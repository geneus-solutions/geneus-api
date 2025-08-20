import Enquiry from "../models/Enquiry.js";
import User from "../models/User.js";
import Detail from "../models/FoodDetails.js";
import Food from "../models/Food.js";
import Plan from "../models/Plan.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../controllers/AuthController.js";
import sendEmail from "./EmailController.js";
import bcryptjs from "bcryptjs";
import Token from "../models/Token.js";
import crypto from "crypto";
import NewUser from "../models/NewUser.js";
import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import aj from "../utilities/ArcjectSetup/arcjetConfig.js";
import UserProfile from "../models/UserProfile.js";
import Contact from "../models/Contact.js";
import Details from "../models/FoodDetails.js";

configDotenv();

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Request Body:", req.body);

        if (!email) return res.status(400).json({ error: "Email is required" });
        if (!password)
            return res.status(400).json({ error: "Password is required" });

        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(400).json({ error: "Invalid Email or Password" });
        }

        const isPasswordValid = bcryptjs.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid Email or Password" });
        }

        if (!user.isAccountVerified) {
            return res
                .status(401)
                .json({ error: "Please verify your account" });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        const updatedData = await User.findOneAndUpdate(
            { email },
            { refreshToken: refreshToken },
            { new: true }
        );

        const token = new Token({ token: refreshToken });
        await token.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                mobile: user.mobile,
                role: user.role,
            },
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(500).json({ error: "Authentication Failed!" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!password)
            return res.status(400).json({ error: "Password is required" });
        if (!email) return res.status(400).json({ error: "Email is required" });
        const user = await User.findOne({ email }).exec();
        if (!user || !bcryptjs.compareSync(password, user.password)) {
            return res.status(400).json({ error: "Invalid Email or Password" });
        }
        const accessToken = jwt.sign(
            user.toJSON(),
            process.env.ACCESS_SECRET_KEY,
            {
                expiresIn: "15m",
            }
        );
        const refreshToken = jwt.sign(
            user.toJSON(),
            process.env.REFRESH_SECRET_KEY
        );
        const token = new Token({ refreshToken });
        await token.save();
        res.cookie("token", token, {
            maxAge: 1000 * 60 * 5,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });
        const dbToken = new Token({ token });
        const newToken = await dbToken.save();
        return res.status(200).json({
            accessToken,
            refreshToken,
            email: user.email,
            name: user.name,
            id: user.id,
        });
    } catch (error) {
        return res.status(500).json({ error: "Authentication Failed!" });
    }
};

// const getUser = async (req, res) => {
//     try {
//         const { userId } = req.user;
//         // Populate the references for details, food, and plan
//         const user = await Details.findOne({userId: userId})
//             .populate("userId");
//         console.log('this is user',user)
//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         // Check if populated fields are available
//         // if (!user.details) {
//         //     console.log(
//         //         "Population error: One or more referenced fields are missing."
//         //     );
//         //     return res
//         //         .status(500)
//         //         .json({ error: "Failed to populate user data" });
//         // }

//         const totalCalories = user.caloriegoal;
//         const goal = user.goal;

//         // Macronutrient distribution based on the goal
//         const macronutrientDistribution = {
//             "Lose Weight": { protein: 30, carbs: 40, fat: 30 },
//             "Gain Muscle": { protein: 35, carbs: 40, fat: 25 },
//             "Athletic Performance": { protein: 30, carbs: 50, fat: 20 },
//             "Maintain Weight": { protein: 30, carbs: 45, fat: 25 },
//             "Gain Weight": { protein: 20, carbs: 55, fat: 25 },
//             "Manage Stress": { protein: 30, carbs: 25, fat: 45 },
//         };

//         const {
//             protein: proteinPercent,
//             carbs: carbsPercent,
//             fat: fatPercent,
//         } = macronutrientDistribution[goal] || {
//             protein: 20,
//             carbs: 50,
//             fat: 30,
//         };

