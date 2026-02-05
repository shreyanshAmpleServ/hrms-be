const departmentModel = require("../models/departmentModel");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { createObjectCsvWriter } = require("csv-writer");
const ExcelJS = require("exceljs");

class DepartmentImportExportService {
  constructor() {
    this.modelName = "departments";
    this.displayName = "Departments";
    this.uniqueFields = ["department_name"];
    this.searchFields = ["department_name"];

    this.columns = [
      {
        key: "department_name",
        header: "Department Name",
        width: 30,
        required: true,
        type: "string",
        validation: (value) => {
          if (!value) return "Department name is required";
          if (value.toString().trim().length < 2)
            return "Department name must be at least 2 characters";
          if (value.toString().trim().length > 100)
            return "Department name must not exceed 100 characters";
          return true;
        },
        transform: (value) => value.toString().trim(),
        description: "Name of the department (required, 2-100 characters)",
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
          const stringValue = value ? value.toString().toLowerCase() : "active";
          return (
            validValues.some((v) => v.toLowerCase() === stringValue) ||
            "Must be Active/Inactive, Y/N, true/false, or 1/0"
          );
        },
        transform: (value) => {
          if (!value) return "Active";
          const stringValue = value.toString().toLowerCase();
          if (["y", "true", "1"].includes(stringValue)) return "Active";
          if (["n", "false", "0"].includes(stringValue)) return "Inactive";
          return ["active", "inactive"].includes(stringValue)
            ? stringValue.charAt(0).toUpperCase() + stringValue.slice(1)
            : "Active";
        },
        description:
          "Active status - Active, Inactive, Y, N, true, false, 1, or 0 (defaults to Active)",
      },
    ];
  }

  async getSampleData() {
    return [
      {
        department_name: "Engineering",
        is_active: "Active",
      },
      {
        department_name: "Marketing",
        is_active: "Active",
      },
      {
        department_name: "Human Resources",
        is_active: "Active",
      },
      {
        department_name: "Finance",
        is_active: "Active",
      },
      {
        department_name: "Operations",
        is_active: "Inactive",
      },
    ];
  }

  getColumnDescription() {
    return `
# Departments Import Template

## Required Fields:
- **Department Name**: Name of the department (2-100 characters, must be unique)

## Optional Fields:
- **Active Status**: Whether the department is active (defaults to Active)

## Accepted Values for Active Status:
- Active, Inactive
- Y, N
- true, false
- 1, 0

## Notes:
- Department names must be unique across the system.
- Active departments are available for use throughout the system.
- Inactive departments are hidden but preserved for historical data.
- Department names are automatically trimmed of whitespace.
    `;
  }

  async transformDataForExport(data) {
    return data.map((dept) => ({
      department_name: dept.department_name,
      is_active: dept.is_active === "Y" ? "Active" : "Inactive",
      createdate: dept.createdate
        ? new Date(dept.createdate).toISOString().split("T")[0]
        : "",
      createdby: dept.createdby || "",
      updatedate: dept.updatedate
        ? new Date(dept.updatedate).toISOString().split("T")[0]
        : "",
      updatedby: dept.updatedby || "",
    }));
  }

  async checkDuplicate(data) {
    const existingDept = await departmentModel.findDepartmentByName(
      data.department_name,
    );
    if (existingDept) {
      return `Department "${data.department_name}" already exists`;
    }
    return null;
  }

  async transformDataForImport(data, userId) {
    return {
      department_name: data.department_name,
      is_active:
        data.is_active === "Active" || data.is_active === "Y" ? "Y" : "N",
      createdby: userId,
      log_inst: 1,
      createdate: new Date(),
      updatedate: new Date(),
      updatedby: userId,
    };
  }

  async validateForeignKeys(data) {
    return null;
  }

  async prepareDataForImport(data, userId) {
    return this.transformDataForImport(data, userId);
  }

  async updateExisting(data, userId) {
    const existing = await departmentModel.findDepartmentByName(
      data.department_name,
    );
    if (!existing) return null;

    const updateData = {
      ...data,
      updatedby: userId,
      updatedate: new Date(),
    };

    return await departmentModel.updateDepartment(existing.id, updateData);
  }

  getModel() {
    return departmentModel;
  }

  async generateTemplate(format = "excel") {
    if (format === "csv") {
      const csvData = `# Department Import Template
# Instructions: Replace sample data with your actual departments
# Department Name: Required field, must be unique
# Active Status: Enter "Active" or "Inactive"
department_name,is_active
Engineering,Active
Marketing,Active
Human Resources,Active`;

      return {
        data: csvData,
        filename: "department_import_template.csv",
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
        filename: "department_import_template.xlsx",
      };
    }
  }

  async exportToExcel(options = {}) {
    const query = {
      where: options.filters,
      orderBy: options.orderBy || { id: "desc" },
    };

    if (options.limit) query.take = options.limit;

    const data = await departmentModel.getAllDepartmentsForExport(
      options.filters?.is_active,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(this.displayName);

    const exportColumns = [
      ...this.columns,
      { header: "Created Date", key: "createdate", width: 20 },
      { header: "Created By", key: "createdby", width: 15 },
      { header: "Updated Date", key: "updatedate", width: 20 },
      { header: "Updated By", key: "updatedby", width: 15 },
    ];

    worksheet.columns = exportColumns.map((col) => ({
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

    const exportData = await this.transformDataForExport(data);
    exportData.forEach((row, index) => {
      const excelRow = worksheet.addRow(row);

      if (index % 2 === 0) {
        excelRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF2F2F2" },
        };
      }

      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
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
    const data = await departmentModel.getAllDepartmentsForExport(
      options.filters?.is_active,
    );
    const exportData = await this.transformDataForExport(data);

    const csvWriter = createObjectCsvWriter({
      header: [
        ...this.columns.map((col) => ({ id: col.key, title: col.header })),
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

        await departmentModel.createDepartment(importData);
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
    const results = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", (error) => reject(error));
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
    const data = await departmentModel.getAllDepartmentsForExport();
    return data.length;
  }
}

module.exports = { DepartmentImportExportService };
