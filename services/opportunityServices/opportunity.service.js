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
            keywords: data.courseDetails.keywords || [],
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


// Update Opportunity:-

export async function updateOpportunityService(id, data) {
    const existing = await Opportunity.findById(id);
    if (!existing) {
      throw new ApiError(404, "Opportunity not found");
    }

    const { type, title, description, visibility, skills, location, locationType, about, employementType } = data;

    // Update base fields
    if (type) existing.type = type;
    if (title) existing.title = title;
    if (about)  existing.about = about;
    if (employementType) existing.employementType = employementType;
    if (description) existing.description = description;
    if (visibility) existing.visibility = visibility;
    if (skills) existing.skills = skills;
    if (locationType) existing.locationType = locationType;
    if (location) existing.location = location;

    /* ------------------------------------
     * UPDATE BASED ON TYPE
     * ------------------------------------ */

    // 🚀 JOB UPDATE
    if (existing.type === "job") {
      if (!data.jobDetails) throw new ApiError(400, "jobDetails is required");

      existing.jobDetails = {
        department: data.jobDetails.department,
        salary: data.jobDetails.salary,
        responsibilities: data.jobDetails.responsibilities || [],
        requirements: data.jobDetails.requirements || []
      };

      existing.courseDetails = undefined;
      existing.internshipDetails = undefined;
    }

    // COURSE UPDATE
    if (existing.type === "course") {
      if (!data.courseDetails) throw new ApiError(400, "courseDetails is required");

      existing.courseDetails = {
        price: data.courseDetails.price,
        durationWeeks: data.courseDetails.durationWeeks,
        keywords: data.courseDetails.keywords || [],
        modules: data.courseDetails.modules || [],
        internshipId: data.courseDetails.internshipId || null
      };

      existing.jobDetails = undefined;
      existing.internshipDetails = undefined;
    }

    // INTERNSHIP UPDATE
    if (existing.type === "internship") {
      const intern = data.internshipDetails;
      if (!intern) throw new ApiError(400, "internshipDetails is required");

      if (!["unpaid", "fixed", "range"].includes(intern.stipendType)) {
        throw new ApiError(400, "Invalid stipendType");
      }

      let stipendPayload = {};

      if (intern.stipendType === "fixed") {
        stipendPayload.stipendAmount = intern.stipendAmount;
      }

      if (intern.stipendType === "range") {
        stipendPayload.stipendRange = {
          min: intern.stipendRange?.min,
          max: intern.stipendRange?.max
        };
      }

      if(intern.lastDateToApply) existing.internshipDetails.lastDateToApply = intern.lastDateToApply

      existing.internshipDetails = {
        duration: intern.duration,
        stipendType: intern.stipendType,
        ...stipendPayload
      };

      existing.jobDetails = undefined;
      existing.courseDetails = undefined;
    }

    // Save updated record
    await existing.save();

    // Convert to a plain object for clean API response
    return existing.toObject();
  }


// Delete Opportunity:-
export async function deleteOpportunityService(id) {
    const deleted = await Opportunity.findByIdAndDelete(id);

    if (!deleted) {
      throw new ApiError(404, "Opportunity not found");
    }

    return deleted; // not returned to client, but needed to check existence
  }


