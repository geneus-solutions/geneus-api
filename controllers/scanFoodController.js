import crypto from "crypto";
import catchAsync from "../utilities/catchAsync.js";
import ApiError from "../utilities/ApiError.js";

import { getGeminiVisionResult, getGeminiNutrition } from "../utilities/gemini.js";
import { createScannedMeal, findScannedMealByHash } from "../services/scanMealServices/scanMeal.service.js";
import { createFoodItem, findFoodByName } from "../services/foodItemServices/foodItem.service.js";

function hashImage(imageBase64){
    return crypto
    .createHash("sha256")
    .update(imageBase64)
    .digest("hex");
}

export const scanFood = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Image is required");
  }

  // 1️ Convert image
  const imageBase64 = req.file.buffer.toString("base64");

  // 2️ Hash image
  const imageHash = hashImage(imageBase64);

  // 3️ Cache check
  const cachedMeal = await findScannedMealByHash(imageHash);
  if (cachedMeal) {
    return res.status(200).json({
      success: true,
      source: "cache",
      summary: cachedMeal.summary,
      totalCalories: cachedMeal.totalCalories,
      items: cachedMeal.items,
    });
  }

  // 4️ Vision AI
  const visionResult = await getGeminiVisionResult(imageBase64);
  if (!visionResult?.items?.length) {
    throw new ApiError(404, "No food detected");
  }

  const detectedItems = [];

  // 5️ Process foods
  for (const foodName of visionResult.items) {
    let food = await findFoodByName(foodName);

    if (!food) {
      const nutrition = await getGeminiNutrition(foodName);

      food = await createFoodItem({
        name: foodName,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        servingSize: nutrition.servingSize,
        ingredients: nutrition.ingredients || [],
        description: nutrition.description || "",
        createdBy: "scan",
        isVerified: false,
      });
    }

    detectedItems.push(food);
  }

  // 6 Calculate calories
  const totalCalories = detectedItems.reduce(
    (sum, item) => sum + (item.calories || 0),
    0
  );

  // 7️ Save scan cache
  const scannedMeal = await createScannedMeal({
    imageHash,
    items: detectedItems.map((i) => i._id),
    summary: visionResult.summary,
    totalCalories,
  });

  // 8️ Response
  res.status(200).json({
    success: true,
    source: "ai",
    summary: scannedMeal.summary,
    totalCalories: scannedMeal.totalCalories,
    items: detectedItems,
  });
});
