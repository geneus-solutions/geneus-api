import { Router } from "express";
import { applyJob } from "../controllers/ApplyJobController.js";
import { uploadDocs } from "../middlewares/uploadDocs.js";

const router = Router();

router.post("/apply-job/:opportunityId", uploadDocs.single("resume"), applyJob);

export default router;
