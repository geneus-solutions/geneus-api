import Stock from "../../models/Stocks.js";
import StockTarget from "../../models/StocksTarget.js";
import StockTargetEmail from "../../models/StockTargetEmail.js";
import eventBus from "../../utilities/createEvent.js";
import { fetchStockCurrentPrice } from "../../utilities/FetchStockCurrentPrice.js";
import "./sendMailProfit.js";

export const getAllUserStock = async () => {
  const groupedStocks = await Stock.aggregate([
    {
      $group: {
        _id: {
          userId: "$userId",
          stockName: "$stockName",
        },
        totalShares: { $sum: "$purchasedShares" }, // Example aggregation
        totalInvestment: {
          $sum: "$buyPrice",
        },
      },
    },
  ]);
  const result = await Promise.allSettled(
    groupedStocks.map(async (stock) => {
      const { userId, stockName } = stock._id;
      const totalInvestment = stock.totalInvestment;
      const totalShares = stock.totalShares;

      const response = await fetchStockCurrentPrice(stockName);
      if (response.success) {
        const currentPrice = response.price;
        const totalCurrentPrice = currentPrice * totalShares;
        const profit = totalCurrentPrice - totalInvestment;
        const profitPercentage =
          totalInvestment === 0 ? 0 : (profit / totalInvestment) * 100;
        const target = await StockTarget.findOne({
          userId,
          stockName,
        });

        if(!target)
            return;
        let targetEmail = await StockTargetEmail.findOne({
          userId,
          stockName,
        });

        const shouldSendEmail = !targetEmail || !targetEmail.emailSent;

        console.log('this is targgetEmail', target)

        if (target && shouldSendEmail && profitPercentage >= target.targetPercentage ) {
            console.log('this is sending the email', profitPercentage)
            eventBus.emit("sendTargetProfitMail", {
            userId,
            stockName,
            profitPercentage,
            totalShares: totalShares,
            totalInvestment: totalInvestment
          });
        }
      }else{
        console.log('current Stock fetch Faild')
      }
    })
  );
  return groupedStocks;
};
