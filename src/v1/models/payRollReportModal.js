const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError.js");
const { toLowerCase } = require("zod/v4");
const { id } = require("date-fns/locale");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const generatePayRollSummaryReport = async (fromDate, toDate) => {
  try {
    console.log("P10 Report - Fetching data for:", { fromDate, toDate });

    const checkData = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_records,
        MIN(doc_date) as min_date,
        MAX(doc_date) as max_date
      FROM hrms_d_monthly_payroll_processing 
      WHERE doc_date >= ${fromDate} AND doc_date <= ${toDate}
    `;
    console.log("P10 Report - Monthly payroll data check:", checkData);

    const sampleData = await prisma.$queryRaw`
      SELECT TOP 5 *, 
        CAST(payroll_month AS VARCHAR) + '/' + CAST(payroll_year AS VARCHAR) as payroll_period,
        doc_date,
        je_transid,
        1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009
      FROM hrms_d_monthly_payroll_processing 
      WHERE doc_date >= ${fromDate} AND doc_date <= ${toDate}
    `;
    console.log("P10 Report - Sample monthly payroll data:", sampleData);

    const result = await prisma.$queryRaw`
      EXEC [dbo].[sp_hrms_p10_report] 
        @FromDate = ${fromDate}, 
        @ToDate = ${toDate}
    `;
    console.log("P10 Report - Raw result:", result);
    console.log("P10 Report - Result length:", result?.length || 0);

    if (!result || result.length === 0) {
      console.log(
        "P10 Report - Stored procedure returned empty, using sample data"
      );
      return sampleData;
    }

    if (result && result.length > 0) {
      console.log("P10 Report - First row sample:", result[0]);
    }

    return result;
  } catch (error) {
    console.error("P10 Report - Error:", error);
    throw new CustomError(
      `Error executing P10 report stored procedure: ${error.message}`,
      500
    );
  }
};

const p10ReportTemplate = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>P10 Report</title>
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

const generateP10ReportHTML = (
  reportData,
  companySettings,
  fromDate,
  toDate
) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("P10 HTML - Processing reportData:", reportData);
      console.log("P10 HTML - ReportData length:", reportData?.length || 0);

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

          console.log(
            `P10 HTML - Processing row: month=${month}, year=${year}, tax=${taxAmount}, gross=${grossSalary}`
          );

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey] += taxAmount;
          totalTax += taxAmount;
          totalGross += grossSalary;
          totalEmployees++;
        });
      }

      console.log("P10 HTML - Monthly data summary:", monthlyData);
      console.log("P10 HTML - Total tax calculated:", totalTax);
      console.log("P10 HTML - Total gross calculated:", totalGross);

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
            (row) => parseInt(row.payroll_year) || new Date().getFullYear()
          )
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

const generatePayRollSummaryReportPDF = async (
  reportData,
  companySettings,
  filePath,
  fromDate,
  toDate
) => {
  let browser = null;
  try {
    const htmlContent = await generateP10ReportHTML(
      reportData,
      companySettings,
      fromDate,
      toDate
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
  generatePayRollSummaryReportPDF,
};
