import Certificate from "../models/Certificate.js";
import eventBus from "../utilities/createEvent.js";
import { generateCertificatePDF } from "../utilities/generateCertificatePDF.js";
import "../listeners/certificate.listener.js"; 

export const generateCertificate = async (req, res) => {
  try {
    const { employee_name, employee_email, role, start_date, end_date } =
      req.body;

    const certificateId = await generateCertificateId();

    await Certificate.create({
      certificate_id: certificateId,
      employee_name,
      employee_email,
      role,
      start_date,
      end_date,
      generated_date: new Date(),
    });

    const pdfBuffer = await generateCertificatePDF({
      certificateId,
      employeeName: employee_name,
      startDate: start_date,
      endDate: end_date,
      issueDate: new Date(),
      description: role,
    });

    // const fileName = `${employee_name.replace(/\s+/g, "_")}_Experience_Certificate.pdf`;

    /* send PDF to browser */
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${employee_name}_certificate.pdf`
    );

    res.send(pdfBuffer);
    /* Event Emitt */
    eventBus.emit("certificate.generated", {
      employee_name,
      employee_email,
      pdfBuffer,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error generating certificate",
    });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificate_id: req.params.certificateId,
    });

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: "Certificate not found!",
      });
    }

    res.json({
      valid: true,
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Verification failed",
    });
  }
};

export const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching certificates",
    });
  }
};

export const generateCertificateId = async () => {
  const year = new Date().getFullYear();

  const lastCertificate = await Certificate.findOne({
    certificate_id: { $regex: `GS-EXP-${year}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastCertificate) {
    const lastNumber = parseInt(lastCertificate.certificate_id.split("-")[3]);

    nextNumber = lastNumber + 1;
  }

  return `GS-EXP-${year}-${String(nextNumber).padStart(4, "0")}`;
};