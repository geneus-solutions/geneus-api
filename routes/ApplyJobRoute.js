import { Router } from "express";
import { applyJob } from "../controllers/ApplyJobController.js";
import { upload } from "../utilities/multerConfig.js";

const router = Router();

router.post("/apply-job/:opportunityId", upload.single("resume"), applyJob);

export default router;
