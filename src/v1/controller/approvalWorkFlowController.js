// const approvalWorkFlowService = require("../services/approvalWorkFlowService.js");
// const approvalWorkFlowModel = require("../models/approvalWorkFlowModel.js");
// const CustomError = require("../../utils/CustomError.js");
// const moment = require("moment");
// const { request } = require("express");

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

//     const globalCount = reqData.filter((r) => !r.department_id).length;
//     const deptCount = reqData.length - globalCount;

//     console.log(
//       ` Created ${reqData.length} workflows: ${globalCount} global, ${deptCount} department-specific`
//     );

//     res.status(201).success("Approval workflow created successfully", {
//       workflows: reqData,
//       summary: {
//         total: reqData.length,
//         global: globalCount,
//         department_specific: deptCount,
//       },
//     });
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
//     const { page, size, search, startDate, endDate, department_id } = req.query;
//     const data = await approvalWorkFlowService.getAllApprovalWorkFlow(
//       search,
//       Number(page),
//       Number(size),
//       startDate && moment(startDate),
//       endDate && moment(endDate),
//       department_id
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

//     const requestType = dataArray[0]?.request_type;
//     const departmentId = dataArray[0]?.department_id;

//     const existingWorkflows =
//       await approvalWorkFlowService.getAllApprovalWorkFlowByRequest(
//         requestType,
//         departmentId
//       );
//     const existingIds = new Set(existingWorkflows.map((w) => w.id));

//     const incomingIds = new Set(
//       dataArray.map((item) => item.id).filter(Boolean)
//     );

//     const idsToDelete = [...existingIds].filter((id) => !incomingIds.has(id));
//     if (idsToDelete.length > 0) {
//       await approvalWorkFlowService.deleteApprovalWorkFlows(idsToDelete);
//       console.log(` Deleted ${idsToDelete.length} obsolete workflows`);
//     }

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

// // const getAllApprovalWorkFlowByRequest = async (req, res) => {
// //   try {
// //     const { request_type, department_id } = req.query;

// //     if (!request_type) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Request type is required",
// //       });
// //     }

// //     const data = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
// //       request_type,
// //       department_id
// //     );

// //     const isGlobal = data.length > 0 && data[0].department_id === null;

// //     return res.status(200).json({
// //       success: true,
// //       data,
// //       meta: {
// //         request_type,
// //         department_id: department_id || null,
// //         is_global_workflow: isGlobal,
// //         total_approvers: data.length,
// //       },
// //     });
// //   } catch (error) {
// //     return res.status(error.status || 500).json({
// //       success: false,
// //       message: error.message,
// //     });
// //   }
// // };

// const getAllApprovalWorkFlowByRequest = async (req, res) => {
//   try {
//     const { request_type, department_id } = req.query;

//     if (!request_type) {
//       return res.status(400).send({
//         success: false,
//         message: "Request type is required",
//       });
//     }
//     if (department_id) {
//       const deptData =
//         await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//           request_type,
//           department_id
//         );
//       if (deptData.length === 0) {
//         return res.status(200).send({
//           success: true,
//           data: [],
//           meta: {
//             request_type,
//             department_id,
//             is_global_workflow: false,
//             total_approvers: deptData.length,
//           },
//         });
//       }
//     }

//     const data = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//       request_type,
//       department_id
//     );
//     const isGloabal = data.length > 0 && data[0].department_id === null;
//     return res.status(200).send({
//       success: true,
//       data,
//       meta: {
//         request_type,
//         department_id: department_id || null,
//         is_global_workflow: isGloabal,
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
// const getDepartmentWorkflows = async (req, res, next) => {
//   try {
//     const { request_type, department_id } = req.query;

//     if (!request_type) {
//       return res.status(400).json({
//         success: false,
//         message: "Request type is required",
//       });
//     }

//     const workflows =
//       await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//         request_type,
//         department_id
//       );

//     const workflowType =
//       workflows.length > 0 && workflows[0].department_id === null
//         ? "global"
//         : "department-specific";

//     return res.status(200).json({
//       success: true,
//       data: workflows,
//       meta: {
//         request_type,
//         department_id: department_id || null,
//         workflow_type: workflowType,
//         total_steps: workflows.length,
//         message: department_id
//           ? `Workflow for ${request_type} in department ${department_id}${
//               workflowType === "global" ? " (using global fallback)" : ""
//             }`
//           : `Global workflow for ${request_type}`,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getDepartmentsWithWorkflows = async (req, res, next) => {
//   try {
//     const { requestType } = req.params;

//     const departments = await approvalWorkFlowModel.getDepartmentsWithWorkflows(
//       requestType
//     );

