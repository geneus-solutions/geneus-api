import express from 'express';
const router = express.Router();
import {Auth} from '../controllers/AuthController.js';
import { Authorise } from  "../middlewares/authorize.js";
import { createOpportunity, deleteOpportunity, getPublicOpportunities, updateOpportunity } from '../controllers/OpportunityController.js';

router.get('/getOpportunity', getPublicOpportunities);
router.post('/createOpportunity', Auth, Authorise(["admin"]), createOpportunity);
router.put('/updateOpportunity/:id',Auth, Authorise(["admin"]), updateOpportunity);
router.delete('/deleteOpportunity/:id', Auth, Authorise(["admin"]),deleteOpportunity);



// router.post('/addFoodItem',Auth, Authorise(['admin']), createItem)
export default router;