import mongoose from 'mongoose';

const stocksTargetSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    stockName: {
        type: String,
        require: true,
        trim: true,
    },
    targetPercentage: {
        type: Number,
        require: true,
        trim: true,
        default: 10
    }
}, {timestamps: true});

const StockTarget = new mongoose.model('StockTarget', stocksTargetSchema);

export default StockTarget;