//     return res.status(200).json({
//       success: true,
//       data: departments,
//       meta: {
//         request_type: requestType,
//         total_departments: departments.length,
//         has_global: departments.some((d) => d.is_global),
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getWorkflowSummary = async (req, res, next) => {
//   try {
//     const { request_type } = req.query;

//     const summary = await approvalWorkFlowModel.getAllApprovalWorkFlow(
//       request_type,
//       1,
//       1000,
//       null,
//       null,
//       undefined
//     );

//     const stats = {
//       total_workflows: summary.data.length,
//       global_workflows: summary.data.filter((w) => w.is_global).length,
//       department_workflows: summary.data.filter((w) => !w.is_global).length,
//       request_types: [...new Set(summary.data.map((w) => w.request_type))],
//       departments: [
//         ...new Set(
//           summary.data.filter((w) => !w.is_global).map((w) => w.department_name)
//         ),
//       ],
//       designations: [
//         ...new Set(
//           summary.data
//             .filter((w) => w.designation_id)
//             .map((w) => w.designation_name)
//         ),
//       ],
//     };

//     return res.status(200).json({
//       success: true,
//       data: stats,
//       workflows: summary.data,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const validateWorkflow = async (req, res, next) => {
//   try {
//     const { request_type, requester_id } = req.body;

//     if (!request_type || !requester_id) {
//       return res.status(400).json({
//         success: false,
//         message: "request_type and requester_id are required",
//       });
//     }

//     const { prisma } = require("../../utils/prismaProxy.js");
//

//     const requester = await prisma.hrms_d_employee.findUnique({
//       where: { id: requester_id },
//       select: {
//         department_id: true,
//         designation_id: true,
//         hrms_employee_department: {
//           select: { department_name: true },
//         },
//         hrms_employee_designation: {
//           select: { designation_name: true },
//         },
//       },
//     });

//     if (!requester) {
//       return res.status(404).json({
//         success: false,
//         message: "Requester not found",
//       });
//     }

//     const deptWorkflows =
//       await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//         request_type,
//         requester.department_id
//       );

//     const globalWorkflows =
//       await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
//         request_type,
//         null
//       );

//     const hasWorkflow = deptWorkflows.length > 0 || globalWorkflows.length > 0;
//     const workflowType =
//       deptWorkflows.length > 0 ? "department-specific" : "global";
//     const activeWorkflow =
//       deptWorkflows.length > 0 ? deptWorkflows : globalWorkflows;

//     return res.status(200).json({
//       success: true,
//       data: {
//         has_workflow: hasWorkflow,
//         workflow_type: workflowType,
//         requester_department:
//           requester.hrms_employee_department?.department_name ||
//           "No Department",
//         total_approval_steps: activeWorkflow.length,
//         approvers: activeWorkflow.map((w, index) => ({
//           sequence: index + 1,
//           approver: w.approval_work_approver?.full_name,
//           department:
//             w.approval_work_approver?.hrms_employee_department?.department_name,
//         })),
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getDesignationsWithWorkflows = async (req, res, next) => {
//   try {
//     const { requestType } = req.params;

//     const designations =
//       await approvalWorkFlowModel.getDesignationsWithWorkflows(requestType);

//     return res.status(200).json({
//       success: true,
//       data: designations,
//       meta: {
//         request_type: requestType,
//         total_designations: designations.length,
//         has_global: designations.some((d) => d.is_global),
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createApprovalWorkFlow,
//   getAllApprovalWorkFlow,
//   findApprovalWorkFlow,
//   updateApprovalWorkFlow,
//   deleteApprovalWorkFlow,
//   getAllApprovalWorkFlowByRequest,
//   getDepartmentWorkflows,
//   getDepartmentsWithWorkflows,
//   getWorkflowSummary,
//   validateWorkflow,
//   getDesignationsWithWorkflows,
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

    const globalCount = reqData.filter(
      (r) => !r.department_id && !r.designation_id
    ).length;
    const deptCount = reqData.filter(
      (r) => r.department_id && !r.designation_id
    ).length;
    const desigCount = reqData.filter(
      (r) => r.designation_id && !r.department_id
    ).length;

    console.log(
      `Created ${reqData.length} workflows: ${globalCount} global, ${deptCount} department-specific, ${desigCount} designation-specific`
    );

    res.status(201).success("Approval workflow created successfully", {
      workflows: reqData,
      summary: {
        total: reqData.length,
        global: globalCount,
        department_specific: deptCount,
        designation_specific: desigCount,
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
    const {
      page,
      size,
      search,
      startDate,
      endDate,
      department_id,
      designation_id,
    } = req.query;

    const data = await approvalWorkFlowService.getAllApprovalWorkFlow(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate),
      department_id,
      designation_id
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
    const designationId = dataArray[0]?.designation_id;

    const existingWorkflows =
      await approvalWorkFlowService.getAllApprovalWorkFlowByRequest(
        requestType,
        departmentId,
        designationId
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
    await approvalWorkFlowService.deleteApprovalWorkFlow(req.params.id);
    res.status(200).success("Approval workflow deleted successfully");
  } catch (error) {
    next(error);
  }
};

const getAllApprovalWorkFlowByRequest = async (req, res) => {
  try {
    const { request_type, department_id, designation_id } = req.query;

    if (!request_type) {
      return res.status(400).send({
        success: false,
        message: "Request type is required",
      });
    }

    const normalizedDepartmentId =
      department_id !== null &&
      department_id !== undefined &&
      department_id !== "" &&
      !isNaN(Number(department_id)) &&
      Number(department_id) > 0
        ? Number(department_id)
        : null;
    const normalizedDesignationId =
      designation_id !== null &&
      designation_id !== undefined &&
      designation_id !== "" &&
      !isNaN(Number(designation_id)) &&
      Number(designation_id) > 0
        ? Number(designation_id)
        : null;

    const data = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
      request_type,
      normalizedDepartmentId,
      normalizedDesignationId
    );

    const isGlobal =
      data.length > 0 &&
      data[0].department_id === null &&
      data[0].designation_id === null;

    return res.status(200).send({
      success: true,
      data,
      meta: {
        request_type,
        department_id: normalizedDepartmentId,
        designation_id: normalizedDesignationId,
        is_global_workflow: isGlobal,
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
const getAllApproverWorkFlow = async (req, res) => {
  try {
    const { request_type } = req.query;

    if (!request_type) {
      return res.status(400).send({
        success: false,
        message: "Request type is required",
      });
    }

    const data = await approvalWorkFlowModel.getAllApproverWorkFlow(
      request_type
    );

    return res.status(200).send({
      success: true,
      data,
      meta: {
        request_type,
        is_global_workflow: false,
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
    const { request_type, department_id, designation_id } = req.query;

    if (!request_type) {
      return res.status(400).json({
        success: false,
        message: "Request type is required",
      });
    }

    const workflows =
      await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
        request_type,
        department_id,
        designation_id
      );

    const workflowType =
      workflows.length > 0 &&
      workflows[0].department_id === null &&
      workflows[0].designation_id === null
        ? "global"
        : workflows.length > 0 && workflows[0].department_id
        ? "department-specific"
        : "designation-specific";

    return res.status(200).json({
      success: true,
      data: workflows,
      meta: {
        request_type,
        department_id: department_id || null,
        designation_id: designation_id || null,
        workflow_type: workflowType,
        total_steps: workflows.length,
        message: department_id
          ? `Workflow for ${request_type} in department ${department_id}${
              workflowType === "global" ? " (using global fallback)" : ""
            }`
          : designation_id
          ? `Workflow for ${request_type} for designation ${designation_id}${
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
      designations: [
        ...new Set(
          summary.data
            .filter((w) => w.designation_id)
            .map((w) => w.designation_name)
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

    const { prisma } = require("../../utils/prismaProxy.js");

    const requester = await prisma.hrms_d_employee.findUnique({
      where: { id: requester_id },
      select: {
        department_id: true,
        designation_id: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
        hrms_employee_designation: {
          select: { designation_name: true },
        },
      },
    });

    if (!requester) {
      return res.status(404).json({
        success: false,
        message: "Requester not found",
      });
    }

    let workflows = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
      request_type,
      requester.department_id,
      null
    );

    let workflowType = "department-specific";

    if (workflows.length === 0 && requester.designation_id) {
      workflows = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
        request_type,
        null,
        requester.designation_id
      );
      workflowType = "designation-specific";
    }

    if (workflows.length === 0) {
      workflows = await approvalWorkFlowModel.getAllApprovalWorkFlowByRequest(
        request_type,
        null,
        null
      );
      workflowType = "global";
    }

    const hasWorkflow = workflows.length > 0;

    return res.status(200).json({
      success: true,
      data: {
        has_workflow: hasWorkflow,
        workflow_type: workflowType,
        requester_department:
          requester.hrms_employee_department?.department_name ||
          "No Department",
        requester_designation:
          requester.hrms_employee_designation?.designation_name ||
          "No Designation",
        total_approval_steps: workflows.length,
        approvers: workflows.map((w, index) => ({
          sequence: index + 1,
          approver: w.approval_work_approver?.full_name,
          department:
            w.approval_work_approver?.hrms_employee_department?.department_name,
          designation:
            w.approval_work_approver?.hrms_employee_designation
              ?.designation_name,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDesignationsWithWorkflows = async (req, res, next) => {
  try {
    const { requestType } = req.params;

    const designations =
      await approvalWorkFlowModel.getDesignationsWithWorkflows(requestType);

    return res.status(200).json({
      success: true,
      data: designations,
      meta: {
        request_type: requestType,
        total_designations: designations.length,
        has_global: designations.some((d) => d.is_global),
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
  getDesignationsWithWorkflows,
  getAllApproverWorkFlow,
};
