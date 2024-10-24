import express from "express";
import shortid from "shortid";
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/payment.js";
import User from "../models/User.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Token from "../models/Token.js";
import {paymentVerification, postRazorpay} from "../controllers/RazorpayController.js"
dotenv.config();

const router = express.Router();
import nodemailer from "nodemailer"

router.post("/razorpay",postRazorpay);

router.post("/paymentverification", paymentVerification);

export default router;