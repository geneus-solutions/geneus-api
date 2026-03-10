import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({

  certificate_id: {
    type: String,
    required: true,
    unique: true
  },

  employee_name: {
    type: String,
    required: true
  },

  employee_email: {
    type: String,
    required: true
  },

  role: {
    type: String,
    required: true
  },

  start_date: {
    type: Date,
    required: true
  },

  end_date: {
    type: Date,
    required: true
  },

  generated_date: {
    type: Date,
    default: Date.now
  },

  pdf_path: String

}, { timestamps: true });

const Certificate = mongoose.model("Certificate", certificateSchema);

export default Certificate;