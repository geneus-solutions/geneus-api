import Opportunity from "../../models/Opportunity.model.js";
import ApiError from "../../utilities/ApiError.js";


//   Create Opportunity (Job / Course / Internship)

export async function createOpportunityService (data) {
    const { type, title, description, department, visibility, skills, locationType, location, about, employementType, lastDateToApply } = data;

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
        about,
        employementType: employementType || 'Full-time',
        visibility: visibility || "public",
        skills: skills || [],
        locationType,
        location
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
            requirements: data.jobDetails.requirements || []
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
            internshipId: data.courseDetails.internshipId || null  // optional linking
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
                throw new ApiError(400, "stipendAmount is required for stipendType = fixed");
            }
            stipendDetails.stipendAmount = internship.stipendAmount;
        }

        if (internship.stipendType === "range") {
            if (!internship.stipendRange?.min || !internship.stipendRange?.max) {
                throw new ApiError(400, "stipendRange.min and stipendRange.max are required for stipendType = range");
            }
            stipendDetails.stipendRange = {
                min: internship.stipendRange.min,
                max: internship.stipendRange.max
            };
        }

        // Assign Internship
        opportunity.internshipDetails = {
            duration: internship.duration,
            stipendType: internship.stipendType,
            lastDateToApply: internship.lastDateToApply,
            ...stipendDetails
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
};



//   Get all public opportunities with optional department filtering
 
export async function getPublicOpportunitiesService(department, visibility) {
  const filter = {
    visibility: visibility
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

