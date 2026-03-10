import express from "express";
import { generateCertificate, getAllCertificates, verifyCertificate } from "../controllers/generateCertificateController.js";

const router = express.Router();

router.post("/generate", generateCertificate);

router.get("/certificates", getAllCertificates);

router.get("/verify/:certificateId", verifyCertificate);

export default router;