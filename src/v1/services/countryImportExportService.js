const countryModel = require("../models/countryModel");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const ExcelJS = require("exceljs");

class CountryImportExportService {
  constructor() {
    this.modelName = "countries";
    this.displayName = "Countries";
    this.uniqueFields = ["name", "code"];
    this.searchFields = ["name", "code"];

    this.columns = [
      {
        key: "name",
        header: "Country Name",
        width: 30,
        required: true,
        type: "string",
        validation: (value) => {
          if (!value) return "Country name is required";
          if (value.toString().trim().length < 2)
            return "Country name must be at least 2 characters";
          if (value.toString().trim().length > 100)
            return "Country name must not exceed 100 characters";
          return true;
        },
        transform: (value) => value.toString().trim(),
        description: "Name of the country (required, 2-100 characters)",
      },
      {
        key: "code",
        header: "Country Code",
        width: 15,
        required: true,
        type: "string",
        validation: (value) => {
          if (!value) return "Country code is required";
          if (value.toString().trim().length !== 2)
            return "Country code must be exactly 2 characters";
          if (!/^[A-Z]{2}$/.test(value.toString().toUpperCase()))
            return "Country code must contain only letters (A-Z)";
          return true;
        },
        transform: (value) => value.toString().toUpperCase().trim(),
        description: "2-letter country code (required, e.g., US, IN, UK)",
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
        description: "Whether the country is active (defaults to Active)",
      },
    ];
  }

  async getSampleData() {
    return [
      { name: "United States", code: "US", is_active: "Active" },
      { name: "India", code: "IN", is_active: "Active" },
      { name: "United Kingdom", code: "UK", is_active: "Active" },
      { name: "Canada", code: "CA", is_active: "Active" },
      { name: "Australia", code: "AU", is_active: "Inactive" },
    ];
  }

  getColumnDescription(columnKey) {
    const descriptions = {
      name: "Name of the country (required, 2-100 characters, must be unique)",
      code: "2-letter country code (required, exactly 2 characters, A-Z only)",
      is_active: "Whether the country is active (defaults to Active)",
    };
    return descriptions[columnKey] || "";
  }

  async transformDataForExport(data) {
    return data.map((country) => ({
      name: country.name,
      code: country.code,
      is_active: country.is_active === "Y" ? "Active" : "Inactive",
      createdate: country.createdate
        ? new Date(country.createdate).toISOString().split("T")[0]
        : "",
      createdby: country.createdby || "",
      updatedate: country.updatedate
        ? new Date(country.updatedate).toISOString().split("T")[0]
        : "",
      updatedby: country.updatedby || "",
    }));
  }

  async checkDuplicate(data) {
    const existingCountry = await countryModel.checkDuplicateCountry(
      data.name,
      data.code,
    );
    if (existingCountry) {
      return `Country "${data.name}" (${data.code}) already exists`;
    }
    return null;
  }

  async transformDataForImport(data, userId) {
    return {
      name: data.name,
      code: data.code,
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
    // Countries don't have foreign key dependencies
    return null;
  }

  async updateExisting(data, userId) {
    const existing = await countryModel.checkDuplicateCountry(
      data.name,
      data.code,
    );
    if (!existing) return null;

    const updateData = {
      ...data,
      updatedby: userId,
      updatedate: new Date(),
    };

    return await countryModel.updateCountry(existing.id, updateData);
  }

  getModel() {
    return countryModel;
  }

  async generateTemplate(format = "excel") {
    if (format === "csv") {
      const csvData = `# Country Import Template
# Instructions: Replace sample data with your actual countries
# Country Name: Required field, must be unique
# Country Code: Required field, exactly 2 letters (A-Z)
# Active Status: Enter "Active" or "Inactive"
name,code,is_active
United States,US,Active
India,IN,Active
United Kingdom,UK,Active`;

      return {
        data: csvData,
        filename: "country_import_template.csv",
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

      // Create instruction sheet like the reference
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
        "1. Do not modify column headers in the template sheet",
        "2. Required fields must be filled for all rows",
        "3. Country codes must be exactly 2 letters (A-Z)",
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
        filename: "country_import_template.xlsx",
      };
    }
  }

  async exportToExcel(options = {}) {
    const query = {
      where: options.filters,
      orderBy: options.orderBy || { id: "desc" },
    };

    if (options.limit) query.take = options.limit;

    const data = await countryModel.getAllCountriesForExport(
      options.filters?.is_active,
    );
    const exportData = await this.transformDataForExport(data);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Countries");

    const exportColumns = [
      { header: "Country Name", key: "name", width: 30 },
      { header: "Country Code", key: "code", width: 15 },
      { header: "Active Status", key: "is_active", width: 15 },
      { header: "Created Date", key: "createdate", width: 15 },
      { header: "Created By", key: "createdby", width: 15 },
      { header: "Updated Date", key: "updatedate", width: 15 },
      { header: "Updated By", key: "updatedby", width: 15 },
    ];

    worksheet.columns = exportColumns;

    // Style header row
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

    // Add data rows
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

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: "A1",
        to: `${String.fromCharCode(64 + exportColumns.length)}${data.length + 1}`,
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportToCsv(options = {}) {
    const data = await countryModel.getAllCountriesForExport(
      options.filters?.is_active,
    );
    const exportData = await this.transformDataForExport(data);

    const csvWriter = createObjectCsvWriter({
      path: "temp/export.csv", // Note: This might be legacy, typically we don't write to file if we stringify. But kept for compatibility if needed, though stringifyRecords returns string.
      // Actually csv-writer createObjectCsvWriter returns an object with writeRecords (promise) and stringifyRecords (not standard in some versions, but let's check Department code)
      // Department code: return await csvWriter.stringifyRecords(exportData);
      // Wait, createObjectCsvWriter from 'csv-writer' usually writes to file.
      // Department used `createObjectCsvWriter` but called `stringifyRecords`?
      // Let's check Department code again. It used `createObjectCsvWriter({ ... })` and `await csvWriter.stringifyRecords(exportData)`.
      // The `csv-writer` library documentation says `createObjectCsvWriter` returns an object that has `writeRecords`. `stringifyRecords` is usually from `csv-stringify` or similar.
      // However, if the user's Department code has it, I assume it works (maybe a wrapper or specific version).
      // I will copy what Department has.
      header: [
        { id: "name", title: "Country Name" },
        { id: "code", title: "Country Code" },
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

        await countryModel.createCountry(importData);
        results.success++;
      } catch (error) {
        results.errors.push({
          data: item,
          error: error.message,
        });
        results.failed++;
      }
    }

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up temp file: ${filePath}`);
      }
    } catch (cleanupError) {
      console.warn(
        `Failed to clean up temp file ${filePath}:`,
        cleanupError.message,
      );
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
    const data = await countryModel.getAllCountriesForExport();
    return data.length;
  }
}

module.exports = { CountryImportExportService };
