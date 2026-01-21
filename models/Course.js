// import mongoose from "mongoose";

// const courseSchema = new mongoose.Schema(
//   {
//     id: Number,
//     title: String,
//     img: String,
//     description:String,
//     level: String,
//     price: Number,
//     discount_price: Number,
//     learnings: {
//       type: [String],
//     },
//     requirements: {
//       type: [String],
//     },
//     aboutCourse: {
//       intro: String,
//       details: [String],
//     },
//     whythisCourse: {
//       title: String,
//       intro: String,
//       details: [String],
//       outro: String,
//     },
//     whoitsfor: {
//       type: [String],
//     },
//     enabled: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Course", courseSchema);


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

    aboutCourse: {
      intro: String,
    },

    learnings: [String],

    requirements: [String],

    whoitsfor: [String],

    whythisCourse: {
      title: String,
      intro: String,
      outro: String,
    },

    courseContent: [
      {
        contentTitle: String,
        url: String,
        time: String,
        assignment: String,
      },
    ],

    notes: {
      notesUrl: String,
      notesTitle: String,
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