//         // Calculate macronutrients in grams
//         const proteinGrams = (totalCalories * (proteinPercent / 100)) / 4;
//         const carbsGrams = (totalCalories * (carbsPercent / 100)) / 4;
//         const fatGrams = (totalCalories * (fatPercent / 100)) / 9;

//         console.log(
//             `Calculated Macronutrients - Protein: ${Math.round(
//                 proteinGrams
//             )}g, Carbs: ${Math.round(carbsGrams)}g, Fat: ${Math.round(
//                 fatGrams
//             )}g`
//         );

//         res.status(201).json({
//             user,
//             macronutrients: {
//                 protein: Math.round(proteinGrams),
//                 carbs: Math.round(carbsGrams),
//                 fat: Math.round(fatGrams),
//             },
//         });
//     } catch (error) {
//         console.error("Server error: ", error);
//         res.status(500).json({ message: "Server error", error });
//     }
// };

const logut = async (req, res) => {
    try {
        console.log("Logout route called : ", req.cookies);
        const refreshToken = req.cookies.refreshToken;
        // const refreshToken = await Token.deleteOne({ refreshToken });
        // delete the refresh token from the database
        const updatedData = await User.findOneAndUpdate(
            { refreshToken },
            { refreshToken: null },
            { new: true }
        );

        console.log("Refresh Token Deleted:", updatedData);
        res.clearCookie("refreshToken");
        console.log("this is logout");
        return res.status(200).json({ message: "Logout successful!" });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const contact = async (req, res) => {
  try {
    const { name, email, subject, contactNumber, message } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!subject) return res.status(400).json({ error: "Contact is required" });
    if (!contactNumber) return res.status(400).json({ error: "Contact Number is required" });
    if (!message)
      return res.status(400).json({ error: "Please mention your query" });
    const query = new Contact({
      name,
      email,
      subject,
      contactNumber,
      message,
    });

        const currentDate = new Date();
        const newQuery = "Geneus Solutions New Contact Query: " + name;
        const emailSubject = `${newQuery} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;

        sendEmail(
            email,
            process.env.toAdmin,
            emailSubject,
            `Name: ${name}\nEmail: ${email}\nMessage: ${message}\nContact Number:${contactNumber}`
        );

        await query.save();
        return res.json({ ok: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
};
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res
                .status(400)
                .send(
                    "No user with that email address found. Please provide a valid email address"
                );
        }

        const token = crypto.randomBytes(20).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        const resetURL = process.env.FRONTEND_URL + `/reset-password/${token}`;

        sendEmail(
            process.env.toAdmin,
            email,
            "Password Reset",
            `You are receiving this because you  have requested to reset the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
        );

        res.send("Password reset email sent.");
    } catch (error) {
        console.error("Error in forgot-password route:", error);
        res.status(500).send("Internal Server Error");
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .send("Password reset token is invalid or has expired.");
        }

        // Hash the new password and save it
        user.password = await bcryptjs.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).send(
            "Password has been reset successfully. Please log in"
        );
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
};

export const createTokens = (user) => {
    try {
        const token = jwt.sign(user.toJSON(), process.env.SECRET_KEY, {
            expiresIn: "600s",
        });
        return token;
    } catch (err) {
        throw new Error(err.message);
    }
};

