// Import Mongoose
import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const NewUser = mongoose.model('NewUser', userSchema);


export default NewUser;