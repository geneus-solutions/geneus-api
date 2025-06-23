import Stock from "../../models/Stocks.js";
import { fetchStockCurrentPrice } from "../../utilities/FetchStockCurrentPrice.js";

export const createStock = async ({ name, shares, buyPrice, purchaseDate, userId }) => {
  const currentPrice = await fetchStockCurrentPrice(name);

  const profit = ((currentPrice - buyPrice) * shares).toFixed(2);
  const profitPercentage = (((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2);

  const stock = new Stock({
    userId,
    stockName: name,
    purchasedShares: shares,
    buyPrice,
    currentPrice,
    profit,
    profitPercentage,
    purchaseDate,
  });

  await stock.save();
  return stock;
};

