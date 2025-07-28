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
            width: 150px;
            height: 80px;
            background: #000;
            color: #ffd700;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            border: 2px dashed #ccc;
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
            padding: 10px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            background-color: #e6e6e6;
            padding: 5px;
            text-align: center;
        }

        .amount-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            line-height: 1.6;
            padding: 2px 5px;
            border-bottom: 1px solid #ddd;
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
            margin-bottom: 10px;
            background-color: #e6e6e6;
            padding: 5px;
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
            background-color: #e6e6e6;
            border: 1px solid #ccc;
        }

        .bank-value {
            font-size: 12px;
            padding: 8px;
            text-align: center;
            border: 1px solid #ccc;
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
            height: 20px;
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
            <div class="logo-section">
                <div class="logo">
                    XYZ<br>CARGO
                </div>
            </div>
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

        <div class="declaration">
            The net pay is accepted and I the undersigned shall have no further claim related to my employment up to date of _ _/_ _/_ _ _ _
        </div>

        <div class="signature-section">
            <span>Signature</span>
            <div class="signature-line"></div>
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
          <span>${earning.amount || "0.00"}</span>
        </div>`
        )
        .join("");

      // Generate deductions rows
      const deductionsRows = (data.deductions || [])
        .map(
          (deduction) =>
            `<div class="amount-row">
          <span>${deduction.label || ""}</span>
          <span>${deduction.amount || "0.00"}</span>
        </div>`
        )
        .join("");

      // Find basic pay from earnings
      const basicPayEarning = (data.earnings || []).find(
        (e) => e.label && e.label.toLowerCase().includes("basic")
      );
      const basicPay = basicPayEarning ? basicPayEarning.amount : "0.00";

      // Find PAYE from deductions
      const payeDeduction = (data.deductions || []).find(
        (d) => d.label && d.label.toLowerCase().includes("paye")
      );
      const paye = payeDeduction ? payeDeduction.tax_amount : "0.00";

      console.log("paye", data);
      // Prepare template data
      const templateData = {
        grossEarning,
        grossDeduction,
        payrollMonth: data.payroll_month || "",
        payrollYear: data.payroll_year || "",
        employeeId: data.employee_id || "",
        pfHrId: data.pf_hr_id || "",
        fullName: data.full_name || "",
        designation: data.designation || "",
        location: data.location || "",
        costCenter: data.cost_center || "",
        napsaNo: data.napsa_no || "",
        taxablePayYtd: data.taxable_pay_ytd || "0.00",
        basicPay,
        tpinNo: data.tpin_no || "",
        nrcNo: data.nrc_no || "",
        nhisNo: data.nhis_no || "",
        leaveDays: data.leave_days || "0.00",
        leaveValue: data.leave_value || "0.00",
        engDate: data.eng_date || "",
        taxYearToDate: data.tax_year_to_date || "0.00",
        earningsRows,
        deductionsRows,
        netPay: data.net_pay || "0.00",
        paye,
        bankName: data.bank_name || "",
        payPoint: data.pay_point || "",
        bankAccount: data.bank_account || "",
        actualWorkedHours: data.actual_worked_hours || "",
        workDayOt: data.work_day_ot || "",
        nightHours: data.night_hours || "",
        expectedWorkedHours: data.expected_worked_hours || "",
        sundayPublicHolidayOt: data.sunday_public_holiday_ot || "",
        leaveDaysTaken: data.leave_days_taken || "",
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
 * Generate HTML payslip and convert to PDF using puppeteer (optional)
 * Requires: npm install puppeteer
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

module.exports = {
  generatePayslipHTML,
  generatePayslipPDF,
};
