import mongoose from "mongoose";

const OpportunitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["job", "course", "internship"],
      required: true,
    },

    // Shared fields
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    about: [
      {
        type: String,
      },
    ],

    department: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    employementType: {
      type: String,
      required: true,
      enum: ["Full-time", "Part-time", "Contract", "Freelance"],
      default: "Full-time",
    },
    skills: [{ type: String }],
    locationType: {
      type: String,
      enum: ["Remote", "Onsite", "Hybrid"],
      default: "Remote",
    },
    location: {
      type: String,
    },
    whoCanApply: [
      {
        type: String,
      },
    ],
    otherRequirements: [
      {
        type: String,
      },
    ],
    perks: [
      {
        type: String,
      },
    ],
    numberOfOpening: {
      type: Number,
    },
    lastDateToApply: {
      type: Date,
    },
    startFrom: {
      type: String,
    },
    /* ------------------------------
     * JOB DETAILS (type = job)
     * ------------------------------ */
    jobDetails: {
      salary: { type: String },
      responsibilities: [{ type: String }],
      requirements: [{ type: String }],
      internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Opportunity",
      },
    },

    /* ------------------------------
     * COURSE DETAILS (type = course)
     * ------------------------------ */
    courseDetails: {
      price: { type: Number },
      durationWeeks: { type: Number },
      modules: [{ type: String }],
      keywords: [{ type: String }],
      // Links to internship
      internshipId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Opportunity",
      },
    },

    /* ----------------------------------
     * INTERNSHIP DETAILS (type = internship)
     * ---------------------------------- */
    internshipDetails: {
      duration: { type: String }, // e.g. "3 months"
      stipendType: {
        type: String,
        enum: ["unpaid", "fixed", "range"],
      },

      stipendAmount: {
        type: String,
      },

      stipendRange: {
        type: {
          min: String,
          max: String,
        },
        default: null,
      },
    },
  },
  { timestamps: true }
);

// Prevent saving irrelevant detail blocks
OpportunitySchema.pre("save", function (next) {
  if (this.type === "job") {
    this.courseDetails = undefined;
    this.internshipDetails = undefined;
  }

  if (this.type === "course") {
    this.jobDetails = undefined;
    this.internshipDetails = undefined;
  }

  if (this.type === "internship") {
    this.jobDetails = undefined;
    this.courseDetails = undefined;
  }

  next();
});

const Opportunity = mongoose.model("Opportunity", OpportunitySchema);

export default Opportunity;
