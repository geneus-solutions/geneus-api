import JobApplication from "../../models/JobApplication.js";
import ApiError from "../../utilities/ApiError.js";

export const createJobApplication = async (data, opportunityId) => {
  const { name, email, phone, college, degreeBranch, currentSemester } = data;

  if (
    !name ||
    !email ||
    !phone ||
    !college ||
    !degreeBranch ||
    !currentSemester
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const application = new JobApplication({
    name,
    email,
    phone,
    college,
    degreeBranch,
    currentSemester,
    opportunityId
  });

  await application.save();
  return application;
};
