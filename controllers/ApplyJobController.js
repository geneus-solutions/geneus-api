import { createJobApplication } from "../services/jobApplication/JobApplication.js";
import { getOpportunityById } from "../services/opportunityServices/opportunity.service.js";
import ApiError from "../utilities/ApiError.js";
import catchAsync from "../utilities/catchAsync.js";
import sendEmail from "./EmailController.js";
import fs from 'fs';

export const applyJob = catchAsync(async (req, res) => {
    const {
      name,
      email,
      phone,
      college,
      degreeBranch,
      currentSemester,
    } = req.body;
    const { opportunityId } = req.params;
    console.log('this is opportunity id', opportunityId)
    const opportunity = await getOpportunityById(opportunityId);

    if(!opportunity) throw new ApiError(404, "Opportunity not exists");

    const application = await createJobApplication(req.body, opportunity._id);

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background-color: #1976d2; color: white; padding: 16px 24px; font-size: 18px;">
            <strong>New Job Application</strong>
          </div>
          <div style="padding: 24px;">
            <h3 style="margin-top: 20px; color: #1976d2;">👤 Applicant Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr><td style="padding: 6px 0;"><strong>Name:</strong></td><td>${name}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Email:</strong></td><td>${email}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Phone:</strong></td><td>${phone}</td></tr>
            </table>

            <h3 style="margin-top: 24px; color: #1976d2;">💻 Educational Qualification</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr><td style="padding: 6px 0;"><strong>College:</strong></td><td>${college}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Degree Branch:</strong></td><td>${degreeBranch}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Current Semester:</strong></td><td>${currentSemester}</td></tr>
            </table>

            <div style="margin-top: 32px; text-align: center;">
              <p style="background: #1976d2; color: white; padding: 10px 20px; border-radius: 4px;">
                Reply to Applicant
              </p>
            </div>
          </div>

          <div style="background-color: #f0f0f0; padding: 12px 24px; text-align: center; font-size: 13px; color: #555;">
            © ${new Date().getFullYear()} Geneus Solutions — Job Application System
          </div>
        </div>
      </div>
    `;

    // const mailOptions = {
    //   from: `"Job Portal" <${process.env.ADMIN_EMAIL}>`,
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `New Application: ${name} (${degreeBranch})`,
    //   html: htmlTemplate,
    //   attachments: req.file
    //     ? [{ filename: req.file.originalname, content: req.file.buffer }]
    //     : [],
    // };

    // await transporter.sendMail(mailOptions);
    await sendEmail(
      email,
      process.env.toAdmin,
      `New Application: ${name} ${phone} ${opportunity.type} ${opportunity.title} (${degreeBranch})`,
      "",
      htmlTemplate,
      req.file ? [{ filename: req.file.originalname, path: req.file.path }] : []
    );
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
        else console.log("Temporary file deleted:", req.file.path);
      });
    }
    return res.status(200).json({
      success: true,
      message: "Application submitted successfully. Email sent to admin.",
      application,
    });
});
