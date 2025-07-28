const fs = require("fs");
const path = require("path");

// HTML Template with placeholders
const payslipTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pay Slip</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;  
        }

        .payslip {
            width: 21cm;
            min-height: 29.7cm;
            background: white;
            margin: 0 auto;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000;
        }

        .logo-section {
            flex: 0 0 200px;
        }

        .logo {
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .payslip-header {
            flex: 1;
            text-align: right;
        }

        .gross-summary {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .payslip-title {
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
        }

        .month-year {
            font-size: 14px;
            margin-bottom: 10px;
        }

        .employee-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
            border: 2px dashed #ccc;
            padding: 15px;
        }

        .info-row {
            display: flex;
            align-items: center;
            font-size: 12px;
            line-height: 1.4;
            padding: 2px 0;
        }

        .info-label {
            font-weight: normal;
            min-width: 120px;
            flex-shrink: 0;
        }

        .info-colon {
            margin: 0 5px;
        }

        .info-value {
            flex: 1;
            font-weight: normal;
        }

        .earnings-deductions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .earnings, .deductions {
            background-color: #f9f9f9;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            background-color: #ffe4ca;
            padding: 5px;
            text-align: center;
        }

        .amount-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            line-height: 1.6;
            padding: 2px 5px;
            border-bottom: 1px dashed #e6e6e6;
        }

        .amount-row:last-child {
            border-bottom: none;
        }

        .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: bold;
            padding: 5px;
            background-color: #e6e6e6;
            margin-top: 5px;
        }

        .net-pay-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 12px;
        }

        .paye-section, .net-amount-section {
            background-color: #f9f9f9;
            padding: 10px;
            text-align: center;
        }

        .salary-transfer {
            margin-bottom: 20px;
        }

        .salary-transfer-title {
            font-size: 14px;
            font-weight: bold;
            text-align: center;
            padding: 10px;
            border: 1px solid #e6e6e6;
        }

        .bank-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            background-color: #f9f9f9;
        }

        .bank-header {
            font-size: 12px;
            font-weight: bold;
            padding: 8px;
            text-align: center;
            background-color: #ffe4ca;
            border: 1px solid #e6e6e6;
        }

        .bank-value {
            font-size: 12px;
            padding: 8px;
            text-align: center;
            border: 1px solid #e6e6e6;
        }

        .ot-hours {
            margin-bottom: 20px;
        }

        .ot-hours-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .ot-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 12px;
            line-height: 1.6;
        }

        .ot-row {
            display: flex;
            align-items: center;
        }

        .ot-label {
            min-width: 180px;
        }

        .ot-colon {
            margin: 0 5px;
        }

        .declaration {
            font-size: 12px;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .signature-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 12px;
            margin-top: 40px;
        }

        .signature-line {
            border-bottom: 1px solid #000;
            width: 200px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .payslip {
                box-shadow: none;
                margin: 0;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="payslip">
        <div class="header">
        <img src="https://ampleserv.com/public/images/1718694633.png" alt="Logo" class="logo">
            <div class="payslip-header">
                <div class="payslip-title">PAY SLIP</div>
                <div class="month-year">For the Month Of {{payrollMonth}}, {{payrollYear}}</div>
            </div>
        </div>

        <div class="employee-info">
            <div class="info-row">
                <span class="info-label">Employee ID</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{employeeId}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Basic</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{basicPay}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">PF HR ID</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{pfHrId}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">TPIN NO.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{tpinNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Employee Name</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{fullName}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NRC NO.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{nrcNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Designation</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{designation}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NHIS NO.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{nhisNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{location}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Leave Days</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{leaveDays}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cost Center</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{costCenter}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Leave Value</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{leaveValue}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NAPSA No.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{napsaNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">ENG Date</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{engDate}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Taxable Pay YTD</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{taxablePayYtd}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tax Year To Date</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{taxYearToDate}}</span>
            </div>
        </div>

        <div class="earnings-deductions">
            <div class="earnings">
                <div class="section-title">Earnings Amount</div>
                {{earningsRows}}
                <div class="total-row">
                    <span>Gross Earning</span>
                    <span>{{grossEarning}}</span>
                </div>
            </div>
            <div class="deductions">
                <div class="section-title">Deductions Amount</div>
                {{deductionsRows}}
                <div class="total-row">
                    <span>Gross Deduction</span>
                    <span>{{grossDeduction}}</span>
                </div>
            </div>
        </div>

        <div class="net-pay-section">
            <div class="paye-section">
                <strong>Paye</strong><br>
                {{paye}}
            </div>
            <div class="net-amount-section">
                <strong>Net Amount</strong><br>
                {{netPay}}
            </div>
        </div>

        <div class="salary-transfer">
            <div class="salary-transfer-title">Salary Transfer</div>
            <div class="bank-info">
                <div class="bank-header">Bank Name</div>
                <div class="bank-header">Pay Point</div>
                <div class="bank-header">Bank A/c No.</div>
                <div class="bank-header">Amount</div>
                <div class="bank-value">{{bankName}}</div>
                <div class="bank-value">{{payPoint}}</div>
                <div class="bank-value">{{bankAccount}}</div>
                <div class="bank-value">{{netPay}}</div>
            </div>
        </div>

        <div class="ot-hours">
            <div class="ot-hours-title">OT HOURS</div>
            <div class="ot-grid">
                <div class="ot-row">
                    <span class="ot-label">Actual Worked Hours</span>
                    <span class="ot-colon">:</span>
                    <span>{{actualWorkedHours}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Expected Worked Hours</span>
                    <span class="ot-colon">:</span>
                    <span>{{expectedWorkedHours}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Work Day OT</span>
                    <span class="ot-colon">:</span>
                    <span>{{workDayOt}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Sunday & Public Holiday OT</span>
                    <span class="ot-colon">:</span>
                    <span>{{sundayPublicHolidayOt}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Night Hours</span>
                    <span class="ot-colon">:</span>
                    <span>{{nightHours}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Leave Days Taken</span>
                    <span class="ot-colon">:</span>
                    <span>{{leaveDaysTaken}}</span>
                </div>
            </div>
        </div>

        <!--  <div class="declaration">
            The net pay is accepted and I the undersigned shall have no further claim related to my employment up to date of _ _/_ _/_ _ _ _
        </div> --> 

        <div class="signature-section">
            <span>Signature</span>\
            <img src="data:image/png;base64,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" alt="Signature" class="signature-line">
        </div>
    </div>
</body>
</html>`;

/**
 * Generate HTML payslip from data
 * @param {Object} data - Payroll data object
 * @param {string} filePath - Output file path (optional)
 * @returns {Promise<string>} - Generated HTML content or file path
 */
const generatePayslipHTML = (data, filePath = null) => {
  return new Promise((resolve, reject) => {
    try {
      // Calculate totals
      const grossEarning = (data.earnings || [])
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
        .toFixed(2);
      const grossDeduction = (data.deductions || [])
        .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0)
        .toFixed(2);

      // Generate earnings rows
      const earningsRows = (data.earnings || [])
        .map(
          (earning) =>
            `<div class="amount-row">
          <span>${earning.label || ""}</span>
          <span>${parseFloat(earning.amount || 0).toFixed(2)}</span>
        </div>`
        )
        .join("");

      // Generate deductions rows
      const deductionsRows = (data.deductions || [])
        .map(
          (deduction) =>
            `<div class="amount-row">
          <span>${deduction.label || ""}</span>
          <span>${parseFloat(deduction.amount || 0).toFixed(2)}</span>
        </div>`
        )
        .join("");

      // Find basic pay from earnings
      const basicPayEarning = (data.earnings || []).find(
        (e) => e.label && e.label.toLowerCase().includes("basic")
      );
      const basicPay = basicPayEarning
        ? parseFloat(basicPayEarning.amount).toFixed(2)
        : "0.00";

      // Use tax_amount from data for PAYE
      const paye = parseFloat(data.tax_amount || 0).toFixed(2);

      // Prepare template data
      const templateData = {
        grossEarning,
        grossDeduction,
        payrollMonth: getMonthName(data.payroll_month) || "N/A",
        payrollYear: data.payroll_year || "N/A",
        employeeId: data.employee_id || "N/A",
        pfHrId: data.pf_hr_id || "N/A",
        fullName: data.full_name || "N/A",
        designation: data.designation || "N/A",
        location: data.location || "N/A",
        costCenter: data.cost_center || "N/A",
        napsaNo: data.napsa_no || "N/A",
        taxablePayYtd: parseFloat(data.taxable_earnings || 0).toFixed(2),
        basicPay,
        tpinNo: data.tpin_no || "N/A",
        nrcNo: data.nrc_no || "N/A",
        nhisNo: data.nhis_no || "N/A",
        leaveDays: data.leave_days || "0",
        leaveValue: data.leave_value || "0.00",
        engDate: formatDate(data.engagement_date) || "",
        taxYearToDate: parseFloat(data.tax_amount || 0).toFixed(2),
        earningsRows,
        deductionsRows,
        netPay: parseFloat(data.net_pay || 0).toFixed(2),
        paye,
        bankName: data.bank_name || "N/A",
        payPoint: data.pay_point || "Direct Transfer",
        bankAccount: data.bank_account || "N/A",
        actualWorkedHours: data.actual_worked_hours || "0",
        workDayOt: data.work_day_ot || "0",
        nightHours: data.night_hours || "0",
        expectedWorkedHours: data.expected_worked_hours || "0",
        sundayPublicHolidayOt: data.sunday_public_holiday_ot || "0",
        leaveDaysTaken: data.leave_days_taken || "0",
      };

      // Replace placeholders in template
      let htmlContent = payslipTemplate;
      Object.keys(templateData).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(placeholder, templateData[key]);
      });

      // If file path is provided, write to file
      if (filePath) {
        fs.writeFileSync(filePath, htmlContent, "utf8");
        resolve(filePath);
      } else {
        // Return HTML content
        resolve(htmlContent);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate HTML payslip and convert to PDF using puppeteer
 */
const generatePayslipPDF = async (data, filePath) => {
  try {
    const puppeteer = require("puppeteer");

    const htmlContent = await generatePayslipHTML(data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

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

    await browser.close();

    return filePath;
  } catch (error) {
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// Helper functions
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB");
};

const getMonthName = (monthNumber) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1] || "";
};

module.exports = {
  generatePayslipHTML,
  generatePayslipPDF,
};
