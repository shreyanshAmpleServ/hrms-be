const announcementService = require("../services/announcementService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");
const { withTenantContextFromRequest } = require("../../utils/prismaProxy");

const createAnnouncement = async (req, res, next) => {
  try {
    // console.log(" Reque//st body:", req.body);

    if (!req.files) {
      console.log(" No files found in request");
    } else {
      console.log(" Files received:", Object.keys(req.files));
    }

    let announcementImageUrl = null;

    if (req.files?.announcement_image?.[0]) {
      const file = req.files.announcement_image[0];
      console.log(" Found announcement image:", {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      try {
        console.log("⬆ Uploading image to Backblaze...");
        announcementImageUrl = await uploadToBackblaze(
          file.buffer,
          file.originalname,
          file.mimetype,
          "announcement_images"
        );
        console.log("Image uploaded successfully:", announcementImageUrl);
      } catch (uploadError) {
        console.error(" Failed to upload image:", uploadError);
        throw new CustomError("Failed to upload announcement image", 500);
      }
    } else {
      console.log("ℹ No announcement image provided in request");
    }

    const data = {
      ...req.body,
      image_url: announcementImageUrl || req.body.image_url || null,
      createdby: req.user?.id || null,
      log_inst: req.user?.log_inst || null,
    };

    console.log(" Final data to save:", data);

    const reqData = await announcementService.createAnnouncement(data);

    console.log("Announcement created successfully:", reqData);

    res.status(201).success("Announcement processed successfully", reqData);
  } catch (error) {
    console.error(" Error in createAnnouncement:", error);
    next(error);
  }
};

const findAnnouncement = async (req, res, next) => {
  try {
    const reqData = await announcementService.findAnnouncementById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Announcement not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const existingAnnouncement = await announcementService.findAnnouncementById(
      req.params.id
    );
    let announcementImageUrl = existingAnnouncement.image_url;

    if (req.files?.announcement_image?.[0]) {
      const file = req.files.announcement_image[0];
      console.log(" Updating announcement image:", file.originalname);

      try {
        announcementImageUrl = await uploadToBackblaze(
          file.buffer,
          file.originalname,
          file.mimetype,
          "announcement_images"
        );
        console.log("New image uploaded successfully:", announcementImageUrl);

        if (
          existingAnnouncement.image_url &&
          existingAnnouncement.image_url !== announcementImageUrl &&
          existingAnnouncement.image_url.includes("backblazeb2.com")
        ) {
          try {
            const oldImagePath = extractBackblazeFilePath(
              existingAnnouncement.image_url,
              "announcement_images"
            );
            if (oldImagePath) {
              await deleteFromBackblaze(oldImagePath);
              console.log(" Old image deleted successfully:", oldImagePath);
            }
          } catch (deleteError) {
            console.warn(" Failed to delete old image:", deleteError.message);
          }
        }
      } catch (uploadError) {
        console.error("Failed to upload new image:", uploadError.message);
        throw new CustomError("Failed to upload announcement image", 500);
      }
    }

    const data = {
      ...req.body,
      image_url: announcementImageUrl,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await announcementService.updateAnnouncement(
      req.params.id,
      data
    );
    res.status(200).success("Announcement updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const existingAnnouncement = await announcementService.findAnnouncementById(
      req.params.id
    );

    await announcementService.deleteAnnouncement(req.params.id);

    if (
      existingAnnouncement.image_url &&
      existingAnnouncement.image_url.includes("backblazeb2.com")
    ) {
      try {
        const imagePath = extractBackblazeFilePath(
          existingAnnouncement.image_url,
          "announcement_images"
        );
        if (imagePath) {
          await deleteFromBackblaze(imagePath);
          console.log(" Announcement image deleted successfully:", imagePath);
        }
      } catch (deleteError) {
        console.warn(
          " Failed to delete announcement image:",
          deleteError.message
        );
      }
    }

    res.status(200).success("Announcement deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllAnnouncement = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await announcementService.getAllAnnouncement(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const processAnnouncementNow = async (req, res, next) => {
  try {
    const result = await announcementService.processAnnouncementDisplay(
      req.params.id
    );
    res.status(200).success("Announcement displayed successfully", result);
  } catch (error) {
    next(error);
  }
};

// const getMyAnnouncement = async (req, res, next) => {
//   try {
//     const data = await announcementService.getEmployeeAnnouncement(
//       req.user.employee_id
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

// const getMyAnnouncements = async (req, res, next) => {
//   try {
//     const { page, size } = req.query;
//     const data = await announcementService.getEmployeeAnnouncements(
//       req.user.id,
//       Number(page) || 1,
//       Number(size) || 10
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

const getMyAnnouncement = async (req, res, next) => {
  try {
    const employeeId = req.user.employee_id;
    const result = await announcementService.getEmployeeAnnouncement(
      employeeId
    );
    res.json({
      success: true,
      data: Array.isArray(result?.data) ? result.data : [],
      message: "Success",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      message: error.message,
      status: 500,
    });
  }
};

const getMyAnnouncements = async (req, res, next) => {
  try {
    const { page, size } = req.query;
    console.log(
      ` Employee ${req.user.id} requesting paginated today's announcements`
    );

    const data = await announcementService.getEmployeeAnnouncements(
      req.user.id,
      Number(page) || 1,
      Number(size) || 10
    );

    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const getScheduledJobsStatus = async (req, res, next) => {
  try {
    const data = announcementService.getScheduledJobsStatus();
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const extractBackblazeFilePath = (url, folderName) => {
  if (!url || !url.includes("backblazeb2.com")) {
    return null;
  }

  try {
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1];

    return `${folderName}/${filename}`;
  } catch (error) {
    console.error("Error extracting Backblaze file path:", error);
    return null;
  }
};

const getPublicAnnouncements = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;

    const data = await withTenantContextFromRequest(req, async () => {
      return await announcementService.getPublicAnnouncements(
        search,
        Number(page) || 1,
        Number(size) || 10,
        startDate && moment(startDate),
        endDate && moment(endDate)
      );
    });

    res.status(200).json({
      success: true,
      data,
      message: "Public announcements fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getPublicAnnouncementById = async (req, res, next) => {
  try {
    const reqData = await withTenantContextFromRequest(req, async () => {
      return await announcementService.getPublicAnnouncementById(req.params.id);
    });

    if (!reqData) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reqData,
      message: "Announcement fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  findAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncement,
  processAnnouncementNow,
  getMyAnnouncement,
  getMyAnnouncements,
  getScheduledJobsStatus,
  getPublicAnnouncements,
  getPublicAnnouncementById,
};
