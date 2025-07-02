import mongoose from 'mongoose';

const stocksSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    stockName: {
        type: String,
        require: true,
        trim: true,
    },
    purchasedShares: {
        type: Number,
        require: true,
        trim: true,
    },
    purchaseDate: {
        type: Date,
        require: true
    },
    buyPrice: {
        type: Number,
        require: true,
        trim: true,
    },
}, {timestamps: true});

const Stock = new mongoose.model('Stock', stocksSchema);

export default Stock;

