import Stock from "../../models/Stocks.js";
import ApiError from "../../utilities/ApiError.js";

export const getUserStocksService = async (id) => {
  const stocks = await Stock.find({ userId: id });
  if (!stocks) return new ApiError(400, "No Stock found Add stocks");
  return stocks;
};
