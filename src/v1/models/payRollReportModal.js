const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError.js");
const { toLowerCase } = require("zod/v4");
const { id } = require("date-fns/locale");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const generatePayRollSummaryReport = async (paymonth, payyear) => {
  try {
    console.log("Payroll Report - Fetching data for:", { paymonth, payyear });

    const result = await prisma.$queryRaw`
      EXEC [dbo].[sp_hrms_payroll_summary_report] 
        @paymonth = ${paymonth}, 
        @payyear = ${payyear}
    `;
    console.log("Payroll Report Report - Raw result:", result);
    console.log("Payroll Report Report - Result length:", result?.length || 0);

    if (!result || result.length === 0) {
      console.log("Payroll Report Report - Stored procedure returned empty");
      return [];
    }

    if (result && result.length > 0) {
      console.log("Payroll Report Report - First row sample:", result[0]);
    }

    return result;
  } catch (error) {
    console.error("Payroll Report Report - Error:", error);
    throw new CustomError(
      `Error executing Payroll Report report stored procedure: ${error.message}`,
      500,
    );
  }
};

const payrollSummaryReportTemplate = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Payroll Summary Report</title>
<style>
body {
  font-family: Arial, sans-serif;
  font-size: 12px;
  margin: 0;
  padding: 20px;
}

.container {
  width: 21cm;
  margin: auto;
  padding: 15px;
  border: 1px solid #000;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.company-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.company-logo {
  max-width: 80px;
  max-height: 80px;
  margin-right: 20px;
}

.company-details h2 {
  margin: 5px 0;
  font-size: 18px;
  font-weight: bold;
}

.company-details p {
  margin: 2px 0;
  font-size: 12px;
}

.report-title {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0;
  text-decoration: underline;
}

