import express from 'express';
const router = express.Router();

import { Auth } from '../controllers/AuthController.js'
import { getFoodById, updateFood, removeFood, addFoodToDiary} from "../controllers/FoodController.js"
import { isNutriPlanValid } from '../middlewares/isNutriPlanValid.js';
import { scanFood } from '../controllers/scanFoodController.js';
import { uploadImage } from '../middlewares/uploadImage.js';

router.post('/api/addFood',Auth,isNutriPlanValid, addFoodToDiary);
router.get('/api/getFoodById/:id',Auth, getFoodById);
router.put('/api/updateFood', Auth,isNutriPlanValid, updateFood);
router.delete('/api/removeFood',Auth,isNutriPlanValid, removeFood)


router.post('/api/scanFood', Auth, isNutriPlanValid, uploadImage.single("foodImage"), scanFood);
export default router;