import mongoose from "mongoose";

const scannedMealSchema = new mongoose.Schema({
    imageHash: {
        type: String,
        unique: true
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodItem"
    }],
    summary: String,
    totalCalories: Number
}, { timestamps: true });

export default mongoose.model("ScannedMeal", scannedMealSchema);
