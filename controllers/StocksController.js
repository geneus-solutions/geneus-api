import catchAsync from "../utilities/catchAsync.js";
import ApiError from "../utilities/ApiError.js";
import { createStock } from "../services/stockServices/createStockService.js";
import ApiResponse from "../utilities/ApiResponse.js";
import { updateUserStock } from "../services/stockServices/updateStockService.js";
import { getUserStocksService, getUserTotalStock } from "../services/stockServices/getUserStocksService.js";
import { getStocksSymbols } from "../services/stockServices/getStockSymbol.js";
import { createTargetPercentageDocument, getTargetPercentageDocument, updateTargetPercentageDocument } from "../services/stockServices/createTargetPercentageService.js";
import { deleteAllStockWithSingleName, deleteStockService } from "../services/stockServices/deleteStockService.js";


const getStocksName = async (req, res) => {
  try {
    const stockList = await getStocksSymbols();
    return res.status(200).json(stockList);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch stock symbols" });
  }
};

const addNewStock = catchAsync(async (req, res) => {
  const { name, shares, buyPrice, purchaseDate, targetPercentage } = req.body;
  const userId = req.user.userId;
  if (!name || !shares || !buyPrice || !purchaseDate)
    return new ApiError(400, "Please provide all required fields");

  const stock = await createStock({
    name,
    shares,
    buyPrice,
    purchaseDate,
    userId,
    targetPercentage
  });

  return res.status(201).json(new ApiResponse(201, stock, "New Stock added."));
});

const updateStock = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { purchasedShares, buyPrice, purchaseDate } = req.body;
  if ( !purchasedShares || !buyPrice || !purchaseDate) {
    throw new ApiError(400, "Please provide all required fields");
  }

  const updated = await updateUserStock({
    id,
    purchasedShares,
    buyPrice,
    purchaseDate,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Stock updated successfully"));
});

const getUserStocksDetails = catchAsync(async (req, res) => {
  const { userId, stockname } = req.params;
  const stocks = await getUserStocksService(userId, stockname);
  return res
    .status(200)
    .json(new ApiResponse(200, {stocks}, "User Stocks Fetched"));
});


const getUserStocks = catchAsync(async(req, res) => {
  const {userId} = req.params;
  const stockStats = await getUserTotalStock(userId);
  return res.status(200).json(new ApiResponse(200, stockStats, "User Stocks data"))
})

const createTargetPercentage = catchAsync(async(req, res)=>{
  const {targetPercentage, stockName} = req.body;
  const { userId } = req.params;
  if(!targetPercentage || !stockName) throw new ApiError(400, "Please provide Target Percentage and Stock Name");
  const response = await createTargetPercentageDocument(targetPercentage, stockName, userId)
  return res.status(200).json(new ApiResponse(201, response, "Target Percentage added Send you email when it crossed!"))
})

const updateTargetPercentage = catchAsync(async (req, res) => {
  const {targetPercentage, stockName} = req.body;
  const {userId} = req.params;
   if(!targetPercentage || !stockName) throw new ApiError(400, "Please provide Target Percentage and Stock Name");

  const response = await updateTargetPercentageDocument( targetPercentage, stockName, userId);
    if (!response || response.length === 0) {
    throw new ApiError(404, "Stock not found Target Percentage Not updated");
  }
  return res.status(200).json(new ApiResponse(200, response, "Target Percetage updated"));
})


const getTargetPercentage = catchAsync(async(req, res) => {
  const {stockName, userId} = req.params;
  if(!stockName || !userId)
    throw new ApiError(400, "Please provide userId and Stock Name");
  const response = await getTargetPercentageDocument(stockName, userId);
   if (!response || response.length === 0) {
    throw new ApiError(404, "Target percentage not found Please Add the Target Percentage");
  }
  return res.status(200).json(new ApiResponse(200, response, "Target Percetage Fetched"));
});

const deleteSingleStock = catchAsync(async(req, res)=>{
  const {stockId, userId} = req.params;
  const response = await deleteStockService(stockId, userId);
  if(!response)
    throw new ApiError(404, "Stock not Found to delete");
  return res.status(200).json(new ApiResponse(200, response, "Stock deleted Succesfully"))
})

const deleteAllStock = catchAsync(async(req, res)=> {
  const {userId, stockName} = req.body;
  const response = await deleteAllStockWithSingleName(stockName, userId)
   if(!response)
    throw new ApiError(404, "Stock not Found to delete");
  return res.status(200).json(new ApiResponse(200, response, "Stock deleted Succesfully"))
})



export { getStocksName, addNewStock, getUserStocks, updateStock, getUserStocksDetails, createTargetPercentage, getTargetPercentage, updateTargetPercentage, deleteSingleStock, deleteAllStock };
