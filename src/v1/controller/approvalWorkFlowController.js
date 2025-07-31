const approvalWorkFlowService = require("../services/approvalWorkFlowService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createApprovalWorkFlow = async (req, res, next) => {
  try {
    let dataArray = req.body;

    if (!Array.isArray(dataArray)) {
      dataArray = [dataArray];
    }

    dataArray = dataArray.map((item) => ({
      ...item,
      createdby: req.user?.id || 1,
      log_inst: req.user?.log_inst || 1,
    }));

    const reqData = await approvalWorkFlowService.createApprovalWorkFlow(
      dataArray
    );

    res.status(201).success("Approval workflow created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findApprovalWorkFlow = async (req, res, next) => {
  try {
    const reqData = await approvalWorkFlowService.findApprovalWorkFlow(
      req.params.id
    );
    if (!reqData) throw new CustomError("Approval workflow not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const getAllApprovalWorkFlow = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await approvalWorkFlowService.getAllApprovalWorkFlow(
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

const updateApprovalWorkFlow = async (req, res, next) => {
  try {
    let dataArray = req.body;

    if (!Array.isArray(dataArray)) {
      dataArray = [dataArray];
    }

    const userId = req.user?.id || 1;
    const logInst = req.user?.log_inst || 1;

    const result = [];

    for (const item of dataArray) {
      const data = {
        ...item,
        log_inst: logInst,
      };

      if (item.id || item.workflow_id) {
        const id = item.id || item.workflow_id;
        const updated = await approvalWorkFlowService.updateApprovalWorkFlow(
          id,
          {
            ...data,
            updatedby: userId,
          }
        );
        result.push(updated);
      } else {
        // ✅ CREATE if ID is not present
        const created = await approvalWorkFlowService.createApprovalWorkFlow([
          {
            ...data,
            createdby: userId,
          },
        ]);
        result.push(...created);
      }
    }

    res.status(200).success("Approval workflows upserted successfully", result);
  } catch (error) {
    next(error); // <- where your error `"next is not a function"` came from earlier
  }
};

const deleteApprovalWorkFlow = async (req, res, next) => {
  try {
    await approvalWorkFlowService.deleteApprovalWorkFlow(
      req.params.requestType
    );
    res.status(200).success("Approval workflow deleted successfully");
  } catch (error) {
    next(error);
  }
};

const getAllApprovalWorkFlowByRequest = async (req, res) => {
  try {
    const { request_type } = req.query;

    if (!request_type) {
      return res.status(400).json({
        success: false,
        message: "Request type is required",
      });
    }

    const data = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
      request_type
    );
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createApprovalWorkFlow,
  getAllApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
  getAllApprovalWorkFlowByRequest,
};