.report-period {
  text-align: center;
  font-size: 14px;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.table th,
.table td {
  border: 1px solid #000;
  padding: 6px;
  text-align: left;
}

.table th {
  background: #f0f0f0;
  text-align: center;
  font-weight: bold;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.total {
  font-weight: bold;
  background: #f9f9f9;
}

.footer {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
}

.signature-section {
  width: 45%;
  text-align: center;
}

.signature-line {
  border-top: 1px solid #000;
  margin-top: 40px;
  padding-top: 5px;
}

@media print {
  .container {
    border: none;
    margin: 0;
    padding: 0;
  }
  
  body {
    padding: 0;
  }
}
</style>
</head>

<body>
<div class="container">

  <!-- HEADER WITH COMPANY INFO -->
  <div class="header">
    <div class="company-info">
      {{companyLogo}}
      <div class="company-details">
        <h2>{{companyName}}</h2>
        <p>{{companyAddress}}</p>
        <p>{{companyPhone}} | {{companyEmail}}</p>
      </div>
    </div>
  </div>

  <!-- REPORT TITLE -->
  <div class="report-title">
    PAYROLL SUMMARY REPORT
  </div>

  <!-- REPORT PERIOD -->
  <div class="report-period">
    Period: {{reportPeriod}}
  </div>

  <!-- PAYROLL DATA TABLE -->
  <table class="table">
    <thead>
      <tr>
        <th>Row No</th>
        <th>Emp ID</th>
        <th>Department</th>
        <th>Employee Name</th>
        <th class="text-right">Basic Salary</th>
        <th class="text-right">1002</th>
        <th class="text-right">1003</th>
        <th class="text-right">1004</th>
        <th class="text-right">1005</th>
        <th class="text-right">1006</th>
        <th class="text-right">1007</th>
        <th class="text-right">1008</th>
        <th class="text-right">1009</th>
        <th class="text-right">1012</th>
        <th class="text-right">Tax</th>
        <th class="text-right">Net Pay</th>
        <th class="text-right">Taxable Amount</th>
      </tr>
    </thead>
    <tbody>
      {{tableRows}}
      <tr class="total">
        <td colspan="4">TOTAL</td>
        <td class="text-right">{{totalBasicSalary}}</td>
        <td class="text-right">{{total1002}}</td>
        <td class="text-right">{{total1003}}</td>
        <td class="text-right">{{total1004}}</td>
        <td class="text-right">{{total1005}}</td>
        <td class="text-right">{{total1006}}</td>
        <td class="text-right">{{total1007}}</td>
        <td class="text-right">{{total1008}}</td>
        <td class="text-right">{{total1009}}</td>
        <td class="text-right">-</td>
        <td class="text-right">{{totalTax}}</td>
        <td class="text-right">{{totalNet}}</td>
        <td class="text-right">{{totalTaxable}}</td>
      </tr>
    </tbody>
  </table>

  <!-- FOOTER WITH SIGNATURES -->
  <div class="footer">
    <div class="signature-section">
      <div class="signature-line">
        {{companySignature}}
      </div>
      <p>Authorized Signature</p>
    </div>
    
    <div class="signature-section">
      <div class="signature-line">
        &nbsp;
      </div>
      <p>Prepared By</p>
    </div>
  </div>

</div>
</body>
</html>
`;

const p10ReportTemplate = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Payroll Report</title>
<style>
body {
  font-family: Arial, sans-serif;
  font-size: 11px;
}

.container {
  width: 21cm;
  margin: auto;
  padding: 15px;
  border: 1px solid #000;
}

.header {
  text-align: center;
  font-weight: bold;
}

.header h2 {
  margin: 2px 0;
  font-size: 14px;
}

.flex {
  display: flex;
  justify-content: space-between;
}

.box {
  width: 48%;
}

.label {
  font-weight: bold;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.table th,
.table td {
  border: 1px solid #000;
  padding: 4px;
}

.table th {
  background: #eee;
  text-align: center;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.total {
  font-weight: bold;
}
</style>
</head>

<body>
<div class="container">

  <!-- HEADER -->
  <div class="header">
    <h2>TANZANIA</h2>
    <h2>TANZANIA REVENUE AUTHORITY - INCOME TAX DEPARTMENT</h2>
    <h2>P.A.Y.E EMPLOYER'S END OF YEAR CERTIFICATE P.10</h2>
  </div>

  <br />

  <!-- EMPLOYER DETAILS -->
  <div class="flex">
    <div class="box">
      <p><span class="label">Employer Name:</span> {{companyName}}</p>
      <p><span class="label">Nature of Business:</span> {{natureOfBusiness}}</p>
      <p><span class="label">Parastatal / Company:</span> {{companyType}}</p>
    </div>

    <div class="box">
      <p>{{companyAddress}}</p>
      <p><span class="label">Payroll/Works Check No:</span> {{payrollCheckNo}}</p>
      <p><span class="label">Employer TIN:</span> {{employerTin}}</p>
    </div>
  </div>

  <br />

  <!-- MONTH TOTALS -->
  <table class="table">
    <thead>
      <tr>
        <th>Month</th>
        <th class="text-right">Tax Paid</th>
      </tr>
    </thead>
    <tbody>
      {{monthlyRows}}
      <tr class="total">
        <td>Total</td>
        <td class="text-right">{{yearlyTaxTotal}}</td>
      </tr>
    </tbody>
  </table>

  <br />

  <!-- INCOME RANGE SUMMARY -->
  <table class="table">
    <thead>
      <tr>
        <th>Income Range</th>
        <th>No. of Employees</th>
        <th>Total Gross</th>
        <th>Total Tax Paid</th>
      </tr>
    </thead>
    <tbody>
      {{incomeRangeRows}}
      <tr class="total">
        <td class="text-center">TOTAL</td>
        <td class="text-center">{{totalEmployees}}</td>
        <td class="text-right">{{totalGross}}</td>
        <td class="text-right">{{totalTax}}</td>
      </tr>
    </tbody>
  </table>

</div>
</body>
</html>
`;

const generatePayrollSummaryReportHTML = (
  reportData,
  companySettings,
  paymonth,
  payyear,
) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Payroll Summary HTML - Processing reportData:", reportData);
      console.log(
        "Payroll Summary HTML - ReportData length:",
        reportData?.length || 0,
      );

      const formatAmount = (value) => {
        const number = parseFloat(value || 0);
        return number.toLocaleString("en-TZ", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const monthNames = [
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

      // Calculate totals
      let totals = {
        basicSalary: 0,
        c1002: 0,
        c1003: 0,
        c1004: 0,
        c1005: 0,
        c1006: 0,
        c1007: 0,
        c1008: 0,
        c1009: 0,
        tax: 0,
        net: 0,
        taxable: 0,
      };

      let tableRows = "";

      if (reportData && reportData.length > 0) {
        reportData.forEach((row) => {
          totals.basicSalary += parseFloat(row.BasicSalary || 0);
          totals.c1002 += parseFloat(row["1002"] || 0);
          totals.c1003 += parseFloat(row["1003"] || 0);
          totals.c1004 += parseFloat(row["1004"] || 0);
          totals.c1005 += parseFloat(row["1005"] || 0);
          totals.c1006 += parseFloat(row["1006"] || 0);
          totals.c1007 += parseFloat(row["1007"] || 0);
          totals.c1008 += parseFloat(row["1008"] || 0);
          totals.c1009 += parseFloat(row["1009"] || 0);
          totals.tax += parseFloat(row.Tax || 0);
          totals.net += parseFloat(row.Net || 0);
          totals.taxable += parseFloat(row.TaxableAmount || 0);

          tableRows += `
            <tr>
              <td class="text-center">${row.RowNumber || ""}</td>
              <td class="text-center">${row.empID || ""}</td>
              <td>${row.dept || ""}</td>
              <td>${row.EmpName || ""}</td>
              <td class="text-right">${formatAmount(row.BasicSalary)}</td>
              <td class="text-right">${formatAmount(row["1002"])}</td>
              <td class="text-right">${formatAmount(row["1003"])}</td>
              <td class="text-right">${formatAmount(row["1004"])}</td>
              <td class="text-right">${formatAmount(row["1005"])}</td>
              <td class="text-right">${formatAmount(row["1006"])}</td>
              <td class="text-right">${formatAmount(row["1007"])}</td>
              <td class="text-right">${formatAmount(row["1008"])}</td>
              <td class="text-right">${formatAmount(row["1009"])}</td>
              <td class="text-right">${formatAmount(row["1012"])}</td>
              <td class="text-right">${formatAmount(row.Tax)}</td>
              <td class="text-right">${formatAmount(row.Net)}</td>
              <td class="text-right">${formatAmount(row.TaxableAmount)}</td>
            </tr>
          `;
        });
      }

      // Prepare company logo HTML
      let companyLogoHtml = "";
      if (companySettings.company_logo) {
        companyLogoHtml = `<img src="${companySettings.company_logo}" alt="Company Logo" class="company-logo">`;
      } else {
        companyLogoHtml = '<div class="company-logo-placeholder"></div>';
      }

      // Prepare company signature HTML
      let companySignatureHtml = "";
      if (companySettings.company_signature) {
        companySignatureHtml = `<img src="${companySettings.company_signature}" alt="Company Signature" style="max-height: 60px;">`;
      } else {
        companySignatureHtml = "&nbsp;";
      }

      const templateData = {
        companyLogo: companyLogoHtml,
        companyName: companySettings.company_name || "Company Name",
        companyAddress: companySettings.street_address || "",
        companyPhone: companySettings.phone_number || "",
        companyEmail: companySettings.email || "",
        reportPeriod: `${monthNames[paymonth - 1]} ${payyear}`,
        tableRows,
        totalBasicSalary: formatAmount(totals.basicSalary),
        total1002: formatAmount(totals.c1002),
        total1003: formatAmount(totals.c1003),
        total1004: formatAmount(totals.c1004),
        total1005: formatAmount(totals.c1005),
        total1006: formatAmount(totals.c1006),
        total1007: formatAmount(totals.c1007),
        total1008: formatAmount(totals.c1008),
        total1009: formatAmount(totals.c1009),
        totalTax: formatAmount(totals.tax),
        totalNet: formatAmount(totals.net),
        totalTaxable: formatAmount(totals.taxable),
        companySignature: companySignatureHtml,
      };

      let htmlContent = payrollSummaryReportTemplate;
      Object.keys(templateData).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(placeholder, templateData[key]);
      });

      resolve(htmlContent);
    } catch (error) {
      reject(error);
    }
  });
};

