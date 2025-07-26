import Stock from "../../models/Stocks.js";
import StockTarget from "../../models/StocksTarget.js";

export const deleteStockService = async (stockId, userId) => {
    const deleteStock = await Stock.findOneAndDelete({_id: stockId, userId: userId});
    return deleteStock;
};


export const deleteAllStockWithSingleName = async (stockName, userId) => {
    const deletedCount = await Stock.deleteMany({
        userId: userId,
        stockName: stockName,
    });
    await StockTarget.findOneAndDelete({userId: userId, stockName: stockName})

    return deletedCount;
}