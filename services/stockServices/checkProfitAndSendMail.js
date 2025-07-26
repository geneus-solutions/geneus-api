import Stock from "../../models/Stocks.js";
import StockTarget from "../../models/StocksTarget.js";
import eventBus from "../../utilities/createEvent.js";
import { fetchStockCurrentPrice } from "../../utilities/FetchStockCurrentPrice.js";
import "./sendMailProfit.js";


//unoptimize code more loopss:-
// export const checkProfitAndSendMail = async () => {
//   const targets = await StockTarget.find({ emailSent: false });

//   // Group targets by userId
//   const groupedByUser = {};

//   for (const target of targets) {
//     const { userId, stockName, targetPercentage, _id } = target;

//     const [stockAggregate] = await Stock.aggregate([
//       {
//         $match: {
//           userId,
//           stockName,
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           totalShares: { $sum: "$purchasedShares" },
//           totalInvested: {
//             $sum: { $multiply: ["$buyPrice", "$purchasedShares"] },
//           },
//         },
//       },
//     ]);

//     if (!stockAggregate) continue;

//     const { totalShares, totalInvested } = stockAggregate;

//     const response = await fetchStockCurrentPrice(stockName);
//     if (!response?.success || !response?.price) continue;

//     const currentPrice = response.price;
//     const currentValue = currentPrice * totalShares;
//     const profit = currentValue - totalInvested;
//     const profitPercentage =
//       totalInvested === 0 ? 0 : (profit / totalInvested) * 100;

//     if (profitPercentage >= targetPercentage) {
//       // Initialize user group if not present
//       if (!groupedByUser[userId]) {
//         groupedByUser[userId] = {
//           targetsToUpdate: [],
//           stockData: [],
//         };
//       }

//       // Push stock info
//       groupedByUser[userId].stockData.push({
//         stockName,
//         profitPercentage: +profitPercentage.toFixed(2),
//         totalShares,
//         totalInvested: +totalInvested.toFixed(2),
//       });

//       // Collect the target ID to mark as emailed later
//       groupedByUser[userId].targetsToUpdate.push(_id);
//     }
//   }

//   // Now send email for each user only once
//   for (const userId in groupedByUser) {
//     const { targetsToUpdate, stockData } = groupedByUser[userId];
//     eventBus.emit("sendTargetProfitMail", {
//       userId,
//       stockSummary: stockData, // array of stocks that hit target
//     });

//     // Mark all those targets as emailed
//     await StockTarget.updateMany(
//       { _id: { $in: targetsToUpdate } },
//       { $set: { emailSent: true } }
//     );
//   }
// };

// optimize code less loops:-
export const checkProfitAndSendMail = async () => {
  const targets = await StockTarget.find({ emailSent: false });

  if (!targets.length) return;

  const groupedByUser = {};
  const stockPriceCache = {};

  for (const target of targets) {
    const { userId, stockName, targetPercentage, _id } = target;

    // Grouping user structure
    if (!groupedByUser[userId]) {
      groupedByUser[userId] = {
        targetsToUpdate: [],
        stockData: [],
      };
    }

    // Use aggregation for userId + stockName
    const [stockAggregate] = await Stock.aggregate([
      {
        $match: {
          userId,
          stockName,
        },
      },
      {
        $group: {
          _id: null,
          totalShares: { $sum: "$purchasedShares" },
          totalInvested: {
            $sum: { $multiply: ["$buyPrice", "$purchasedShares"] },
          },
        },
      },
    ]);

    if (!stockAggregate) continue;

    const { totalShares, totalInvested } = stockAggregate;

    // Cache current price to avoid duplicate HTTP calls
    let currentPrice;
    if (stockPriceCache[stockName]) {
      currentPrice = stockPriceCache[stockName];
    } else {
      const response = await fetchStockCurrentPrice(stockName);
      if (!response?.success || !response?.price) continue;
      currentPrice = response.price;
      stockPriceCache[stockName] = currentPrice;
    }

    const currentValue = currentPrice * totalShares;
    const profit = currentValue - totalInvested;
    const profitPercentage =
      totalInvested === 0 ? 0 : (profit / totalInvested) * 100;

    if (profitPercentage >= targetPercentage) {
      groupedByUser[userId].stockData.push({
        stockName,
        profitPercentage: +profitPercentage.toFixed(2),
        totalShares,
        totalInvested: +totalInvested.toFixed(2),
      });

      groupedByUser[userId].targetsToUpdate.push(_id);
    }
  }

  // Send email to each user once
  for (const userId in groupedByUser) {
    const { targetsToUpdate, stockData } = groupedByUser[userId];

    if (!stockData.length) continue;

    eventBus.emit("sendTargetProfitMail", {
      userId,
      stockSummary: stockData,
    });

    await StockTarget.updateMany(
      { _id: { $in: targetsToUpdate } },
      { $set: { emailSent: true } }
    );
  }
};

