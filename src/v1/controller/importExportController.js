const importExportService = require("../services/importExportService.js");
const CustomError = require("../../utils/CustomError");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/imports");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new CustomError("Only Excel files (.xlsx, .xls) are allowed", 400),
        false
      );
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const getAvailableTables = async (req, res, next) => {
  try {
    console.log(" Fetching available tables...");

    const tables = importExportService.getAvailableTables();

    console.log(" Tables retrieved:", tables.length);

    res.status(200).success("Available tables retrieved successfully", tables);
  } catch (error) {
    console.error(" Error in getAvailableTables:", error);
    next(error);
  }
};

const downloadTemplate = async (req, res, next) => {
  try {
    const { tableName } = req.params;

    if (!tableName) {
      throw new CustomError("Table name is required", 400);
    }

    console.log(` Generating template for: ${tableName}`);
    const buffer = await importExportService.generateExcelTemplate(tableName);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${tableName}_template.xlsx"`
    );
    res.send(buffer);

    console.log(` Template sent: ${tableName}_template.xlsx`);
  } catch (error) {
    console.error(" Template generation error:", error);
    next(error);
  }
};

const previewExcelData = async (req, res, next) => {
  try {
    const { tableName } = req.body;

    if (!tableName) {
      throw new CustomError("Table name is required", 400);
    }

    if (!req.file) {
      throw new CustomError("Excel file is required", 400);
    }

    console.log(` Previewing data for table: ${tableName}`);

    const result = await importExportService.parseExcelFile(
      req.file.path,
      tableName
    );

    // Clean up file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "File contains validation errors",
        errors: result.errors,
        preview: result.data.slice(0, 10),
      });
    }

    res.status(200).success("File preview generated successfully", {
      count: result.count,
      preview: result.data.slice(0, 10),
      isValid: true,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(" Preview error:", error);
    next(error);
  }
};

const importData = async (req, res, next) => {
  try {
    const { tableName } = req.body;

    if (!tableName) {
      throw new CustomError("Table name is required", 400);
    }

    if (!req.file) {
      throw new CustomError("Excel file is required", 400);
    }

    console.log(` Starting import for table: ${tableName}`);

    const result = await importExportService.importDataFromExcel(
      req.file.path,
      tableName,
      req.user?.id || 1
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Import failed due to validation errors",
        errors: result.errors,
        data: result.data,
      });
    }

    res.status(200).success(result.message, {
      imported: result.inserted,
      total: result.total,
      preview: result.preview,
    });

    console.log(`Import completed: ${result.inserted}/${result.total} records`);
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(" Import error:", error);
    next(error);
  }
};

const exportToExcel = async (req, res, next) => {
  try {
    const { tableName } = req.params;
    const filters = req.query;

    if (!tableName) {
      throw new CustomError("Table name is required", 400);
    }

    console.log(` Exporting ${tableName} to Excel with filters:`, filters);

    const buffer = await importExportService.exportDataToExcel(
      tableName,
      filters
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${tableName}_export.xlsx"`
    );
    res.send(buffer);

    console.log(` Export completed: ${tableName}_export.xlsx`);
  } catch (error) {
    console.error(" Export error:", error);
    next(error);
  }
};

module.exports = {
  upload,
  getAvailableTables,
  downloadTemplate,
  previewExcelData,
  importData,
  exportToExcel,
};
