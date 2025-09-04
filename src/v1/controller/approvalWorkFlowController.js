// const approvalWorkFlowService = require("../services/approvalWorkFlowService.js");
// const approvalWorkFlowModel = require("../models/approvalWorkFlowModel.js");
// const CustomError = require("../../utils/CustomError.js");
// const moment = require("moment");

// const createApprovalWorkFlow = async (req, res, next) => {
//   try {
//     let dataArray = req.body;

//     if (!Array.isArray(dataArray)) {
//       dataArray = [dataArray];
//     }

//     dataArray = dataArray.map((item) => ({
//       ...item,
//       createdby: req.user?.id || 1,
//       log_inst: req.user?.log_inst || 1,
//     }));

//     const reqData = await approvalWorkFlowService.createApprovalWorkFlow(
//       dataArray
//     );

//     res.status(201).success("Approval workflow created successfully", reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const findApprovalWorkFlow = async (req, res, next) => {
//   try {
//     const reqData = await approvalWorkFlowService.findApprovalWorkFlow(
//       req.params.id
//     );
//     if (!reqData) throw new CustomError("Approval workflow not found", 404);
//     res.status(200).success(null, reqData);
//   } catch (error) {
//     next(error);
//   }
// };

// const getAllApprovalWorkFlow = async (req, res, next) => {
//   try {
//     const { page, size, search, startDate, endDate } = req.query;
//     const data = await approvalWorkFlowService.getAllApprovalWorkFlow(
//       search,
//       Number(page),
//       Number(size),
//       startDate && moment(startDate),
//       endDate && moment(endDate)
//     );
//     res.status(200).success(null, data);
//   } catch (error) {
//     next(error);
//   }
// };

// const updateApprovalWorkFlow = async (req, res, next) => {
//   try {
//     let dataArray = req.body;

//     if (!Array.isArray(dataArray)) {
//       dataArray = [dataArray];
//     }

//     const userId = req.user?.id || 1;
//     const logInst = req.user?.log_inst || 1;

//     const result = [];

//     // Step 1: Get all current workflow IDs for the same request_type (assumption)
//     const requestType = dataArray[0]?.request_type;
//     const existingWorkflows =
//       await approvalWorkFlowService.getAllApprovalWorkFlowByRequest(
//         requestType
//       );
//     const existingIds = new Set(existingWorkflows.map((w) => w.id));

//     // Step 2: Collect incoming IDs
//     const incomingIds = new Set(
//       dataArray.map((item) => item.id).filter(Boolean)
//     );

//     // Step 3: Delete workflows not in incoming list
//     const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
//     if (idsToDelete.length > 0) {
//       await approvalWorkFlowService.deleteApprovalWorkFlows(idsToDelete);
//     }

//     // Step 4: Upsert workflows (update or create)
//     for (const item of dataArray) {
//       const data = {
//         ...item,
//         log_inst: logInst,
//       };

//       if (item.id || item.workflow_id) {
//         const id = item.id || item.workflow_id;
//         const updated = await approvalWorkFlowService.updateApprovalWorkFlow(
//           id,
//           {
//             ...data,
//             updatedby: userId,
//           }
//         );
//         result.push(updated);
//       } else {
//         const created = await approvalWorkFlowService.createApprovalWorkFlow([
//           {
//             ...data,
//             createdby: userId,
//           },
//         ]);
//         result.push(...created);
//       }
//     }

