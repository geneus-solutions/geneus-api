import yahooFinance from "yahoo-finance2";
yahooFinance.suppressNotices(["yahooSurvey"]);

export const fetchStockCurrentPrice = async (symbol) => {
  try {
    console.log('thi si symbol', symbol)
    const symbolFormatted = `${symbol?.toUpperCase().trim()}.NS`;
    const quote = await yahooFinance.quote(symbolFormatted);
    const price = parseFloat(quote?.regularMarketPrice);
    if (!price) {
      // throw new ApiError(404, "Unable to fetch current 
      return {success: false, message: "Unable to fetch Current Price"}
    }

    return {success: true, price: price};
  } catch (err) {
    // throw new ApiError(500, `Stock current Price fetch failed: ${err.message}`);
    console.log('this is error', err)
    return {success: false, message: "Unable to fetch Current Price!"}
  }
};
