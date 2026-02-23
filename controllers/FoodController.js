import Food from "../models/Food.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import { configDotenv } from "dotenv";
import { findOrCreateFood } from "../services/foodItemServices/foodOrCreateFood.js";
import Item from "../models/FoodItems.js";
import { getGeminiNutrition } from "../utilities/gemini.js";

configDotenv();

const addFoodToDiary = async (req, res) => {
  try {
    const { userId } = req.user;
    let { mealName, food, date, quantity } = req.body;
    quantity = Number(quantity) || 1;
    if (quantity < 1) quantity = 1;
    if (quantity > 1000) quantity = 1000;
    if (!mealName) {
      return res.status(400).json({ message: "Meal name is required" });
    }

    // Always keep date string
    const selectedDate = date || new Date().toISOString().split("T")[0];

    //  Atomic upsert (VERY IMPORTANT)
    let diary = await Food.findOneAndUpdate(
      { user: userId, foodDate: selectedDate },
      { $setOnInsert: { user: userId, foodDate: selectedDate, meals: [] } },
      { new: true, upsert: true },
    );

    //  Find or create meal
    let meal = diary.meals.find(
      (m) => m.mealName.toLowerCase() === mealName.toLowerCase(),
    );

    if (!meal) {
      diary.meals.push({
        mealName,
        items: [],
      });
      meal = diary.meals[diary.meals.length - 1];
    }

    /* ------------------------------------------------ */
    /* CASE A : USER CUSTOM FOOD                        */
    /* ------------------------------------------------ */

    if (typeof food === "object" && food.calories !== undefined) {
      const existingCustom = meal.items.find(
        (m) =>
          m.customFood &&
          m.customFood.name &&
          m.customFood.name.toLowerCase() === (food.name || "").toLowerCase(),
      );

      if (existingCustom) {
        existingCustom.quantity += quantity;
      } else {
        meal.items.push({
          customFood: {
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            servingSize: food.servingSize || "1 serving",
          },
          quantity: quantity,
        });
      }
    } else {
      /* ------------------------------------------------ */
      /* CASE B : FOOD NAME → DB → AI                     */
      /* ------------------------------------------------ */
      const foodName = typeof food === "string" ? food : food.name;

      if (!foodName) {
        return res.status(400).json({ message: "Food name missing" });
      }

      let foodItem = await Item.findOne({
        name: new RegExp(`^${foodName}$`, "i"),
      });

      // Not found → call AI
      if (!foodItem) {
        const aiNutrition = await getGeminiNutrition(foodName);

        foodItem = await Item.create({
          name: foodName,
          calories: aiNutrition.calories,
          protein: aiNutrition.protein,
          carbs: aiNutrition.carbs,
          fat: aiNutrition.fat,
          servingSize: aiNutrition.servingSize || "1 serving",
          source: "ai",
        });
      }

      const existingItem = meal.items.find(
        (m) => m.item && m.item.equals(foodItem._id),
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        meal.items.push({
          item: foodItem._id,
          quantity: quantity,
        });
      }
    }

    await diary.save();

    res.status(200).json({
      message: "Food added successfully",
      diary,
    });
  } catch (error) {
    console.error("Add Food Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // YYYY-MM-DD
    const selectedDate = date || new Date().toISOString().split("T")[0];

    console.log("Fetching diary for:", selectedDate);

    /* ---------------- FIND DIARY ---------------- */

    const diary = await Food.findOne({
      user: id,
      foodDate: selectedDate,
    })
      .populate("user", "_id name mobile food")
      .populate("meals.items.item") // ⭐ IMPORTANT
      .lean();

    /* ---------- NO DIARY FOUND ---------- */

    if (!diary) {
      const user = await User.findById(id, {
        _id: 1,
        name: 1,
        mobile: 1,
        food: 1,
      });

      return res.status(200).json({
        user,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
    }

    /* ---------- NUTRIENT CALCULATION ---------- */

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealsWithNutrition = diary.meals.map((meal) => {
      let mealCalories = 0;
      let mealProtein = 0;
      let mealCarbs = 0;
      let mealFat = 0;

      const items = meal.items.map((item) => {
        const quantity = item.quantity || 1;

        // choose source (global OR custom)
        const source = item.item || item.customFood;

        const calories = (source?.calories || 0) * quantity;
        const protein = (source?.protein || 0) * quantity;
        const carbs = (source?.carbs || 0) * quantity;
        const fat = (source?.fat || 0) * quantity;

        mealCalories += calories;
        mealProtein += protein;
        mealCarbs += carbs;
        mealFat += fat;

        return {
          ...item,
          calculated: {
            calories,
            protein,
            carbs,
            fat,
          },
        };
      });

      // add to total day nutrition
      totalCalories += mealCalories;
      totalProtein += mealProtein;
      totalCarbs += mealCarbs;
      totalFat += mealFat;

      return {
        mealName: meal.mealName,
        items,
        mealNutrition: {
          calories: Math.round(mealCalories),
          protein: Math.round(mealProtein),
          carbs: Math.round(mealCarbs),
          fat: Math.round(mealFat),
        },
      };
    });

    /* ---------- FINAL RESPONSE ---------- */

    return res.status(200).json({
      user: diary.user,
      foodDate: diary.foodDate,
      meals: mealsWithNutrition,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
    });
  } catch (error) {
    console.error("Error fetching food data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateFood = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id, mealName, quantity, date } = req.body;

    const selectedDate = date || new Date().toISOString().split("T")[0];

    // Find diary
    const diary = await Food.findOne({
      user: userId,
      foodDate: selectedDate,
    });

    if (!diary) {
      return res.status(404).json({ message: "Diary not found" });
    }

    let foundItem = null;
    let oldMealIndex = -1;

    // Find item inside all meals
    for (let i = 0; i < diary.meals.length; i++) {
      const itemIndex = diary.meals[i].items.findIndex(
        (it) => it._id.toString() === id,
      );

      if (itemIndex !== -1) {
        foundItem = diary.meals[i].items[itemIndex];
        diary.meals[i].items.splice(itemIndex, 1);
        oldMealIndex = i;
        break;
      }
    }

    if (!foundItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    // Update quantity
    if (quantity && quantity > 0) {
      foundItem.quantity = quantity;
    }

    // Find / create new meal
    let targetMeal = diary.meals.find(
      (m) => m.mealName.toLowerCase() === mealName.toLowerCase(),
    );

    if (!targetMeal) {
      diary.meals.push({
        mealName,
        items: [],
      });
      targetMeal = diary.meals[diary.meals.length - 1];
    }

    // Push item
    targetMeal.items.push(foundItem);

    await diary.save();

    return res.status(200).json({
      message: "Food updated successfully",
      diary,
    });
  } catch (error) {
    console.error("Update Food Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeFood = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id, date } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Food item id is required" });
    }

    // use provided date or today
    const selectedDate = date || new Date().toISOString().split("T")[0];

    // find diary
    const diary = await Food.findOne({
      user: userId,
      foodDate: selectedDate,
    });

    if (!diary) {
      return res.status(404).json({ message: "Diary not found" });
    }

    let itemRemoved = false;

    // find item inside meals
    for (let i = 0; i < diary.meals.length; i++) {
      const meal = diary.meals[i];

      const itemIndex = meal.items.findIndex(
        (item) => item._id.toString() === id,
      );

      if (itemIndex !== -1) {
        // remove the food item
        meal.items.splice(itemIndex, 1);
        itemRemoved = true;

        // IMPORTANT: if meal has no items -> remove meal also
        if (meal.items.length === 0) {
          diary.meals.splice(i, 1);
        }

        break;
      }
    }

    if (!itemRemoved) {
      return res.status(404).json({ message: "Food item not found" });
    }

    await diary.save();

    return res.status(200).json({
      message: "Food removed successfully",
      diary,
    });
  } catch (error) {
    console.error("Remove Food Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getFoodById, addFoodToDiary, updateFood, removeFood };
