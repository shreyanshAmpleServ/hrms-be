const grievanceService = require("../services/grievanceService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");

const createGrievanceSubmission = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await grievanceService.createGrievanceSubmission(data);
    res
      .status(201)
      .success("Grievance submission created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findGrievanceSubmissionById = async (req, res, next) => {
  try {
    const reqData = await grievanceService.findGrievanceSubmissionById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Grievance submission not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateGrievanceSubmission = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await grievanceService.updateGrievanceSubmission(
      req.params.id,
      data
    );
    res
      .status(200)
      .success("Grievance submission updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteGrievanceSubmission = async (req, res, next) => {
  try {
    await grievanceService.deleteGrievanceSubmission(req.params.id);
    res.status(200).success("Grievance submission deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllGrievanceSubmission = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const data = await grievanceService.getAllGrievanceSubmission(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

const updateGrievanceSubmissionStatus = async (req, res, next) => {
  try {
    console.log("Approver ID from token:", req.user.employee_id);
    const status = req.body.status;
    const data = {
      status,
      updatedby: req.user.employee_id,
      updatedate: new Date(),
    };

    const reqData = await grievanceService.updateGrievanceSubmissionStatus(
      req.params.id,
      data
    );
    res
      .status(200)
      .success("Grievance Submission status updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createGrievanceSubmission,
  findGrievanceSubmissionById,
  updateGrievanceSubmission,
  deleteGrievanceSubmission,
  getAllGrievanceSubmission,
  updateGrievanceSubmissionStatus,
};
