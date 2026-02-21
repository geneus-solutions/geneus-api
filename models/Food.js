import mongoose from "mongoose";

/* ---------- Food inside a meal ---------- */
const mealItemSchema = new mongoose.Schema(
  {
    // Reference to global DB food
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodItem",
      default: null,
    },

    // Custom user-only food
    customFood: {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      servingSize: String,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: true }
);

/* ---------- Meal (Dynamic) ---------- */
const mealSchema = new mongoose.Schema(
  {
    // USER CAN CREATE ANY MEAL NAME
    mealName: {
      type: String,
      required: true,
      trim: true,
    },

    items: [mealItemSchema],
  },
  { _id: true }
);

/* ---------- Diary ---------- */
const userDietDiarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // String date removes timezone problems
    // Example: "2026-02-16"
    foodDate: {
      type: String,
      required: true,
    },

    // Dynamic meals
    meals: [mealSchema],
  },
  { timestamps: true }
);

// One diary per user per day
userDietDiarySchema.index({ user: 1, foodDate: 1 }, { unique: true });

const Food = mongoose.model("UserDietDiary", userDietDiarySchema);

export default Food;