const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const logger = require("../Comman/logger");

const appraisalTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Appraisal</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }

        .appraisal-report {
            width: 21cm;
            min-height: 29.7cm;
            background: white;
            margin: 0 auto;
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2c3e50;
        }

        .logo {
            max-height: 80px;
            max-width: 200px;
        }

        .company-info {
            text-align: right;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
        }

        .company-details {
            font-size: 12px;
            color: #7f8c8d;
            margin-top: 5px;
        }

        .report-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .report-date {
            text-align: right;
            font-size: 14px;
            margin-bottom: 20px;
            color: #555;
        }

        .employee-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }

        .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px dashed #ddd;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: bold;
            min-width: 200px;
            color: #555;
        }

        .detail-value {
            color: #333;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin: 25px 0 15px 0;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
        }

        .overall-rating {
            background-color: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }

        .rating-score {
            font-size: 48px;
            font-weight: bold;
            color: #2c3e50;
        }

        .rating-label {
            font-size: 18px;
            color: #555;
            margin-top: 10px;
        }

        .comments-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .comments-text {
            line-height: 1.8;
            color: #333;
        }

        .signature-box {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }

        .signature-block {
            width: 45%;
        }

        .signature-image {
            max-height: 60px;
            max-width: 150px;
            margin-bottom: 10px;
            display: block;
        }

        .signature-line {
            border-top: 2px solid #333;
            margin-top: 10px;
            padding-top: 10px;
        }

        .signature-label {
            font-size: 12px;
            color: #555;
            margin-top: 5px;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            font-size: 11px;
            color: #7f8c8d;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .appraisal-report {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="appraisal-report">
        <div class="header">
            <img src="{{companyLogo}}" alt="Company Logo" class="logo">
            <div class="company-info">
                <div class="company-name">{{companyName}}</div>
                <div class="company-details">{{companyAddress}}</div>
                <div class="company-details">{{companyEmail}} | {{companyPhone}}</div>
            </div>
        </div>

        <div class="report-title">Performance Appraisal Report</div>
        <div class="report-date">Appraisal Date: {{appraisalDate}}</div>

        <div class="section-title">Employee Information</div>
        <div class="employee-details">
            <div class="detail-row">
                <div class="detail-label">Employee Name:</div>
                <div class="detail-value">{{employeeName}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Employee Code:</div>
                <div class="detail-value">{{employeeCode}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Department:</div>
                <div class="detail-value">{{department}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Designation:</div>
                <div class="detail-value">{{designation}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Appraisal Period:</div>
                <div class="detail-value">{{appraisalPeriod}}</div>
            </div>
        </div>

        <div class="section-title">Overall Performance Rating</div>
        <div class="overall-rating">
            <div class="rating-score">{{overallRating}}/5</div>
            <div class="rating-label">{{ratingLabel}}</div>
        </div>

        <div class="section-title">Manager's Comments</div>
        <div class="comments-section">
            <div class="comments-text">{{managerComments}}</div>
        </div>

        <div class="section-title">Employee's Comments</div>
        <div class="comments-section">
            <div class="comments-text">{{employeeComments}}</div>
        </div>

        <div class="signature-box">
            <div class="signature-block">
                {{companySignature}}
                <div style="font-weight: bold; font-size: 14px;">{{managerName}}</div>
                <div class="signature-label">Manager/Supervisor</div>
            </div>
            <div class="signature-block">
                <div class="signature-line" style="margin-top: 60px;">
                    <div style="font-weight: bold; font-size: 14px;">{{employeeName}}</div>
                    <div class="signature-label">Date: _________________</div>
                    </div>
            </div>
        </div>

        <div class="footer">
            <p>This is a system-generated appraisal report from {{companyName}}</p>
            <p>{{companyAddress}} | {{companyEmail}} | {{companyPhone}}</p>
        </div>
    </div>
</body>
</html>`;

const generateAppraisalHTML = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const getRatingLabel = (rating) => {
        const r = parseFloat(rating) || 0;
        if (r >= 4.5) return "Outstanding";
        if (r >= 4.0) return "Excellent";
        if (r >= 3.5) return "Very Good";
        if (r >= 3.0) return "Good";
        if (r >= 2.5) return "Satisfactory";
        if (r >= 2.0) return "Needs Improvement";
        return "Unsatisfactory";
      };

      const templateData = {
        companyLogo: data.companyLogo || "",
        companySignature: data.companySignature
          ? `<img src="${data.companySignature}" alt="Signature" class="signature-image">`
          : "",
        companyName: data.companyName || "Company Name",
        companyAddress: data.companyAddress || "",
        companyEmail: data.companyEmail || "",
        companyPhone: data.companyPhone || "",
        employeeName: data.employeeName || "N/A",
        employeeCode: data.employeeCode || "N/A",
        department: data.department || "N/A",
        designation: data.designation || "N/A",
        appraisalDate: formatDate(data.appraisalDate) || "",
        appraisalPeriod: data.appraisalPeriod || "N/A",
        overallRating: (data.overallRating || 0).toFixed(1),
        ratingLabel: getRatingLabel(data.overallRating),
        managerComments: data.managerComments || "No comments provided",
        employeeComments: data.employeeComments || "No comments provided",
        managerName: data.managerName || "Manager",
      };

      let htmlContent = appraisalTemplate;
      Object.keys(templateData).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(placeholder, templateData[key]);
      });

      logger.debug("Appraisal HTML generated successfully");
      resolve(htmlContent);
    } catch (error) {
      reject(error);
    }
  });
};

const generateAppraisalPDF = async (data, filePath) => {
  let browser = null;
  try {
    const htmlContent = await generateAppraisalHTML(data);

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    browser = await puppeteer.launch({
      executablePath: path.join(
        process.cwd(),
        ".puppeteer/chrome/win64-138.0.7204.168/chrome-win64/chrome.exe"
      ),
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754 });

    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "load"],
      timeout: 60000,
    });

    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = img.onerror = resolve;
              })
          )
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in",
      },
    });

    logger.info(`Appraisal PDF generated successfully: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`PDF generation failed: ${error.message}`);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        logger.error("Error closing browser:", closeError);
      }
    }
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

module.exports = {
  generateAppraisalHTML,
  generateAppraisalPDF,
};
