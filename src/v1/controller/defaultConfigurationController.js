const defaultConfigurationService = require("../services/defaultConfigurationService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const fs = require("fs");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");
const { url } = require("inspector");
const createDefaultConfiguration = async (req, res, next) => {
  try {
    let companyLogo = null;
    let companySignature = null;

    console.log(
      "company_logo file buffer",
      req.files?.company_logo?.[0]?.buffer
    );
    if (req.files?.company_logo) {
      const file = req.files.company_logo[0];
      const buffer = file.buffer;
      companyLogo = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_logo"
      );
    }

    if (req.files?.company_signature) {
      const file = req.files.company_signature[0];
      const buffer = file.buffer;
      companySignature = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_signature"
      );
    }
    console.log("company url", companyLogo, companySignature);
    const data = {
      ...req.body,
      createdby: req.user.id,
      company_logo: companyLogo,
      company_signature: companySignature,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await defaultConfigurationService.createDefaultConfiguration(data);
    res
      .status(201)
      .success("Default Configuration created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findDefaultConfiguration = async (req, res, next) => {
  try {
    const reqData = await defaultConfigurationService.findDefaultConfiguration(
      req.params.id
    );
    if (!reqData) throw new CustomError("Default Configuration not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateDefaultConfiguration = async (req, res, next) => {
  try {
    const existingData =
      await defaultConfigurationService.findDefaultConfiguration(req.params.id);

    let companyLogoUrl = existingData.company_logo;
    let companySignatureUrl = existingData.company_signature;
    if (req.files?.company_logo) {
      const file = req.files.company_logo[0];
      const buffer = file.buffer;
      companyLogoUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_logo"
      );
      if (existingData.company_logo) {
        await deleteFromBackblaze(existingData.company_logo);
      }
    }
    if (req.files?.company_signature) {
      const file = req.files.company_signature[0];
      const buffer = file.buffer;
      companySignatureUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_signature"
      );
      if (existingData.company_signature) {
        await deleteFromBackblaze(existingData.company_signature);
      }
    }
    const data = {
      ...req.body,
      employee_id: Number(req.body.employee_id),
      company_logo: companyLogoUrl,
      company_signature: companySignatureUrl,
      updatedby: Number(req.user.employee_id),
      log_inst: req.user.log_inst || Number(req.user.employee_id),
    };
    console.log("data ; ", req.params);
    const updated =
      await defaultConfigurationService.updateDefaultConfiguration(
        req.params.id,
        data
      );

    res
      .status(200)
      .success("Default Configuration updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

const deleteDefaultConfiguration = async (req, res, next) => {
  try {
    const reqData =
      await defaultConfigurationService.deleteDefaultConfiguration(
        req.params.id
      );
    res
      .status(200)
      .success("Default Configuration deleted successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllDefaultConfiguration = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await defaultConfigurationService.getAllDefaultConfiguration(
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

const createOrUpdateDefaultConfiguration = async (req, res, next) => {
  try {
    const id = req.body.id;
    const isUpdate = id && !isNaN(Number(id));
    let existingData = null;

    // Utility to extract file name from URL (only path part, not full URL)
    const extractFileNameFromUrl = (url) => {
      if (!url) return null;
      try {
        // Handle Backblaze URLs (or similar structures)
        if (url.includes("/file/")) {
          const parsed = new URL(url);
          return decodeURIComponent(
            parsed.pathname.replace(/^\/file\/[^/]+\//, "")
          );
        } else if (
          url.includes("company_logo/") ||
          url.includes("company_signature/")
        ) {
          // If the URL is in the expected format: "company_logo/filename.ext"
          const parts = url.split("/");
          return parts[parts.length - 1];
        } else {
          // For other URL structures
          const parsed = new URL(url);
          const pathParts = parsed.pathname.split("/");
          return pathParts[pathParts.length - 1];
        }
      } catch (error) {
        console.warn(
          `Failed to extract filename from URL: ${url}`,
          error.message
        );
        return null;
      }
    };

    // Helper function to safely delete files from Backblaze
    const safeDeleteFromBackblaze = async (fileUrl, fileType) => {
      if (!fileUrl) return;

      try {
        const fileName = extractFileNameFromUrl(fileUrl);
        if (!fileName) {
          console.warn(`Could not extract filename from URL: ${fileUrl}`);
          return;
        }

        // Construct the file path that Backblaze expects (company_logo/filename or company_signature/filename)
        const filePath = fileName.includes("company_logo")
          ? `company_logo/${fileName}`
          : `company_signature/${fileName}`;

        console.log(`Attempting to delete ${fileType}: ${filePath}`);
        await deleteFromBackblaze(filePath); // Use the correct file path for deletion
        console.log(`Successfully deleted ${fileType}: ${filePath}`);
      } catch (error) {
        // Log the error but don't throw - file might already be deleted
        console.warn(`Failed to delete old ${fileType}:`, error.message);
        console.warn(`File URL: ${fileUrl}`);
        console.warn(`Error details:`, error);
      }
    };

    // Get existing data if updating
    if (isUpdate) {
      existingData = await defaultConfigurationService.findDefaultConfiguration(
        id
      );
      if (!existingData) {
        return res.status(404).error("Configuration not found");
      }
    }

    let companyLogoUrl = existingData?.company_logo || null;
    let companySignatureUrl = existingData?.company_signature || null;

    // Handle company logo upload
    if (req.files?.company_logo?.[0]) {
      const file = req.files.company_logo[0];

      try {
        // Upload the new file first
        companyLogoUrl = await uploadToBackblaze(
          file.buffer,
          file.originalname,
          file.mimetype,
          "company_logo"
        );
        console.log(`New company logo uploaded: ${companyLogoUrl}`);

        // Only delete old file after successful upload
        if (
          isUpdate &&
          existingData?.company_logo &&
          existingData.company_logo !== companyLogoUrl
        ) {
          await safeDeleteFromBackblaze(
            existingData.company_logo,
            "company logo"
          );
        }
      } catch (error) {
        console.error("Failed to upload company logo:", error.message);
        throw new Error("Failed to upload company logo");
      }
    }

    // Handle company signature upload
    if (req.files?.company_signature?.[0]) {
      const file = req.files.company_signature[0];

      try {
        // Upload the new file first
        companySignatureUrl = await uploadToBackblaze(
          file.buffer,
          file.originalname,
          file.mimetype,
          "company_signature"
        );
        console.log(`New company signature uploaded: ${companySignatureUrl}`);

        // Only delete old file after successful upload
        if (
          isUpdate &&
          existingData?.company_signature &&
          existingData.company_signature !== companySignatureUrl
        ) {
          await safeDeleteFromBackblaze(
            existingData.company_signature,
            "company signature"
          );
        }
      } catch (error) {
        console.error("Failed to upload company signature:", error.message);
        throw new Error("Failed to upload company signature");
      }
    }

    // Prepare data for database
    const data = {
      ...req.body,
      id: isUpdate ? Number(id) : undefined,
      employee_id: Number(req.body.employee_id),
      company_logo: companyLogoUrl,
      company_signature: companySignatureUrl,
      updatedby: Number(req.user.employee_id),
      createdby: Number(req.user.employee_id),
      log_inst: req.user.log_inst || Number(req.user.employee_id),
    };

    // Save to database
    const result =
      await defaultConfigurationService.updateDefaultConfigurationService(
        id,
        data
      );

    res.status(200).success("Default Configuration saved successfully", result);
  } catch (err) {
    console.error("Error in createOrUpdateDefaultConfiguration:", err);
    next(err);
  }
};

// const createOrUpdateDefaultConfiguration = async (req, res, next) => {
//   try {
//     const id = req.body.id;
//     const isUpdate = id && !isNaN(Number(id));
//     let existingData = null;

//     // Utility to extract file name from URL (only path part, not full URL)
//     const extractFileNameFromUrl = (url) => {
//       if (!url) return null;

//       try {
//         console.log(`Extracting filename from URL: ${url}`);

//         // For Backblaze URLs, the file path starts after 'company_logo/' or 'company_signature/'
//         if (
//           url.includes("company_logo/") ||
//           url.includes("company_signature/")
//         ) {
//           const parts = url.split("/"); // Split URL into parts by "/"
//           return parts[parts.length - 1]; // Return the last part, which is the filename
//         } else {
//           const parsed = new URL(url);
//           const pathParts = parsed.pathname.split("/");
//           return pathParts[pathParts.length - 1]; // Return the last part after splitting the path
//         }
//       } catch (error) {
//         console.warn(
//           `Failed to extract filename from URL: ${url}`,
//           error.message
//         );
//         return null;
//       }
//     };

//     // Helper function to safely delete files from Backblaze
//     const safeDeleteFromBackblaze = async (fileUrl, fileType) => {
//       if (!fileUrl) return;

//       try {
//         const fileName = extractFileNameFromUrl(fileUrl);
//         if (!fileName) {
//           console.warn(`Could not extract filename from URL: ${fileUrl}`);
//           return;
//         }

//         // Dynamically determine the folder based on file type
//         let filePath = "";
//         if (fileType === "company logo") {
//           filePath = `company_logo/${fileName}`;
//         } else if (fileType === "company signature") {
//           filePath = `company_signature/${fileName}`;
//         } else {
//           console.warn(`Invalid file type provided: ${fileType}`);
//           return;
//         }

//         console.log(`Attempting to delete ${fileType}: ${filePath}`);
//         await deleteFromBackblaze(filePath); // Use the correct file path for deletion
//         console.log(`Successfully deleted ${fileType}: ${filePath}`);
//       } catch (error) {
//         // Log the error but don't throw - file might already be deleted
//         console.warn(`Failed to delete old ${fileType}:`, error.message);
//         console.warn(`File URL: ${fileUrl}`);
//         console.warn(`Error details:`, error);
//       }
//     };

//     // Get existing data if updating
//     if (isUpdate) {
//       existingData = await defaultConfigurationService.findDefaultConfiguration(
//         id
//       );
//       if (!existingData) {
//         return res.status(404).error("Configuration not found");
//       }
//     }

//     let companyLogoUrl = existingData?.company_logo || null;
//     let companySignatureUrl = existingData?.company_signature || null;

//     // Handle company logo upload
//     if (req.files?.company_logo?.[0]) {
//       const file = req.files.company_logo[0];

//       try {
//         // Upload the new file first
//         companyLogoUrl = await uploadToBackblaze(
//           file.buffer,
//           file.originalname,
//           file.mimetype,
//           "company_logo"
//         );
//         console.log(`New company logo uploaded: ${companyLogoUrl}`);

//         // Construct the URL to match the required format
//         companyLogoUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/company_logo/${companyLogoUrl
//           .split("/")
//           .pop()}`;

//         // Only delete old file after successful upload
//         if (
//           isUpdate &&
//           existingData?.company_logo &&
//           existingData.company_logo !== companyLogoUrl
//         ) {
//           await safeDeleteFromBackblaze(
//             existingData.company_logo,
//             "company logo"
//           );
//         }
//       } catch (error) {
//         console.error("Failed to upload company logo:", error.message);
//         throw new Error("Failed to upload company logo");
//       }
//     }

//     // Handle company signature upload
//     if (req.files?.company_signature?.[0]) {
//       const file = req.files.company_signature[0];

//       try {
//         // Upload the new file first
//         companySignatureUrl = await uploadToBackblaze(
//           file.buffer,
//           file.originalname,
//           file.mimetype,
//           "company_signature"
//         );
//         console.log(`New company signature uploaded: ${companySignatureUrl}`);

//         // Construct the URL to match the required format
//         companySignatureUrl = `https://DCC-HRMS.s3.us-east-005.backblazeb2.com/company_signature/${companySignatureUrl
//           .split("/")
//           .pop()}`;

//         // Only delete old file after successful upload
//         if (
//           isUpdate &&
//           existingData?.company_signature &&
//           existingData.company_signature !== companySignatureUrl
//         ) {
//           await safeDeleteFromBackblaze(
//             existingData.company_signature,
//             "company signature"
//           );
//         }
//       } catch (error) {
//         console.error("Failed to upload company signature:", error.message);
//         throw new Error("Failed to upload company signature");
//       }
//     }

//     // Prepare data for database
//     const data = {
//       ...req.body,
//       id: isUpdate ? Number(id) : undefined,
//       employee_id: Number(req.body.employee_id),
//       company_logo: companyLogoUrl,
//       company_signature: companySignatureUrl,
//       updatedby: Number(req.user.employee_id),
//       createdby: Number(req.user.employee_id),
//       log_inst: req.user.log_inst || Number(req.user.employee_id),
//     };

//     // Save to database
//     const result =
//       await defaultConfigurationService.updateDefaultConfigurationService(
//         id,
//         data
//       );

//     res.status(200).success("Default Configuration saved successfully", result);
//   } catch (err) {
//     console.error("Error in createOrUpdateDefaultConfiguration:", err);
//     next(err);
//   }
// };

module.exports = {
  createDefaultConfiguration,
  getAllDefaultConfiguration,
  updateDefaultConfiguration,
  deleteDefaultConfiguration,
  findDefaultConfiguration,
  createOrUpdateDefaultConfiguration,
};
