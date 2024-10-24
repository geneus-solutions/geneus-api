import express from 'express';
import Food from '../models/Food.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { Auth, refreshTokenHandler } from '../controllers/AuthController.js'
import {postFood, getFoodById, updateFood, removeFood} from "../controllers/FoodController.js"
const router = express.Router();
router.post('/api/addFood',postFood);

router.get('/api/getFoodById/:id',getFoodById);

router.put('/api/updateFood', Auth, updateFood);

  router.delete('/api/removeFood',Auth, removeFood)
 export default router;