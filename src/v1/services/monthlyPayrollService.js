const monthlyPayrollModel = require("../models/monthlyPayrollModel.js");
const CustomError = require("../../utils/CustomError");
const { generatePayslipPDF } = require("../../utils/pdfUtils.js");
const fs = require("fs");
const path = require("path");

const ExcelJS = require("exceljs");

const createMonthlyPayroll = async (data) => {
  return await monthlyPayrollModel.createMonthlyPayroll(data);
};

const findMonthlyPayrollById = async (id) => {
  return await monthlyPayrollModel.findMonthlyPayrollById(id);
};

const updateMonthlyPayroll = async (id, data) => {
  return await monthlyPayrollModel.updateMonthlyPayroll(id, data);
};

const deleteMonthlyPayroll = async (id) => {
  return await monthlyPayrollModel.deleteMonthlyPayroll(id);
};

const getAllMonthlyPayroll = async (
  search,
  page,
  size,
  startDate,
  endDate,
  payroll_month,
  payroll_year
) => {
  return await monthlyPayrollModel.getAllMonthlyPayroll(
    search,
    page,
    size,
    startDate,
    endDate,
    payroll_month,
    payroll_year
  );
};

const callMonthlyPayrollSP = async (params) => {
  try {
    const result = await monthlyPayrollModel.callMonthlyPayrollSP(params);

    console.log("Service layer result:", result);

    return {
      success: true,
      message: "Monthly payroll processed successfully.",
      result: result,
    };
  } catch (error) {
    throw new CustomError(`SP execution failed: ${error.message}`, 500);
  }
};

const triggerMonthlyPayrollCalculationSP = async (params) => {
  try {
    const result = await monthlyPayrollModel.triggerMonthlyPayrollCalculationSP(
      params
    );
    return {
      message: "Taxable amount SP executed successfully",
      result: result,
    };
  } catch (error) {
    throw new CustomError(
      `Calculation SP execution failed: ${error.message}`,
      500
    );
  }
};

const getComponentNames = async () => {
  return await monthlyPayrollModel.getComponentNames();
};

const createOrUpdatePayrollBulk = async (rows, user) => {
  return await monthlyPayrollModel.createOrUpdatePayrollBulk(rows, user);
};

// const getGeneratedMonthlyPayroll = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   payroll_month,
//   payroll_year
// ) => {
//   return await monthlyPayrollModel.getGeneratedMonthlyPayroll(
//     search,
//     page,
//     size,
//     startDate,
//     endDate,
//     payroll_month,
//     payroll_year
//   );
// };

const getGeneratedMonthlyPayroll = async (
  search,
  page,
  size,
  employee_id,
  payroll_month,
  payroll_year
) => {
  return await monthlyPayrollModel.getGeneratedMonthlyPayroll(
    search,
    page,
    size,
    employee_id,
    payroll_month,
    payroll_year
  );
};

const downloadPayslipPDF = async (employee_id, payroll_month, payroll_year) => {
  const data = await monthlyPayrollModel.downloadPayslipPDF(
    employee_id,
    payroll_month,
    payroll_year
  );

  if (!data) {
    throw new CustomError("Payslip not found", 404);
  }

  const fileName = `payslip_${employee_id}_${payroll_month}_${payroll_year}.pdf`;
  const filePath = path.join(__dirname, `../../pdfs/${fileName}`);

  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  await generatePayslipPDF(data, filePath);

  return filePath;
};

