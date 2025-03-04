import express from "express";
import {addtoCart, getCart, cartDelete} from "../controllers/CartController.js"
const router = express.Router();

router.post("/addtocart", addtoCart);

router.get("/cart", getCart);

router.post("/cartempty",cartDelete);

router.post("/cartdelete", cartDelete);

export default router;