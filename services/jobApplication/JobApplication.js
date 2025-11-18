import JobApplication from "../../models/JobApplication.js";

export const createJobApplication = async (data) => {
  const { name, email, phone, college, degreeBranch, currentSemester } = data;

  if (
    !name ||
    !email ||
    !phone ||
    !college ||
    !degreeBranch ||
    !currentSemester
  ) {
    throw new Error("Missing required fields");
  }

  const application = new JobApplication({
    name,
    email,
    phone,
    college,
    degreeBranch,
    currentSemester,
  });

  await application.save();
  return application;
};
