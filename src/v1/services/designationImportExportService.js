const designationModel = require("../models/designationModel");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const ExcelJS = require("exceljs");

class DesignationImportExportService {
  constructor() {
    this.modelName = "designations";
    this.displayName = "Designations";
    this.uniqueFields = ["designation_name"];
    this.searchFields = ["designation_name"];

    this.columns = [
      {
        key: "designation_name",
        header: "Designation Name",
        width: 30,
        required: true,
        type: "string",
        validation: (value) => {
          if (!value) return "Designation name is required";
          if (value.toString().trim().length < 2)
            return "Designation name must be at least 2 characters";
          if (value.toString().trim().length > 100)
            return "Designation name must not exceed 100 characters";
          return true;
        },
        transform: (value) => value.toString().trim(),
        description: "Name of the designation (required, 2-100 characters)",
      },
      {
        key: "is_active",
        header: "Active Status",
        width: 15,
        type: "string",
        defaultValue: "Active",
        validation: (value) => {
          const validValues = [
            "Active",
            "Inactive",
            "Y",
            "N",
            "true",
            "false",
            "1",
            "0",
          ];
          if (value && !validValues.includes(value.toString())) {
            return "Active status must be one of: Active, Inactive, Y, N, true, false, 1, 0";
          }
          return true;
        },
        transform: (value) => {
          if (!value) return "Active";
          const val = value.toString().toLowerCase();
          if (["y", "true", "1"].includes(val)) return "Active";
          if (["n", "false", "0"].includes(val)) return "Inactive";
          return value.toString();
        },
        description: "Whether the designation is active (defaults to Active)",
      },
    ];
  }

  async getSampleData() {
    return [
      { designation_name: "Software Engineer", is_active: "Active" },
      { designation_name: "Senior Software Engineer", is_active: "Active" },
      { designation_name: "Team Lead", is_active: "Active" },
      { designation_name: "Project Manager", is_active: "Active" },
      { designation_name: "HR Manager", is_active: "Inactive" },
    ];
  }

  getColumnDescription(columnKey) {
    const descriptions = {
      designation_name:
        "Name of the designation (required, 2-100 characters, must be unique)",
      is_active: "Whether the designation is active (defaults to Active)",
    };
    return descriptions[columnKey] || "";
  }

  async transformDataForExport(data) {
    return data.map((designation) => ({
      designation_name: designation.designation_name,
      is_active: designation.is_active === "Y" ? "Active" : "Inactive",
      createdate: designation.createdate
        ? new Date(designation.createdate).toISOString().split("T")[0]
        : "",
      createdby: designation.createdby || "",
      updatedate: designation.updatedate
        ? new Date(designation.updatedate).toISOString().split("T")[0]
        : "",
      updatedby: designation.updatedby || "",
    }));
  }

  async checkDuplicate(data) {
    const existingDesignation = await designationModel.findDesignationByName(
      data.designation_name,
    );
    if (existingDesignation) {
      return `Designation "${data.designation_name}" already exists`;
    }
    return null;
  }

  async transformDataForImport(data, userId) {
    return {
      designation_name: data.designation_name,
      is_active:
        data.is_active === "Active" || data.is_active === "Y" ? "Y" : "N",
      createdby: userId,
      updatedby: userId,
      createdate: new Date(),
      updatedate: new Date(),
      log_inst: 1,
    };
  }

  async prepareDataForImport(data, userId) {
    return await this.transformDataForImport(data, userId);
  }

  async validateForeignKeys(data) {
    return null;
  }

  getModel() {
    return designationModel;
  }

