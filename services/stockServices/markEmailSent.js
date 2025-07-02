import Stock from "../../models/Stocks.js";

export const markEmailSent = async (id) => {
  const updateStock = await Stock.findOneAndUpdate(
    { _id: id },
    {
      emailSent: true,
    },
    { new: true, runValidators: true }
  );
  return updateStock;
};
