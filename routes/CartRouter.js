import express from "express";
import Cart from "../models/cart.js";
import User from "../models/User.js";
import {addtoCart, getCart, cartEmpty, cartDelete} from "../controllers/CartController.js"
const router = express.Router();

router.post("/addtocart", addtoCart);

router.get("/cart", getCart);

router.post("/cartempty",cartDelete);

router.post("/cartdelete", cartDelete);

export default router;