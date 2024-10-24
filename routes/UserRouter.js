import express from 'express';
import jwt from 'jsonwebtoken';
const { verify } = jwt;
import Token from "../models/Token.js";
import dotenv from 'dotenv';
import NewUser from "../models/newUser.js";
dotenv.config();
import nodemailer from "nodemailer"
const router = express.Router();

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  // Configure the email provider settings
  service: "Gmail",
  auth: {
    user: process.env.email,
    pass: process.env.password,
  },
});

export const validateToken = async (req, res, next) => {
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

router.post('/userAuth', validateToken, async (req, res) => {
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
});

router.post('/newUserRegister', async (req, res) => {
  try {
    const { fullname, email, mobile } = req.body;
    // Check if the required fields are provided
    if (!fullname || !email || !mobile) {
      return res.status(400).json({ error: 'Please provide fullname, email, and mobile' });
    }
    const currentDate = new Date();
    const registrationRequest = "Geneus Solutions New User Registration request(Modal)";
    const updatedRegStatus = `${registrationRequest} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;
    // Define the email content
    const mailOptions = {
      from: process.env.email,
      to: process.env.toAdmin,
      subject: updatedRegStatus,
      text: `Name: ${fullname}\nEmail: ${email}\nMobile: ${mobile}`,
    };
    console.log("===newUserRegister called====");
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to send email" });
      }
      console.log("Email sent:", info.response);
    });
    // Create a new user instance
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
});

export default router;