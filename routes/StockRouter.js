import express from "express";
import { addNewStock, getStocksName, getUserStocks, updateStock } from "../controllers/StocksController.js";
import { Auth } from "../controllers/AuthController.js";
import { Authorise } from "../middlewares/authorize.js";

const router = express.Router();

router.get('/stock-symbols', getStocksName);
router.post('/add-stocks',Auth,  Authorise(["admin"]), addNewStock);
router.put('/update-stocks/:id',Auth,  Authorise(["admin"]), updateStock);
router.get('/user-stocks/:userId',Auth, getUserStocks);

export default router;