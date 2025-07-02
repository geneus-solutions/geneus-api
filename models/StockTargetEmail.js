import mongoose from "mongoose";

const stocksTargetEmailSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    stockName: {
      type: String,
      require: true,
      trim: true,
    },
    lastProfitPercentage: {
      type: Number,
      require: true,
      trim: true,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
);

const StockTargetEmail = new mongoose.model("StockTargetEmail", stocksTargetEmailSchema);

export default StockTargetEmail;
