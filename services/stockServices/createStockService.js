import Stock from "../../models/Stocks.js";
import StockTarget from "../../models/StocksTarget.js";
import { createTargetPercentageDocument } from "./createTargetPercentageService.js";

export const createStock = async ({ name, shares, buyPrice, purchaseDate, userId}) => {
  const stock = new Stock({
    userId,
    stockName: name,
    purchasedShares: shares,
    buyPrice,
    purchaseDate,
  });

  await stock.save();

  const findExistingPercentag = await StockTarget.findOne({userId: userId, stockName: name})
  if(!findExistingPercentag){
    await createTargetPercentageDocument(10, name, userId)
  }
  return stock;
};

