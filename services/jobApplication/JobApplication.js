import JobApplication from "../../models/JobApplication.js";


export const createJobApplication = async (data) => {
  const {
    name,
    email,
    phone,
    college,
    degreeBranch,
    currentSemester,
    tenthMarks,
    twelfthMarks,
  } = data;

  if (
    !name ||
    !email ||
    !phone ||
    !college ||
    !degreeBranch ||
    !currentSemester ||
    !tenthMarks ||
    !twelfthMarks
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
    tenthMarks,
    twelfthMarks,
  });

  await application.save();
  return application;
};