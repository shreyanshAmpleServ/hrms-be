// const { PrismaClient } = require("@prisma/client");
// const { evaluateConditions } = require("./conditionEvaluator");
// const { executeActions } = require("./actionExecutor");
// const logger = require("./../Comman/logger");

// const prisma = new PrismaClient();

// const runWorkflow = async (workflowId, workflow) => {
//   const log = await prisma.hrms_d_alert_log.create({
//     data: {
//       workflow_id: workflowId,
//       status: "RUNNING",
//       details: JSON.stringify({ started_at: new Date().toISOString() }),
//     },
//   });

//   try {
//     const employees = await getTargetEmployees(workflow);
//     const eligible = employees.filter((emp) =>
//       evaluateConditions(emp, workflow.conditions)
//     );

//     console.log(` ${eligible.length} employees meet conditions`);

//     let actionResults = [];
//     if (eligible.length > 0) {
//       actionResults = await executeActions(eligible, workflow.actions);
//       console.log(
//         ` Actions executed for ${eligible.length} eligible employees`
//       );
//     } else {
//       console.log(` No eligible employees found, skipping actions`);
//       actionResults = [
//         { type: "Email", status: "SKIPPED", reason: "No eligible employees" },
//       ];
//     }

//     await prisma.hrms_d_alert_log.update({
//       where: { id: log.id },
//       data: {
//         status: "COMPLETED",
//         details: JSON.stringify({
//           ...JSON.parse(log.details || "{}"),
//           completed_at: new Date().toISOString(),
//           employees: eligible.map((e) => e.id),
//           eligible_count: eligible.length,
//           action_results: actionResults,
//         }),
//       },
//     });
//   } catch (err) {
//     await prisma.hrms_d_alert_log.update({
//       where: { id: log.id },
//       data: {
//         status: "FAILED",
//         details: JSON.stringify({
//           ...JSON.parse(log.details || "{}"),
//           completed_at: new Date().toISOString(),
//           error_message: err.message,
//         }),
//       },
//     });
//     logger.error(`Workflow ${workflowId} failed: ${err.message}`);
//     throw err;
//   }
// };

// async function getTargetEmployees(workflow) {
//   let where = { status: "Active" };

//   let include = {
//     user_employee: {
//       include: {
//         hrms_d_user_role: {
//           include: {
//             hrms_m_role: true,
//           },
//         },
//       },
//     },
//     w_employee: true,
//     probation_employee: true,
//     contracted_employee: true,
//     hrms_d_training_session: true,
//     hrms_employee_designation: true,
//     hrms_employee_department: true,
//   };

//   if (workflow.target_type === "Role" && workflow.target) {
//     const roles = workflow.target.split(",").map((r) => r.trim());

//     const employees = await prisma.hrms_d_employee.findMany({
//       include,
//       where: {
//         status: "Active",
//         user_employee: {
//           some: {
//             hrms_d_user_role: {
//               some: {
//                 hrms_m_role: {
//                   role_name: { in: roles },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     console.log(` Found ${employees.length} employees with roles: ${roles}`);
//     employees.forEach((emp) => {
//       console.log(` ${emp.full_name} (ID: ${emp.id})`);
//       console.log(`    Direct probation_end_date: ${emp.probation_end_date}`);
//       console.log(`    w_employee records: ${emp.w_employee?.length || 0}`);
//       console.log(
//         `    contracted_employee records: ${
//           emp.contracted_employee?.length || 0
//         }`
//       );

//       if (emp.w_employee?.length > 0) {
//         emp.w_employee.forEach((review, index) => {
//           console.log(
//             `    Review ${index + 1}: probation_end_date = ${
//               review.probation_end_date
//             }`
//           );
//         });
//       }
//     });

//     return employees;
//   }

//   return await prisma.hrms_d_employee.findMany({ where, include });
// }

// module.exports = {
//   runWorkflow,
//   getTargetEmployees,
// };
const { PrismaClient } = require("@prisma/client");
const { evaluateConditions } = require("./conditionEvaluator");
const { executeActions } = require("./actionExecutor");
const logger = require("./../Comman/logger");

