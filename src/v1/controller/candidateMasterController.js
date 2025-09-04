const candidateMasterService = require("../services/candidateMasterService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const fs = require("fs");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");
const e = require("express");

//Create
const createCandidateMaster = async (req, res, next) => {
  try {
    let profilePicUrl = null;
    let resumePathUrl = null;
    // console.log("file", req.files.buffer);

    if (req.files?.profile_pic) {
      const file = req.files.profile_pic[0];
      const buffer = file.buffer;
      profilePicUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "Candidate"
      );
      // fs.unlinkSync(file.path);
    }

    if (req.files?.resume_path) {
      const file = req.files.resume_path[0];
      const buffer = file.buffer;
      resumePathUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "Candidate"
      );
    }
    const data = {
      ...req.body,
      createdby: req.user.id,
      profile_pic: profilePicUrl,
      resume_path: resumePathUrl,
      log_inst: req.user.log_inst,
    };

    const reqData = await candidateMasterService.createCandidateMaster(data);
    res.status(201).success("Candidate Master created successfully", reqData);
  } catch (error) {
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

    console.log("req.files", req.files);
    if (req.files?.profile_pic) {
      const file = req.files.profile_pic[0];
      const buffer = file.buffer;

      profilePicUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "Candidate"
      );
    }

    if (req.files?.resume_path) {
      const file = req.files.resume_path[0];
      const buffer = file.buffer;

      resumePathUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "Candidate"
      );
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

    res.status(200).success("Candidate master updated Successfully", result);

    if (existingCandidateMaster.profile_pic && req.files?.profile_pic) {
      await deleteFromBackblaze(existingCandidateMaster.profile_pic);
    }
    if (existingCandidateMaster.resume_path && req.files?.resume_path) {
      await deleteFromBackblaze(existingCandidateMaster.resume_path);
    }
  } catch (error) {
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
    res.status(200).json({
      success: true,
      message: "Candidate master deleted successfully",
    });
    if (existingCandidateMaster.profile_pic && req.files?.profile_pic) {
      await deleteFromBackblaze(existingCandidateMaster.profile_pic);
    }
    if (existingCandidateMaster.resume_path && req.files?.resume_path) {
      await deleteFromBackblaze(existingCandidateMaster.resume_path);
    }
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Get all
const getAllCandidateMaster = async (req, res, next) => {
  try {
    const { search, page, size, startDate, endDate } = req.query;
    const data = await candidateMasterService.getAllCandidateMaster(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
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
    const autoCreateEmployee = req.body.autoCreateEmployee || false; // New flag
    const employeeData = req.body.employeeData || {}; // Additional employee data

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

    // Check if we need to auto-create employee after status update
    if (status === "Hired" && autoCreateEmployee) {
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
        // Don't fail the status update if employee creation fails
      }
    }

    res
      .status(200)
      .success("Candidate Master status updated successfully", reqData);
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

    res
      .status(201)
      .success("Employee created successfully from candidate", result);
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
