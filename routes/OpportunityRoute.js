import express from 'express';
const router = express.Router();
import {Auth} from '../controllers/AuthController.js'

import { Authorise } from '../middlewares/authorize.js';
import { createOpportunity, getPublicOpportunities } from '../controllers/OpportunityController.js';

router.post('/createOpportunity', createOpportunity);
router.get('/getOpportunity', getPublicOpportunities);



// router.post('/addFoodItem',Auth, Authorise(['admin']), createItem)
export default router;