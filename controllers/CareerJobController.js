import {
  fetchJobs,
  fetchJobById,
  createJobInDB,
} from "../services/careerJobServices/CareerJob.js";

export const getAllJobs = async (req, res) => {
  try {
    const { search, location, type, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (location) filter.location = location;
    if (type) filter.type = type;

    const { jobs, total, limitNum } = await fetchJobs(filter, page, limit);

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("getAllJobs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await fetchJobById(id);

    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });

    res.json({ success: true, data: job });
  } catch (error) {
    console.error("getJobById error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const job = await createJobInDB(req.body);
    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    console.error("createJob error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