const generateP10ReportHTML = (
  reportData,
  companySettings,
  fromDate,
  toDate,
) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Payroll HTML - Processing reportData:", reportData);
      console.log("Payroll HTML - ReportData length:", reportData?.length || 0);

      const formatAmount = (value) => {
        const number = parseFloat(value || 0);
        return number.toLocaleString("en-TZ", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const monthlyData = {};
      let totalTax = 0;
      let totalGross = 0;
      let totalEmployees = 0;

      if (reportData && reportData.length > 0) {
        reportData.forEach((row) => {
          const month = parseInt(row.payroll_month) || 1;
          const year = parseInt(row.payroll_year) || new Date().getFullYear();
          const monthKey = `${year}-${String(month).padStart(2, "0")}`;
          const taxAmount = parseFloat(row.tax_amount || 0);
          const grossSalary =
            parseFloat(row["1001"] || 0) +
            parseFloat(row["1002"] || 0) +
            parseFloat(row["1003"] || 0) +
            parseFloat(row["1004"] || 0) +
            parseFloat(row["1005"] || 0) +
            parseFloat(row["1006"] || 0) +
            parseFloat(row["1007"] || 0) +
            parseFloat(row["1008"] || 0) +
            parseFloat(row["1009"] || 0);

          // console.log(
          //   `Payroll HTML - Processing row: month=${month}, year=${year}, tax=${taxAmount}, gross=${grossSalary}`
          // );

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += taxAmount;
          totalTax += taxAmount;
          totalGross += grossSalary;
          totalEmployees++;
        });
      }

      console.log("Payroll HTML - Monthly data summary:", monthlyData);
      console.log("Payroll HTML - Total tax calculated:", totalTax);
      console.log("Payroll HTML - Total gross calculated:", totalGross);

      let monthlyRows = "";
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const years = [
        ...new Set(
          reportData.map(
            (row) => parseInt(row.payroll_year) || new Date().getFullYear(),
          ),
        ),
      ];
      console.log("P10 HTML - Years found in data:", years);

      const monthYearData = [];
      years.forEach((year) => {
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${year}-${String(month).padStart(2, "0")}`;
          const taxAmount = monthlyData[monthKey] || 0;
          if (taxAmount > 0) {
            monthYearData.push({
              month,
              year,
              taxAmount,
              monthName: monthNames[month - 1],
              displayText: `${monthNames[month - 1]} ${year}`,
            });
          }
        }
      });

      monthYearData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      monthYearData.forEach((data) => {
        monthlyRows += `
          <tr>
            <td>${data.displayText}</td>
            <td class="text-right">${formatAmount(data.taxAmount)}</td>
          </tr>
        `;
      });

      const incomeRanges = [
        { range: "Up to 270,000", employees: 0, gross: 0, tax: 0 },
        { range: "270,001 - 520,000", employees: 0, gross: 0, tax: 0 },
        { range: "520,001 - 780,000", employees: 0, gross: 0, tax: 0 },
        { range: "780,001 - 1,040,000", employees: 0, gross: 0, tax: 0 },
        { range: "1,040,001 - 1,300,000", employees: 0, gross: 0, tax: 0 },
        { range: "1,300,001 - 1,560,000", employees: 0, gross: 0, tax: 0 },
        { range: "1,560,001 - 1,820,000", employees: 0, gross: 0, tax: 0 },
        { range: "1,820,001 - 2,080,000", employees: 0, gross: 0, tax: 0 },
        { range: "2,080,001 - 2,340,000", employees: 0, gross: 0, tax: 0 },
        { range: "2,340,001 - 2,600,000", employees: 0, gross: 0, tax: 0 },
        { range: "2,600,001 - 2,860,000", employees: 0, gross: 0, tax: 0 },
        { range: "2,860,001 - 3,120,000", employees: 0, gross: 0, tax: 0 },
        { range: "3,120,001 - 3,380,000", employees: 0, gross: 0, tax: 0 },
        { range: "3,380,001 - 3,640,000", employees: 0, gross: 0, tax: 0 },
        { range: "3,640,001 - 3,900,000", employees: 0, gross: 0, tax: 0 },
        { range: "3,900,001 - 4,160,000", employees: 0, gross: 0, tax: 0 },
        { range: "4,160,001 - 4,420,000", employees: 0, gross: 0, tax: 0 },
        { range: "4,420,001 - 4,680,000", employees: 0, gross: 0, tax: 0 },
        { range: "4,680,001 - 4,940,000", employees: 0, gross: 0, tax: 0 },
        { range: "4,940,001 - 5,200,000", employees: 0, gross: 0, tax: 0 },
        { range: "5,200,001 - 5,460,000", employees: 0, gross: 0, tax: 0 },
        { range: "5,460,001 - 5,720,000", employees: 0, gross: 0, tax: 0 },
        { range: "5,720,001 - 5,980,000", employees: 0, gross: 0, tax: 0 },
        { range: "5,980,001 - 6,240,000", employees: 0, gross: 0, tax: 0 },
        { range: "6,240,001 - 6,500,000", employees: 0, gross: 0, tax: 0 },
        { range: "6,500,001 - 6,760,000", employees: 0, gross: 0, tax: 0 },
        { range: "6,760,001 - 7,020,000", employees: 0, gross: 0, tax: 0 },
        { range: "7,020,001 - 7,280,000", employees: 0, gross: 0, tax: 0 },
        { range: "7,280,001 - 7,540,000", employees: 0, gross: 0, tax: 0 },
        { range: "7,540,001 - 7,800,000", employees: 0, gross: 0, tax: 0 },
        { range: "7,800,001 - 8,060,000", employees: 0, gross: 0, tax: 0 },
        { range: "8,060,001 - 8,320,000", employees: 0, gross: 0, tax: 0 },
        { range: "8,320,001 - 8,580,000", employees: 0, gross: 0, tax: 0 },
        { range: "8,580,001 - 8,840,000", employees: 0, gross: 0, tax: 0 },
        { range: "8,840,001 - 9,100,000", employees: 0, gross: 0, tax: 0 },
        { range: "9,100,001 - 9,360,000", employees: 0, gross: 0, tax: 0 },
        { range: "9,360,001 - 9,620,000", employees: 0, gross: 0, tax: 0 },
        { range: "9,620,001 - 9,880,000", employees: 0, gross: 0, tax: 0 },
        { range: "9,880,001 - 10,140,000", employees: 0, gross: 0, tax: 0 },
        { range: "10,140,001 and above", employees: 0, gross: 0, tax: 0 },
      ];

      if (reportData && reportData.length > 0) {
        incomeRanges[0].employees = totalEmployees;
        incomeRanges[0].gross = totalGross;
        incomeRanges[0].tax = totalTax;
      }

      let incomeRangeRows = "";
      incomeRanges.forEach((range) => {
        incomeRangeRows += `
          <tr>
            <td>${range.range}</td>
            <td class="text-center">${range.employees}</td>
            <td class="text-right">${formatAmount(range.gross)}</td>
            <td class="text-right">${formatAmount(range.tax)}</td>
          </tr>
        `;
      });

      console.log("P10 HTML - Monthly data:", monthlyData);
      console.log("P10 HTML - Total tax:", totalTax);
      console.log("P10 HTML - Total gross:", totalGross);

      const templateData = {
        companyName: companySettings.company_name || "Company Name",
        natureOfBusiness:
          companySettings.nature_of_business || "Nature of Business",
        companyType: companySettings.company_type || "Company",
        companyAddress: companySettings.street_address || "Company Address",
        payrollCheckNo: companySettings.payroll_check_no || "",
        employerTin: companySettings.tin_number || "",
        monthlyRows,
        yearlyTaxTotal: formatAmount(totalTax),
        incomeRangeRows,
        totalEmployees: totalEmployees,
        totalGross: formatAmount(totalGross),
        totalTax: formatAmount(totalTax),
      };

      let htmlContent = p10ReportTemplate;
      Object.keys(templateData).forEach((key) => {
        const placeholder = new RegExp(`{{${key}}}`, "g");
        htmlContent = htmlContent.replace(placeholder, templateData[key]);
      });

      resolve(htmlContent);
    } catch (error) {
      reject(error);
    }
  });
};

const generatePayrollSummaryReportPDF = async (
  reportData,
  companySettings,
  filePath,
  paymonth,
  payyear,
) => {
  let browser = null;
  try {
    const htmlContent = await generatePayrollSummaryReportHTML(
      reportData,
      companySettings,
      paymonth,
      payyear,
    );

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    browser = await puppeteer.launch({
      executablePath:
        process.cwd() +
        "\\.puppeteer\\chrome\\win64-138.0.7204.168\\chrome-win64\\chrome.exe",
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

    return filePath;
  } catch (error) {
    console.log("Payroll Summary PDF generation error:", error);
    throw new Error(`Payroll Summary PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
};

const generatePayRollSummaryReportPDF = async (
  reportData,
  companySettings,
  filePath,
  fromDate,
  toDate,
) => {
  let browser = null;
  try {
    const htmlContent = await generateP10ReportHTML(
      reportData,
      companySettings,
      fromDate,
      toDate,
    );

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    browser = await puppeteer.launch({
      executablePath:
        process.cwd() +
        "\\.puppeteer\\chrome\\win64-138.0.7204.168\\chrome-win64\\chrome.exe",
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

    return filePath;
  } catch (error) {
    console.log("P10 PDF generation error:", error);
    throw new Error(`P10 PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

module.exports = {
  generatePayRollSummaryReport,
  generatePayrollSummaryReportHTML,
  generatePayrollSummaryReportPDF,
  generatePayRollSummaryReportPDF,
};
