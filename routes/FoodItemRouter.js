import express from 'express';
const router = express.Router();
import {getItems} from "../controllers/FoodItemController.js"

router.get('/getFoodItems', getItems);

export default router;