import mongoose from "mongoose";

const detailsSchema = new mongoose.Schema({
    userId : {  //
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    goal : {
        type : String
    },
    activityLevel : {  //
        type : String
    },
    gender : {  //
        type : String
    },
    dateOfBirth : {  //
        type : Date
    },
    country : {
        type : String
    },
    height : {  //
       type : Number
    },
    weight : {  //
        type : Number
    },
    goalWeight:{
        type: Number
    },
    caloriegoal : {  //
        type : Number
    }
}, {timestamps : true})

const Details = mongoose.model('Details', detailsSchema);

export default Details;