const importExportModel = require("../models/importExportModel.js");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
const fs = require("fs");

const isInstructionRow = (row, config) => {
  const rowValues = Object.values(row);
  const nonEmptyValues = rowValues.filter(
    (val) => val !== null && val !== undefined && val !== ""
  );

  if (nonEmptyValues.length === 0) {
    return true;
  }

  const firstValue = String(nonEmptyValues[0] || "").trim();

  if (
    firstValue.toUpperCase().includes("INSTRUCTIONS") ||
    firstValue.match(/^\d+\.\s/) ||
    firstValue.match(/^Row \d+:/) ||
    firstValue.includes("Fill the data") ||
    firstValue.includes("Do not modify") ||
    firstValue.includes("Required fields") ||
    firstValue.includes("Date format") ||
    firstValue.includes("Gender values") ||
    firstValue.includes("Status values") ||
    firstValue.includes("Marital Status") ||
    firstValue.includes("Phone number format") ||
    firstValue.includes("Email must be") ||
    firstValue.includes("Employee code must be") ||
    firstValue.includes("Department ID") ||
    firstValue.includes("Date of birth must be") ||
    firstValue.includes("Join date should be") ||
    firstValue.includes("Leave optional fields")
  ) {
    return true;
  }

  const requiredFields = config.requiredFields || [];
  const hasRequiredFields = requiredFields.some(
    (field) => row[field] && String(row[field]).trim() !== ""
  );

  if (!hasRequiredFields && nonEmptyValues.length <= 2) {
    return true;
  }

  return false;
};

const parseExcelFile = async (filePath, tableName) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return { success: false, errors: ["Excel file is empty"], data: [] };
    }

    const config = importExportModel.getTableConfig(tableName);

    const filteredData = jsonData.filter(
      (row) => !isInstructionRow(row, config)
    );

    if (filteredData.length === 0) {
      return {
        success: false,
        errors: [
          "No valid data rows found. Please ensure data rows are present and instruction rows are excluded.",
        ],
        data: [],
      };
    }

    const validationErrors = importExportModel.validateData(
      filteredData,
      tableName
    );

    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors, data: filteredData };
    }

    return { success: true, data: filteredData, count: filteredData.length };
  } catch (error) {
    throw new Error(`Error parsing Excel: ${error.message}`);
  }
};

const importDataFromExcel = async (filePath, tableName, createdBy = 1) => {
  try {
    const parseResult = await parseExcelFile(filePath, tableName);

    if (!parseResult.success) {
      return {
        success: false,
        errors: parseResult.errors,
        data: parseResult.data,
      };
    }

    const importResult = await importExportModel.bulkInsertData(
      parseResult.data,
      tableName,
      createdBy
    );

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return {
      success: true,
      inserted: importResult.inserted,
      total: importResult.total,
      skipped: importResult.skipped || 0,
      errors: importResult.errors || [],
      message: importResult.message,
      preview: parseResult.data.slice(0, 5),
    };
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw new Error(`Import failed: ${error.message}`);
  }
};

