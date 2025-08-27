const fs = require("fs");
const logger = require("../Comman/logger");

// HTML Template for Employment Contract with proper signature alignment
const contractTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employment Contract</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.4;
            color: #333;
            background-color: #f5f5f5;
            padding: 10px;
        }

        .contract {
            width: 21cm;
            min-height: 29.7cm;
            background: white;
            margin: 0 auto;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        /* Page break controls */
        .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .force-page-break {
            page-break-before: always;
            break-before: page;
        }

        .keep-with-next {
            page-break-after: avoid;
            break-after: avoid;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2c3e50;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .logo-section {
            flex: 0 0 180px;
        }

        .company-logo {
            height: 90px;
            object-fit: contain;
        }

        .contract-header {
            flex: 1;
            text-align: right;
        }

        .contract-title {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .contract-details {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }

        .parties-section {
            margin-bottom: 15px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #2c3e50;
            text-transform: uppercase;
            border-bottom: 1px solid #3498db;
            padding-bottom: 3px;
            page-break-after: avoid;
            break-after: avoid;
        }

        .party-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .party {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            border-left: 3px solid #3498db;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .party h3 {
            font-size: 13px;
            margin-bottom: 8px;
            color: #2c3e50;
            text-transform: uppercase;
            font-weight: bold;
        }

        .info-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 4px;
            font-size: 11px;
            line-height: 1.3;
        }

        .info-label {
            font-weight: bold;
            min-width: 100px;
            flex-shrink: 0;
            color: #555;
        }

        .info-colon {
            margin: 0 5px;
            font-weight: bold;
        }

        .info-value {
            flex: 1;
            color: #333;
        }

        .employment-details {
            background-color: #ecf0f1;
            padding: 12px;
            border-radius: 5px;
            margin-bottom: 15px;
            border-left: 3px solid #e74c3c;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .compensation-section {
            margin-bottom: 15px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .compensation-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
            font-size: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .compensation-table th {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
        }

        .compensation-table td {
            padding: 6px;
            border-bottom: 1px solid #ddd;
            font-size: 11px;
        }

        .compensation-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .compensation-table tbody tr:hover {
            background-color: #e8f4fd;
        }

        .amount-cell {
            text-align: right;
            font-weight: bold;
            color: #27ae60;
        }

        .deduction-amount {
            color: #e74c3c;
        }

        .total-row {
            background: linear-gradient(135deg, #34495e, #2c3e50);
            color: white;
            font-weight: bold;
        }

        .total-row td {
            border-bottom: none;
            padding: 8px 6px;
            font-size: 12px;
        }

        .net-salary-highlight {
            background: linear-gradient(135deg, #27ae60, #229954);
            color: white;
            font-size: 14px;
            text-align: center;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .terms-section {
            margin-bottom: 15px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .terms-content {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 5px;
            border-left: 3px solid #f39c12;
            line-height: 1.5;
            font-size: 12px;
        }

        .terms-content h3 {
            color: #2c3e50;
            margin-bottom: 6px;
            font-size: 13px;
        }

        .terms-content p {
            margin-bottom: 8px;
            text-align: justify;
        }

        .terms-content ul {
            margin-left: 15px;
            margin-bottom: 8px;
        }

        .terms-content li {
            margin-bottom: 4px;
        }

        /* Enhanced Signature Section with Proper Alignment */
        .signature-section {
            margin-top: 25px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .signature-block {
            text-align: center;
            padding: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
            position: relative;
            min-height: 120px;
        }

        /* Company signature image positioning */
        .signature-image-container {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1;
        }

        .company-signature {
            max-height: 50px;
            max-width: 150px;
            object-fit: contain;
        }

        .signature-line {
            border-bottom: 1px solid #2c3e50;
            margin: 60px 0 10px 0;
            height: 1px;
            position: relative;
            z-index: 0;
        }

        /* Adjust signature line for company signature block when image is present */
        .signature-block.has-signature .signature-line {
            margin-top: 70px;
        }

        .signature-label {
            font-weight: bold;
            font-size: 11px;
            color: #2c3e50;
            text-transform: uppercase;
            margin-bottom: 5px;
        }

        .signature-name {
            margin: 5px 0;
            font-size: 12px;
            font-weight: bold;
        }

        .signature-date {
            font-size: 10px;
            color: #666;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            line-height: 1.4;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        /* Deductions section specific styling */
        .deductions-section {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        /* Large content handling */
        .large-section {
            max-height: 85vh;
            overflow: visible;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .contract {
                box-shadow: none;
                margin: 0;
                padding: 15px;
            }

            /* Enhanced print page break controls */
            .avoid-break,
            .parties-section,
            .employment-details,
            .compensation-section,
            .deductions-section,
            .terms-section,
            .signature-section,
            .footer {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            .compensation-table,
            .party-info,
            .party {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            .section-title {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }

            /* Force page break for large content */
            .force-page-break {
                page-break-before: always !important;
                break-before: page !important;
            }

            /* Ensure signature alignment in print */
            .signature-image-container {
                position: absolute !important;
                top: 0 !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
            }
        }
    </style>
</head>
<body>
    <div class="contract">
        <!-- Header Section -->
        <div class="header avoid-break">
            <div class="logo-section">
                {{companyLogoHtml}}
            </div>
            <div class="contract-header">
                <div class="contract-title">Employment Contract</div>
                <div class="contract-details">Contract No: {{contractNumber}}</div>
                <div class="contract-details">Date: {{date}}</div>
            </div>
        </div>

        <!-- Parties Information -->
        <div class="parties-section avoid-break">
            <h2 class="section-title keep-with-next">Contracting Parties</h2>
            <div class="party-info avoid-break">
                <div class="party avoid-break">
                    <h3>Employer</h3>
                    <div class="info-row">
                        <span class="info-label">Company Name</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{companyName}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Address</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{companyAddress}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">City</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{companyCity}}, {{companyState}} {{companyZip}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{companyPhone}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{companyEmail}}</span>
                    </div>
                </div>
                
                <div class="party avoid-break">
                    <h3>Employee</h3>
                    <div class="info-row">
                        <span class="info-label">Full Name</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{employeeName}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nationality</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{employeeNationality}}</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Phone</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{employeePhone}}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-colon">:</span>
                        <span class="info-value">{{employeeEmail}}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Employment Details -->
        <div class="employment-details avoid-break">
            <h2 class="section-title keep-with-next">Employment Details</h2>
            <div class="details-grid">
                <div class="info-row">
                    <span class="info-label">Position</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{position}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Department</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{department}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Contract Type</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{contractType}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Start Date</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{startDate}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Working Hours</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{workingHours}} hours</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Probation Period</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{probationPeriod}} months </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Notice Period</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{noticePeriod}} months </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Frequency</span>
                    <span class="info-colon">:</span>
                    <span class="info-value">{{paymentFrequency}}</span>
                </div>
            </div>
        </div>

        <!-- Compensation & Benefits -->
        <div class="compensation-section avoid-break">
            <h2 class="section-title keep-with-next">Compensation & Benefits</h2>
            <table class="compensation-table avoid-break">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount ({{currency}})</th>
                        <th>Frequency</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Base Salary</strong></td>
                        <td>Salary</td>
                        <td class="amount-cell">{{baseSalary}}</td>
                        <td>{{paymentFrequency}}</td>
                    </tr>
                    {{benefitsRows}}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2"><strong>TOTAL ANNUAL PACKAGE</strong></td>
                        <td class="amount-cell"><strong>{{totalPackage}}</strong></td>
                        <td><strong>Annual</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {{deductionsSection}}

        <!-- Terms and Conditions -->
        <div class="terms-section avoid-break">
            <h2 class="section-title keep-with-next">Terms and Conditions</h2>
            <div class="terms-content">
                {{additionalTerms}}
            </div>
        </div>

        <!-- Additional Notes -->
        {{notesSection}}

        <!-- Enhanced Signature Section with Proper Alignment -->
        <div class="signature-section avoid-break">
            <div class="signature-block avoid-break">
                <div class="signature-line"></div>
                <div class="signature-label">Employee Signature</div>
                <div class="signature-name">{{employeeName}}</div>
                <div class="signature-date">Date: _______________</div>
            </div>
            <div class="signature-block avoid-break {{companySignatureClass}}">
                {{companySignHtml}}
                <div class="signature-line"></div>
                <div class="signature-label">Company Representative</div>
                <div class="signature-name">{{companyName}}</div>
                <div class="signature-date">Date: _______________</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer avoid-break">
            <p><strong>Legal Notice:</strong> This contract is governed by applicable employment laws and regulations.</p>
            <p>Any disputes shall be resolved through appropriate legal channels.</p>
            <p>Both parties acknowledge that they have read, understood, and agree to be bound by the terms of this contract.</p>
        </div>
    </div>
</body>
</html>`;

/**
 * Generate HTML contract from data
 * @param {Object} data - Contract data object
 * @param {string} filePath - Output file path (optional)
 * @returns {Promise<string>} - Generated HTML content or file path
 */
const generateContractHTML = (data, filePath = null) => {
  return new Promise((resolve, reject) => {
    try {
      logger.debug("Starting contract HTML generation");

      // Calculate totals
      const baseSalaryAmount = parseFloat(data.baseSalary || 0);
      const totalBenefits = (data.benefits || []).reduce(
        (sum, benefit) => sum + parseFloat(benefit.amount || 0),
        0
      );
      const totalDeductions = (data.deductions || []).reduce(
        (sum, deduction) => sum + parseFloat(deduction.amount || 0),
        0
      );
      const totalPackage = baseSalaryAmount + totalBenefits;
      const netAnnualSalary = totalPackage - totalDeductions;

      // Generate benefits rows (properly formatted HTML)
      const benefitsRows = (data.benefits || [])
        .map(
          (benefit) =>
            `                    <tr>
                        <td>${escapeHtml(benefit.description || "")}</td>
                        <td style="text-transform: capitalize;">${escapeHtml(
                          benefit.type || ""
                        )}</td>
                        <td class="amount-cell">${parseFloat(
                          benefit.amount || 0
                        ).toLocaleString()}</td>
                        <td>Annual</td>
                    </tr>`
        )
        .join("\n");

      // Generate deductions rows (properly formatted HTML)
      const deductionsRows = (data.deductions || [])
        .map(
          (deduction) =>
            `                    <tr>
                        <td>${escapeHtml(deduction.description || "")}</td>
                        <td style="text-transform: capitalize;">${escapeHtml(
                          deduction.type || ""
                        )}</td>
                        <td class="amount-cell deduction-amount">${parseFloat(
                          deduction.amount || 0
                        ).toLocaleString()}</td>
                        <td>Annual</td>
                    </tr>`
        )
        .join("\n");

      // Generate deductions section HTML with enhanced page break controls
      const deductionsSection =
        data.deductions && data.deductions.length > 0
          ? `        <!-- Deductions -->
        <div class="compensation-section deductions-section avoid-break">
            <h2 class="section-title keep-with-next">Deductions</h2>
            <table class="compensation-table avoid-break">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount (${data.currency || "USD"})</th>
                        <th>Period</th>
                    </tr>
                </thead>
                <tbody>
${deductionsRows}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="2"><strong>TOTAL ANNUAL DEDUCTIONS</strong></td>
                        <td class="amount-cell deduction-amount"><strong>${totalDeductions.toLocaleString()}</strong></td>
                        <td><strong>Annual</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div class="net-salary-highlight avoid-break">
            NET ANNUAL SALARY: ${
              data.currency || "USD"
            } ${netAnnualSalary.toLocaleString()}
        </div>`
          : "";

      // Generate notes section HTML with page break controls
      const notesSection = data.notes
        ? `        <!-- Additional Notes -->
        <div class="terms-section avoid-break">
            <h2 class="section-title keep-with-next">Important Notes</h2>
            <div class="terms-content">
                ${data.notes}
            </div>
        </div>`
        : "";

      // Generate company logo HTML
      const companyLogoHtml = data.companyLogo
        ? `<img src="${data.companyLogo}" alt="Company Logo" class="company-logo">`
        : "";

      // Generate company signature HTML with proper positioning
      const companySignHtml = data.companySignature
        ? `<div class="signature-image-container">
                <img src="${data.companySignature}" alt="Company Signature" class="company-signature">
            </div>`
        : "";

      // Add class to signature block if signature is present
      const companySignatureClass = data.companySignature
        ? "has-signature"
        : "";

      const templateData = {
        contractNumber: data.contractNumber || "N/A",
        date: formatDate(data.date) || formatDate(new Date()),
        companyLogoHtml: companyLogoHtml,
        companyName: data.companyName || "N/A",
        companyAddress: data.companyAddress || "",
        companyCity: data.companyCity || "",
        companyState: data.companyState || "",
        companyZip: data.companyZip || "",
        companyPhone: data.companyPhone || "",
        companyEmail: data.companyEmail || "",
        employeeName: data.employeeName || "N/A",
        employeeAddress: data.employeeAddress || "",
        employeeCity: data.employeeCity || "",
        employeeState: data.employeeState || "",
        employeeZip: data.employeeZip || "",
        employeePhone: data.employeePhone || "",
        employeeNationality: data.employeeNationality || "N/A",
        employeeEmail: data.employeeEmail || "",
        position: data.position || "N/A",
        department: data.department || "N/A",
        contractType: data.contractType || "N/A",
        startDate: formatDate(data.startDate) || "N/A",
        workingHours: data.workingHours || "40",
        probationPeriod: data.probationPeriod || "90",
        noticePeriod: data.noticePeriod || "30",
        baseSalary: parseFloat(data.baseSalary || 0).toLocaleString(),
        currency: data.currency || "USD",
        paymentFrequency: data.paymentFrequency || "Monthly",
        benefitsRows: benefitsRows,
        deductionsSection: deductionsSection,
        notesSection: notesSection,
        totalPackage: totalPackage.toLocaleString(),
        additionalTerms: data.additionalTerms,
        companySignHtml: companySignHtml,
        companySignatureClass: companySignatureClass,
      };

      // Replace all placeholders in template
      let htmlContent = contractTemplate;

      Object.keys(templateData).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(placeholder, templateData[key] || "");
      });

      logger.debug("Contract HTML content generated successfully");

      // If file path is provided, write to file
      if (filePath) {
        fs.writeFileSync(filePath, htmlContent, "utf8");
        logger.info(`Contract HTML saved to: ${filePath}`);
        resolve(filePath);
      } else {
        // Return HTML content
        resolve(htmlContent);
      }
    } catch (error) {
      logger.error("Error generating contract HTML:", error);
      reject(error);
    }
  });
};

/**
 * Generate contract PDF using puppeteer with enhanced page break handling
 * @param {Object} data - Contract data object
 * @param {string} filePath - Output PDF file path
 * @returns {Promise<string>} - Generated PDF file path
 */
const generateContractPDF = async (data, filePath) => {
  try {
    logger.debug("Starting contract PDF generation with page break controls");

    const puppeteer = require("puppeteer");
    const htmlContent = await generateContractHTML(data);

    const browser = await puppeteer.launch({
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Wait for content to load completely
    await page.setContent(htmlContent, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Enhanced PDF generation with better page break handling
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
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      // Enhanced options for better page handling
      tagged: false,
      outline: false,
    });

    await browser.close();
    logger.info(
      `Contract PDF with page break controls generated successfully: ${filePath}`
    );
    return filePath;
  } catch (error) {
    logger.error("PDF generation failed:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const escapeHtml = (text) => {
  if (typeof text !== "string") return text;
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

module.exports = {
  generateContractHTML,
  generateContractPDF,
};