  async generateTemplate(format = "excel") {
    if (format === "csv") {
      const csvData = `# Designation Import Template
# Instructions: Replace sample data with your actual designations
# Designation Name: Required field, must be unique
# Active Status: Enter "Active" or "Inactive"
designation_name,is_active
Software Engineer,Active
Senior Software Engineer,Active
Team Lead,Active`;

      return {
        data: csvData,
        filename: "designation_import_template.csv",
      };
    } else {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${this.displayName} Template`);

      worksheet.columns = this.columns.map((col) => ({
        header: col.header,
        key: col.key,
        width: col.width || 20,
      }));

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 25;

      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      const sampleData = await this.getSampleData();
      sampleData.forEach((data, index) => {
        const row = worksheet.addRow(data);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
        if (index % 2 === 0) {
          row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF2F2F2" },
          };
        }
      });

      const instructionSheet = workbook.addWorksheet("Instructions");
      instructionSheet.columns = [
        { header: "Field", key: "field", width: 25 },
        { header: "Required", key: "required", width: 12 },
        { header: "Type", key: "type", width: 15 },
        { header: "Description", key: "description", width: 60 },
      ];

      const instructionHeader = instructionSheet.getRow(1);
      instructionHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      instructionHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      instructionHeader.height = 25;

      this.columns.forEach((col) => {
        const row = instructionSheet.addRow({
          field: col.header,
          required: col.required ? "Yes" : "No",
          type: col.type || "string",
          description: col.description || this.getColumnDescription(col.key),
        });

        if (col.required) {
          row.getCell("required").font = {
            color: { argb: "FFFF0000" },
            bold: true,
          };
        }
      });

      instructionSheet.addRow([]);
      instructionSheet.addRow(["GENERAL INSTRUCTIONS:", "", "", ""]);
      const instructions = [
        "1. Do not modify the column headers in the template sheet",
        "2. Required fields must be filled for all rows",
        "3. Date format should be YYYY-MM-DD",
        "4. Boolean fields accept: Y/N, Yes/No, True/False, 1/0",
        "5. Remove any empty rows before importing",
        "6. Maximum file size: 10MB",
        "7. Supported formats: .xlsx, .xls, .csv",
      ];

      instructions.forEach((instruction) => {
        const row = instructionSheet.addRow([instruction, "", "", ""]);
        row.getCell(1).font = { italic: true };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return {
        data: Buffer.from(buffer),
        filename: "designation_import_template.xlsx",
      };
    }
  }

  async exportToExcel(options = {}) {
    const query = {
      where: options.filters,
      orderBy: options.orderBy || { id: "desc" },
    };

    if (options.limit) query.take = options.limit;

    const data = await designationModel.getAllDesignationsForExport();
    const exportData = await this.transformDataForExport(data);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Designations");

    worksheet.columns = [
      { header: "Designation Name", key: "designation_name", width: 30 },
      { header: "Active Status", key: "is_active", width: 15 },
      { header: "Created Date", key: "createdate", width: 15 },
      { header: "Created By", key: "createdby", width: 15 },
      { header: "Updated Date", key: "updatedate", width: 15 },
      { header: "Updated By", key: "updatedby", width: 15 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    exportData.forEach((data, index) => {
      const row = worksheet.addRow(data);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
      if (index % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToCsv(options = {}) {
    const data = await designationModel.getAllDesignationsForExport();
    const exportData = await this.transformDataForExport(data);

    const csvWriter = createObjectCsvWriter({
      path: "temp/export.csv",
      header: [
        { id: "designation_name", title: "Designation Name" },
        { id: "is_active", title: "Active Status" },
        { id: "createdate", title: "Created Date" },
        { id: "createdby", title: "Created By" },
        { id: "updatedate", title: "Updated Date" },
        { id: "updatedby", title: "Updated By" },
      ],
      encoding: "utf8",
    });

    return await csvWriter.stringifyRecords(exportData);
  }

  async importFromFile(filePath, userId = 1) {
    const fileExtension = path.extname(filePath).toLowerCase();
    let data = [];

    if (fileExtension === ".csv") {
      data = await this.parseCsvFile(filePath);
    } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      data = await this.parseExcelFile(filePath);
    } else {
      throw new Error(
        "Unsupported file format. Only CSV and Excel files are supported.",
      );
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [],
      duplicates: [],
    };

    for (const item of data) {
      try {
        const validatedData = await this.validateAndTransformData(item);

        const duplicateError = await this.checkDuplicate(validatedData);
        if (duplicateError) {
          results.duplicates.push({
            data: item,
            error: duplicateError,
          });
          results.failed++;
          continue;
        }

        const foreignKeyError = await this.validateForeignKeys([validatedData]);
        if (foreignKeyError) {
          results.errors.push({
            data: item,
            error: foreignKeyError,
          });
          results.failed++;
          continue;
        }

        const importData = await this.prepareDataForImport(
          validatedData,
          userId,
        );

        await designationModel.createDesignation(importData);
        results.success++;
      } catch (error) {
        results.errors.push({
          data: item,
          error: error.message,
        });
        results.failed++;
      }
    }

    return results;
  }

  async validateAndTransformData(data) {
    const transformed = {};

    for (const column of this.columns) {
      let value = data[column.header] || data[column.key];

      if (value === undefined || value === null) {
        value = column.defaultValue;
      }

      if (column.transform && value !== undefined && value !== null) {
        value = column.transform(value);
      }

      if (
        column.required &&
        (value === undefined || value === null || value === "")
      ) {
        throw new Error(`${column.header} is required`);
      }

      if (column.validation && value !== undefined && value !== null) {
        const validationResult = column.validation(value);
        if (validationResult !== true) {
          throw new Error(`${column.header}: ${validationResult}`);
        }
      }

      transformed[column.key] = value;
    }

    return transformed;
  }

  async parseCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", reject);
    });
  }

  async parseExcelFile(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const data = [];

    const headers = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value?.toString() || "";
        });
      } else {
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = cell.value;
          }
        });
        data.push(rowData);
      }
    });

    return data;
  }

  async parseFile(filePath) {
    const fileExtension = path.extname(filePath).toLowerCase();

    if (fileExtension === ".csv") {
      return await this.parseCsvFile(filePath);
    } else if (fileExtension === ".xlsx" || fileExtension === ".xls") {
      return await this.parseExcelFile(filePath);
    } else {
      throw new Error(
        "Unsupported file format. Only CSV and Excel files are supported.",
      );
    }
  }

  async getCount() {
    const data = await designationModel.getAllDesignationsForExport();
    return data.length;
  }
}

module.exports = { DesignationImportExportService };
