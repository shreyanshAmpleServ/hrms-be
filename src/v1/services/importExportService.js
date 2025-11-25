const importExportModel = require("../models/importExportModel.js");
const xlsx = require("xlsx");
const ExcelJS = require("exceljs");
const fs = require("fs");

const parseExcelFile = async (filePath, tableName) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return { success: false, errors: ["Excel file is empty"], data: [] };
    }

    const validationErrors = importExportModel.validateData(
      jsonData,
      tableName
    );

    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors, data: jsonData };
    }

    return { success: true, data: jsonData, count: jsonData.length };
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

    const sampleRow = {};
    Object.keys(config.fields).forEach((field) => {
      const fieldConfig = config.fields[field];
      switch (fieldConfig.type) {
        case "string":
          if (field === "employee_code") {
            sampleRow[field] = "EMP001";
          } else if (field === "full_name") {
            sampleRow[field] = "John Doe";
          } else if (field === "first_name") {
            sampleRow[field] = "John";
          } else if (field === "last_name") {
            sampleRow[field] = "Doe";
          } else if (field === "phone_number") {
            sampleRow[field] = "+1234567890";
          } else if (field === "status") {
            sampleRow[field] = "Active";
          } else if (field === "gender") {
            sampleRow[field] = "Male";
          } else {
            sampleRow[field] = `Sample ${field.replace(/_/g, " ")}`;
          }
          break;
        case "number":
          sampleRow[field] = field.includes("id") ? 1 : 123;
          break;
        case "decimal":
          sampleRow[field] = field.includes("salary") ? 50000.0 : 100.5;
          break;
        case "date":
          sampleRow[field] = "2025-01-01";
          break;
        case "email":
          sampleRow[field] =
            field === "official_email"
              ? "john.doe@company.com"
              : "john.doe@email.com";
          break;
        default:
          sampleRow[field] = "Sample";
      }
    });

    worksheet.addRow(Object.values(sampleRow));

    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    worksheet.addRow([]);
    worksheet.addRow(["Instructions:"]);
    worksheet.addRow(["1. Fill the data starting from row 3"]);
    worksheet.addRow(["2. Do not modify column headers"]);
    worksheet.addRow([
      "3. Required fields: " + config.requiredFields.join(", "),
    ]);
    worksheet.addRow(["4. Use phone_number instead of phone"]);
    worksheet.addRow(["5. Date format: YYYY-MM-DD"]);

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
