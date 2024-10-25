import User from '../models/User.js';
import Detail from '../models/FoodDetails.js';
import Food from '../models/Food.js';
import Plan from '../models/Plan.js';
import { generateAccessToken, generateRefreshToken } from '../controllers/AuthController.js';
import sendEmail from './EmailController.js';
import bcryptjs from "bcryptjs"
import Token from "../models/Token.js";
import Enquiry from "../models/Enquiry.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import NewUser from "../models/newUser.js";
import { configDotenv } from 'dotenv';


configDotenv()


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Request Body:", req.body); // Log request body

    // Validate input
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    const user = await User.findOne({ email }).exec();
    console.log("User fetched:", user); // Log fetched user

    // Validate user credentials
    if (!user) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    const isPasswordValid = bcryptjs.compareSync(password, user.password);
    console.log("Is Password Valid:", isPasswordValid); // Log password validity

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Check for mobile or web request
   
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
      // For mobile requests, return tokens in the JSON response
      return res.status(200).json({
        message: 'Logged in successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          plan: user.plan
        },
        accessToken,
        refreshToken
      });
    
      // For web requests, set tokens as cookies
     
      
    
    
  } catch (error) {
    console.error("Authentication Error:", error); // Log any errors
    return res.status(500).json({ error: "Authentication Failed!" });
  }
};


const getUser = async (req, res) => {
  const { userId } = req.user;
  try {
      console.log(`Fetching user with ID: ${userId}`);
      
      // Populate the references for details, food, and plan
      const user = await User.findById(userId)
          .populate('details')
          .populate('food')
          .populate('plan')

      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      console.log("User found:", user);

      // Check if populated fields are available
      if (!user.details || !user.food || !user.plan) {
          console.log("Population error: One or more referenced fields are missing.");
          return res.status(500).json({ error: "Failed to populate user data" });
      }

      const totalCalories = user.details.caloriegoal;
      const goal = user.details.goal;

      // Macronutrient distribution based on the goal
      const macronutrientDistribution = {
          'Lose Weight': { protein: 30, carbs: 40, fat: 30 },
          'Gain Muscle': { protein: 35, carbs: 40, fat: 25 },
          'Athletic Performance': { protein: 30, carbs: 50, fat: 20 },
          'Maintain Weight': { protein: 30, carbs: 45, fat: 25 },
          'Gain Weight': { protein: 20, carbs: 55, fat: 25 },
          'Manage Stress': { protein: 30, carbs: 25, fat: 45 },
      };

      const { protein: proteinPercent, carbs: carbsPercent, fat: fatPercent } = macronutrientDistribution[goal] || { protein: 20, carbs: 50, fat: 30 };

      // Calculate macronutrients in grams
      const proteinGrams = (totalCalories * (proteinPercent / 100)) / 4;
      const carbsGrams = (totalCalories * (carbsPercent / 100)) / 4;
      const fatGrams = (totalCalories * (fatPercent / 100)) / 9;

      console.log(`Calculated Macronutrients - Protein: ${Math.round(proteinGrams)}g, Carbs: ${Math.round(carbsGrams)}g, Fat: ${Math.round(fatGrams)}g`);

      res.status(201).json({
          user,
          macronutrients: {
              protein: Math.round(proteinGrams),
              carbs: Math.round(carbsGrams),
              fat: Math.round(fatGrams)
          }
      });
  } catch (error) {
      console.error('Server error: ', error);
      res.status(500).json({ message: 'Server error', error });
  }
};


