import express from "express";
import { addNewStock, createTargetPercentage, getStocksName, getTargetPercentage, getUserStocks, getUserStocksDetails, updateStock, updateTargetPercentage } from "../controllers/StocksController.js";
import { Auth } from "../controllers/AuthController.js";
import { Authorise } from "../middlewares/authorize.js";
// import { getAllUserStock } from "../services/stockServices/getAllUserStock.js";

const router = express.Router();

router.get('/stock-symbols', getStocksName);
router.post('/add-stocks',Auth,  Authorise(["admin"]), addNewStock);
router.put('/update-stocks/:id',Auth,  Authorise(["admin"]), updateStock);
router.get('/user-stocks/:userId',Auth, getUserStocks);
router.get('/detail-stock/:stockname/:userId',Auth, getUserStocksDetails);


router.post('/create-targetpercentage/:userId', Auth, Authorise(["admin"]), createTargetPercentage);
router.put('/update-targetpercentage/:userId', Auth, Authorise(["admin"]), updateTargetPercentage);
router.get('/getTargetPercentage/:userId/:stockName', Auth, Authorise(["admin"]), getTargetPercentage);

// router.get('/all-stocks', Auth, Authorise(["Admin"]), getAllUserStock);

export default router;