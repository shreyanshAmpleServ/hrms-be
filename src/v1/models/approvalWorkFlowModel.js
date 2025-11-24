// const { prisma } = require("../../utils/prismaProxy.js");
// const CustomError = require("../../utils/CustomError");
//

// const serializeApprovalWorkFlowData = (data) => ({
//   request_type: data.request_type || "",
//   sequence: data.sequence ? Number(data.sequence) : 1,
//   approver_id: Number(data.approver_id),
//   department_id: data.department_id ? Number(data.department_id) : null,
//   header_approval_type: data.header_approval_type || "",
//   header_designation_id: data.header_designation_id
//     ? Number(data.header_designation_id)
//     : null,
//   remarks: data.remarks || "",
//   is_active: data.is_active || "Y",
// });

// // const createApprovalWorkFlow = async (dataArray) => {
// //   try {
// //     if (!Array.isArray(dataArray)) {
// //       throw new CustomError("Input must be an array of data objects", 400);
// //     }

// //     const result = await prisma.hrms_d_approval_work_flow.createMany({
// //       data: dataArray,
// //       // skipDuplicates: true,
// //     });
// //     const results = [];

// //     for (const data of dataArray) {
// //       const approver = await prisma.hrms_d_employee.findUnique({
// //         where: { id: Number(data.approver_id) },
// //         select: {
// //           id: true,
// //           full_name: true,
// //           department_id: true,
// //           hrms_employee_department: {
// //             select: { department_name: true },
// //           },
// //         },
// //       });

// //       if (!approver) {
// //         throw new CustomError(
// //           `Approver with ID ${data.approver_id} not found`,
// //           400
// //         );
// //       }

// //       if (
// //         data.department_id &&
// //         approver.department_id !== Number(data.department_id)
// //       ) {
// //         const department = await prisma.hrms_m_department_master.findUnique({
// //           where: { id: Number(data.department_id) },
// //           select: { department_name: true },
// //         });

// //         throw new CustomError(
// //           `Approver ${approver.full_name} (${approver.hrms_employee_department?.department_name}) does not belong to ${department?.department_name} department`,
// //           400
// //         );
// //       }

// //       const result = await prisma.hrms_d_approval_work_flow.create({
// //         data: {
// //           ...serializeApprovalWorkFlowData(data),
// //           createdby: data.createdby || 1,
// //           createdate: new Date(),
// //           log_inst: data.log_inst ? Number(data.log_inst) : 1,
// //         },
// //         include: {
// //           approval_work_approver: {
// //             select: {
// //               id: true,
// //               employee_code: true,
// //               full_name: true,
// //               hrms_employee_department: {
// //                 select: {
// //                   id: true,
// //                   department_name: true,
// //                 },
// //               },
// //             },
// //           },
// //           approval_work_department: {
// //             select: {
// //               id: true,
// //               department_name: true,
// //             },
// //           },
// //         },
// //       });

// //       console.log(
// //         ` Created ${
// //           data.department_id ? "Department-Specific" : "Global"
// //         } workflow: ${data.request_type} → ${approver.full_name}`
// //       );
// //       results.push(result);
// //     }

// //     return results;
// //   } catch (error) {
// //     throw new CustomError(`${error.message}`, 500);
// //   }
// // };

// const createApprovalWorkFlow = async (dataArray) => {
//   try {
//     if (!Array.isArray(dataArray)) {
//       throw new CustomError("Input must be an array of data objects", 400);
//     }

//     const serializedData = dataArray.map((data) => ({
//       ...serializeApprovalWorkFlowData(data),
//       createdby: data.createdby || 1,
//       createdate: new Date(),
//       log_inst: data.log_inst ? Number(data.log_inst) : 1,
//     }));

//     // Validate approvers and departments BEFORE creating
//     for (const data of dataArray) {
//       const approver = await prisma.hrms_d_employee.findUnique({
//         where: { id: Number(data.approver_id) },
//         select: {
//           id: true,
//           full_name: true,
//           department_id: true,
//           hrms_employee_department: {
//             select: { department_name: true },
//           },
//         },
//       });

//       if (!approver) {
//         throw new CustomError(
//           `Approver with ID ${data.approver_id} not found`,
//           400
//         );
//       }