const signup = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        if (!name) return res.status(400).json({ error: "Name is required" });

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: "Valid email is required" });

        if (!password || password.length < 8) {
            return res.status(400).json({
                error: "Password is required and must be at least 8 characters",
            });
        }

        const decision = await aj.protect(req, {
            email: email,
        });

        // console.log("Decision:", decision);

        if (decision.isDenied()) {
            if (decision.reason.isEmail()) {
                return res.status(400).json({ error: "invalid email" });
            } else {
                return res.status(400).json({ error: "Forbidden" });
            }
        }

        if (!mobile)
            return res.status(400).json({ error: "Mobile number is required" });

        const userExists = await User.findOne({ email }).exec();

        if (userExists) {
            return res.status(400).json({ error: "Email already exists" });
        }
        //const salt = await bcryptjs.genSalt(10);

        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
        });


        // Create related details, food, and plan
        // const newDetail = await Detail.create({ user: newUser._id });
        // const newFood = await Food.create({ user: newUser._id });
        // const freePlanPrice = 0;

        // const newPlan = await Plan.create({
        //     userId: newUser._id,
        //     name: "Free Trial",
        //     duration: 3,
        //     price: freePlanPrice,
        // });

        // newUser.details = newDetail._id;
        // newUser.food = newFood._id;
        // newUser.plan = newPlan._id;
        await newUser.save();

        // Send the email without sensitive info
        const currentDate = new Date();

        const registrationRequest =
            "Geneus Solutions New User Registration request(Modal)";
        const updatedRegStatus = `${registrationRequest} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;

        await sendEmail(
            process.env.email,
            process.env.toAdmin,
            updatedRegStatus,
            `New user registered: Name: ${name}, Email: ${email}, Mobile: ${mobile}`
        );

        // Generate tokens
        let accessToken = generateAccessToken(newUser);
        let refreshToken = generateRefreshToken(newUser);
        // console.log("Access Token:", accessToken, "Refresh Token:", refreshToken);

        // Return success response
        return res.status(200).json({
            message: "your registration has been successful",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                details: newUser.details,
                food: newUser.food,
                number: newUser.mobile, // Ensure this is the correct property
                plan: newUser.plan,
            },
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.log("Error occurred", err);
        return res
            .status(500)
            .json({ error: "An error occurred! Please try again later." });
    }
};


const androidSignup = async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        if (!name) return res.status(400).json({ error: "Name is required" });

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return res.status(400).json({ error: "Valid email is required" });

        if (!password || password.length < 8) {
            return res.status(400).json({
                error: "Password is required and must be at least 8 characters",
            });
        }

        if (!mobile)
            return res.status(400).json({ error: "Mobile number is required" });

        const userExists = await User.findOne({ email }).exec();
        if (userExists) {
            return res.status(400).json({ error: "Email already exists" });
        }
        //const salt = await bcryptjs.genSalt(10);

        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            mobile,
        });

        // Create related details, food, and plan
        // const newDetail = await Detail.create({ user: newUser._id });
        // const newFood = await Food.create({ user: newUser._id });
        // const freePlanPrice = 0;

        // const newPlan = await Plan.create({
        //     userId: newUser._id,
        //     name: "Free Trial",
        //     duration: 7,
        //     price: freePlanPrice,
        // });

            // newUser.details = newDetail._id;
            // newUser.food = newFood._id;
            // newUser.plan = newPlan._id;
        await newUser.save();

        // Send the email without sensitive info
        const currentDate = new Date();
        const registrationRequest =
            "Geneus Solutions New User Registration request(Modal)";
        const updatedRegStatus = `${registrationRequest} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;

        await sendEmail(
            process.env.email,
            process.env.toAdmin,
            updatedRegStatus,
            `New user registered: Name: ${name}, Email: ${email}, Mobile: ${mobile}`
        );

        // Generate tokens
        let accessToken = generateAccessToken(newUser);
        let refreshToken = generateRefreshToken(newUser);
        // console.log("Access Token:", accessToken, "Refresh Token:", refreshToken);

        // Return success response
        return res.status(200).json({
            message: "your registration has been successful",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                details: newUser.details,
                food: newUser.food,
                number: newUser.mobile, // Ensure this is the correct property
                plan: newUser.plan,
            },
            accessToken,
            refreshToken,
        });
    } catch (err) {
        console.log("Error occurred", err);
        return res
            .status(500)
            .json({ error: "An error occurred! Please try again later." });
    }
};

