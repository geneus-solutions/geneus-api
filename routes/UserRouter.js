import express from 'express';
import {
  loginUser,
  signup,
    androidSignup,
    newUserRegister,
    userAuth,
    validateToken,
    deleteUserAccountById,
  createAndUpdateUserProfile,
    getUserProfile,
    getAllUsers,
 } from '../controllers/UserController.js';
import { Auth, refreshTokenHandler} from '../controllers/AuthController.js';
import { Authorise } from "../middlewares/authorize.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/androidSignup", androidSignup);
router.post("/login", loginUser);
router.post("/refreshToken", refreshTokenHandler);
router.post("/userAuth", validateToken, userAuth);
router.post("/newUserRegister", newUserRegister);
router.delete("/deleteuser/:id", Auth, deleteUserAccountById);
router.post("/updateuserprofile/:userId", createAndUpdateUserProfile);
router.get("/getuserprofile/:id", Auth, getUserProfile);
router.get("/getallusers",Auth, Authorise(["admin"]), getAllUsers);
export default router;