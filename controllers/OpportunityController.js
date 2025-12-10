import { createOpportunityService, deleteOpportunityService, getPublicOpportunitiesService, updateOpportunityService } from "../services/opportunityServices/opportunity.service.js";
import catchAsync from "../utilities/catchAsync.js";

export const createOpportunity = catchAsync(async (req, res) => {
    const result = await createOpportunityService(req.body);

    res.status(201).json({
        success: true,
        message: `${result.type} created successfully`,
        data: result
    });
});



export const getPublicOpportunities = catchAsync(async (req, res) => {
    const { visibility, department } = req.query; // comes from frontend ?department=HR

    const data = await getPublicOpportunitiesService(
      department || null, visibility
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      opportunities: data,
    });
});

export const updateOpportunity = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Opportunity ID is required.");
  }

  const updatedOpportunity = await updateOpportunityService(id, req.body);

  if (!updatedOpportunity) {
    throw new ApiError(404, "Opportunity not found.");
  }

  return res.status(200).json({
    success: true,
    message: "Opportunity updated successfully",
    opportunity: updatedOpportunity
  });
});


export const deleteOpportunity = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Opportunity ID is required.");
  }

  const deleted = await deleteOpportunityService(id);

  if (!deleted) {
    throw new ApiError(404, "Opportunity not found.");
  }

  return res.status(200).json({
    success: true,
    message: "Opportunity deleted successfully."
  });
});
