import yahooFinance from "yahoo-finance2";
yahooFinance.suppressNotices(["yahooSurvey"]);
import ApiError from "./ApiError.js";

export const fetchStockCurrentPrice = async (symbol) => {
  try {
    const symbolFormatted = `${symbol?.toUpperCase().trim()}.NS`;
    const quote = await yahooFinance.quote(symbolFormatted);
    console.log("this is quote", quote);
    const price = parseFloat(quote?.regularMarketPrice);
    console.log("this is pice", price);
    if (!price) {
      throw new ApiError(404, "Unable to fetch current stock price");
    }

    return price;
  } catch (err) {
    throw new ApiError(500, `Stock fetch failed: ${err.message}`);
  }
};
