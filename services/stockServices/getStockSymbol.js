import StockSymbols from "../../models/StockSymbols.js";

export const getStocksSymbols = async () => {
  const allStocksNames = await StockSymbols.find({});
  return allStocksNames;
};