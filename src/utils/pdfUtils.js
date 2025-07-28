// // const PDFDocument = require("pdfkit");
// // const fs = require("fs");
// // const path = require("path");

// // const generatePayslipPDF = (data, filePath) => {
// //   return new Promise((resolve, reject) => {
// //     const doc = new PDFDocument({ margin: 50 });
// //     const stream = fs.createWriteStream(filePath);
// //     doc.pipe(stream);

// //     doc.fontSize(20).text("PAY SLIP", { align: "center" });
// //     doc
// //       .moveDown()
// //       .fontSize(12)
// //       .text(`For the Month Of ${data.payroll_month}, ${data.payroll_year}`, {
// //         align: "center",
// //       });
// //     doc.moveDown();

// //     doc.fontSize(10);

// //     const excludeKeys = new Set([
// //       "earnings",
// //       "deductions",
// //       "full_name",
// //       "designation",
// //       "bank_name",
// //       "bank_account",
// //       "pay_point",
// //       "pf_hr_id",
// //     ]);

// //     Object.keys(data).forEach((key) => {
// //       if (!excludeKeys.has(key) && typeof data[key] !== "object") {
// //         const label = key
// //           .replace(/_/g, " ")
// //           .replace(/\b\w/g, (l) => l.toUpperCase());
// //         doc.text(`${label} : ${data[key]}`);
// //       }
// //     });

// //     doc.text(`Full Name : ${data.full_name}`);
// //     doc.text(`Designation : ${data.designation}`);
// //     doc.text(`PF HR ID : ${data.pf_hr_id}`);

// //     doc.moveDown();
// //     doc.fontSize(12).text("Earnings", { underline: true });
// //     (data.earnings || []).forEach((e) => doc.text(`${e.label} : ${e.amount}`));

// //     doc.moveDown();
// //     doc.fontSize(12).text("Deductions", { underline: true });
// //     (data.deductions || []).forEach((d) =>
// //       doc.text(`${d.label} : ${d.amount}`)
// //     );

// //     doc.moveDown();
// //     doc.text(`Net Amount : ${data.net_pay}`);

// //     doc.moveDown();
// //     doc.fontSize(12).text("Salary Transfer", { underline: true });
// //     doc.text(`Bank Name : ${data.bank_name}`);
// //     doc.text(`Pay Point : ${data.pay_point}`);
// //     doc.text(`Bank A/c No. : ${data.bank_account}`);
// //     doc.text(`Amount : ${data.net_pay}`);

// //     doc.moveDown();
// //     doc.text(
// //       "The net pay is accepted and I the undersigned shall have no further claim related to my employment up to date of __/__/____"
// //     );
// //     doc.text("Signature ________________________");

// //     doc.end();

// //     stream.on("finish", () => resolve(filePath));
// //     stream.on("error", reject);
// //   });
// // };

// // module.exports = { generatePayslipPDF };

// const PDFDocument = require("pdfkit");
// const fs = require("fs");
// const path = require("path");

// const generatePayslipPDF = (data, filePath) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 50 });
//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     doc.fontSize(20).text("PAY SLIP", { align: "center" });
//     doc
//       .moveDown()
//       .fontSize(12)
//       .text(`For the Month Of ${data.payroll_month}, ${data.payroll_year}`, {
//         align: "center",
//       });
//     doc.moveDown();

//     const field = (label, value) => doc.text(`${label} : ${value ?? ""}`);