//       if (
//         data.department_id &&
//         approver.department_id !== Number(data.department_id)
//       ) {
//         const department = await prisma.hrms_m_department_master.findUnique({
//           where: { id: Number(data.department_id) },
//           select: { department_name: true },
//         });

//         throw new CustomError(
//           `Approver ${approver.full_name} (${approver.hrms_employee_department?.department_name}) does not belong to ${department?.department_name} department`,
//           400
//         );
//       }
//     }

//     const result = await prisma.hrms_d_approval_work_flow.createMany({
//       data: serializedData,
//     });

//     // Fetch and return created records with relations
//     const createdWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
//       where: {
//         request_type: dataArray[0].request_type,
//       },
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//         approval_work_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//       orderBy: { createdate: "desc" },
//       take: dataArray.length,
//     });

//     return createdWorkflows;
//   } catch (error) {
//     throw new CustomError(`${error.message}`, 500);
//   }
// };

// const findApprovalWorkFlow = async (id) => {
//   try {
//     const reqData = await prisma.hrms_d_approval_work_flow.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//         approval_work_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//     });
//     if (!reqData) {
//       throw new CustomError("Approval workflow not found", 404);
//     }
//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error finding approval workflow by ID: ${error.message}`,
//       503
//     );
//   }
// };

// const updateApprovalWorkFlow = async (id, data) => {
//   try {
//     if (!id || isNaN(Number(id))) {
//       throw new CustomError("Invalid or missing ID for update", 400);
//     }

//     if (data.approver_id) {
//       const approver = await prisma.hrms_d_employee.findUnique({
//         where: { id: Number(data.approver_id) },
//         select: {
//           department_id: true,
//           full_name: true,
//           hrms_employee_department: {
//             select: { department_name: true },
//           },
//         },
//       });

//       if (!approver) {
//         throw new CustomError(
//           `Approver with ID ${data.approver_id} not found`,
//           400
//         );
//       }

//       if (
//         data.department_id &&
//         approver.department_id !== Number(data.department_id)
//       ) {
//         throw new CustomError(
//           `Approver ${approver.full_name} does not belong to the specified department`,
//           400
//         );
//       }
//     }

//     const updatedEntry = await prisma.hrms_d_approval_work_flow.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializeApprovalWorkFlowData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//             profile_pic: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//         approval_work_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//     });

//     return updatedEntry;
//   } catch (error) {
//     throw new CustomError(
//       `Error updating approval workflow: ${error.message}`,
//       500
//     );
//   }
// };

// const deleteApprovalWorkFlow = async (requestType) => {
//   try {
//     const result = await prisma.hrms_d_approval_work_flow.deleteMany({
//       where: { request_type: requestType },
//     });
//     console.log(` Deleted ${result.count} workflows for ${requestType}`);
//   } catch (error) {
//     throw new CustomError(
//       `Error deleting approval workflow: ${error.message}`,
//       500
//     );
//   }
// };

// const deleteApprovalWorkFlows = async (ids) => {
//   try {
//     const result = await prisma.hrms_d_approval_work_flow.deleteMany({
//       where: { id: { in: ids } },
//     });
//     console.log(` Deleted ${result.count} workflows by IDs`);
//   } catch (error) {
//     throw new CustomError(
//       `Error deleting approval workflows: ${error.message}`,
//       500
//     );
//   }
// };

// const getAllApprovalWorkFlow = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;

//     const filters = {};

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = { gte: start, lte: end };
//       }
//     }

//     const workflows = await prisma.hrms_d_approval_work_flow.findMany({
//       where: filters,
//       orderBy: [
//         { request_type: "asc" },
//         { department_id: "asc" },
//         { sequence: "asc" },
//       ],
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//         approval_work_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//     });

//     const grouped = {};
//     for (const wf of workflows) {
//       const type = wf.request_type;

//       if (!grouped[type]) {
//         grouped[type] = {
//           request_type: type,
//           departments: [],
//           no_of_approvers: 0,
//           is_active: wf.is_active,
//           request_approval_request: [],
//         };
//       }

//       const deptName =
//         wf.approval_work_department?.department_name ||
//         "Global (All Departments)";

