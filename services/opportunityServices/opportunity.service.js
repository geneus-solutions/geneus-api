import Opportunity from "../../models/Opportunity.model.js";
import ApiError from "../../utilities/ApiError.js";

//   Create Opportunity (Job / Course / Internship)

export async function createOpportunityService(data) {
  const {
    type,
    title,
    description,
    department,
    visibility,
    skills,
    locationType,
    location,
    about,
    employementType,
  } = data;

  // Validate main type
  if (!["job", "course", "internship"].includes(type)) {
    throw new ApiError(400, "Invalid opportunity type.");
  }

  if (!title) {
    throw new ApiError(400, "Title is required.");
  }

  // Base Opportunity
  const opportunity = new Opportunity({
    type,
    title,
    description,
    department,
    about: about || [],
    employementType: employementType || "Full-time",
    visibility: visibility || "public",
    skills: skills || [],
    locationType,
    location,
    whoCanApply: data.whoCanApply || [],
    otherRequirements: data.otherRequirements || [],
    perks: data.perks || [],
    numberOfOpening: data.numberOfOpening,
    lastDateToApply: data.lastDateToApply,
    startFrom: data.startFrom,
  });

  /* ====================================================
       🟦 JOB HANDLING
    ======================================================*/
  if (type === "job") {
    if (!data.jobDetails) {
      throw new ApiError(400, "jobDetails is required.");
    }

    opportunity.jobDetails = {
      salary: data.jobDetails.salary,
      responsibilities: data.jobDetails.responsibilities || [],
      requirements: data.jobDetails.requirements || [],
    };

    // Remove irrelevant fields
    opportunity.courseDetails = undefined;
    opportunity.internshipDetails = undefined;
  }

  /* ====================================================
       🟩 COURSE HANDLING
    ======================================================*/
  if (type === "course") {
    if (!data.courseDetails) {
      throw new ApiError(400, "courseDetails is required.");
    }

    opportunity.courseDetails = {
      price: data.courseDetails.price,
      durationWeeks: data.courseDetails.durationWeeks,
      modules: data.courseDetails.modules || [],
      keywords: data.courseDetails.keywords || [],
      internshipId: data.courseDetails.internshipId || null, // optional linking
    };

    // Remove irrelevant fields
    opportunity.jobDetails = undefined;
    opportunity.internshipDetails = undefined;
  }

  /* ====================================================
       🟧 INTERNSHIP HANDLING
    ======================================================*/
  if (type === "internship") {
    const internship = data.internshipDetails;

    if (!internship) {
      throw new ApiError(400, "internshipDetails is required.");
    }

    if (!["unpaid", "fixed", "range"].includes(internship.stipendType)) {
      throw new ApiError(400, "Invalid stipendType.");
    }

    // Prepare stipend structure
    let stipendDetails = {};

    if (internship.stipendType === "fixed") {
      if (!internship.stipendAmount) {
        throw new ApiError(
          400,
          "stipendAmount is required for stipendType = fixed"
        );
      }
      stipendDetails.stipendAmount = internship.stipendAmount;
    }

    if (internship.stipendType === "range") {
      if (!internship.stipendRange?.min || !internship.stipendRange?.max) {
        throw new ApiError(
          400,
          "stipendRange.min and stipendRange.max are required for stipendType = range"
        );
      }
      stipendDetails.stipendRange = {
        min: internship.stipendRange.min,
        max: internship.stipendRange.max,
      };
    }

    // Assign Internship
    opportunity.internshipDetails = {
      duration: internship.duration,
      stipendType: internship.stipendType,
      ...stipendDetails,
    };

    // Remove irrelevant fields
    opportunity.jobDetails = undefined;
    opportunity.courseDetails = undefined;
  }

  /* ====================================================
       🟪 SAVE TO DATABASE
    ======================================================*/
  await opportunity.save();

  return opportunity;
}

//   Get all public opportunities with optional department filtering

