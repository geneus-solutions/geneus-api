import mongoose from "mongoose";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { configDotenv } from "dotenv";
import Razorpay from "razorpay";
import MyLearning from "../models/Mylearnings.js";
configDotenv();
const getCourse = async (req, res) => {
  try {
    const courses = await Course.find();
    console.log(courses.length);
    res.json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching courses" });
  }
};

// const addCourse = async (req, res) => {
//   try {
//     const {
//       id,
//       title,
//       img,
//       description,
//       level,
//       price,
//       discount_price,
//       learnings,
//       requirements,
//       aboutCourse,
//       whythisCourse,
//       whoitsfor,
//     } = req.body;

//     console.log('this is create course data--->', req.body)
//     // Validation checks (basic example, consider using libraries like Joi)
//     if (!title || !img || !price) {
//       return res
//         .status(400)
//         .json({ error: "Title, Image, Description, and Price are required." });
//     }
//     // Create a new course instance
//     const newCourse = new Course({
//       id,
//       title,
//       img,
//       description,
//       level,
//       price,
//       discount_price,
//       learnings,
//       requirements,
//       aboutCourse,
//       whythisCourse,
//       whoitsfor,
//     });

//     // Save the course to the database
//     await newCourse.save();
//     res
//       .status(201)
//       .json({ message: "Course added successfully", course: newCourse });
//   } catch (error) {
//     console.error("Error adding course:", error);
//     res
//       .status(500)
//       .json({ error: "Error adding course", details: error.message });
//   }
// };


const addCourse = async (req, res) => {
  try {
    const {
      id,
      title,
      img,
      description,
      level,
      price,
      discount_price,
      aboutCourse,
      learnings,
      requirements,
      whoitsfor,
      whythisCourse,
      courseContent,
      notes,
      enabled,
    } = req.body;

    console.log("Create course payload --->", req.body);

    // ✅ Basic validation
    if (!title || !img || !price) {
      return res.status(400).json({
        error: "Title, Image, and Price are required.",
      });
    }

    // ✅ Create course
    const newCourse = new Course({
      id,
      title,
      img,
      description,
      level,
      price,
      discount_price,

      aboutCourse: aboutCourse || {},

      learnings: learnings || [],
      requirements: requirements || [],
      whoitsfor: whoitsfor || [],

      whythisCourse: whythisCourse || {},

      courseContent: courseContent || [],

      notes: notes || {},

      enabled: enabled ?? true,
    });

    // ✅ Save to DB
    const savedCourse = await newCourse.save();

    return res.status(201).json({
      message: "Course added successfully",
      course: savedCourse,
    });
  } catch (error) {
    console.error("Error adding course:", error);

    return res.status(500).json({
      error: "Failed to add course",
      details: error.message,
    });
  }
};

const learning = async (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const courses = await MyLearning.findOne({ userId: userId })
      .populate("courses_id")
      .lean();

    const myLearningCourses = courses?.courses_id ? courses?.courses_id : [];

    return res.status(200).json({ courses: myLearningCourses });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching courses" });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { userId } = req.query; // Extract user ID from the query
    const courseId = req.params.id;

    // change courseId to mongoose ObjectId
    const courseObjectId = mongoose.Types.ObjectId(courseId);
    // Fetch course details
    const courseDetails = await Course.findById(courseId).lean();
    if (!courseDetails) {
      return res.status(404).json({ error: "Course details not found" });
    }

    let hasAccess = false;

    // Validate _id before using it
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const Mylearning = await MyLearning.findOne({ userId }).lean();

      if (Mylearning?.courses_id?.length > 0) {
        // Check if the user has access to the course
        hasAccess = Mylearning?.courses_id.includes(courseObjectId);
      }
    }

    // Modify course content based on access
    const modifiedContent = courseDetails?.courseContent?.map(
      (content, index) => {
        if (index === 0 || hasAccess) {
          return content; // Return the first video or all videos if the user has access
        }
        return { ...content, url: null }; // Remove URLs for other videos
      }
    );

    // Construct the response
    const modifiedCourseDetails = {
      ...courseDetails,
      courseContent: modifiedContent,
    };

    res.json(modifiedCourseDetails);
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ error: "Error fetching course details" });
  }
};