//       if (!grouped[type].departments.some((d) => d.id === wf.department_id)) {
//         grouped[type].departments.push({
//           id: wf.department_id,
//           name: deptName,
//           is_global: wf.department_id === null,
//         });
//       }

//       grouped[type].request_approval_request.push({
//         id: wf.id,
//         sequence: wf.sequence,
//         approver_id: wf.approver_id,
//         department_id: wf.department_id,
//         is_active: wf.is_active,
//         createdate: wf.createdate,
//         createdby: wf.createdby,
//         updatedate: wf.updatedate,
//         updatedby: wf.updatedby,
//         log_inst: wf.log_inst,
//         approval_work_approver: {
//           id: wf.approval_work_approver?.id || null,
//           name: wf.approval_work_approver?.full_name || null,
//           employee_code: wf.approval_work_approver?.employee_code || null,
//           profile_pic: wf.approval_work_approver?.profile_pic || null,
//           department:
//             wf.approval_work_approver?.hrms_employee_department
//               ?.department_name || null,
//         },
//       });

//       grouped[type].no_of_approvers += 1;
//     }

//     const groupedArray = Object.values(grouped);

//     const totalCount = groupedArray.length;
//     const totalPages = Math.ceil(totalCount / size);
//     const paginatedData = groupedArray.slice((page - 1) * size, page * size);

//     return {
//       data: paginatedData,
//       currentPage: page,
//       size,
//       totalPages,
//       totalCount,
//       summary: {
//         total_workflows: totalCount,
//       },
//     };
//   } catch (error) {
//     throw new CustomError("Error retrieving approval workflows", 503);
//   }
// };

// const getAllApprovalWorkFlowByRequest = async (
//   request_type,
//   department_id = null
// ) => {
//   try {
//     let workflows;

//     if (department_id) {
//       workflows = await prisma.hrms_d_approval_work_flow.findMany({
//         where: {
//           request_type,
//           department_id: Number(department_id),
//           is_active: "Y",
//         },
//         orderBy: { sequence: "asc" },
//         include: {
//           approval_work_approver: {
//             select: {
//               id: true,
//               full_name: true,
//               employee_code: true,
//               profile_pic: true,
//               hrms_employee_department: {
//                 select: {
//                   id: true,
//                   department_name: true,
//                 },
//               },
//             },
//           },
//           approval_work_department: {
//             select: {
//               id: true,
//               department_name: true,
//             },
//           },
//         },
//       });

//       return workflows;
//     }

//     workflows = await prisma.hrms_d_approval_work_flow.findMany({
//       where: {
//         request_type,
//         department_id: null,
//         OR: [{ is_active: "Y" }, { is_active: null }],
//       },
//       orderBy: { sequence: "asc" },
//       include: {
//         approval_work_approver: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//             hrms_employee_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     return workflows;
//   } catch (error) {
//     throw new CustomError(
//       `Error fetching workflows for request_type '${request_type}': ${error.message}`,
//       500
//     );
//   }
// };

// const getDepartmentsWithWorkflows = async (request_type) => {
//   try {
//     const departments = await prisma.hrms_d_approval_work_flow.findMany({
//       where: {
//         request_type,
//         is_active: "Y",
//       },
//       select: {
//         department_id: true,
//         approval_work_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//       distinct: ["department_id"],
//     });

//     return departments.map((d) => ({
//       department_id: d.department_id,
//       department_name: d.department_id
//         ? d.approval_work_department?.department_name
//         : "Global (All Departments)",
//       is_global: d.department_id === null,
//     }));
//   } catch (error) {
//     throw new CustomError(
//       `Error fetching departments with workflows: ${error.message}`,
//       500
//     );
//   }
// };

// module.exports = {
//   createApprovalWorkFlow,
//   findApprovalWorkFlow,
//   updateApprovalWorkFlow,
//   deleteApprovalWorkFlow,
//   deleteApprovalWorkFlows,
//   getAllApprovalWorkFlow,
//   getAllApprovalWorkFlowByRequest,
//   getDepartmentsWithWorkflows,
// };