export async function getPublicOpportunitiesService(department, visibility) {
  const filter = {
    visibility: visibility,
  };

  if (department) {
    filter.department = department;
  }

  const list = await Opportunity.find(filter).sort({ createdAt: -1 });
  // Trim fields based on type
  const formatted = list.map((item) => {
    const obj = item.toObject();

    if (obj.type === "job") {
      delete obj.courseDetails;
      delete obj.internshipDetails;
    }

    if (obj.type === "internship") {
      delete obj.courseDetails;
      delete obj.jobDetails;
    }

    if (obj.type === "course") {
      delete obj.jobDetails;
      delete obj.internshipDetails;
    }

    return obj;
  });

  return formatted;
}

export async function updateOpportunityService(id, data) {
  const existing = await Opportunity.findById(id);
  if (!existing) {
    throw new ApiError(404, "Opportunity not found");
  }

  /* ------------------------------------
   * 1. UPDATE BASE FIELDS (except nested)
   * ------------------------------------ */
  const excludeKeys = [
    "jobDetails",
    "courseDetails",
    "internshipDetails",
    "type", // handle separately
  ];

  Object.keys(data).forEach((key) => {
    if (!excludeKeys.includes(key)) {
      if (data[key] !== undefined) {
        existing[key] = data[key];
      }
    }
  });

  /* ------------------------------------
   * 2. HANDLE TYPE CHANGE
   * ------------------------------------ */
  let newType = data.type || existing.type;

  // If user changed type, reset other nested details
  if (data.type && data.type !== existing.type) {
    if (newType === "job") {
      existing.jobDetails = {};
      existing.courseDetails = undefined;
      existing.internshipDetails = undefined;
    }

    if (newType === "course") {
      existing.courseDetails = {};
      existing.jobDetails = undefined;
      existing.internshipDetails = undefined;
    }

    if (newType === "internship") {
      existing.internshipDetails = {};
      existing.courseDetails = undefined;
      existing.jobDetails = undefined;
    }

    existing.type = newType;
  }

  /* ------------------------------------
   * 3. UPDATE NESTED DETAILS BASED ON TYPE
   * ------------------------------------ */

  // 🔵 JOB UPDATE
  if (newType === "job" && data.jobDetails) {
    existing.jobDetails = {
      ...existing.jobDetails,
      ...data.jobDetails,
    };
  }

  // 🟣 COURSE UPDATE
  if (newType === "course" && data.courseDetails) {
    existing.courseDetails = {
      ...existing.courseDetails,
      ...data.courseDetails,
    };
  }

  // 🟢 INTERNSHIP UPDATE
  if (newType === "internship" && data.internshipDetails) {
    const intern = data.internshipDetails;

    if (!["unpaid", "fixed", "range"].includes(intern.stipendType)) {
      throw new ApiError(400, "Invalid stipendType");
    }

    existing.internshipDetails.stipendAmount = undefined;
    existing.internshipDetails.stipendRange = undefined;

    let stipendPayload = {};

    if (intern.stipendType === "fixed") {
      stipendPayload.stipendAmount = intern.stipendAmount;
    }

    if (intern.stipendType === "range") {
      stipendPayload.stipendRange = {
        min: intern.stipendRange?.min,
        max: intern.stipendRange?.max,
      };
    }

    console.log("this is stipendPayload", stipendPayload);

    existing.internshipDetails = {
      ...existing.internshipDetails,
      duration: intern.duration,
      stipendType: intern.stipendType,
      ...stipendPayload,
    };
  }

  console.log("this is existihng", existing);
  /* ------------------------------------
   * 4. SAVE & RETURN CLEAN DATA
   * ------------------------------------ */
  await existing.save();
  return existing;
}

// Delete Opportunity:-
export async function deleteOpportunityService(id) {
  const deleted = await Opportunity.findByIdAndDelete(id);

  if (!deleted) {
    throw new ApiError(404, "Opportunity not found");
  }

  return deleted; // not returned to client, but needed to check existence
}


// Get Opportunity by ID:-

export async function getOpportunityById(id) {
  const opportunity = await Opportunity.findById({_id: id});
  return opportunity;
}