const downloadPayrollExcel = async (
  search,
  employee_id,
  payroll_month,
  payroll_year
) => {
  try {
    const result = await monthlyPayrollModel.getPayrollDataForExcel(
      search,
      employee_id,
      payroll_month,
      payroll_year
    );

    if (!result.data || result.data.length === 0) {
      throw new CustomError(
        "No payroll data found for the specified filters",
        404
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Payroll Data");

    const staticColumns = [
      { header: "Employee Code", key: "employee_code", width: 15 },
      { header: "Employee Name", key: "employee_full_name", width: 25 },
      { header: "Designation", key: "designation", width: 20 },
      { header: "Department", key: "department", width: 20 },
      { header: "Join Date", key: "join_date", width: 12 },
      { header: "NRC No", key: "nrc_no", width: 15 },
      { header: "TPIN No", key: "tpin_no", width: 15 },
      { header: "NAPSA No", key: "napsa_no", width: 15 },
      { header: "NHIS No", key: "nhis_no", width: 15 },
      { header: "Email", key: "employee_email", width: 25 },
      { header: "Payroll Week", key: "payroll_week", width: 12 },
      { header: "Start Date", key: "payroll_start_date", width: 12 },
      { header: "End Date", key: "payroll_end_date", width: 12 },
      { header: "Paid Days", key: "payroll_paid_days", width: 10 },

      { header: "Currency Code", key: "currency_code", width: 10 },
      { header: "Currency Name", key: "currency_name", width: 15 },

      { header: "Basic Salary", key: "basic_salary", width: 15 },
      { header: "Total Earnings", key: "total_earnings", width: 15 },
      { header: "Taxable Earnings", key: "taxable_earnings", width: 15 },
      { header: "Tax Amount", key: "tax_amount", width: 15 },
      { header: "Total Deductions", key: "total_deductions", width: 15 },
      { header: "Net Pay", key: "net_pay", width: 15 },
    ];

    const dynamicColumns = [];

    result.earningsComponents.forEach((componentCode) => {
      const componentName =
        result.componentMapping[componentCode] || `Component_${componentCode}`;
      dynamicColumns.push({
        header: `${componentName} (${componentCode})`,
        key: `${componentName} (${componentCode})`,
        width: 18,
      });
    });

    result.deductionComponents.forEach((componentCode) => {
      const componentName =
        result.componentMapping[componentCode] || `Component_${componentCode}`;
      dynamicColumns.push({
        header: `${componentName} (${componentCode})`,
        key: `${componentName} (${componentCode})`,
        width: 18,
      });
    });

    const additionalColumns = [
      { header: "Payroll Month", key: "payroll_month", width: 15 },
      { header: "Payroll Year", key: "payroll_year", width: 15 },
      { header: "Status", key: "status", width: 10 },
      { header: "Processed", key: "processed", width: 10 },
      { header: "Execution Date", key: "execution_date", width: 15 },
      { header: "Pay Date", key: "pay_date", width: 12 },
      { header: "Doc Date", key: "doc_date", width: 12 },
      { header: "Processed On", key: "processed_on", width: 15 },
      { header: "JE Trans ID", key: "je_transid", width: 12 },
      { header: "Remarks", key: "remarks", width: 30 },
      { header: "Created By", key: "createdby", width: 12 },
      { header: "Create Date", key: "createdate", width: 15 },
      { header: "Updated By", key: "updatedby", width: 12 },
      { header: "Update Date", key: "updatedate", width: 15 },
    ];

    const allColumns = [
      ...staticColumns,
      ...dynamicColumns,
      ...additionalColumns,
    ];
    worksheet.columns = allColumns;

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF366092" },
    };
    headerRow.height = 20;
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // result.data.forEach((row, index) => {
    //   const dataRow = worksheet.addRow(row);

    //   if (index % 2 === 1) {
    //     dataRow.fill = {
    //       type: "pattern",
    //       pattern: "solid",
    //       fgColor: { argb: "FFF8F9FA" },
    //     };
    //   }
    // });

    result.data.forEach((row, index) => {
      const fullRow = {};
      worksheet.columns.forEach((col) => {
        fullRow[col.key] =
          row[col.key] !== undefined && row[col.key] !== null
            ? row[col.key]
            : "N/A";
      });

      const dataRow = worksheet.addRow(fullRow);

      if (index % 2 === 1) {
        dataRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8F9FA" },
        };
      }
    });

    const currencyColumns = [
      "basic_salary",
      "total_earnings",
      "taxable_earnings",
      "tax_amount",
      "total_deductions",
      "net_pay",
    ];

    currencyColumns.forEach((colKey) => {
      const col = worksheet.getColumn(colKey);
      if (col) {
        col.numFmt = "#,##0.00";
        col.alignment = { horizontal: "right" };
      }
    });

    [...result.earningsComponents, ...result.deductionComponents].forEach(
      (componentCode) => {
        const componentName =
          result.componentMapping[componentCode] ||
          `Component_${componentCode}`;
        const col = worksheet.getColumn(`${componentName} (${componentCode})`);
        if (col) {
          col.numFmt = "#,##0.00";
          col.alignment = { horizontal: "right" };
        }
      }
    );

    const dateColumns = [
      "join_date",
      "payroll_start_date",
      "payroll_end_date",
      "execution_date",
      "pay_date",
      "doc_date",
      "processed_on",
      "createdate",
      "updatedate",
    ];

    dateColumns.forEach((colKey) => {
      const col = worksheet.getColumn(colKey);
      if (col) {
        col.numFmt = "dd/mm/yyyy";
        col.alignment = { horizontal: "center" };
      }
    });

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD3D3D3" } },
          left: { style: "thin", color: { argb: "FFD3D3D3" } },
          bottom: { style: "thin", color: { argb: "FFD3D3D3" } },
          right: { style: "thin", color: { argb: "FFD3D3D3" } },
        };
      });
    });

    worksheet.columns.forEach((column) => {
      if (column.header && column.header.length > column.width) {
        column.width = column.header.length + 2;
      }
    });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
    let filename = `Monthly_Payroll_${timestamp}`;

    if (employee_id) filename += `_Emp${employee_id}`;
    if (payroll_month)
      filename += `_M${String(payroll_month).padStart(2, "0")}`;
    if (payroll_year) filename += `_Y${payroll_year}`;
    if (search) filename += `_Search_${search.replace(/[^a-zA-Z0-9]/g, "_")}`;

    filename += ".xlsx";

    const filePath = path.join(__dirname, `../../exports/${filename}`);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    await workbook.xlsx.writeFile(filePath);

    console.log(`Excel file created: ${filePath}`);

    return {
      filePath,
      filename,
      totalRecords: result.totalRecords,
      componentMapping: result.componentMapping,
      earningsCount: result.earningsComponents.length,
      deductionsCount: result.deductionComponents.length,
    };
  } catch (error) {
    console.error("Excel generation error:", error);
    throw new CustomError(
      `Failed to generate Excel file: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createMonthlyPayroll,
  findMonthlyPayrollById,
  updateMonthlyPayroll,
  deleteMonthlyPayroll,
  getAllMonthlyPayroll,
  callMonthlyPayrollSP,
  getComponentNames,
  triggerMonthlyPayrollCalculationSP,
  createOrUpdatePayrollBulk,
  getGeneratedMonthlyPayroll,
  downloadPayslipPDF,
  downloadPayrollExcel,
};
