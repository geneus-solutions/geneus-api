import { readFileSync } from "fs";

import catchAsync from "../utilities/catchAsync.js";
import ApiError from "../utilities/ApiError.js";
import { createStock } from "../services/stockServices/createStockService.js";
import ApiResponse from "../utilities/ApiResponse.js";
import { updateUserStock } from "../services/stockServices/updateStockService.js";
import { getUserStocksService } from "../services/stockServices/getUserStocksService.js";

const stockList = JSON.parse(
  readFileSync(new URL("../data/stockList.json", import.meta.url))
);

const getStocksName = async (req, res) => {
  try {
    return res.status(200).json(stockList);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch stock symbols" });
  }
};

const addNewStock = catchAsync(async (req, res) => {
  const { name, shares, buyPrice, purchaseDate } = req.body;
  const userId = req.user.userId;
  if (!name || !shares || !buyPrice || !purchaseDate)
    return new ApiError(400, "Please provide all required fields");

  const stock = await createStock({
    name,
    shares,
    buyPrice,
    purchaseDate,
    userId,
  });

  return res.status(201).json(new ApiResponse(201, stock, "New Stock added."));
});

const updateStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, shares, buyPrice, purchaseDate } = req.body;

  if (!name || !shares || !buyPrice || !purchaseDate) {
    throw new ApiError(400, "Please provide all required fields");
  }

  const updated = await updateUserStock({
    id,
    name,
    shares,
    buyPrice,
    purchaseDate,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Stock updated successfully"));
});

const getUserStocks = catchAsync(async (req, res) => {
  const { userId } = req.params;
  console.log("this is user stock", userId);
  const stocks = await getUserStocksService(userId);
  console.log(stocks, "this is users Stocks");
  return res
    .status(200)
    .json(new ApiResponse(200, stocks, "User Stocks Fetched"));
});

export { getStocksName, addNewStock, getUserStocks, updateStock };
