import { createOpportunityService, getPublicOpportunitiesService } from "../services/opportunityServices/opportunity.service.js";
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
