import express from 'express';
const router = express.Router();
import {Auth} from '../controllers/AuthController.js'

import { Authorise } from '../middlewares/authorize.js';
import { createOpportunity, deleteOpportunity, getPublicOpportunities, updateOpportunity } from '../controllers/OpportunityController.js';

router.get('/getOpportunity', getPublicOpportunities);
router.post('/createOpportunity', createOpportunity);
router.put('/updateOpportunity/:id', updateOpportunity);
router.delete('/deleteOpportunity/:id', deleteOpportunity);



// router.post('/addFoodItem',Auth, Authorise(['admin']), createItem)
export default router;