//     res.status(200).success("Approval workflows upserted successfully", result);
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteApprovalWorkFlow = async (req, res, next) => {
//   try {
//     await approvalWorkFlowService.deleteApprovalWorkFlow(
//       req.params.requestType
//     );
//     res.status(200).success("Approval workflow deleted successfully");
//   } catch (error) {
//     next(error);
//   }
// };

// const getAllApprovalWorkFlowByRequest = async (req, res) => {
//   try {
//     const { request_type } = req.query;

//     if (!request_type) {
//       return res.status(400).json({
//         success: false,
//         message: "Request type is required",
//       });
//     }

//     const data = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//       request_type
//     );
//     return res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     return res.status(error.status || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = {
//   createApprovalWorkFlow,
//   getAllApprovalWorkFlow,
//   findApprovalWorkFlow,
//   updateApprovalWorkFlow,
//   deleteApprovalWorkFlow,
//   getAllApprovalWorkFlowByRequest,
// };
const approvalWorkFlowService = require("../services/approvalWorkFlowService.js");
const approvalWorkFlowModel = require("../models/approvalWorkFlowModel.js");
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

    const globalCount = reqData.filter((r) => !r.department_id).length;
    const deptCount = reqData.length - globalCount;

    console.log(
      ` Created ${reqData.length} workflows: ${globalCount} global, ${deptCount} department-specific`
    );

    res.status(201).success("Approval workflow created successfully", {
      workflows: reqData,
      summary: {
        total: reqData.length,
        global: globalCount,
        department_specific: deptCount,
      },
    });
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
    const { page, size, search, startDate, endDate, department_id } = req.query;
    const data = await approvalWorkFlowService.getAllApprovalWorkFlow(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      department_id
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

    const requestType = dataArray[0]?.request_type;
    const departmentId = dataArray[0]?.department_id;

    const existingWorkflows =
      await approvalWorkFlowService.getAllApprovalWorkFlowByRequest(
        requestType,
        departmentId
      );
    const existingIds = new Set(existingWorkflows.map((w) => w.id));

    const incomingIds = new Set(
      dataArray.map((item) => item.id).filter(Boolean)
    );

    const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
    if (idsToDelete.length > 0) {
      await approvalWorkFlowService.deleteApprovalWorkFlows(idsToDelete);
      console.log(` Deleted ${idsToDelete.length} obsolete workflows`);
    }

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
    next(error);
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

// const getAllApprovalWorkFlowByRequest = async (req, res) => {
//   try {
//     const { request_type, department_id } = req.query;

//     if (!request_type) {
//       return res.status(400).json({
//         success: false,
//         message: "Request type is required",
//       });
//     }

//     const data = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//       request_type,
//       department_id
//     );

//     const isGlobal = data.length > 0 && data[0].department_id === null;

//     return res.status(200).json({
//       success: true,
//       data,
//       meta: {
//         request_type,
//         department_id: department_id || null,
//         is_global_workflow: isGlobal,
//         total_approvers: data.length,
//       },
//     });
//   } catch (error) {
//     return res.status(error.status || 500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const getAllApprovalWorkFlowByRequest = async (req, res) => {
  try {
    const { request_type, department_id } = req.query;

    if (!request_type) {
      return res.status(400).send({
        success: false,
        message: "Request type is required",
      });
    }
    if (department_id) {
      const deptData =
        await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
          request_type,
          department_id
        );
      if (deptData.length === 0) {
        return res.status(200).send({
          success: true,
          data: [],
          meta: {
            request_type,
            department_id,
            is_global_workflow: false,
            total_approvers: deptData.length,
          },
        });
      }
    }

    const data = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
      request_type,
      department_id
    );
    const isGloabal = data.length > 0 && data[0].department_id === null;
    return res.status(200).send({
      success: true,
      data,
      meta: {
        request_type,
        department_id: department_id || null,
        is_global_workflow: isGloabal,
        total_approvers: data.length,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
const getDepartmentWorkflows = async (req, res, next) => {
  try {
    const { request_type, department_id } = req.query;

    if (!request_type) {
      return res.status(400).json({
        success: false,
        message: "Request type is required",
      });
    }

    const workflows =
      await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
        request_type,
        department_id
      );

    const workflowType =
      workflows.length > 0 && workflows[0].department_id === null
        ? "global"
        : "department-specific";

    return res.status(200).json({
      success: true,
      data: workflows,
      meta: {
        request_type,
        department_id: department_id || null,
        workflow_type: workflowType,
        total_steps: workflows.length,
        message: department_id
          ? `Workflow for ${request_type} in department ${department_id}${
              workflowType === "global" ? " (using global fallback)" : ""
            }`
          : `Global workflow for ${request_type}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentsWithWorkflows = async (req, res, next) => {
  try {
    const { requestType } = req.params;

    const departments = await approvalWorkFlowModel.getDepartmentsWithWorkflows(
      requestType
    );

    return res.status(200).json({
      success: true,
      data: departments,
      meta: {
        request_type: requestType,
        total_departments: departments.length,
        has_global: departments.some((d) => d.is_global),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getWorkflowSummary = async (req, res, next) => {
  try {
    const { request_type } = req.query;

    const summary = await approvalWorkFlowModel.getAllApprovalWorkFlow(
      request_type,
      1,
      1000,
      null,
      null,
      undefined
    );

    const stats = {
      total_workflows: summary.data.length,
      global_workflows: summary.data.filter((w) => w.is_global).length,
      department_workflows: summary.data.filter((w) => !w.is_global).length,
      request_types: [...new Set(summary.data.map((w) => w.request_type))],
      departments: [
        ...new Set(
          summary.data.filter((w) => !w.is_global).map((w) => w.department_name)
        ),
      ],
    };

    return res.status(200).json({
      success: true,
      data: stats,
      workflows: summary.data,
    });
  } catch (error) {
    next(error);
  }
};

const validateWorkflow = async (req, res, next) => {
  try {
    const { request_type, requester_id } = req.body;

    if (!request_type || !requester_id) {
      return res.status(400).json({
        success: false,
        message: "request_type and requester_id are required",
      });
    }

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    const requester = await prisma.hrms_d_employee.findUnique({
      where: { id: requester_id },
      select: {
        department_id: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });

    if (!requester) {
      return res.status(404).json({
        success: false,
        message: "Requester not found",
      });
    }

    const deptWorkflows =
      await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
        request_type,
        requester.department_id
      );

    const globalWorkflows =
      await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
        request_type,
        null
      );

    const hasWorkflow = deptWorkflows.length > 0 || globalWorkflows.length > 0;
    const workflowType =
      deptWorkflows.length > 0 ? "department-specific" : "global";
    const activeWorkflow =
      deptWorkflows.length > 0 ? deptWorkflows : globalWorkflows;

    return res.status(200).json({
      success: true,
      data: {
        has_workflow: hasWorkflow,
        workflow_type: workflowType,
        requester_department:
          requester.hrms_employee_department?.department_name ||
          "No Department",
        total_approval_steps: activeWorkflow.length,
        approvers: activeWorkflow.map((w, index) => ({
          sequence: index + 1,
          approver: w.approval_work_approver?.full_name,
          department:
            w.approval_work_approver?.hrms_employee_department?.department_name,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApprovalWorkFlow,
  getAllApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
  getAllApprovalWorkFlowByRequest,
  getDepartmentWorkflows,
  getDepartmentsWithWorkflows,
  getWorkflowSummary,
  validateWorkflow,
};