const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const serializeApprovalWorkFlowData = (data) => ({
  request_type: data.request_type || "",
  sequence: data.sequence ? Number(data.sequence) : 1,
  approver_id: Number(data.approver_id),
  department_id: data.department_id ? Number(data.department_id) : null,
  designation_id: data.designation_id ? Number(data.designation_id) : null,
  header_approval_type: data.header_approval_type || "",
  header_designation_id: data.header_designation_id
    ? Number(data.header_designation_id)
    : null,
  remarks: data.remarks || "",
  is_active: data.is_active || "Y",
});

// const createApprovalWorkFlow = async (dataArray) => {
//   try {
//     if (!Array.isArray(dataArray)) {
//       throw new CustomError("Input must be an array of data objects", 400);
//     }

//     const result = await prisma.hrms_d_approval_work_flow.createMany({
//       data: dataArray,
//       // skipDuplicates: true,
//     });
//     const results = [];

//     for (const data of dataArray) {
//       const approver = await prisma.hrms_d_employee.findUnique({
//         where: { id: Number(data.approver_id) },
//         select: {
//           id: true,
//           full_name: true,
//           department_id: true,
//           hrms_employee_department: {
//             select: { department_name: true },
//           },
//         },
//       });

//       if (!approver) {
//         throw new CustomError(
//           `Approver with ID ${data.approver_id} not found`,
//           400
//         );
//       }

//       if (
//         data.department_id &&
//         approver.department_id !== Number(data.department_id)
//       ) {
//         const department = await prisma.hrms_m_department_master.findUnique({
//           where: { id: Number(data.department_id) },
//           select: { department_name: true },
//         });

//         throw new CustomError(
//           `Approver ${approver.full_name} (${approver.hrms_employee_department?.department_name}) does not belong to ${department?.department_name} department`,
//           400
//         );
//       }

//       const result = await prisma.hrms_d_approval_work_flow.create({
//         data: {
//           ...serializeApprovalWorkFlowData(data),
//           createdby: data.createdby || 1,
//           createdate: new Date(),
//           log_inst: data.log_inst ? Number(data.log_inst) : 1,
//         },
//         include: {
//           approval_work_approver: {
//             select: {
//               id: true,
//               employee_code: true,
//               full_name: true,
//               hrms_employee_department: {
//                 select: {
//                   id: true,
//                   department_name: true,
//                 },
//               },
//             },
//           },
//           approval_work_department: {
//             select: {
//               id: true,
//               department_name: true,
//             },
//           },
//         },
//       });

//       console.log(
//         ` Created ${
//           data.department_id ? "Department-Specific" : "Global"
//         } workflow: ${data.request_type} → ${approver.full_name}`
//       );
//       results.push(result);
//     }

//     return results;
//   } catch (error) {
//     throw new CustomError(`${error.message}`, 500);
//   }
// };

