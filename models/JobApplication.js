import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Please fill a valid 10-digit mobile number"],
    },
    college: {
      type: String,
      required: true,
      trim: true,
    },
    degreeBranch: {
      type: String,
      required: true,
      trim: true,
    },
    currentSemester: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