//     doc.fontSize(10);
//     field("Id", data.id);
//     field("Employee Id", data.employee_id);
//     field("Payroll Month", data.payroll_month);
//     field("Payroll Year", data.payroll_year);
//     field("Payroll Week", data.payroll_week);
//     field("Payroll Paid Days", data.payroll_paid_days);
//     field("Pay Currency", data.pay_currency);
//     field("Status", data.status);
//     field("Processed", data.processed);
//     field("Je Transid", data.je_transid);
//     field("Project Id", data.project_id);
//     field("Cost Center1 Id", data.cost_center1_id);
//     field("Cost Center2 Id", data.cost_center2_id);
//     field("Cost Center3 Id", data.cost_center3_id);
//     field("Cost Center4 Id", data.cost_center4_id);
//     field("Cost Center5 Id", data.cost_center5_id);
//     field("Approved1", data.approved1);
//     field("Approver1 Id", data.approver1_id);
//     field("Employee Email", data.employee_email);
//     field("Createdby", data.createdby);
//     field("Updatedby", data.updatedby);
//     field("Location", data.location);
//     field("Nrc No", data.nrc_no);
//     field("Tpin No", data.tpin_no);
//     field("Cost Center", data.cost_center);
//     field("Bank Id", data.bank_id);
//     field("Napsa No", data.napsa_no);
//     field("Nhis No", data.nhis_no);
//     field("Full Name", data.full_name);
//     field("Designation", data.designation);
//     field("PF HR ID", data.pf_hr_id);

//     doc.moveDown().fontSize(12).text("Earnings", { underline: true });
//     data.earnings?.forEach((e) => field(e.label, e.amount));
//     doc.moveDown();

//     doc.fontSize(12).text("Deductions", { underline: true });
//     data.deductions?.forEach((d) => field(d.label, d.amount));
//     doc.moveDown();

//     field("Net Amount", data.net_pay);
//     doc.moveDown();

//     doc.fontSize(12).text("Salary Transfer", { underline: true });
//     field("Bank Name", data.bank_name);
//     field("Pay Point", data.pay_point);
//     field("Bank A/c No.", data.bank_account);
//     field("Amount", data.net_pay);

//     doc.moveDown();
//     doc.text(
//       "The net pay is accepted and I the undersigned shall have no further claim related to my"
//     );
//     doc.text("employment up to date of __/__/____");
//     doc.text("Signature ________________________");

//     doc.end();
//     stream.on("finish", () => resolve(filePath));
//     stream.on("error", reject);
//   });
// };