const createApprovalWorkFlow = async (dataArray) => {
  try {
    if (!Array.isArray(dataArray)) {
      throw new CustomError("Input must be an array of data objects", 400);
    }

    const serializedData = dataArray.map((data) => ({
      ...serializeApprovalWorkFlowData(data),
      createdby: data.createdby || 1,
      createdate: new Date(),
      log_inst: data.log_inst ? Number(data.log_inst) : 1,
    }));

    for (const data of dataArray) {
      const approver = await prisma.hrms_d_employee.findUnique({
        where: { id: Number(data.approver_id) },
        select: {
          id: true,
          full_name: true,
          department_id: true,
          hrms_employee_department: {
            select: { department_name: true },
          },
        },
      });

      if (!approver) {
        throw new CustomError(
          `Approver with ID ${data.approver_id} not found`,
          400
        );
      }

      if (
        data.department_id &&
        approver.department_id !== Number(data.department_id)
      ) {
        const department = await prisma.hrms_m_department_master.findUnique({
          where: { id: Number(data.department_id) },
          select: { department_name: true },
        });

        throw new CustomError(
          `Approver ${approver.full_name} (${approver.hrms_employee_department?.department_name}) does not belong to ${department?.department_name} department`,
          400
        );
      }
    }

    const result = await prisma.hrms_d_approval_work_flow.createMany({
      data: serializedData,
    });

    console.log(` Created ${result.count} approval workflows`);

    const createdWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
      where: {
        request_type: dataArray[0].request_type,
      },
      include: {
        approval_work_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
      orderBy: { createdate: "desc" },
      take: dataArray.length,
    });

    return createdWorkflows;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

const findApprovalWorkFlow = async (id) => {
  try {
    const reqData = await prisma.hrms_d_approval_work_flow.findUnique({
      where: { id: parseInt(id) },
      include: {
        approval_work_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });
    if (!reqData) {
      throw new CustomError("Approval workflow not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding approval workflow by ID: ${error.message}`,
      503
    );
  }
};

const updateApprovalWorkFlow = async (id, data) => {
  try {
    if (!id || isNaN(Number(id))) {
      throw new CustomError("Invalid or missing ID for update", 400);
    }

    if (data.approver_id) {
      const approver = await prisma.hrms_d_employee.findUnique({
        where: { id: Number(data.approver_id) },
        select: {
          department_id: true,
          full_name: true,
          hrms_employee_department: {
            select: { department_name: true },
          },
        },
      });

      if (!approver) {
        throw new CustomError(
          `Approver with ID ${data.approver_id} not found`,
          400
        );
      }

      if (
        data.department_id &&
        approver.department_id !== Number(data.department_id)
      ) {
        throw new CustomError(
          `Approver ${approver.full_name} does not belong to the specified department`,
          400
        );
      }
    }

    const updatedEntry = await prisma.hrms_d_approval_work_flow.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeApprovalWorkFlowData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        approval_work_approver: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
            profile_pic: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

const deleteApprovalWorkFlow = async (requestType) => {
  try {
    const result = await prisma.hrms_d_approval_work_flow.deleteMany({
      where: { request_type: requestType },
    });
    console.log(` Deleted ${result.count} workflows for ${requestType}`);
  } catch (error) {
    throw new CustomError(
      `Error deleting approval workflow: ${error.message}`,
      500
    );
  }
};

const deleteApprovalWorkFlows = async (ids) => {
  try {
    const result = await prisma.hrms_d_approval_work_flow.deleteMany({
      where: { id: { in: ids } },
    });
    console.log(` Deleted ${result.count} workflows by IDs`);
  } catch (error) {
    throw new CustomError(
      `Error deleting approval workflows: ${error.message}`,
      500
    );
  }
};
const getAllApprovalWorkFlow = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;

    const filters = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const workflows = await prisma.hrms_d_approval_work_flow.findMany({
      where: filters,
      orderBy: [
        { request_type: "asc" },
        { department_id: "asc" },
        { sequence: "asc" },
      ],
      include: {
        approval_work_approver: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            profile_pic: true,
            hrms_employee_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
          },
        },
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });

    const grouped = {};
    for (const wf of workflows) {
      const type = wf.request_type;

      if (!grouped[type]) {
        grouped[type] = {
          request_type: type,
          departments: [],
          no_of_approvers: 0,
          is_active: wf.is_active,
          request_approval_request: [],
        };
      }

      const deptName =
        wf.approval_work_department?.department_name ||
        "Global (All Departments)";

      if (!grouped[type].departments.some((d) => d.id === wf.department_id)) {
        grouped[type].departments.push({
          id: wf.department_id,
          name: deptName,
          is_global: wf.department_id === null,
        });
      }

      grouped[type].request_approval_request.push({
        id: wf.id,
        sequence: wf.sequence,
        approver_id: wf.approver_id,
        department_id: wf.department_id,
        is_active: wf.is_active,
        createdate: wf.createdate,
        createdby: wf.createdby,
        updatedate: wf.updatedate,
        updatedby: wf.updatedby,
        log_inst: wf.log_inst,
        approval_work_approver: {
          id: wf.approval_work_approver?.id || null,
          name: wf.approval_work_approver?.full_name || null,
          employee_code: wf.approval_work_approver?.employee_code || null,
          profile_pic: wf.approval_work_approver?.profile_pic || null,
          department:
            wf.approval_work_approver?.hrms_employee_department
              ?.department_name || null,
        },
      });

      grouped[type].no_of_approvers += 1;
    }

    const groupedArray = Object.values(grouped);

    const totalCount = groupedArray.length;
    const totalPages = Math.ceil(totalCount / size);
    const paginatedData = groupedArray.slice((page - 1) * size, page * size);

    return {
      data: paginatedData,
      currentPage: page,
      size,
      totalPages,
      totalCount,
      summary: {
        total_workflows: totalCount,
      },
    };
  } catch (error) {
    throw new CustomError("Error retrieving approval workflows", 503);
  }
};

// const getAllApprovalWorkFlowByRequest = async (
//   request_type,
//   department_id = null,
//   designation_id = null
// ) => {
//   try {
//     const includeConfig = {
//       approval_work_approver: {
//         select: {
//           id: true,
//           full_name: true,
//           employee_code: true,
//           profile_pic: true,
//           hrms_employee_department: {
//             select: {
//               id: true,
//               department_name: true,
//             },
//           },
//           hrms_employee_designation: {
//             select: {
//               id: true,
//               designation_name: true,
//             },
//           },
//         },
//       },
//       approval_work_department: {
//         select: {
//           id: true,
//           department_name: true,
//         },
//       },
//       approval_work_flow_designation: {
//         select: {
//           id: true,
//           designation_name: true,
//         },
//       },
//     };

//     if (department_id) {
//       const workflows = await prisma.hrms_d_approval_work_flow.findMany({
//         where: {
//           request_type,
//           department_id: Number(department_id),
//           designation_id: null,
//           is_active: "Y",
//         },
//         orderBy: { sequence: "asc" },
//         include: includeConfig,
//       });
//       return workflows;
//     }

//     if (designation_id) {
//       const workflows = await prisma.hrms_d_approval_work_flow.findMany({
//         where: {
//           request_type,
//           designation_id: Number(designation_id),
//           department_id: null,
//           is_active: "Y",
//         },
//         orderBy: { sequence: "asc" },
//         include: includeConfig,
//       });
//       return workflows;
//     }

//     const workflows = await prisma.hrms_d_approval_work_flow.findMany({
//       where: {
//         request_type,
//         department_id: null,
//         designation_id: null,
//         OR: [{ is_active: "Y" }, { is_active: null }],
//       },
//       orderBy: { sequence: "asc" },
//       include: includeConfig,
//     });

//     return workflows;
//   } catch (error) {
//     throw new CustomError(
//       `Error fetching workflows for request_type '${request_type}': ${error.message}`,
//       500
//     );
//   }
// };

const getAllApprovalWorkFlowByRequest = async (
  request_type,
  department_id = null,
  designation_id = null
) => {
  try {
    const includeConfig = {
      approval_work_approver: {
        select: {
          id: true,
          full_name: true,
          employee_code: true,
          profile_pic: true,
          hrms_employee_department: {
            select: {
              id: true,
              department_name: true,
            },
          },
          hrms_employee_designation: {
            select: {
              id: true,
              designation_name: true,
            },
          },
        },
      },
      approval_work_department: {
        select: {
          id: true,
          department_name: true,
        },
      },
      approval_work_flow_designation: {
        select: {
          id: true,
          designation_name: true,
        },
      },
    };

    if (department_id && designation_id) {
      const results = [];
      const seenApprovers = new Set();

      const deptWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          department_id: Number(department_id),
          designation_id: null,
          is_active: "Y",
        },
        orderBy: { sequence: "asc" },
        include: includeConfig,
      });

      deptWorkflows.forEach((wf) => {
        results.push(wf);
        seenApprovers.add(wf.approver_id);
      });

      const designWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          designation_id: Number(designation_id),
          department_id: null,
          is_active: "Y",
        },
        orderBy: { sequence: "asc" },
        include: includeConfig,
      });

      designWorkflows.forEach((wf) => {
        if (!seenApprovers.has(wf.approver_id)) {
          results.push(wf);
          seenApprovers.add(wf.approver_id);
        }
      });

      const globalWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          department_id: null,
          designation_id: null,
          OR: [{ is_active: "Y" }, { is_active: null }],
        },
        orderBy: { sequence: "asc" },
        include: includeConfig,
      });

      globalWorkflows.forEach((wf) => {
        if (!seenApprovers.has(wf.approver_id)) {
          results.push(wf);
          seenApprovers.add(wf.approver_id);
        }
      });

      results.sort((a, b) => {
        if (a.sequence !== b.sequence) {
          return a.sequence - b.sequence;
        }
        return new Date(b.createdate) - new Date(a.createdate);
      });

      return results;
    }

    if (department_id) {
      const results = [];
      const seenApprovers = new Set();

      const deptWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          department_id: Number(department_id),
          designation_id: null,
          is_active: "Y",
        },
        orderBy: { sequence: "asc" },
        include: includeConfig,
      });

      deptWorkflows.forEach((wf) => {
        results.push(wf);
        seenApprovers.add(wf.approver_id);
      });

      const globalWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          department_id: null,
          designation_id: null,
          OR: [{ is_active: "Y" }, { is_active: null }],
        },
        orderBy: { sequence: "asc" },
        include: includeConfig,
      });

      globalWorkflows.forEach((wf) => {
        if (!seenApprovers.has(wf.approver_id)) {
          results.push(wf);
          seenApprovers.add(wf.approver_id);
        }
      });

      results.sort((a, b) => {
        if (a.sequence !== b.sequence) {
          return a.sequence - b.sequence;
        }
        return new Date(b.createdate) - new Date(a.createdate);
      });

      return results;
    }

    if (designation_id) {
      const results = [];
      const seenApprovers = new Set();

      const designWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          designation_id: Number(designation_id),
          department_id: null,
          is_active: "Y",
        },
        orderBy: { sequence: "asc" },
        include: includeConfig,
      });

      designWorkflows.forEach((wf) => {
        results.push(wf);
        seenApprovers.add(wf.approver_id);
      });

      const globalWorkflows = await prisma.hrms_d_approval_work_flow.findMany({
        where: {
          request_type,
          department_id: null,
          designation_id: null,
          OR: [{ is_active: "Y" }, { is_active: null }],
        },
        orderBy: { sequence: "asc" },
        include: includeConfig,
      });

      globalWorkflows.forEach((wf) => {
        if (!seenApprovers.has(wf.approver_id)) {
          results.push(wf);
          seenApprovers.add(wf.approver_id);
        }
      });

      results.sort((a, b) => {
        if (a.sequence !== b.sequence) {
          return a.sequence - b.sequence;
        }
        return new Date(b.createdate) - new Date(a.createdate);
      });

      return results;
    }

    const workflows = await prisma.hrms_d_approval_work_flow.findMany({
      where: {
        request_type,
        department_id: null,
        designation_id: null,
        OR: [{ is_active: "Y" }, { is_active: null }],
      },
      orderBy: { sequence: "asc" },
      include: includeConfig,
    });

    return workflows;
  } catch (error) {
    throw new CustomError(
      `Error fetching workflows for request_type '${request_type}': ${error.message}`,
      500
    );
  }
};

