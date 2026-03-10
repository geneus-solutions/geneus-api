import PDFDocument from "pdfkit";
import dayjs from "dayjs";
import path from "path";

export const generateCertificatePDF = (data, res) => {
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

  const fileName = `${(employeeName || "Employee").replace(/\s+/g, "_")}_Experience_Certificate.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  doc.pipe(res);

  const templatePath = path.join(
    process.cwd(),
    "assets",
    "certificate-bg.jpeg",
  );

  doc.image(templatePath, 0, 0, {
    width: doc.page.width,
    height: doc.page.height,
  });

  const logoPath = path.join(process.cwd(), "assets", "geneus.png");
  const trophyPath = path.join(process.cwd(), "assets", "trophy.png");
  const signPath = path.join(process.cwd(), "assets", "sign.png");

  doc.image(logoPath, 80, 60, { width: 90 });

  const trophyWidth = 90;
  const marginRight = 70;

  doc.image(trophyPath, doc.page.width - trophyWidth - marginRight, 60, {
    width: trophyWidth,
  });

  doc
    .fontSize(26)
    .fillColor("#5a7d82")
    .font("Helvetica-Bold")
    .text("GENEUS SOLUTIONS", 0, 70, { align: "center" });

  doc
    .fontSize(14)
    .fillColor("black")
    .text("Bangalore, India", 0, 100, { align: "center" });

  doc
    .fontSize(40)
    .fillColor("#5a7d82")
    .text("CERTIFICATE", 0, 140, { align: "center" });

  doc.fontSize(18).text("OF EXPERIENCE", 0, 190, { align: "center" });

  doc
    .fontSize(16)
    .fillColor("#5a7d82")
    .text("This certificate is proudly presented to", 0, 230, {
      align: "center",
    });

  doc.moveDown(2);

  doc
    .fontSize(26)
    .fillColor("#5a7d82")
    .font("Helvetica-Oblique")
    .text(employeeName, 0, 265, { align: "center" });



  doc
    .fontSize(16)
    .fillColor("black")
    .font("Helvetica")
    .text(
      `has successfully served as ${description} at Geneus Solutions`,
      0,
      320,
      {
        align: "center",
        width: doc.page.width,
      },
    );

  

  doc.fontSize(16).text(`from ${formattedStartDate} to ${formattedEndDate}.`, {
    align: "center",
  });

  doc
    .fontSize(14)
    .text(
      `During this period, the employee contributed to software development projects demonstrating strong technical skills, responsibility, and commitment to learning.`,
      100,
      380,
      {
        align: "center",
        width: doc.page.width - 200,
      },
    );

  doc
    .fontSize(14)
    .text(
      `We appreciate the contribution and wish continued success in future endeavors.`,
      100,
      430,
      {
        align: "center",
        width: doc.page.width - 200,
      },
    );

  doc
    .fontSize(14)
    .fillColor("black")
    .font("Helvetica-Bold")
    .text(`Date: ${formattedIssueDate}`, 100, 500);

 const signWidth = 140;

  doc.image(signPath, doc.page.width - 260, 443, { width: signWidth });

  doc.fontSize(12).text("Manager", doc.page.width - 220, 510);

  doc.fontSize(10).text("Geneus Solutions", doc.page.width - 220, 530);

  doc
    .fontSize(9)
    .text(
      "*This certificate is system generated and does not require a physical signature.",
      0,
      doc.page.height - 55,
      {
        align: "center",
        width: doc.page.width,
      },
    );

  doc.end();
};