import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    id: Number,
    title: String,
    img: String,
    description: String,
    level: String,
    price: Number,
    discount_price: Number,
    learnings: {
      type: [String],
    },
    requirements: {
      type: [String],
    },
    aboutCourse: {
      intro: String,
      details: [String],
    },
    whythisCourse: {
      title: String,
      intro: String,
      details: [String],
      outro: String,
    },
    whoitsfor: {
      type: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
