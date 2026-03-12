import express from "express";
import { generateCertificate, getAllCertificates, verifyCertificate } from "../controllers/generateCertificateController.js";
import { Auth } from "../controllers/AuthController.js";
import { Authorise } from "../middlewares/authorize.js";

const router = express.Router();

router.post("/certificate/generate",  Auth, Authorise(["admin"]), generateCertificate);

router.get("/certificates", Auth, Authorise(["admin"]), getAllCertificates);

router.get("/verify/:certificateId", Auth, Authorise(["admin"]), verifyCertificate);

export default router;