import mongoose from "mongoose";
import UserProfile from "./UserProfile.js";

const { Schema } = mongoose;
var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
const userSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: "Email address is required",
            validate: [validateEmail, "Please fill a valid email address"],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid email address",
            ],
        },
        password: {
            type: String,
            trim: true,
            required: true,
            min: 8,
            max: 25,
        },
        isAccountVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: Number,
        },
        otpExpires: {
            type: Date,
        },
        mobile: {
            type: String,
            trim: true,
            required: true,
            match: [
                /^[0-9]{10}$/,
                "Please fill a valid 10-digit mobile number",
            ],
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        subscriptionStatus: {
            type: Boolean,
            default: false,
        },
        details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Details",
        },
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserDietDiary",
        },
        plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamp: true }
);
//export default mongoose.model("User", userSchema);
// Check if the model already exists to avoid overwriting

// After successfull registration save the user Id into the userProfile model
userSchema.post("save", async function (doc) {
    try {
        const userProfile = new UserProfile({
            userId: doc._id,
        });

        await userProfile.save();
    } catch (error) {
        console.error("Error creating UserProfile:", error.message);
    }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Default export
export default User;
