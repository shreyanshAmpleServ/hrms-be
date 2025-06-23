const candidateMasterService = require("../services/candidateMasterService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");
const fs = require("fs");
const { uploadToBackblaze } = require("../../utils/uploadBackblaze.js");

//Create
const createCandidateMaster = async (req, res, next) => {
  try {
    if (!req.file) throw new CustomError("No file uploaded", 400);
    const fileBuffer = await fs.promises.readFile(req.file.path);
    const fileUrl = await uploadToBackblaze(
      fileBuffer,
      req.file.originalname,
      req.file.mimetype,
      "resume_path"
    );

    const candidateData = {
      ...req.body,
      resume_path: fileUrl,
      createdby: req.user.id,
    };

    const result = await candidateMasterService.createCandidateMaster(
      candidateData
    );
    res.status(201).success("Candidate Master created successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 400));
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

    let fileUrl = existingCandidateMaster.resume_path;

    if (req.file) {
      const fileBuffer = await fs.promises.readFile(req.file.path);
      fileUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "resume_path"
      );
    }

    const candidateData = {
      ...req.body,
      resume_path: fileUrl,
      updatedby: req.user.id,
    };

    const result = await candidateMasterService.updateCandidateMaster(
      req.params.id,
      candidateData
    );
    res.status(200).success("Candidate master updated Successfully", result);
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

// Delete
const deleteCandidateMaster = async (req, res, next) => {
  try {
    await candidateMasterService.deleteCandidateMaster(req.params.id);
    res.status(200).json({
      success: true,
      message: "Candidate master deleted successfully",
    });
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
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(new CustomError(error.message, 400));
  }
};

const updateCandidateMasterStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);

    const status = req.body.status;
    const status_remarks = req.body.status_remarks || "";
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
    res
      .status(200)
      .success("Candidate Master status updated successfully", reqData);
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
};
