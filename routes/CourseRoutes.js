import express from "express";
import Course from "../models/course.js";
import User from "../models/User.js";
import {getCourse, getCourseById, learning} from "../controllers/CourseController.js"
const router = express.Router();

router.get("/courses", getCourse);

router.get("/learning", learning);

router.get("/courseDes/:id",getCourseById);

export default router;