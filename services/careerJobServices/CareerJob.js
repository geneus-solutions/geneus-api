import Job from "../../models/Career.js";
import { v4 as uuidv4 } from "uuid";


const parseArray = (input) => {
  if (Array.isArray(input)) return input.filter((i) => i && i.trim() !== "");
  if (typeof input === "string" && input.trim() !== "") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.filter((i) => i && i.trim() !== "");
    } catch {}
    return input
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i !== "");
  }
  return [];
};

// ------------------- DB Operations ----------------------

export const fetchJobs = async (filter, page, limit) => {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
    Job.countDocuments(filter),
  ]);

  return { jobs, total, limitNum };
};

export const fetchJobById = async (id) => {
  return await Job.findOne({ id }).lean();
};

export const createJobInDB = async ({
  title,
  desc,
  about,
  location = "100% remote",
  employmentType = "Full-time",
  qualifications = [],
  responsibilities = [],
}) => {
  const trimmedTitle = title.trim();
  const trimmedDesc = desc.trim();

  const existingJob = await Job.findOne({ title: trimmedTitle });
  if (existingJob) throw new Error("A job with this title already exists");

  const id = uuidv4();
  const qualificationsArray = parseArray(qualifications);
  const responsibilitiesArray = parseArray(responsibilities);

  const aboutText = about && typeof about === "string" ? about.trim() : "";
  if (!aboutText) throw new Error("About field is required");

  const job = await Job.create({
    title: trimmedTitle,
    desc: trimmedDesc,
    about: aboutText,
    location: location.trim(),
    employmentType,
    qualifications: qualificationsArray,
    responsibilities: responsibilitiesArray,
    id,
  });

  return job;
};