const enquiry =  async (req, res) => {
  try {
      const { name, email, subject, paymentid, message } = req.body;
      console.log(req.body)
      if (!name) return res.status(400).send("Name is required");
      if (!email) return res.status(400).send("Email is required");
      if (!subject) return res.status(400).send("Subject is required");
      const enquiry = new Enquiry({
          name,
          email,
          subject,
          paymentId: paymentid,
          message,
      });
      if(paymentid){
      const currentDate = new Date();
      const newQuery = "Geneus Solutions Student payment related Query: " + name;
      const emailSubject = `${newQuery} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;
      
        sendEmail(
          email,
          process.env.toAdmin,
          emailSubject,
          `Name: ${name}\nEmail: ${email}\nMessage: ${message}\nPaymentId: ${paymentid}`
        );
      }
      await enquiry.save();
      return res.status(200).json({message: 'Your Query submitted we will connect to you soon.'});
  } catch (err) {
      console.log(err);
      return res.status(500).send("Error occurred! Please try again later");
  }
}


const getEnquiry = async (req, res) => {
  try{
    const allEnquiry = await Enquiry.find();
    return res.status(200).json({allEnquiry})

  }catch(error){
    console.log(error);
    return res.status(500).json({message: 'Error Occured! Please check out'})
  }
}

const deleteEnquiry = async (req, res) => {
  try{
    const {id} = req.params;
    const findQuery = await Enquiry.findByIdAndDelete(id);
    return res.status(200).json({message: 'Enquiry Deleted.'})
  }catch(error){
    console.log('this is error', error);
    return res.status(500).json({message: 'Error Occured! On Delete the query'})
  }
}

const updateEnquiry = async (req, res) => {
  try{
    const { status }= req.body;
    const { id }= req.params;
    const findQuery = await Enquiry.findOneAndUpdate(
      {_id:  id},
      {$set: {status}},
      {new: true}
    );
    if(!findQuery) return res.status(400).json({success: false, message: 'Enquery not found'});
    return res.status(200).json({success: true, messagge: "Enquiry Status Updated"});
  }catch(error){
    console.log('this is error', error);
    return res.status(500).json({message: 'Error on update the enquiry status'})
  }
}
const validateToken = async (req, res, next) => {
    try {
        const token = req.cookies["token"];
        if (!token) {
            return res.status(401).json({
                authorized: false,
                message: "User is not authenticated",
            });
        }
        const validToken = jwt.verify(token, process.env.SECRET_KEY);
        const rootUser = await Token.findOne({ token: token });
        if (!validToken || !rootUser) {
            throw new Error("User not found");
        }
        req.name = validToken.name;
        req.email = validToken.email;
        req.id = validToken._id;
        req.courses = validToken.courses;
        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).send("Unauthorized: No token provided");
    }
};

const userAuth = async (req, res) => {
    try {
        res.json({
            authorized: true,
            message: "User is authenticated",
            username: req.name,
            useremail: req.email,
            userId: req.id,
            courses: req.courses,
        });
    } catch (error) {
        console.log(error);
        res.status(401).send("Unauthorized: No token provided");
    }
};

const newUserRegister = async (req, res) => {
    try {
        const { fullname, email, mobile } = req.body;
        // Check if the required fields are provided
        if (!fullname || !email || !mobile) {
            return res
                .status(400)
                .json({ error: "Please provide fullname, email, and mobile" });
        }
        const currentDate = new Date();
        const registrationRequest =
            "Geneus Solutions New User Registration request(Modal)";
        const updatedRegStatus = `${registrationRequest} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;
        sendEmail(
            process.env.toAdmin,
            process.env.email,
            updatedRegStatus,
            `Name: ${fullname}\nEmail: ${email}\nMobile: ${mobile}`
        );

        console.log("===newUserRegister called====");
        // Send the email
        const newUser = new NewUser({
            fullname,
            email,
            mobile,
        });
        // Save the user to the database
        const savedUser = await newUser.save();
        res.status(201).json({
            message: "User registered successfully",
            user: savedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "An error occurred while registering the user",
        });
    }
};

const createAndUpdateUserProfile = async (req, res) => {
    try {
        const { data } = req.body;
        console.log(data);
        // const {name, email, mobile, dateOfBirth, secondaryEmail, whatsappNumber, address} = req.body;
        const { userId } = req.params;
        // Find the user in database:-
        // Step 01:- update the user on User model:-
        const updateUserData = {};
        if (data.name) updateUserData.name = data.name;
        if (data.email) updateUserData.email = data.email;
        if (data.mobile) updateUserData.mobile = data.mobile;

        const updateUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: updateUserData,
            },
            { new: true, runValidators: true }
        );
        if (!updateUser)
            return res
                .status(400)
                .json({ error: "User Not Registered and not updated" });
        //Find the user in UserProfile:-
        // step 02:- update the user on User Profile:-
        const updateUserProfileData = {};
        if (data.dateOfBirth)
            updateUserProfileData.dateOfBirth = data.dateOfBirth;
        if (data.secondaryEmail)
            updateUserProfileData.secondaryEmail = data.secondaryEmail;
        if (data.whatsappNumber)
            updateUserProfileData.whatsappNumber = data.whatsappNumber;
        if (data.address) updateUserProfileData.address = data.address;

        const updateUserProfile = await UserProfile.findOneAndUpdate(
            { userId },
            {
                $set: updateUserProfileData,
            },
            { new: true, runValidators: true }
        );
        if (!updateUserProfile)
            return res.status(400).json({
                error: "User Not Registered on Update Profile and not updated",
            });

        // step 03: use $lookup to fetch user along with user Profile
        return res.status(200).json({
            message: "User Profile updated",
            userData: updateUserProfile,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error || "An error occurred while update the user Profile",
        });
    }
};

