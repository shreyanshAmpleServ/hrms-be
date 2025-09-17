const alertWorkflowService = require("../services/alertWorkflowService");
const moment = require("moment");
const CustomError = require("../../utils/CustomError");

const createAlertWorkflow = async (req, res, next) => {
  try {
    console.log("Incoming request body:", req.body);
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const created = await alertWorkflowService.createAlertWorkflow(data);
    res.status(201).success("Workflow created successfully", created);
  } catch (error) {
    next(error);
  }
};

const getAllAlertWorkflows = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await alertWorkflowService.getAllAlertWorkflows(
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

const getAlertWorkflowById = async (req, res, next) => {
  try {
    const workflow = await alertWorkflowService.getAlertWorkflowById(
      req.params.id
    );
    if (!workflow) throw new CustomError("Workflow not found", 404);
    res.status(200).success(null, workflow);
  } catch (error) {
    next(error);
  }
};

const updateAlertWorkflow = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const updated = await alertWorkflowService.updateAlertWorkflow(
      req.params.id,
      data
    );
    res.status(200).success("Workflow updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

const deleteAlertWorkflow = async (req, res, next) => {
  try {
    await alertWorkflowService.deleteAlertWorkflow(req.params.id);
    res.status(204).success("Workflow deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const triggerAlertWorkflow = async (req, res, next) => {
  try {
    await alertWorkflowService.runAlertWorkflow(req.params.id);
    res.status(200).success("Workflow triggered and executed", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAlertWorkflow,
  getAllAlertWorkflows,
  getAlertWorkflowById,
  updateAlertWorkflow,
  deleteAlertWorkflow,
  triggerAlertWorkflow,
};
