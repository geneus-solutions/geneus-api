import { Router } from 'express';
import { getAllJobs, getJobById, createJob } from '../controllers/CareerJobController.js';

const router = Router();


router.get('/jobs', getAllJobs);


router.get('/jobs/:id', getJobById);

router.post('/createjob', createJob);

export default router;