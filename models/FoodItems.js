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
    }
})

const Item = mongoose.model('Item', ItemSchema);

export default Item;