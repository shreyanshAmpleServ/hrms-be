// const candidateMasterService = require("../services/candidateMasterService.js");
// const CustomError = require("../../utils/CustomError.js");
// const moment = require("moment");
// const fs = require("fs");
// const {
//   uploadToBackblaze,
//   deleteFromBackblaze,
// } = require("../../utils/uploadBackblaze.js");
// const e = require("express");

// //Create
// const createCandidateMaster = async (req, res, next) => {
//   try {
//     let profilePicUrl = null;
//     let resumePathUrl = null;
//     // console.log("file", req.files.buffer);

//     if (req.files?.profile_pic) {
//       const file = req.files.profile_pic[0];
//       const buffer = file.buffer;
//       profilePicUrl = await uploadToBackblaze(
//         buffer,
//         file.originalname,
//         file.mimetype,
//         "Candidate"
//       );
//       // fs.unlinkSync(file.path);
//     }

//     if (req.files?.resume_path) {
//       const file = req.files.resume_path[0];
//       const buffer = file.buffer;
//       resumePathUrl = await uploadToBackblaze(
//         buffer,
//         file.originalname,
//         file.mimetype,
//         "Candidate"
//       );
//     }
//     const data = {
//       ...req.body,
//       createdby: req.user.id,
//       profile_pic: profilePicUrl,
//       resume_path: resumePathUrl,
//       log_inst: req.user.log_inst,
//     };

//     const reqData = await candidateMasterService.createCandidateMaster(data);
//     res.status(201).success("Candidate Master created successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const findCandidateMasterById = async (req, res, next) => {
//   try {
//     const data = await candidateMasterService.getCandidateMasterById(
//       req.params.id
//     );
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     next(new CustomError(error.message, 400));
//   }
// };

// const updateCandidateMaster = async (req, res, next) => {
//   try {
//     const existingCandidateMaster =
//       await candidateMasterService.getCandidateMasterById(req.params.id);

//     if (!existingCandidateMaster) {
//       throw new CustomError("Candidate Master not found", 404);
//     }

//     let profilePicUrl = existingCandidateMaster.profile_pic;
//     let resumePathUrl = existingCandidateMaster.resume_path;

//     console.log("req.files", req.files);
//     if (req.files?.profile_pic) {
//       const file = req.files.profile_pic[0];
//       const buffer = file.buffer;

//       profilePicUrl = await uploadToBackblaze(
//         buffer,
//         file.originalname,
//         file.mimetype,
//         "Candidate"
//       );
//     }

//     if (req.files?.resume_path) {
//       const file = req.files.resume_path[0];
//       const buffer = file.buffer;

//       resumePathUrl = await uploadToBackblaze(
//         buffer,
//         file.originalname,
//         file.mimetype,
//         "Candidate"
//       );
//     }

//     const candidateData = {
//       ...req.body,
//       resume_path: resumePathUrl,
//       profile_pic: profilePicUrl,
//       updatedby: req.user.id,
//     };

//     const result = await candidateMasterService.updateCandidateMaster(
//       req.params.id,
//       candidateData
//     );

//     res.status(200).success("Candidate master updated Successfully", result);

//     if (existingCandidateMaster.profile_pic && req.files?.profile_pic) {
//       await deleteFromBackblaze(existingCandidateMaster.profile_pic);
//     }
//     if (existingCandidateMaster.resume_path && req.files?.resume_path) {
//       await deleteFromBackblaze(existingCandidateMaster.resume_path);
//     }
//   } catch (error) {
//     next(new CustomError(error.message, 400));
//   }
// };

// // Delete
// const deleteCandidateMaster = async (req, res, next) => {
//   try {
//     const existingCandidateMaster =
//       await candidateMasterService.getCandidateMasterById(req.params.id);
//     if (!existingCandidateMaster) {
//       throw new CustomError("Candidate Master not found", 404);
//     }
//     await candidateMasterService.deleteCandidateMaster(req.params.id);
//     res.status(200).json({
//       success: true,
//       message: "Candidate master deleted successfully",
//     });
//     if (existingCandidateMaster.profile_pic && req.files?.profile_pic) {
//       await deleteFromBackblaze(existingCandidateMaster.profile_pic);
//     }
//     if (existingCandidateMaster.resume_path && req.files?.resume_path) {
//       await deleteFromBackblaze(existingCandidateMaster.resume_path);
//     }
//   } catch (error) {
//     next(new CustomError(error.message, 400));
//   }
// };

// // Get all
// const getAllCandidateMaster = async (req, res, next) => {
//   try {
//     const { search, page, size, startDate, endDate, is_active } = req.query;
//     const data = await candidateMasterService.getAllCandidateMaster(
//       search,
//       Number(page),
//       Number(size),
//       startDate && moment(startDate),
//       endDate && moment(endDate),
//       is_active
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(new CustomError(error.message, 400));
//   }
// };

// // const updateCandidateMasterStatus = async (req, res, next) => {
// //   try {
// //     console.log("Approver ID from token:", req.user.employee_id);