const prisma = new PrismaClient();

const runWorkflow = async (workflowId, workflow) => {
  const log = await prisma.hrms_d_alert_log.create({
    data: {
      workflow_id: workflowId,
      status: "RUNNING",
      details: JSON.stringify({ started_at: new Date().toISOString() }),
    },
  });

  try {
    const employees = await getTargetEmployees(workflow);
    console.log(
      ` Found ${employees.length} target employees for workflow ${workflowId}`
    );

    const eligible = employees.filter((emp) => {
      const isEligible = evaluateConditions(emp, workflow.conditions);
      console.log(
        `   Employee: ${emp.full_name} (${emp.employee_code}) - Eligible: ${isEligible}`
      );
      return isEligible;
    });

    console.log(
      `${eligible.length} employees are eligible for workflow ${workflowId}`
    );
    if (eligible.length > 0) {
      console.log(
        `   Eligible employees: ${eligible
          .map((e) => `${e.full_name} (${e.employee_code})`)
          .join(", ")}`
      );
    }

    const actionResults = await executeActions(
      eligible,
      workflow.actions,
      workflow.conditions
    );

    await prisma.hrms_d_alert_log.update({
      where: { id: log.id },
      data: {
        status: "COMPLETED",
        details: JSON.stringify({
          started_at: JSON.parse(log.details || "{}").started_at,
          completed_at: new Date().toISOString(),
          employees: eligible.map((e) => ({
            id: e.id,
            name: e.full_name,
            code: e.employee_code,
          })),
          action_results: actionResults,
        }),
      },
    });
  } catch (err) {
    await prisma.hrms_d_alert_log.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        details: JSON.stringify({
          started_at: JSON.parse(log.details || "{}").started_at,
          completed_at: new Date().toISOString(),
          error_message: err.message,
        }),
      },
    });
    logger.error(`Workflow ${workflowId} failed: ${err.message}`);
    throw err;
  }
};

// async function getTargetEmployees(workflow) {
//   const baseWhere = { status: "Active" };

//   console.log(
//     ` Target Type: ${workflow.target_type}, Target: ${workflow.target}`
//   );

//   const commonIncludes = {
//     user_employee: {
//       include: {
//         hrms_d_user_role: {
//           include: {
//             hrms_m_role: true,
//           },
//         },
//       },
//     },
//     hrms_employee_designation: true,
//     hrms_employee_department: true,

//     contracted_employee: {
//       orderBy: { contract_end_date: "desc" },
//       take: 1,
//       select: {
//         id: true,
//         contract_start_date: true,
//         contract_end_date: true,
//         contract_type: true,
//         description: true,
//       },
//     },

//     hrms_daily_attendance_employee: {
//       where: {
//         attendance_date: {
//           gte: new Date(new Date().setHours(0, 0, 0, 0)),
//           lte: new Date(new Date().setHours(23, 59, 59, 999)),
//         },
//       },
//       orderBy: { attendance_date: "desc" },
//       take: 1,
//     },

//     w_employee: {
//       orderBy: { createdate: "desc" },
//       take: 1,
//     },

//     hrms_d_training_session: {
//       orderBy: { createdate: "desc" },
//       take: 1,
//     },
//   };

//   if (workflow.target_type === "Role" && workflow.target) {
//     const roles = workflow.target.split(",").map((r) => r.trim());
//     console.log(` Targeting roles by name: ${roles.join(", ")}`);

//     const employees = await prisma.hrms_d_employee.findMany({
//       include: commonIncludes,
//       where: {
//         ...baseWhere,
//         user_employee: {
//           some: {
//             hrms_d_user_role: {
//               some: {
//                 hrms_m_role: {
//                   role_name: { in: roles },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     console.log(` Found ${employees.length} employees with target roles`);
//     return employees;
//   } else if (workflow.target_type === "Department" && workflow.target) {
//     const departmentIds = workflow.target
//       .split(",")
//       .map((id) => parseInt(id.trim()));
//     console.log(` Targeting departments by ID: ${departmentIds.join(", ")}`);

