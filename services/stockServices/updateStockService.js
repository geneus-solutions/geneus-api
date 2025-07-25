import Stock from "../../models/Stocks.js";
import ApiError from "../../utilities/ApiError.js";
import { fetchStockCurrentPrice } from "../../utilities/FetchStockCurrentPrice.js";


export const updateUserStock = async ({ id, purchasedShares, buyPrice, purchaseDate, targetPercentage }) => {
  const updatedStock = await Stock.findOneAndUpdate(
    { _id: id },
    {
      purchasedShares: purchasedShares,
      buyPrice,
      purchaseDate,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedStock) {
    throw new ApiError(404, "Stock not found");
  }

  return updatedStock;
};
