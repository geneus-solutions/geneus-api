import mongoose from "mongoose";

const scannedMealSchema = new mongoose.Schema(
  {
    imageHash: {
      type: String,
      unique: true,
    },
    items: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    summary: String,
    totalCalories: Number,
  },
  { timestamps: true },
);

export default mongoose.model("ScannedMeal", scannedMealSchema);
