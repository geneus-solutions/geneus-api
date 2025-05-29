import express from "express";

const router = express.Router();

import {
    getRefreshToken,
    getRefreshTokenAndroid,
} from "../controllers/RefreshTokenController.js";

router.get("/refresh_token", getRefreshToken);
router.post("/refresh_token_android", getRefreshTokenAndroid);

export default router;
