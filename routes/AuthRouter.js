import express from "express";
import {logut, contact, loginUser,  signup, enquiry, forgotPassword, resetPassword} from '../controllers/UserController.js'
import { Auth, deleteVistorDataByDate, getVisitorData } from '../controllers/AuthController.js';
const router = express.Router();


router.post("/logout",Auth, logut);

router.post("/contact", contact);

router.post("/login",loginUser);

router.post("/signup", signup);

router.post("/enquiry", enquiry);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/getvisitor/:date", getVisitorData);
router.delete("/deletevisitor/:date", deleteVistorDataByDate);

export default router;