import { createTargetPercentage } from "../../controllers/StocksController.js";
import Stock from "../../models/Stocks.js";
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

  const createTargetPercentage = await createTargetPercentageDocument(10, name, userId)
  return stock;
};

