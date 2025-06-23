import Stock from "../../models/Stocks.js";
import ApiError from "../../utilities/ApiError.js";
import { fetchStockCurrentPrice } from "../../utilities/FetchStockCurrentPrice.js";


export const updateUserStock = async ({ id, name, shares, buyPrice, purchaseDate }) => {
    console.log('this is the data of update stock', name, id)
  const currentPrice = await fetchStockCurrentPrice(name);
  console.log('this is currentPrice', currentPrice)
  if (!currentPrice) {
    throw new ApiError(404, "Unable to fetch current stock price");
  }

  const profit = ((currentPrice - buyPrice) * shares).toFixed(2);
  const profitPercentage = (((currentPrice - buyPrice) / buyPrice) * 100).toFixed(2);

  const updatedStock = await Stock.findOneAndUpdate(
    { _id: id },
    {
      stockName: name,
      purchasedShares: shares,
      buyPrice,
      currentPrice,
      profit,
      profitPercentage,
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
