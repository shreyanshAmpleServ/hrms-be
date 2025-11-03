//2
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const logger = require("../Comman/logger");

const offerLetterTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offer Letter</title>
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

        .offer-letter {
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

        .letter-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin: 30px 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .letter-date {
            text-align: right;
            font-size: 14px;
            margin-bottom: 20px;
            color: #555;
        }

        .candidate-details {
            margin-bottom: 30px;
        }

        .candidate-name {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
        }

        .candidate-info {
            font-size: 14px;
            color: #555;
            line-height: 1.6;
        }

        .letter-body {
            font-size: 14px;
            line-height: 1.8;
            color: #333;
            margin-bottom: 30px;
            text-align: justify;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            margin: 25px 0 15px 0;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
        }

        .compensation-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .compensation-table th {
            background-color: #34495e;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
        }

        .compensation-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 13px;
        }

        .compensation-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .total-row {
            background-color: #ecf0f1 !important;
            font-weight: bold;
            font-size: 14px;
        }

        .offer-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
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

        .terms-section {
            margin-top: 30px;
        }

        .terms-list {
            list-style-type: decimal;
            padding-left: 25px;
            line-height: 2;
        }

        .terms-list li {
            margin-bottom: 10px;
            text-align: justify;
        }

        .acceptance-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ecf0f1;
        }

        .signature-box {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
        }

        .signature-block {
            width: 45%;
        }

        .signature-line {
            border-top: 2px solid #333;
            margin-top: 60px;
            padding-top: 10px;
        }

        .signature-label {
            font-size: 12px;
            color: #555;
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
            .offer-letter {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="offer-letter">
        <!-- Header -->
        <div class="header">
            <img src="{{companyLogo}}" alt="Company Logo" class="logo">
            <div class="company-info">
                <div class="company-name">{{companyName}}</div>
                <div class="company-details">{{companyAddress}}</div>
                <div class="company-details">{{companyEmail}} | {{companyPhone}}</div>
            </div>
        </div>

        <!-- Letter Title -->
        <div class="letter-title">Employment Offer Letter</div>

        <!-- Date -->
        <div class="letter-date">Date: {{offerDate}}</div>

        <!-- Candidate Details -->
        <div class="candidate-details">
            <div class="candidate-name">{{candidateName}}</div>
            <div class="candidate-info">{{candidateEmail}}</div>
            <div class="candidate-info">{{candidatePhone}}</div>
        </div>

        <!-- Letter Body -->
        <div class="letter-body">
            <p>Dear {{candidateName}},</p>
            <br>
            <p>We are pleased to offer you the position of <strong>{{position}}</strong> with <strong>{{companyName}}</strong>. 
            We believe your skills and experience will be a valuable addition to our team.</p>
            <br>
            <p>This offer is contingent upon successful completion of background verification and submission of required documents.</p>
        </div>

        <!-- Offer Details -->
        <div class="section-title">Position Details</div>
        <div class="offer-details">
            <div class="detail-row">
                <div class="detail-label">Position:</div>
                <div class="detail-value">{{position}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Department:</div>
                <div class="detail-value">{{department}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Offer Date:</div>
                <div class="detail-value">{{offerDate}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Valid Until:</div>
                <div class="detail-value">{{validUntil}}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Expected Joining Date:</div>
                <div class="detail-value">{{expectedJoiningDate}}</div>
            </div>
        </div>

        <!-- Compensation Breakdown -->
        <div class="section-title">Compensation Package</div>
        <table class="compensation-table">
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Amount</th>
                    <th>Frequency</th>
                </tr>
            </thead>
            <tbody>
                {{payComponentsRows}}
                <tr class="total-row">
                    <td><strong>Total Annual Compensation</strong></td>
                    <td><strong>{{currencyCode}} {{totalCompensation}}</strong></td>
                    <td><strong>Per Annum</strong></td>
                </tr>
            </tbody>
        </table>

        <!-- Terms and Conditions -->
        <div class="section-title">Terms and Conditions</div>
        <div class="terms-section">
            <ol class="terms-list">
                <li>This offer is valid until <strong>{{validUntil}}</strong>. Please confirm your acceptance by signing and returning this letter before the expiry date.</li>
                <li>Your employment will be subject to a probationary period as per company policy.</li>
                <li>You will be required to comply with all company policies, procedures, and code of conduct.</li>
                <li>The compensation package is subject to applicable tax deductions as per local regulations.</li>
                <li>This offer is contingent upon verification of your credentials, references, and background check.</li>
                <li>You will be expected to maintain confidentiality regarding company information and sign necessary non-disclosure agreements.</li>
            </ol>
        </div>

        <!-- Acceptance -->
        <div class="acceptance-section">
            <p style="line-height: 1.8;">
                We look forward to welcoming you to our team. If you have any questions regarding this offer, 
                please feel free to contact us.
            </p>
            <br>
            <p>Sincerely,</p>
        </div>

        <!-- Signatures -->
     <div class="signature-box">
            <div class="signature-block">
                <div class="signature-line">
                    <div style="font-weight: bold;">{{companySignatory}}</div>
                    <div class="signature-label">Authorized Signatory</div>
                    <div class="signature-label">{{companyName}}</div>
                </div>
            </div>
            <div class="signature-block">
                <div class="signature-line">
                    <div class="signature-label">Candidate Signature</div>
                    <div class="signature-label">Date: _________________</div>
                </div>
            </div>
        </div>



        <!-- Footer -->
        <div class="footer">
            <p>This is a system-generated offer letter from {{companyName}}</p>
            <p>{{companyAddress}} | {{companyEmail}} | {{companyPhone}}</p>
        </div>
    </div>
</body>
</html>`;

/**
 * Generate HTML offer letter from data
 */
const generateOfferLetterHTML = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Generate pay components rows
      const payComponentsRows = (data.payComponents || [])
        .map(
          (component) =>
            `<tr>
              <td>${component.componentName || "Component"}</td>
              <td>${data.currencyCode} ${parseFloat(
              component.amount || 0
            ).toFixed(2)}</td>
              <td>Monthly</td>
            </tr>`
        )
        .join("");

      // Calculate total compensation (annual)
      const totalMonthly = (data.payComponents || []).reduce(
        (sum, c) => sum + parseFloat(c.amount || 0),
        0
      );
      const totalAnnual = (totalMonthly * 12).toFixed(2);

      // Prepare template data
      const templateData = {
        companyLogo: data.companyLogo || "",
        companyName: data.companyName || "Company Name",
        companyAddress: data.companyAddress || "",
        companyEmail: data.companyEmail || "",
        companyPhone: data.companyPhone || "",
        candidateName: data.candidateName || "N/A",
        candidateEmail: data.candidateEmail || "N/A",
        candidatePhone: data.candidatePhone || "N/A",
        position: data.position || "N/A",
        department: data.department || "N/A",
        offerDate: formatDate(data.offerDate) || "",
        validUntil: formatDate(data.validUntil) || "",
        expectedJoiningDate: formatDate(data.expectedJoiningDate) || "",
        payComponentsRows,
        currencyCode: data.currencyCode || "",
        totalCompensation: totalAnnual,
        companySignatory: data.companySignatory || "HR Manager",
      };

      // Replace placeholders in template
      let htmlContent = offerLetterTemplate;
      Object.keys(templateData).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(placeholder, templateData[key]);
      });

      logger.debug("Offer letter HTML generated successfully");
      resolve(htmlContent);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Offer Letter PDF using Puppeteer
 */
const generateOfferLetterPDF = async (data, filePath) => {
  let browser = null;
  try {
    const htmlContent = await generateOfferLetterHTML(data);

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
      waitUntil: "networkidle0",
      timeout: 30000,
    });

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

    logger.info(`Offer letter PDF generated successfully: ${filePath}`);
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

// Helper function
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

module.exports = {
  generateOfferLetterHTML,
  generateOfferLetterPDF,
};
