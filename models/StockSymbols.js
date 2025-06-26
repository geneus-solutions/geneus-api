import mongoose from 'mongoose';

const stocksSymbolSchema = mongoose.Schema({
    companyName: {
        type: String,
    },
    symbol: {
        type: String
    },
    isin: {
        type: String
    }
});

const StockSymbols = new mongoose.model('stockssymbol', stocksSymbolSchema);

export default StockSymbols;