// //     const status = req.body.status;
// //     const status_remarks = req.body.status_remarks || "";
// //     const data = {
// //       status,
// //       status_remarks,
// //       updatedby: req.user.employee_id,
// //       updatedate: new Date(),
// //     };

// //     const reqData = await candidateMasterService.updateCandidateMasterStatus(
// //       req.params.id,
// //       data
// //     );
// //     res
// //       .status(200)
// //       .success("Candidate Master status updated successfully", reqData);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// const updateCandidateMasterStatus = async (req, res, next) => {
//   try {
//     console.log("Approver ID from token:", req.user.employee_id);

//     const status = req.body.status;
//     const status_remarks = req.body.status_remarks || "";
//     const autoCreateEmployee = req.body.autoCreateEmployee || false;
//     const employeeData = req.body.employeeData || {};

//     const data = {
//       status,
//       status_remarks,
//       updatedby: req.user.employee_id,
//       updatedate: new Date(),
//     };

//     const reqData = await candidateMasterService.updateCandidateMasterStatus(
//       req.params.id,
//       data
//     );

//     if (status === "A" && autoCreateEmployee) {
//       try {
//         const employeeResult =
//           await candidateMasterService.createEmployeeFromCandidate(
//             req.params.id,
//             employeeData,
//             req.user.id,
//             req.user.log_inst
//           );
//         reqData.employee = employeeResult;
//       } catch (employeeError) {
//         console.error("Error creating employee from candidate:", employeeError);
//       }
//     }

//     res
//       .status(200)
//       .success("Candidate Master status updated successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const createEmployeeFromCandidate = async (req, res, next) => {
//   try {
//     const candidateId = req.params.id;
//     const additionalEmployeeData = req.body;
//     const result = await candidateMasterService.createEmployeeFromCandidate(
//       candidateId,
//       additionalEmployeeData,
//       req.user.id,
//       req.user.log_inst
//     );

//     res
//       .status(201)
//       .success("Employee created successfully from candidate", result);
//   } catch (error) {
//     next(error);
//   }
// };
// module.exports = {
//   createCandidateMaster,
//   findCandidateMasterById,
//   updateCandidateMaster,
//   deleteCandidateMaster,
//   getAllCandidateMaster,
//   updateCandidateMasterStatus,
//   createEmployeeFromCandidate,
// };

const candidateMasterService = require("../services/candidateMasterService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const fs = require("fs");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");
const e = require("express");
const { profile } = require("console");
const { resume } = require("pdfkit");

const safeUploadToBackblaze = async (file, folder) => {
  if (!file) return null;

  try {
    const fileUrl = await uploadToBackblaze(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder
    );
    console.log(`Successfully uploaded ${file.fieldname} to ${folder}`);
    return fileUrl;
  } catch (error) {
    console.error(`Failed to upload ${file.fieldname}:`, error.message);
    return null;
  }
};

const safeDeleteFromBackblaze = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    await deleteFromBackblaze(fileUrl);
    console.log(`Successfully deleted file: ${fileUrl}`);
  } catch (error) {
    console.error(`Failed to delete file ${fileUrl}:`, error.message);
  }
};

const processCandidateFileUploads = async (files) => {
  const result = {
    profile_pic: null,
    resume_path: null,
    warnings: [],
  };
  if (!files) return result;

  if (files.profile_pic && files.profile_pic[0]) {
    result.profile_pic = await safeUploadToBackblaze(
      files.profile_pic[0],
      "Candidate"
    );
    if (!result.profile_pic) {
      result.warnings.push(
        "Failed to upload profile picture. Candidate saved without profile picture."
      );
    }
  }

  if (files.resume_path && files.resume_path[0]) {
    result.resume_path = await safeUploadToBackblaze(
      files.resume_path[0],
      "Candidate"
    );
    if (!result.resume_path) {
      result.warnings.push(
        "Failed to upload resume. Candidate saved without resume."
      );
    }
  }
  return result;
};

