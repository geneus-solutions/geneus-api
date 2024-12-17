import jwt from "jsonwebtoken";
import express from "express";
import bcryptjs from "bcryptjs";
import User from "../models/User.js";
import Token from "../models/Token.js";
import Enquiry from "../models/Enquiry.js";
import Visitor from "../models/Visitor.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {logut, contact, loginUser,  signup, enquiry, forgotPassword, resetPassword} from '../controllers/UserController.js'
import { Auth } from '../controllers/AuthController.js';
const router = express.Router();


router.post("/logout",Auth, logut);

router.post("/contact", contact);

router.post("/login",loginUser);

router.post("/signup", signup);

router.post("/enquiry", enquiry);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

  export default router;