const getDepartmentsWithWorkflows = async (request_type) => {
  try {
    const departments = await prisma.hrms_d_approval_work_flow.findMany({
      where: {
        request_type,
        is_active: "Y",
      },
      select: {
        department_id: true,
        approval_work_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
      distinct: ["department_id"],
    });

    return departments.map((d) => ({
      department_id: d.department_id,
      department_name: d.department_id
        ? d.approval_work_department?.department_name
        : "Global (All Departments)",
      is_global: d.department_id === null,
    }));
  } catch (error) {
    throw new CustomError(
      `Error fetching departments with workflows: ${error.message}`,
      500
    );
  }
};
const getDesignationsWithWorkflows = async (request_type) => {
  try {
    const designations = await prisma.hrms_d_approval_work_flow.findMany({
      where: {
        request_type,
        is_active: "Y",
      },
      select: {
        designation_id: true,
        approval_work_flow_designation: {
          select: {
            id: true,
            designation_name: true,
          },
        },
      },
      distinct: ["designation_id"],
    });

    return designations.map((d) => ({
      designation_id: d.designation_id,
      designation_name: d.designation_id
        ? d.approval_work_flow_designation?.designation_name
        : "Global (All Designations)",
      is_global: d.designation_id === null,
    }));
  } catch (error) {
    throw new CustomError(
      `Error fetching designations with workflows: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createApprovalWorkFlow,
  findApprovalWorkFlow,
  updateApprovalWorkFlow,
  deleteApprovalWorkFlow,
  deleteApprovalWorkFlows,
  getAllApprovalWorkFlow,
  getAllApprovalWorkFlowByRequest,
  getDepartmentsWithWorkflows,
  getDesignationsWithWorkflows,
};