const logut = async (req, res) => {
  try {
    const token = req.cookies.token;
    await Token.deleteOne({ token });
    res.clearCookie("token");
    return res.status(204).json({ message: "Logout successful!" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const contact = async (req, res) => {
  try {
    const { name, email, contact, message } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
    if (!contact) return res.status(400).json({ error: "Contact is required" });
    if (!message) return res.status(400).json({ error: "Please mention your query" });
    const query = new Query({
      name,
      email,
      contact,
      message,
    });

    const currentDate = new Date();
    const newQuery =  "Geneus Solutions New Contact Query: "+name;
    const subject = `${newQuery} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()} - mm/dd/yyyy`;



sendEmail(process.env.toAdmin, email, subject, `Name: ${name}\nEmail: ${email}\nContact: ${contact}\nMessage: ${message}`);
  

    await query.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
}
const forgotPassword = async (req, res) => {
  try {

  const { email } = req.body;
  const user = await User.findOne({ email });
    console.log(' user info '+ user);
  if (!user) {
    return res.status(400).send('No user with that email address found. Please provide a valid email address');
  }

  const token = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();
  const resetURL = process.env.FRONTEND_URL + `/reset-password?token=${token}`;

 
sendEmail(email, process.env.toAdmin, 'Password Reset', `You are receiving this because you  have requested to reset the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`)
  

  res.send('Password reset email sent.');
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    res.status(500).send("Internal Server Error");
  }
};

const resetPassword = async (req, res) => {
 const { token, password } = req.body;
 const user = await User.findOne({
   resetPasswordToken: token,
   resetPasswordExpires: { $gt: Date.now() }
 });

 if (!user) {
   return res.status(400).send('Password reset token is invalid or has expired.');
 }

 // Hash the new password and save it
 user.password = await bcryptjs.hash(password, 12);
 user.resetPasswordToken = undefined;
 user.resetPasswordExpires = undefined;
 await user.save();

 res.status(200).send('Password has been reset successfully. Please log in');
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password) return res.status(400).json({ error: "Password is required" });
    if (!email) return res.status(400).json({ error: "Email is required" });
        const user = await User.findOne({ email }).exec();
    if (!user || !bcryptjs.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }
      const accessToken = jwt.sign(
        user.toJSON(),
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        user.toJSON(),
        process.env.REFRESH_SECRET_KEY
      );
      const token = createTokens(user);
      res.cookie("token", token, {
        maxAge: 1000 * 60 * 5,
        httpOnly: true,
        sameSite: "lax",
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
}

const signup = async (req, res) => {
  try {
    const { name, email, password, mobile  } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: "Valid email is required" });
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password is required and must be at least 8 characters" });
    }
    if (!mobile) return res.status(400).json({ error: "Mobile number is required" });

    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile
    });

    // Create related details, food, and plan
    const newDetail = await Detail.create({ user: newUser._id });
    const newFood = await Food.create({ user: newUser._id });
    const freePlanPrice = 0;

    const newPlan = await Plan.create({
      userId: newUser._id,
      name: 'Free Trial',
      duration: 7,
      price: freePlanPrice
    });

    newUser.details = newDetail._id;
    newUser.food = newFood._id;
    newUser.plan = newPlan._id;
    await newUser.save();

    // Send the email without sensitive info
    const currentDate = new Date();
    const registrationRequest = "Geneus Solutions New User Registration request(Modal)";
    const updatedRegStatus = `${registrationRequest} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;

      await sendEmail(email, process.env.toAdmin, updatedRegStatus, `New user registered: Name: ${name}, Email: ${email}, Mobile: ${mobile}`);

      // Generate tokens
      let accessToken = generateAccessToken(newUser);
      let refreshToken = generateRefreshToken(newUser);
      console.log("Access Token:", accessToken, "Refresh Token:", refreshToken);

      // Return success response
      return res.status(200).json({
          message: 'User registered successfully',
          user: {
              id: newUser._id,
              name: newUser.name,
              email: newUser.email,
              details: newUser.details,
              food: newUser.food,
              number: newUser.mobile,  // Ensure this is the correct property
              plan: newUser.plan,
          },
          accessToken,
          refreshToken
      });
  } catch (err) {
      console.log("Error occurred", err);
      return res.status(500).json({ error: "An error occurred! Please try again later." });
  } finally {
      console.log("====FINALLY CALLED====");
  }
};


const enquiry =  async (req, res) => {
  try {
      const { name, email, contact } = req.body;
      if (!name) return res.status(400).send("Name is required");
      if (!email) return res.status(400).send("Email is required");
      if (!contact) return res.status(400).send("Contact is required");
      const enquiry = new Enquiry({
          name,
          email,
          contact,
      });
      await enquiry.save();
      return res.status(200).json({ ok: true });
  } catch (err) {
      console.log(err);
      return res.status(400).send("Error occurred! Please try again later");
  }
}

const validateToken = async (req, res, next) => {
  try {
    const token = req.cookies["token"];
    if (!token) {
      return res.status(401).json({ authorized: false, message: "User is not authenticated" });
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
}

const userAuth = async (req, res) => {
  try {
    res.json({
      authorized: true,
      message: "User is authenticated",
      username: req.name,
      useremail: req.email,
      userId: req.id,
      courses: req.courses
    });
  } catch (error) {
    console.log(error);
    res.status(401).send("Unauthorized: No token provided");
  }
}

const newUserRegister = async (req, res) => {
  try {
    const { fullname, email, mobile } = req.body;
    // Check if the required fields are provided
    if (!fullname || !email || !mobile) {
      return res.status(400).json({ error: 'Please provide fullname, email, and mobile' });
    }
    const currentDate = new Date();
    const registrationRequest = "Geneus Solutions New User Registration request(Modal)";
    const updatedRegStatus = `${registrationRequest} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;
    sendEmail(process.env.toAdmin, process.env.email, updatedRegStatus,  `Name: ${fullname}\nEmail: ${email}\nMobile: ${mobile}`)
   
    console.log("===newUserRegister called====");
    // Send the email
      const newUser = new NewUser({
      fullname,
      email,
      mobile
    });
    // Save the user to the database
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while registering the user' });
  }
}
export {
    loginUser,
    getUser,
    logut,
    contact,
    forgotPassword,
    resetPassword,
    login,
    enquiry,
    signup,
newUserRegister,
userAuth,
validateToken
};
