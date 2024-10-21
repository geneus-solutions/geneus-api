import jwt from "jsonwebtoken";
import express from "express";
import bcryptjs from "bcryptjs";
import User from "../models/User.js";
import Token from "../models/Token.js";
import Enquiry from "../models/Enquiry.js";
import Visitor from "../models/Visitor.js";

const nodemailer = require("nodemailer");
const router = express.Router();
const crypto = require('crypto');
const Detail = require('../models/Details')
const Food = require('../models/Food')
const Item = require('../models/Items')
const Plan = require('../models/Plan')

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  // Configure the email provider settings
  // For example, for Gmail:
  service: "Gmail",
  auth: {
    user: process.env.email,
    pass: process.env.password,
  },
});

function addErrorHandling(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;
    await Token.deleteOne({ token });
    res.clearCookie("token");
    return res.status(204).json({ message: "Logout successful!" });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

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

router.post("/contact", async (req, res) => {
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


    // Define the email content
    const mailOptions = {
      from: email,
      to: process.env.toAdmin,
      subject: subject,
      text: `Name: ${name}\nEmail: ${email}\nContact: ${contact}\nMessage: ${message}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to send email" });
      }
    });

    await query.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

router.post("/login", async (req, res) => {
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
});

router.post("/signup", async (req, res) => {
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

    const mailOptions = {
      from: process.env.email,
      to: process.env.toAdmin,
      subject: updatedRegStatus,
      text: `New user registered: Name: ${name}, Email: ${email}, Mobile: ${mobile}`,
    };

    // Send the email
    await  transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.log(error);
                  return res.status(500).json({ error: "Failed to send email" });
                }
                console.log("Email sent:", info.response);
              });
    return res.status(200).json({
                       message: 'User registered successfully',
                       user: {
                           id: newUser._id,
                           name: newUser.name,
                           email: newUser.email,
                           details: newUser.details,
                           food: newUser.food,
                           number : newUser.number,
                           plan : newUser.plan,
                       }
                       //,
                       //accessToken,
                       //refreshToken
                   });
  } catch (err) {
    console.log("Error occurred", err);
    return res.status(500).json({ error: "An error occurred! Please try again later." });
  } finally {
    console.log("====FINALLY CALLED====");
  }
});

router.post("/enquiry", async (req, res) => {
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
});

router.post("/forgot-password", async (req, res) => {
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

  const mailOptions = {
    from:process.env.toAdmin,
    to: email,
    subject: 'Password Reset',
    text: `You are receiving this because you  have requested to reset the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to send email" });
    }
    console.log("Email sent:", info.response);
  });

  res.send('Password reset email sent.');
  } catch (error) {
    console.error("Error in forgot-password route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/reset-password", async (req, res) => {
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
});

// Endpoint to save visitor data
router.post('/api/visitors', async (req, res) => {
  const { ip, city } = req.body;
  const newVisitor = new Visitor({ ip, city });

  try {
    await newVisitor.save();
    res.status(201).send('Visitor data saved successfully');
  } catch (error) {
    res.status(500).send('Error saving visitor data');
  }
});

  export default router;