// module.exports = { generatePayslipPDF };

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
            padding: 40px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .gross-summary {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .payslip-title {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }

        .month-year {
            font-size: 14px;
            margin-bottom: 30px;
        }

        .employee-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px 40px;
            font-size: 12px;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .info-row {
            display: flex;
            align-items: flex-start;
        }

        .info-label {
            font-weight: bold;
            min-width: 120px;
            flex-shrink: 0;
        }

        .info-colon {
            margin: 0 5px;
        }

        .info-value {
            flex: 1;
        }

        .earnings-deductions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 30px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-decoration: underline;
        }

        .amount-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            line-height: 1.4;
            margin-bottom: 2px;
        }

        .net-amount {
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0;
            text-align: left;
        }

        .salary-transfer {
            margin-bottom: 30px;
        }

        .bank-info {
            display: flex;
            font-size: 12px;
            line-height: 1.6;
            margin-top: 10px;
        }

        .bank-column {
            flex: 1;
            text-align: center;
            font-weight: bold;
        }

        .ot-hours {
            margin-bottom: 30px;
        }

        .ot-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px 20px;
            font-size: 12px;
            line-height: 1.6;
            margin-top: 10px;
        }

        .ot-row {
            display: flex;
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
            margin-bottom: 20px;
        }

        .signature {
            font-size: 12px;
            margin-top: 20px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .payslip {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="payslip">
        <div class="header">
            <div class="gross-summary">
                <span>Gross Earning {{grossEarning}}</span>
                <span>Gross Deduction {{grossDeduction}}</span>
            </div>
            <div class="payslip-title">PAY SLIP</div>
            <div class="month-year">For the Month Of {{payrollMonth}}, {{payrollYear}}</div>
        </div>

        <div class="employee-info">
            <div class="info-row">
                <span class="info-label">Employee ID</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{employeeId}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">PF HR ID</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{pfHrId}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Employee Name</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{fullName}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Designation</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{designation}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{location}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Cost Center</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{costCenter}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NAPSA No.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{napsaNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Taxable Pay YTD</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{taxablePayYtd}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Basic</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{basicPay}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">TPIN NO.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{tpinNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NRC NO.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{nrcNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">NHIS NO.</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{nhisNo}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Leave Days</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{leaveDays}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Leave Value</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{leaveValue}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">ENG Date</span>
                <span class="info-colon">:</span>
                <span class="info-value">{{engDate}}</span>
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
            </div>
            <div class="deductions">
                <div class="section-title">Deductions Amount</div>
                {{deductionsRows}}
            </div>
        </div>

        <div class="net-amount">
            Net Amount: {{netPay}}
        </div>

        <div class="salary-transfer">
            <div class="section-title">Salary Transfer</div>
            <div class="bank-info">
                <div class="bank-column">Bank Name</div>
                <div class="bank-column">Pay Point</div>
                <div class="bank-column">Bank A/c No.</div>
                <div class="bank-column">Amount</div>
            </div>
            <div class="bank-info">
                <div class="bank-column">{{bankName}}</div>
                <div class="bank-column">{{payPoint}}</div>
                <div class="bank-column">{{bankAccount}}</div>
                <div class="bank-column">{{netPay}}</div>
            </div>
        </div>

        <div class="ot-hours">
            <div class="section-title">OT HOURS</div>
            <div class="ot-grid">
                <div class="ot-row">
                    <span class="ot-label">Actual Worked Hours</span>
                    <span class="ot-colon">:</span>
                    <span>{{actualWorkedHours}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Work Day OT</span>
                    <span class="ot-colon">:</span>
                    <span>{{workDayOt}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Night Hours</span>
                    <span class="ot-colon">:</span>
                    <span>{{nightHours}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Expected Worked Hours</span>
                    <span class="ot-colon">:</span>
                    <span>{{expectedWorkedHours}}</span>
                </div>
                <div class="ot-row">
                    <span class="ot-label">Sunday & Public Holiday OT</span>
                    <span class="ot-colon">:</span>
                    <span>{{sundayPublicHolidayOt}}</span>
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

        <div class="signature">
            Signature ________________________
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

    const browser = await puppeteer.launch();
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

// Usage Example:
/*
const payrollData = {
  employee_id: "1",
  pf_hr_id: "1-006",
  full_name: "LAWRENCE CHINTU",
  designation: "OFFICE ORDERLY",
  location: "ZAMBIA",
  cost_center: "CHINTU LAWRENCE",
  napsa_no: "303111919",
  tpin_no: "2205909953",
  nrc_no: "370008/61/1",
  nhis_no: "5392129110127",
  payroll_month: "February",
  payroll_year: "2025",
  net_pay: "7,450.58",
  bank_name: "NMB",
  pay_point: "NDOLA",
  bank_account: "E WALLET",
  leave_days: "32.00",
  leave_value: "2,826.94",
  eng_date: "01/11/1999",
  tax_year_to_date: "8,733.78",
  leave_days_taken: "10.00",
  earnings: [
    { label: "BASIC PAY", amount: "2,296.89" },
    { label: "HOUSING ALLOWANCE", amount: "689.07" },
    { label: "LUNCH ALLOWANCE", amount: "220.00" },
    { label: "TRANSPORT ALLOWANCE", amount: "200.00" },
    { label: "EX-GRATIA PAYMENT", amount: "960.93" },
    { label: "GRATUITY", amount: "3,500.00" }
  ],
  deductions: [
    { label: "NAPSA", amount: "393.34" },
    { label: "NHIMA", amount: "22.97" },
    { label: "Paye", amount: "0.00" }
  ]
};

// Generate HTML file
generatePayslipHTML(payrollData, './payslip.html')
  .then(filePath => console.log('HTML generated:', filePath))
  .catch(error => console.error('Error:', error));

// Generate PDF file (requires puppeteer)
generatePayslipPDF(payrollData, './payslip.pdf')
  .then(filePath => console.log('PDF generated:', filePath))
  .catch(error => console.error('Error:', error));

// Get HTML content as string
generatePayslipHTML(payrollData)
  .then(htmlContent => console.log('HTML content generated'))
  .catch(error => console.error('Error:', error));
*/
