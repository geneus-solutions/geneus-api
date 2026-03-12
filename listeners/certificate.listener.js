import sendEmail from "../controllers/EmailController.js";
import eventBus from "../utilities/createEvent.js";

eventBus.on("certificate.generated", async (data) => {
  try {
    const { employee_name, employee_email, pdfBuffer } = data;

    await sendEmail(
      process.env.email,
      employee_email,
      "Your Experience Certificate – Geneus Solutions",
      "Please find your experience certificate attached.",
      `
      <p>Dear ${employee_name},</p>

      <p>Congratulations! 🎉</p>

      <p>
      We are pleased to share your <strong>Experience Certificate</strong> from 
      <strong>Geneus Solutions</strong>. Your contribution, dedication, and effort during 
      your time with us are truly appreciated.
      </p>

      <p>
      Please find your certificate attached to this email for your records.
      </p>

      <p>
      We wish you continued success in your professional journey and hope you achieve 
      great milestones in the future.
      </p>

      <p>
      Best regards,<br/>
      <strong>Geneus Solutions Team</strong>
      </p>
      `,
      [
        {
          filename: "Geneus_Experience_Certificate.pdf",
          content: pdfBuffer,
        },
      ]
    );

    console.log("Certificate email sent");
  } catch (error) {
    console.error("Email sending failed:", error);
  }
});