//Create
const createCandidateMaster = async (req, res, next) => {
  try {
    const uploadResults = await processCandidateFileUploads(req.files);

    const data = {
      ...req.body,
      createdby: req.user.id,
      profile_pic: uploadResults.profile_pic,
      resume_path: uploadResults.resume_path,
      log_inst: req.user.log_inst,
    };

    const reqData = await candidateMasterService.createCandidateMaster(data);

    const response = {
      success: true,
      message: "Candidate Master created successfully",
      data: reqData,
    };

    if (uploadResults.warnings.length > 0) {
      response.warnings = uploadResults.warnings;
      response.message =
        "Candidate Master created successfully with some upload warnings";
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Create Candidate Master Error:", error);
    next(error);
  }
};

const findCandidateMasterById = async (req, res, next) => {
  try {
    const data = await candidateMasterService.getCandidateMasterById(
      req.params.id
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const updateCandidateMaster = async (req, res, next) => {
  try {
    const existingCandidateMaster =
      await candidateMasterService.getCandidateMasterById(req.params.id);

    if (!existingCandidateMaster) {
      throw new CustomError("Candidate Master not found", 404);
    }

    let profilePicUrl = existingCandidateMaster.profile_pic;
    let resumePathUrl = existingCandidateMaster.resume_path;

    const uploadWarnings = [];
    const oldFilesToDelete = [];

    console.log("req.files", req.files);

    if (req.files?.profile_pic && req.files.profile_pic[0]) {
      const newProfilePic = await safeUploadToBackblaze(
        req.files.profile_pic[0],
        "Candidate"
      );

      if (newProfilePic) {
        profilePicUrl = newProfilePic;
        if (existingCandidateMaster.profile_pic) {
          oldFilesToDelete.push(existingCandidateMaster.profile_pic);
        }
      } else {
        uploadWarnings.push(
          "Failed to upload new profile picture. Keeping existing file."
        );
      }
    }

    if (req.files?.resume_path && req.files.resume_path[0]) {
      const newResume = await safeUploadToBackblaze(
        req.files.resume_path[0],
        "Candidate"
      );

      if (newResume) {
        resumePathUrl = newResume;
        // Mark old file for deletion after successful update
        if (existingCandidateMaster.resume_path) {
          oldFilesToDelete.push(existingCandidateMaster.resume_path);
        }
      } else {
        uploadWarnings.push(
          "Failed to upload new resume. Keeping existing file."
        );
      }
    }

    const candidateData = {
      ...req.body,
      resume_path: resumePathUrl,
      profile_pic: profilePicUrl,
      updatedby: req.user.id,
    };

    const result = await candidateMasterService.updateCandidateMaster(
      req.params.id,
      candidateData
    );

    for (const fileUrl of oldFilesToDelete) {
      await safeDeleteFromBackblaze(fileUrl);
    }

    const response = {
      success: true,
      message: "Candidate master updated successfully",
      data: result,
    };

    if (uploadWarnings.length > 0) {
      response.warnings = uploadWarnings;
      response.message =
        "Candidate master updated successfully with some upload warnings";
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Update Candidate Master Error:", error);
    next(new CustomError(error.message, 400));
  }
};
// Delete
const deleteCandidateMaster = async (req, res, next) => {
  try {
    const existingCandidateMaster =
      await candidateMasterService.getCandidateMasterById(req.params.id);

    if (!existingCandidateMaster) {
      throw new CustomError("Candidate Master not found", 404);
    }

    await candidateMasterService.deleteCandidateMaster(req.params.id);

    if (existingCandidateMaster.profile_pic) {
      await safeDeleteFromBackblaze(existingCandidateMaster.profile_pic);
    }
    if (existingCandidateMaster.resume_path) {
      await safeDeleteFromBackblaze(existingCandidateMaster.resume_path);
    }

    res.status(200).json({
      success: true,
      message: "Candidate master deleted successfully",
    });
  } catch (error) {
    console.error("Delete Candidate Master Error:", error);
    next(new CustomError(error.message, 400));
  }
};

// Get all
const getAllCandidateMaster = async (req, res, next) => {
  try {
    const { search, page, size, startDate, endDate, is_active } = req.query;
    const data = await candidateMasterService.getAllCandidateMaster(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active
    );
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// const updateCandidateMasterStatus = async (req, res, next) => {
//   try {
//     console.log("Approver ID from token:", req.user.employee_id);

//     const status = req.body.status;
//     const status_remarks = req.body.status_remarks || "";
//     const data = {
//       status,
//       status_remarks,
//       updatedby: req.user.employee_id,
//       updatedate: new Date(),
//     };

//     const reqData = await candidateMasterService.updateCandidateMasterStatus(
//       req.params.id,
//       data
//     );
//     res
//       .status(200)
//       .success("Candidate Master status updated successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

const updateCandidateMasterStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);

    const status = req.body.status;
    const status_remarks = req.body.status_remarks || "";
    const autoCreateEmployee = req.body.autoCreateEmployee || false;
    const employeeData = req.body.employeeData || {};

    const data = {
      status,
      status_remarks,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData = await candidateMasterService.updateCandidateMasterStatus(
      req.params.id,
      data
    );

    if (status === "A" && autoCreateEmployee) {
      try {
        const employeeResult =
          await candidateMasterService.createEmployeeFromCandidate(
            req.params.id,
            employeeData,
            req.user.id,
            req.user.log_inst
          );
        reqData.employee = employeeResult;
      } catch (employeeError) {
        console.error("Error creating employee from candidate:", employeeError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Candidate Master status updated successfully",
      data: reqData,
    });
  } catch (error) {
    next(error);
  }
};

const createEmployeeFromCandidate = async (req, res, next) => {
  try {
    const candidateId = req.params.id;
    const additionalEmployeeData = req.body;
    const result = await candidateMasterService.createEmployeeFromCandidate(
      candidateId,
      additionalEmployeeData,
      req.user.id,
      req.user.log_inst
    );

    res.status(201).json({
      success: true,
      message: "Employee created successfully from candidate",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createCandidateMaster,
  findCandidateMasterById,
  updateCandidateMaster,
  deleteCandidateMaster,
  getAllCandidateMaster,
  updateCandidateMasterStatus,
  createEmployeeFromCandidate,
};