//     const employees = await prisma.hrms_d_employee.findMany({
//       include: commonIncludes,
//       where: {
//         ...baseWhere,
//         department_id: { in: departmentIds },
//       },
//     });

//     console.log(` Found ${employees.length} employees in target departments`);
//     return employees;
//   } else if (workflow.target_type === "Designation" && workflow.target) {
//     const designationIds = workflow.target
//       .split(",")
//       .map((id) => parseInt(id.trim()));
//     console.log(` Targeting designations by ID: ${designationIds.join(", ")}`);

//     const employees = await prisma.hrms_d_employee.findMany({
//       include: commonIncludes,
//       where: {
//         ...baseWhere,
//         designation_id: { in: designationIds },
//       },
//     });

//     console.log(
//       ` Found ${employees.length} employees with target designations`
//     );
//     return employees;
//   } else {
//     console.log(` No specific targeting - getting all active employees`);
//     const employees = await prisma.hrms_d_employee.findMany({
//       include: commonIncludes,
//       where: baseWhere,
//     });

//     console.log(` Found ${employees.length} total active employees`);
//     return employees;
//   }
// }

async function getTargetEmployees(workflow) {
  const baseWhere = { status: "Active" };

  console.log(
    ` Target Type: ${workflow.target_type}, Target: ${workflow.target}`
  );

  const commonIncludes = {
    user_employee: {
      include: {
        hrms_d_user_role: {
          include: {
            hrms_m_role: true,
          },
        },
      },
    },
    hrms_employee_designation: true,
    hrms_employee_department: true,

    w_employee: {
      orderBy: { createdate: "desc" },
      take: 1,
    },

    contracted_employee: {
      orderBy: { contract_end_date: "desc" },
      take: 5,
    },

    hrms_daily_attendance_employee: {
      where: {
        attendance_date: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
      orderBy: { attendance_date: "desc" },
      take: 10,
    },
  };

  if (workflow.target_type === "Role" && workflow.target) {
    const roles = workflow.target.split(",").map((r) => r.trim());
    console.log(` Targeting roles by name: ${roles.join(", ")}`);

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        user_employee: {
          some: {
            hrms_d_user_role: {
              some: {
                hrms_m_role: {
                  role_name: { in: roles },
                },
              },
            },
          },
        },
      },
    });

    console.log(` Found ${employees.length} employees with target roles`);
    return employees;
  } else if (workflow.target_type === "Department" && workflow.target) {
    const departmentIds = workflow.target
      .split(",")
      .map((d) => parseInt(d.trim()));
    console.log(` Targeting departments by ID: ${departmentIds.join(", ")}`);

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        department_id: { in: departmentIds },
      },
    });

    console.log(` Found ${employees.length} employees in target departments`);
    return employees;
  } else if (workflow.target_type === "Designation" && workflow.target) {
    const designationIds = workflow.target
      .split(",")
      .map((d) => parseInt(d.trim()));
    console.log(` Targeting designations by ID: ${designationIds.join(", ")}`);

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        designation_id: { in: designationIds },
      },
    });

    console.log(` Found ${employees.length} employees in target designations`);
    return employees;
  } else if (workflow.target_type === "Employee" && workflow.target) {
    const employeeIds = workflow.target
      .split(",")
      .map((e) => parseInt(e.trim()));
    console.log(
      ` Targeting individual employees by ID: ${employeeIds.join(", ")}`
    );

    const employees = await prisma.hrms_d_employee.findMany({
      include: commonIncludes,
      where: {
        ...baseWhere,
        id: { in: employeeIds },
      },
    });

    console.log(` Found ${employees.length} individual target employees`);
    return employees;
  }

  return await prisma.hrms_d_employee.findMany({
    include: commonIncludes,
    where: baseWhere,
  });
}

module.exports = {
  runWorkflow,
};
