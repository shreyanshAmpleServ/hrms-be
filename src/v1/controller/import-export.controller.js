const {
  ImportExportFactory,
} = require("../services/import-export-factory.service");
const CustomError = require("../../utils/CustomError");

const importExportController = {
  async getSupportedTables(req, res, next) {
    try {
      const tables = ImportExportFactory.getSupportedTables();

      const tableDetails = await Promise.all(
        tables.map(async (table) => {
          const service = ImportExportFactory.getService(table);
          if (service) {
            const count = await service.getCount();
            return {
              name: table,
              displayName: service.displayName,
              count,
              columns: service.columns.length,
            };
          }
          return { name: table, count: 0, columns: 0 };
        }),
      );

      res.json({
        success: true,
        message: "Supported tables retrieved successfully",
        data: {
          tables,
          details: tableDetails,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async downloadTemplate(req, res, next) {
    try {
      const { table } = req.params;
      const { format = "excel" } = req.query;
      const service = ImportExportFactory.getService(table);

      if (!service) {
        return res.status(400).json({
          success: false,
          message: `Table '${table}' is not supported`,
          errors: [{ msg: "Unsupported table", param: "table" }],
        });
      }

      const template = await service.generateTemplate(format);

      if (format === "excel") {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${template.filename}"`,
        );
        res.setHeader("Content-Length", template.data.length.toString());
        res.send(template.data);
      } else {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${template.filename}"`,
        );
        res.send(template.data);
      }
    } catch (error) {
      next(error);
    }
  },

  async importData(req, res, next) {
    try {
      const { table } = req.params;
      const {
        batchSize = 100,
        skipDuplicates = false,
        updateExisting = false,
      } = req.body;

      const service = ImportExportFactory.getService(table);

      if (!service) {
        return res.status(400).json({
          success: false,
          message: `Table '${table}' is not supported`,
          errors: [{ msg: "Unsupported table", param: "table" }],
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
          errors: [{ msg: "File is required", param: "file" }],
        });
      }

      const userId = req.user?.employee_id || 1;
      const result = await service.importFromFile(req.file.path, userId);

      const totalProcessed = result.success + result.failed;

      if (result.success > 0) {
        return res.json({
          success: true,
          message:
            result.failed > 0
              ? `Import completed with partial success: ${result.success} succeeded, ${result.failed} failed`
              : `Import completed successfully: ${result.success} record(s) imported`,
          data: {
            success: result.success,
            failed: result.failed,
            errors: result.errors || [],
            duplicates: result.duplicates || [],
            totalProcessed,
            fileInfo: {
              originalName: req.file.originalname,
              rows: result.total,
            },
          },
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "Import failed: No records were imported",
          data: {
            success: 0,
            failed: result.failed,
            errors: result.errors || [],
            duplicates: result.duplicates || [],
            totalProcessed: result.failed,
            fileInfo: {
              originalName: req.file.originalname,
              rows: result.total,
            },
          },
        });
      }
    } catch (error) {
      next(error);
    }
  },

  async previewImport(req, res, next) {
    try {
      const { table } = req.params;
      const service = ImportExportFactory.getService(table);

      if (!service) {
        return res.status(400).json({
          success: false,
          message: `Table '${table}' is not supported`,
          errors: [{ msg: "Unsupported table", param: "table" }],
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
          errors: [{ msg: "File is required", param: "file" }],
        });
      }

      const data = await service.parseFile(req.file.path);
      const fileInfo = {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };

      res.json({
        success: true,
        message: "File parsed successfully",
        data: {
          success: data.length,
          failed: 0,
          errors: [],
          data: data.slice(0, 10),
          totalProcessed: data.length,
          fileInfo: {
            originalName: req.file.originalname,
            rows: data.length,
          },
          columns: service.columns,
          validCount: data.length,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async exportToExcel(req, res, next) {
    try {
      const { table } = req.params;
      const service = ImportExportFactory.getService(table);

      if (!service) {
        return res.status(400).json({
          success: false,
          message: `Table '${table}' is not supported`,
          errors: [{ msg: "Unsupported table", param: "table" }],
        });
      }

      const {
        search,
        limit,
        page,
        sortField = "id",
        sortOrder = "desc",
        is_active,
        ...filters
      } = req.query;

      const options = {
        filters: search
          ? {
              OR: service.searchFields.map((field) => ({
                [field]: { contains: search },
              })),
            }
          : is_active !== undefined
            ? { is_active: is_active === "true" ? "Y" : "N" }
            : Object.keys(filters).length > 0
              ? filters
              : undefined,
        limit: limit ? parseInt(limit) : undefined,
        orderBy: { [sortField]: sortOrder },
      };

      const buffer = await service.exportToExcel(options);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${table}_export_${new Date().toISOString().split("T")[0]}.xlsx"`,
      );
      res.setHeader("Content-Length", buffer.length.toString());

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },

  async exportToCSV(req, res, next) {
    try {
      const { table } = req.params;
      const service = ImportExportFactory.getService(table);

      if (!service) {
        return res.status(400).json({
          success: false,
          message: `Table '${table}' is not supported`,
          errors: [{ msg: "Unsupported table", param: "table" }],
        });
      }

      const {
        search,
        limit,
        sortField = "id",
        sortOrder = "desc",
        is_active,
        ...filters
      } = req.query;

      const options = {
        filters: search
          ? {
              OR: service.searchFields.map((field) => ({
                [field]: { contains: search },
              })),
            }
          : is_active !== undefined
            ? { is_active: is_active === "true" ? "Y" : "N" }
            : Object.keys(filters).length > 0
              ? filters
              : undefined,
        limit: limit ? parseInt(limit) : undefined,
        orderBy: { [sortField]: sortOrder },
      };

      const csvData = await service.exportToCsv(options);
      const filename = `${table}_export_${new Date().toISOString().split("T")[0]}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.send(csvData);
    } catch (error) {
      next(error);
    }
  },

  async exportToJSON(req, res, next) {
    try {
      const { table } = req.params;
      const service = ImportExportFactory.getService(table);

      if (!service) {
        return res.status(400).json({
          success: false,
          message: `Table '${table}' is not supported`,
          errors: [{ msg: "Unsupported table", param: "table" }],
        });
      }

      const {
        search,
        limit,
        sortField = "id",
        sortOrder = "desc",
        is_active,
        ...filters
      } = req.query;

      const options = {
        filters: search
          ? {
              OR: service.searchFields.map((field) => ({
                [field]: { contains: search },
              })),
            }
          : is_active !== undefined
            ? { is_active: is_active === "true" ? "Y" : "N" }
            : Object.keys(filters).length > 0
              ? filters
              : undefined,
        limit: limit ? parseInt(limit) : undefined,
        orderBy: { [sortField]: sortOrder },
      };

      const jsonData = await service.exportToJson(options);
      const filename = `${table}_export_${new Date().toISOString().split("T")[0]}.json`;

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.send(jsonData);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = { importExportController };