const generateExcelTemplate = async (tableName) => {
  try {
    const config = importExportModel.getTableConfig(tableName);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${config.displayName} Template`);

    const headers = Object.keys(config.fields);
    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4CAF50" },
    };

    const getSampleValue = (field, fieldConfig) => {
      const fieldLower = field.toLowerCase();

      switch (fieldConfig.type) {
        case "string":
          if (fieldLower === "employee_code") {
            return "EMP001";
          } else if (fieldLower === "full_name") {
            return "John Michael Doe";
          } else if (fieldLower === "first_name") {
            return "John";
          } else if (fieldLower === "last_name") {
            return "Doe";
          } else if (fieldLower === "middle_name") {
            return "Michael";
          } else if (
            fieldLower === "phone_number" ||
            fieldLower === "office_phone"
          ) {
            return "+255712345678";
          } else if (fieldLower === "status") {
            return "Active";
          } else if (fieldLower === "gender") {
            return fieldConfig.enum && fieldConfig.enum.length > 0
              ? fieldConfig.enum[0]
              : "M";
          } else if (fieldLower === "marital_status") {
            return "Married";
          } else if (
            fieldLower === "national_id_number" ||
            fieldLower === "identification_number"
          ) {
            return "1234567890123456";
          } else if (fieldLower === "passport_number") {
            return "A12345678";
          } else if (fieldLower === "employment_type") {
            return "Full Time";
          } else if (fieldLower === "employee_category") {
            return "Permanent";
          } else if (fieldLower === "work_location") {
            return "Head Office";
          } else if (fieldLower === "account_number") {
            return "1234567890";
          } else if (fieldLower === "nationality") {
            return "Tanzanian";
          } else if (fieldLower === "blood_group") {
            return "O+";
          } else if (fieldLower === "address") {
            return "123 Main Street, Dar es Salaam";
          } else if (fieldLower === "father_name") {
            return "Robert Doe";
          } else if (fieldLower === "mother_name") {
            return "Mary Doe";
          } else if (fieldLower === "spouse_name") {
            return "Jane Doe";
          } else if (fieldLower === "extension") {
            return "1234";
          } else if (fieldLower === "payment_mode") {
            return "Bank Transfer";
          } else if (fieldLower === "header_attendance_rule") {
            return "Biometric/Manual Attendance";
          } else {
            return `Sample ${field.replace(/_/g, " ")}`;
          }

        case "number":
          if (fieldLower.includes("department_id")) {
            return 1;
          } else if (fieldLower.includes("designation_id")) {
            return 1;
          } else if (fieldLower.includes("bank_id")) {
            return 1;
          } else if (fieldLower.includes("currency_id")) {
            return 1;
          } else if (fieldLower.includes("shift_id")) {
            return 1;
          } else if (fieldLower.includes("manager_id")) {
            return null;
          } else if (fieldLower.includes("id")) {
            return 1;
          } else if (fieldLower.includes("no_of_child")) {
            return 2;
          } else {
            return 123;
          }

        case "decimal":
          return fieldLower.includes("salary") ? 50000.0 : 100.5;

        case "date":
          const today = new Date();
          if (
            fieldLower.includes("date_of_birth") ||
            fieldLower.includes("birth")
          ) {
            const birthDate = new Date(today);
            birthDate.setFullYear(today.getFullYear() - 30);
            return birthDate.toISOString().split("T")[0];
          } else if (fieldLower.includes("join_date")) {
            const joinDate = new Date(today);
            joinDate.setMonth(today.getMonth() - 6);
            return joinDate.toISOString().split("T")[0];
          } else if (fieldLower.includes("confirm_date")) {
            const confirmDate = new Date(today);
            confirmDate.setMonth(today.getMonth() - 3);
            return confirmDate.toISOString().split("T")[0];
          } else if (
            fieldLower.includes("resign_date") ||
            fieldLower.includes("relieving")
          ) {
            return null;
          } else if (
            fieldLower.includes("expiry") ||
            fieldLower.includes("expiry_date")
          ) {
            const expiryDate = new Date(today);
            expiryDate.setFullYear(today.getFullYear() + 5);
            return expiryDate.toISOString().split("T")[0];
          } else if (
            fieldLower.includes("issue") ||
            fieldLower.includes("issue_date")
          ) {
            const issueDate = new Date(today);
            issueDate.setFullYear(today.getFullYear() - 2);
            return issueDate.toISOString().split("T")[0];
          } else {
            return today.toISOString().split("T")[0];
          }

        case "email":
          if (fieldLower === "official_email") {
            return "john.doe@company.com";
          } else {
            return "john.doe@email.com";
          }

        default:
          return "Sample";
      }
    };

    const sampleRow = {};
    Object.keys(config.fields).forEach((field) => {
      const fieldConfig = config.fields[field];
      sampleRow[field] = getSampleValue(field, fieldConfig);
    });

    worksheet.addRow(Object.values(sampleRow));

    const sampleRow2 = {};
    Object.keys(config.fields).forEach((field) => {
      const fieldConfig = config.fields[field];
      const fieldLower = field.toLowerCase();

      if (fieldLower === "employee_code") {
        sampleRow2[field] = "EMP002";
      } else if (fieldLower === "full_name") {
        sampleRow2[field] = "Sarah Jane Smith";
      } else if (fieldLower === "first_name") {
        sampleRow2[field] = "Sarah";
      } else if (fieldLower === "last_name") {
        sampleRow2[field] = "Smith";
      } else if (fieldLower === "middle_name") {
        sampleRow2[field] = "Jane";
      } else if (fieldLower === "gender") {
        sampleRow2[field] =
          fieldConfig.enum && fieldConfig.enum.length > 1
            ? fieldConfig.enum[1]
            : "F";
      } else if (fieldLower === "email" || fieldConfig.type === "email") {
        sampleRow2[field] = "sarah.smith@email.com";
      } else if (fieldLower === "official_email") {
        sampleRow2[field] = "sarah.smith@company.com";
      } else if (
        fieldLower === "phone_number" ||
        fieldLower === "office_phone"
      ) {
        sampleRow2[field] = "+255765432109";
      } else if (fieldLower === "marital_status") {
        sampleRow2[field] = "Un-married";
      } else if (fieldLower === "status") {
        sampleRow2[field] = "Active";
      } else if (
        fieldLower.includes("date_of_birth") ||
        fieldLower.includes("birth")
      ) {
        const today = new Date();
        const birthDate = new Date(today);
        birthDate.setFullYear(today.getFullYear() - 28);
        sampleRow2[field] = birthDate.toISOString().split("T")[0];
      } else if (fieldLower.includes("join_date")) {
        const today = new Date();
        const joinDate = new Date(today);
        joinDate.setMonth(today.getMonth() - 12);
        sampleRow2[field] = joinDate.toISOString().split("T")[0];
      } else if (fieldLower.includes("confirm_date")) {
        const today = new Date();
        const confirmDate = new Date(today);
        confirmDate.setMonth(today.getMonth() - 9);
        sampleRow2[field] = confirmDate.toISOString().split("T")[0];
      } else if (fieldLower === "spouse_name") {
        sampleRow2[field] = "";
      } else if (fieldLower === "no_of_child") {
        sampleRow2[field] = 0;
      } else {
        sampleRow2[field] = getSampleValue(field, fieldConfig);
      }
    });

    worksheet.addRow(Object.values(sampleRow2));

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const instructionsRow = worksheet.addRow([]);
    instructionsRow.height = 5;

    worksheet.addRow(["INSTRUCTIONS:"]);
    const instructionHeaderRow = worksheet.getRow(worksheet.rowCount);
    instructionHeaderRow.font = { bold: true, size: 12 };
    instructionHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFE0B2" },
    };

    worksheet.addRow([
      "1. Fill the data starting from row 3 (sample data provided)",
    ]);
    worksheet.addRow(["2. Do not modify column headers in row 1"]);
    worksheet.addRow([
      `3. Required fields: ${config.requiredFields.join(", ")}`,
    ]);
    worksheet.addRow(["4. Date format: YYYY-MM-DD (e.g., 2024-01-15)"]);
    worksheet.addRow(["5. Gender values: M (Male), F (Female), O (Other)"]);
    worksheet.addRow(["6. Status values: Active, Inactive, Terminated"]);
    worksheet.addRow([
      "7. Marital Status: Married, Un-married, Divorced, Widowed",
    ]);
    worksheet.addRow([
      "8. Phone number format: +255XXXXXXXXX (include country code)",
    ]);
    worksheet.addRow(["9. Email must be valid format: user@domain.com"]);
    worksheet.addRow(["10. Employee code must be unique"]);
    worksheet.addRow([
      "11. Department ID, Designation ID, Bank ID, etc. must reference existing records",
    ]);
    worksheet.addRow(["12. Date of birth must be in the past"]);
    worksheet.addRow(["13. Join date should be before confirm date"]);
    worksheet.addRow(["14. Leave optional fields empty if not applicable"]);

    const lastRow = worksheet.getRow(worksheet.rowCount);
    lastRow.font = { italic: true };

    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    throw new Error(`Error generating template: ${error.message}`);
  }
};

const exportDataToExcel = async (tableName, filters = {}) => {
  try {
    const result = await importExportModel.getDataForExport(tableName, filters);
    const config = importExportModel.getTableConfig(tableName);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(config.displayName);

    if (result.data.length === 0) {
      worksheet.addRow(["No data found"]);
      return await workbook.xlsx.writeBuffer();
    }

    // Add headers
    const headers = Object.keys(result.data[0]);
    worksheet.addRow(headers);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2196F3" },
    };

    // Add data rows
    result.data.forEach((record) => {
      const row = headers.map((header) => {
        const value = record[header];
        return value instanceof Date
          ? value.toISOString().split("T")[0]
          : value;
      });
      worksheet.addRow(row);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    throw new Error(`Error exporting to Excel: ${error.message}`);
  }
};

const getAvailableTables = () => {
  return importExportModel.getAvailableTables();
};

module.exports = {
  parseExcelFile,
  importDataFromExcel,
  generateExcelTemplate,
  exportDataToExcel,
  getAvailableTables,
};