// const updateCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log("this is course Id", req.params);
//     console.log(req.body);
//     const {
//       title,
//       img,
//       description,
//       level,
//       price,
//       discount_price,
//       learnings,
//       requirements,
//       aboutCourse,
//       whythisCourse,
//       whoitsfor,
//     } = req.body;

//     // Find the course by ID and update it
//     const updatedCourse = await Course.findByIdAndUpdate(
//       { _id: courseId },
//       {
//         title,
//         img,
//         description,
//         level,
//         price,
//         discount_price,
//         learnings,
//         requirements,
//         aboutCourse,
//         whythisCourse,
//         whoitsfor,
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedCourse) {
//       return res.status(404).json({ error: "Course not found" });
//     }

//     return res.status(200).json({ message: "Course updated successfully" });
//   } catch (error) {
//     console.error("Error updating course:", error);
//     res
//       .status(500)
//       .json({ error: "Error updating course", details: error.message });
//   }
// };

/* ----- update the updateCourse controller ----- */

const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // ✅ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }

    // ✅ Build update object dynamically
    const updateData = {};

    const fields = [
      "title",
      "img",
      "description",
      "level",
      "price",
      "discount_price",
      "learnings",
      "requirements",
      "aboutCourse",
      "whythisCourse",
      "whoitsfor",
      "courseContent",
      "notes",
      "enabled",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // ❌ Nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    // ✅ Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      error: "Error updating course",
      details: error.message,
    });
  }
};

export default updateCourse;


const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const deleteCourse = await Course.findByIdAndDelete({ _id: courseId });
    if (!deleteCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(200).json({ message: "Course Deleted Successfully!" });
  } catch (error) {
    console.error("Error updating course:", error);
    res
      .status(500)
      .json({ error: "Error updating course", details: error.message });
  }
};

const courseCheckout = async (req, res) => {
  try {
    const { userId } = req.user;

    const { currency, courseIds } = req.body;

    // Validate userId and courseId
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    if (courseIds.length === 0 || courseIds.length < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Course ID is required" });
    }

    //  check if any of the course is already purchased
    const purchasedCourses = await MyLearning.findOne({ userId })
      .populate("courses_id", "_id title")
      .lean();

    if (purchasedCourses && purchasedCourses.courses_id.length > 0) {
      const alreadyPurchased = purchasedCourses.courses_id.find((course) =>
        courseIds.includes(course._id.toString())
      );

      if (alreadyPurchased) {
        return res
          .status(400)
          .json({
            success: false,
            message: `Course "${alreadyPurchased?.title}" already purchased`,
          });
      }
    }

    const courses = await Course.find(
      { _id: { $in: courseIds } },
      { _id: 1, title: 1, price: 1, discount_price: 1 }
    );

    const checkoutCoursesIds = courses.map((course) => {
      return course?._id?.toString();
    });

    // let payableAmount = courses.reduce((total, course) => {
    //   const coursePrice = course.discount_price || course.price;
    //   return total + coursePrice;
    // }, 0);

    // // this is static only 1 rupees if we intergrate with other copon so change the code
    // if(couponCode === 'a3e29f41'){
    //   payableAmount = 1;
    // }
    let finalAmount;
    console.log('this is vohcer', req.voucher)
    if (req.voucher) {
      finalAmount = req.voucher.finalAmount;
    } else {
      finalAmount = courses.reduce((total, course) => {
        const coursePrice = course.discount_price || course.price;
        return total + coursePrice;
      }, 0);
    }

    const options = {
      amount: finalAmount * 100,
      currency,
      notes: {
        data: {
          userId: userId,
          courseIds: checkoutCoursesIds,
          token: req.voucher
        },
        expectedPaymentToReceive: finalAmount * 100,
        event: "purchase_course",
      },
    };

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const order = await razorpay.orders.create(options);

    return res
      .status(200)
      .json({
        success: true,
        Data: {
          orderId: order?.id,
          currency: order?.currency,
          amount: order?.amount,
        },
      });
  } catch (error) {
    console.log('this is error on checkout', error)
    res
      .status(500)
      .json({ error: "Error during checkout", details: error.message });
  }
};

export {
  learning,
  getCourseById,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
  courseCheckout,
};
