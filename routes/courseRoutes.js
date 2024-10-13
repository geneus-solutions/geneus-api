import express from "express";
import Course from "../models/course";
import User from "../models/user";
const router = express.Router();

router.get("/courses", async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: "Error fetching courses" });
    }
});

router.get("/learning", async (req, res) => {
    try {
        const user_id = req.query.user_id;
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const user_courses = user.courses;
        const courses = await Course.find({ id: { $in: user_courses } });
        res.status(200).json({ courses: courses });
    } catch (error) {
        res.status(500).json({ error: "Error fetching courses" });
    }
});

router.get("/courseDes/:id", async (req, res) => {
    try {
        const courseDetails = await Course.findById(req.params.id);
        if (!courseDetails) {
            return res.status(404).json({ error: "Course details not found" });
        }
        res.json(courseDetails);
    } catch (error) {
        res.status(500).json({ error: "Error fetching course details" });
    }
});

export default router;