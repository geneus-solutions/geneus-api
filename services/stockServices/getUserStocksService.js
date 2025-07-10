import mongoose from "mongoose";
import Stock from "../../models/Stocks.js";
import ApiError from "../../utilities/ApiError.js";
import { fetchStockCurrentPrice } from "../../utilities/FetchStockCurrentPrice.js";

export const getUserStocksService = async (id, stockname) => {
  const stocks = await Stock.find({ userId: id, stockName: stockname });
  if (!stocks) return new ApiError(400, "No Stock found Add stocks");

  const response = await fetchStockCurrentPrice(stockname);
  let currentPrice = 0;
  // if (!currentPrice) throw new ApiError(500, "Could not fetch current price");
  if (response.success) {
    currentPrice = response.price;
  }

  console.log('this is stocks', stocks);
  const enrichedStocks = stocks.map((stock) => {
    const purchasedShares = stock.purchasedShares;
    const buyPrice = stock.buyPrice;
    const totalCurrentPrice = currentPrice * purchasedShares;
    const profit = ((currentPrice - buyPrice) * purchasedShares).toFixed(2);
    const profitPercentage = ((profit / (buyPrice * purchasedShares)) * 100).toFixed(2);

    return {
      ...stock.toObject(),
      profit,
      profitPercentage,
      totalCurrentPrice,
    };
  });

  return {
    stocks: enrichedStocks,
    currentPrice,
  };
};

export const getUserTotalStock = async (userId) => {
  const stocksStats = await Stock.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$stockName",
        totalShares: { $sum: "$purchasedShares" },
        totalBuyPrice:{
          $sum: { $multiply: ["$buyPrice", "$purchasedShares"] },
        },
        lastPurchaseDate: { $max: "$purchaseDate" },
      },
    },
  ]);

  console.log('the stockss slflds------------>', stocksStats)
  // Step 2: Enrich with live price and total value
  let totalShares = 0;
  let totalInvested = 0;
  let totalCurrentValue = 0;

  const updateStats = await Promise.allSettled(
    stocksStats.map(async (stock) => {
      const response = await fetchStockCurrentPrice(stock?._id); // Fetch from external API
      let currentPrice = 0;
      let dataNotFound = false;
      if (response.success) {
        currentPrice = response.price;
      } else {
        dataNotFound = true;
      }
      const currentTotalValue = currentPrice * stock.totalShares;
      const investedAmount = stock.totalBuyPrice;
      const profit = currentTotalValue - investedAmount;
      const profitPercentage =
        investedAmount === 0 ? 0 : (profit / investedAmount) * 100;
        totalShares = totalShares + stock.totalShares;
        totalInvested = totalInvested + investedAmount;

      if (!dataNotFound) {
        totalCurrentValue = totalCurrentValue + currentTotalValue;
      }

      return {
        stockName: stock._id,
        totalShares: stock.totalShares,
        investedAmount,
        currentPrice: dataNotFound
          ? "Data Not Found"
          : +currentPrice.toFixed(2),
        currentTotalValue: dataNotFound
          ? "Data Not Found"
          : +currentTotalValue.toFixed(2),
        profit: dataNotFound ? "Data Not Found" : +profit.toFixed(2),
        profitPercentage: dataNotFound
          ? "Data Not Found"
          : +profitPercentage.toFixed(2),
        lastPurchaseDate: stock.lastPurchaseDate,
      };
    })
  );

  let allStocks = [];
  updateStats.forEach((eachStockData) => {
    console.log(eachStockData);
    allStocks.push(eachStockData.value);
  });

  const totalProfit = totalCurrentValue - totalInvested;
  const totalProfitPercentage =
    totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

  console.log("this is all Stocks", allStocks);
  return {
    stocks: allStocks || [],
    summary: {
      totalShares,
      totalInvested: +totalInvested.toFixed(2),
      totalCurrentValue: +totalCurrentValue.toFixed(2),
      totalProfit: +totalProfit.toFixed(2),
      totalProfitPercentage: +totalProfitPercentage.toFixed(2),
    },
  };
};
