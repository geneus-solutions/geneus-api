import StockTarget from "../../models/StocksTarget.js";
import StockTargetEmail from "../../models/StockTargetEmail.js";

export const createTargetPercentageDocument = async (
  targetPercentage,
  stockName,
  userId
) => {
  const newTarget = await StockTarget.create({
    userId,
    stockName,
    targetPercentage,
  });
  return newTarget;
};

export const updateTargetPercentageDocument = async (
  targetPercentage,
  stockName,
  userId
) => {
  const updateTarget = await StockTarget.findOneAndUpdate(
    { stockName, userId },
    {
      targetPercentage: targetPercentage,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  return updateTarget;
};

export const getTargetPercentageDocument = async (stockName, userId) => {
  const targetPercentage = await StockTarget.findOne({ stockName, userId });
  return targetPercentage;
};

export const updateStockEmailDocument = async (stockName, userId) => {
  const findDocument = await StockTargetEmail.findOneAndUpdate(
    { stockName, userId },
    {
      emailSent: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  return findDocument;
};
