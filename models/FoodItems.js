import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    calories : {
        type : Number,
        required : true
    },
    protein : {
        type : Number,
        required : true
    },
    carbs : {
        type : Number,
        required : true
    },
    fat : {
        type : Number,
        required : true
    },
    servingSize : {
        type : String
    },

    // add two more fields:-
    createdBy: {
        type: String,
        enum: ["admin", "scan"],
        default: "admin"
    },

    isVerified: {
        type: Boolean,
        default: true // admin = true, scan = false
    }
}, {timestamps: true})

const Item = mongoose.model('FoodItem', ItemSchema);

export default Item;