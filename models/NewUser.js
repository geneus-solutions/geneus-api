// Import Mongoose
const mongoose = require('mongoose');

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

// Create User Model
const NewUser = mongoose.model('NewUser', userSchema);

// Export User Model
module.exports = NewUser;