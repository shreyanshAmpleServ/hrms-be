const LeaveApplyService = require("../services/LeaveApplyService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze");
const fs = require("fs");

const createLeaveApplication = async (req, res, next) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path); // read file from disk
      imageUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "document_attachment"
      );
      fs.unlinkSync(req.file.path); // optional: delete file after upload
    }

    const data = {
      ...req.body,
      createdby: req.user.id,
      document_attachment: imageUrl,
      log_inst: req.user.log_inst,
    };

    const reqData = await LeaveApplyService.createLeaveApplication(data);
    res.status(201).success("Leave application created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findLeaveApplicationById = async (req, res, next) => {
  try {
    const reqData = await LeaveApplyService.findLeaveApplicationById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Leave application not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateLeaveApplication = async (req, res, next) => {
  try {
    const existingData = await LeaveApplyService.findLeaveApplicationById(
      req.params.id
    );
    if (!existingData)
      throw new CustomError("Leave Application not found", 404);

    let imageUrl = existingData.document_attachment;

    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);
      imageUrl = await uploadToBackblaze(
        fileBuffer,
        req.file.originalname,
        req.file.mimetype,
        "document_attachment"
      );
      fs.unlinkSync(req.file.path); // optional: remove file after upload

      if (existingData.document_attachment) {
        await deleteFromBackblaze(existingData.document_attachment);
      }
    }

    const data = {
      ...req.body,
      document_attachment: imageUrl,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };

    const reqData = await LeaveApplyService.updateLeaveApplication(
      req.params.id,
      data
    );
    res.status(200).success("Leave application updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteLeaveApplication = async (req, res, next) => {
  try {
    await LeaveApplyService.deleteLeaveApplication(req.params.id);
    res.status(200).success("Leave application deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllLeaveApplication = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await LeaveApplyService.getAllLeaveApplication(
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

module.exports = {
  createLeaveApplication,
  findLeaveApplicationById,
  updateLeaveApplication,
  deleteLeaveApplication,
  getAllLeaveApplication,
};
