import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    default: "100% remote"
  },
  employmentType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'],
    default: 'Full-time'
  },
  department: {
    type: String,
    enum: ['Development', 'Design', 'Marketing', 'Customer Service', 'Operations', 'Finance', 'Management']
  },
  isRemote: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  qualifications: {
    type: [String],
    required: true
  },
  responsibilities: {
    type: [String],
    required: true
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  applicationLink: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model("Job", jobSchema);