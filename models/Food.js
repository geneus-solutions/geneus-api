import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    //add date field:-
      date: {
        type: Date,
        default: () => new Date().setHours(0,0,0,0)
    },

    breakfast: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,

                ref: "FoodItem",
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
    lunch: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,

                ref: "FoodItem",
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
    dinner: [
        {
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FoodItem",
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
},{timestamps: true});

foodSchema.index({ user: 1, date: 1 }, { unique: true });

const Food = mongoose.model("UserDietDiary", foodSchema);

export default Food;