const getUserProfile = async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    if (userId != id)
        return res
            .status(403)
            .json("You are not authorize to get the profile details");

    const userData = await UserProfile.findOne({ userId: id })
        .populate("userId", "name email mobile role") // Populate specific fields
        .select(
            "dateOfBirth address secondaryEmail whatsappNumber profilePicture"
        )
        .exec();
    return res
        .status(200)
        .json({ userProfileData: userData, message: "User Profile Data" });
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("_id courses name role");
        const modifyUsers = users.map((user) => {
            const coursePurchase =
                user?.courses && user.courses?.length > 0 ? true : false;
            return { ...user.toObject(), coursePurchase };
        });
        return res
            .status(200)
            .json({ message: "User fetched successfully", modifyUsers });
    } catch (error) {
        return res
            .status(200)
            .json(error || "Something went wrong on fecthing user data");
    }
};

const deleteUserAccountById = async (req, res) => {
    try {
        const { id } = req.params; // ID to be deleted
        const { userId } = req.user; // Logged-in user's ID and role
        //find the user by id
        const user = await User.findById({ _id: userId });console.log(user)
        // Check if the user is authorized to delete this account
        if (user.role !== "admin" && userId !== id) {
            return res.status(403).json({
                message: "You are not authorized to delete this account",
            });
        }

        const deletedUser = await User.findByIdAndDelete(id);
        await UserProfile.findOneAndDelete({ userId: id });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const message =
            user.role === "admin"
                ? "User account has been deleted by admin"
                : "Your account has been deleted";

        return res.status(200).json({ message });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ message: "An error occurred while deleting the account" });
    }
};

export {
    loginUser,
    logut,
    contact,
    forgotPassword,
    resetPassword,
    login,
    enquiry,
    getEnquiry,
    deleteEnquiry,
    updateEnquiry,
    signup,
    androidSignup,
    newUserRegister,
    userAuth,
    validateToken,
    deleteUserAccountById,
    createAndUpdateUserProfile,
    getUserProfile,
    getAllUsers,
};
