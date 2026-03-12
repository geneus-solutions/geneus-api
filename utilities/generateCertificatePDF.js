import PDFDocument from "pdfkit";
import dayjs from "dayjs";
import axios from "axios";

const fetchImage = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
};

export const generateCertificatePDF = async (data, res) => {
  try {
    const {
      certificateId,
      issueDate,
      employeeName,
      startDate,
      endDate,
      description,
    } = data;

    const formattedStartDate = dayjs(startDate).format("DD MMMM YYYY");
    const formattedEndDate = dayjs(endDate).format("DD MMMM YYYY");
    const formattedIssueDate = dayjs(issueDate).format("DD MMMM YYYY");

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const endPromise = new Promise((resolve) => {
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });

    /* ---------- LOAD IMAGES ---------- */

    const bg = await fetchImage(process.env.CERTIFICATE_BG_URL);
    const logo = await fetchImage(process.env.CERTIFICATE_LOGO_URL);
    const sign = await fetchImage(process.env.CERTIFICATE_SIGN_URL);

    /* ---------- BACKGROUND ---------- */

    doc.image(bg, 0, 0, {
      width: doc.page.width,
      height: doc.page.height,
    });

    /* ---------- LOGO ---------- */

    doc.image(logo, 80, 50, { width: 90 });

    /* ---------- ISSUE DATE ---------- */

    doc
      .fontSize(10)
      .fillColor("black")
      .font("Helvetica")
      .text("Issue Date:", doc.page.width - 220, 60);

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(formattedIssueDate, doc.page.width - 220, 75);

    /* ---------- COMPANY NAME ---------- */

    doc
      .fontSize(26)
      .fillColor("#5a7d82")
      .font("Helvetica-Bold")
      .text("GENEUS SOLUTIONS", 0, 60, { align: "center" });

    doc
      .fontSize(14)
      .fillColor("black")
      .font("Helvetica")
      .text("Bangalore, India", 0, 90, { align: "center" });

    /* ---------- TITLE ---------- */

    doc
      .fontSize(40)
      .fillColor("#5a7d82")
      .font("Helvetica-Bold")
      .text("CERTIFICATE", 0, 140, { align: "center" });

    doc
      .fontSize(18)
      .fillColor("#5a7d82")
      .text("OF EXPERIENCE", 0, 185, { align: "center" });

    /* ---------- SUBTITLE ---------- */

    doc
      .fontSize(16)
      .fillColor("#5a7d82")
      .text("This certificate is proudly presented to", 0, 230, {
        align: "center",
      });

    /* ---------- EMPLOYEE NAME ---------- */

    doc
      .fontSize(30)
      .font("Helvetica-Oblique")
      .fillColor("#4e6f74")
      .text(employeeName, 0, 265, {
        align: "center",
      });

    /* ---------- ROLE ---------- */

    doc
      .fontSize(14)
      .fillColor("black")
      .font("Helvetica")
      .text(
        `has successfully served as ${description} at Geneus Solutions`,
        0,
        330,
        { align: "center" }
      );

    /* ---------- DATE RANGE ---------- */

    // doc
    //   .fontSize(14)
    //   .text(`from ${formattedStartDate} to ${formattedEndDate}.`, 0, 355, {
    //     align: "center",
    //   });

    /* ---------- DESCRIPTION PARAGRAPH ---------- */

    doc
      .fontSize(12)
      .text(
        `During this period, the employee contributed to software development projects demonstrating strong technical skills, responsibility, and commitment to learning.`,
        200,
        380,
        {
          align: "center",
          width: doc.page.width - 400,
        }
      );

    doc
      .fontSize(12)
      .text(
        `We appreciate the contribution and wish continued success in future endeavors.`,
        200,
        420,
        {
          align: "center",
          width: doc.page.width - 400,
        }
      );

    /* ---------- CERTIFICATE ID ---------- */

    doc.fontSize(12).font("Helvetica-Bold").text("Certificate ID:", 100, 480);

    doc.fontSize(12).fillColor("#4e6f74").text(certificateId, 100, 495);

    /* ---------- VERIFY LINK ---------- */

    const verifyUrl = `geneussolutions.com/verify/${certificateId}`;

    doc
      .fontSize(10)
      .fillColor("black")
      .text("Verify this certificate at", 100, 515);

    doc.fontSize(10).fillColor("#4e6f74").text(verifyUrl, 100, 525);

    /* ---------- SIGNATURE ---------- */

    doc.image(sign, doc.page.width - 260, 450, { width: 120 });

    doc
      .fontSize(11)
      .fillColor("black")
      .text("Manager", doc.page.width - 250, 500);

    doc.fontSize(10).text("Geneus Solutions", doc.page.width - 250, 510);

    /* ---------- FOOTER ---------- */

    doc
      .fontSize(9)
      .fillColor("black")
      .text(
        "*This certificate is system generated and does not require a physical signature.",
        0,
        doc.page.height - 40,
        {
          align: "center",
          width: doc.page.width,
        }
      );

    doc.end();

    return endPromise;
  } catch (error) {
    console.error("PDF Generation Error:", error);

    res.status(500).json({
      message: "Error generating certificate PDF",
    });
  }
};