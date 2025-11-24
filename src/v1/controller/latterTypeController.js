const latterTypeService = require("../services/latterTypeService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { uploadToBackblaze } = require("../../utils/uploadBackblaze");
const { asyncLocalStorage } = require("../../utils/prismaProxy");

// Helper to ensure tenant context
const withTenantContext = (handler) => {
  return async (req, res, next) => {
    const tenantDb = req.tenantDb;

    if (!tenantDb) {
      return next(new CustomError("No tenant database specified", 400));
    }

    return asyncLocalStorage.run({ tenantDb }, async () => {
      try {
        await handler(req, res, next);
      } catch (error) {
        next(error);
      }
    });
  };
};

const createLatterType = withTenantContext(async (req, res, next) => {
  try {
    console.log("📝 Incoming request body:", req.body);
    console.log("📎 File:", req.file ? "Yes" : "No");

    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    // ✅ Use buffer directly (memory storage)
    const fileBuffer = req.file.buffer;

    // Upload to Backblaze
    const fileUrl = await uploadToBackblaze(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      "template_path"
    );

    const latterTypeData = {
      letter_name: req.body.letter_name,
      template_path: fileUrl,
      createdby: req.user?.userId || req.user?.id || 1,
      log_inst: req.user?.log_inst || 1,
    };

    const latter = await latterTypeService.createLatterType(latterTypeData);

    res.status(201).json({
      success: true,
      data: latter,
      message: "Letter type created successfully",
      status: 201,
    });
  } catch (error) {
    console.error("❌ Create error:", error);
    next(error);
  }
});

const findLatterTypeById = withTenantContext(async (req, res, next) => {
  try {
    const data = await latterTypeService.findLatterTypeById(req.params.id);

    if (!data) {
      throw new CustomError("Letter type not found", 404);
    }

    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

const updateLatterType = withTenantContext(async (req, res, next) => {
  try {
    console.log("📝 Update request body:", req.body);
    console.log("📎 File:", req.file ? "Yes" : "No");

    const existingLatterType = await latterTypeService.findLatterTypeById(
      req.params.id
    );

    if (!existingLatterType) {
      throw new CustomError("Letter type not found", 404);
    }

    // Keep existing file URL
    let fileUrl = existingLatterType.template_path;

    // Upload new file if provided
    if (req.file) {
      try {
        // ✅ Use buffer directly (memory storage)
        const fileBuffer = req.file.buffer;

        fileUrl = await uploadToBackblaze(
          fileBuffer,
          req.file.originalname,
          req.file.mimetype,
          "template_path"
        );

        console.log("✅ File uploaded to Backblaze:", fileUrl);
      } catch (uploadError) {
        console.error("❌ Upload error:", uploadError);
        throw new CustomError(
          `File upload failed: ${uploadError.message}`,
          500
        );
      }
    }

    const latterTypeData = {
      letter_name: req.body.letter_name,
      is_active: req.body.is_active,
      template_path: fileUrl,
      updatedby: req.user?.userId || req.user?.id || 1,
    };

    const latter = await latterTypeService.updateLatterType(
      req.params.id,
      latterTypeData
    );

    res.status(200).json({
      success: true,
      data: latter,
      message: "Letter type updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("❌ Update error:", error);
    next(error);
  }
});

const deleteLatterType = withTenantContext(async (req, res, next) => {
  try {
    await latterTypeService.deleteLatterType(req.params.id);

    res.status(200).json({
      success: true,
      message: "Letter type deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

const getAllLatterType = withTenantContext(async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;

    const data = await latterTypeService.getAllLatterType(
      Number(page) || 1,
      Number(size) || 10,
      search,
      startDate ? moment(startDate).toDate() : undefined,
      endDate ? moment(endDate).toDate() : undefined,
      is_active
    );

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  createLatterType,
  findLatterTypeById,
  updateLatterType,
  deleteLatterType,
  getAllLatterType,
};
