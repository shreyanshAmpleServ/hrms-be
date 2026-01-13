/**
 * @fileoverview HRMS Cron Jobs Scheduler
 * @description Handles scheduled health check tasks and contract expiry alerts for the HRMS system
 */

const cron = require("node-cron");
const logger = require("./Comman/logger");
const moment = require("moment-timezone");
const { prisma } = require("./utils/prismaProxy.js");
const { getPrismaClient } = require("./config/db.js");

const {
  contractExpiryAlertFn,
  getAllEmploymentContract,
} = require("./v1/models/employmentContractModel");
const { gt } = require("zod/v4");

const dateISO = (d = 0) =>
  moment.tz("Asia/Kolkata").add(d, "day").format("YYYY-MM-DD");

const asDateObj = (iso) => new Date(`${iso}T00:00:00.000Z`);

const dailyAttendanceInitializer = async () => {
  try {
    const tomorrow = asDateObj(dateISO(1));
    const activeEmployees = await prisma.hrms_d_employee.findMany({
      where: { status: { in: ["Active", "Probation", "Notice Period"] } },
      select: { id: true },
    });

    if (!activeEmployees.length) return;

    const existing = await prisma.hrms_d_daily_attendance_entry.findMany({
      where: {
        attendance_date: tomorrow,
        employee_id: { in: activeEmployees.map((e) => e.id) },
      },
      select: { employee_id: true },
    });

    const haveRow = new Set(existing.map((r) => r.employee_id));
    const rows = activeEmployees
      .filter((e) => !haveRow.has(e.id))
      .map((e) => ({
        employee_id: e.id,
        attendance_date: tomorrow,
        status: "absent",
        createdby: 1,
        createdate: new Date(),
        log_inst: 1,
      }));

    if (rows.length)
      await prisma.hrms_d_daily_attendance_entry.createMany({
        data: rows,
        skipDuplicates: true,
      });

    logger.info(
      `Midnight job → inserted ${rows.length} rows for ${dateISO(1)}`
    );
  } catch (err) {
    logger.error("Midnight job failed", err);
  }
};

/**
 * @description Cron schedule format notation:
 * ┌────────────── second (optional)
 * │ ┌──────────── minute (0-59)
 * │ │ ┌────────── hour (0-23)
 * │ │ │ ┌──────── day of month (1-31)
 * │ │ │ │ ┌────── month (1-12)
 * │ │ │ │ │ ┌──── day of week (0-7, Sunday=0 or 7)
 * │ │ │ │ │ │
 * * * * * * *
 *
 * Common patterns:
 * - "* * * * *"     - Every minute
 * - "0 * * * *"     - Every hour at minute 0
 * - "0 8 * * *"     - Every day at 8:00 AM
 * - "0 17 * * 5"    - Every Friday at 5:00 PM
 * - "30 9 1 * *"    - 1st of every month at 9:30 AM
 * - "0 9-17 * * 1-5" - Every hour from 9 AM to 5 PM, Monday to Friday
 */

/**
 * Performs system health check operations
 * @description Executes health check and logs the results with timestamp
 * @returns {void}
 */
const HealthCheckUp = () => {
  try {
    logger.info(
      "Health Check Task Started at " + moment(new Date()).calendar()
    );
    logger.info(
      "Health Check Task Completed at " + moment(new Date()).calendar()
    );
  } catch (error) {
    logger.error("Failed to perform Health Check:", error);
  }
};

/**
 * Checks for contracts expiring soon and sends alerts
 * @description Identifies contracts expiring in the next 30, 15, and 7 days and sends email notifications to employees
 * @async
 * @returns {Promise<void>}
 */
const contractExpiryAlert = async () => {
  try {
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    logger.info(`Contract Expiry Alert Task Started at ${currentTime}`);

    await checkExpiringContracts(30);
    await checkExpiringContracts(15);
    await checkExpiringContracts(7);
    await checkExpiringContracts(1);

    logger.info(
      `Contract Expiry Alert Task Completed at ${moment().format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
  } catch (error) {
    logger.error("Failed to perform Contract Expiry Alert:", error);
  }
};

/**
 * Finds contracts expiring in specified number of days and sends alerts
 * @description Queries database for contracts expiring within the given timeframe and processes alert notifications
 * @async
 * @param {number} days - Number of days before expiry to check
 * @returns {Promise<void>}
 */
const checkExpiringContracts = async (days) => {
  try {
    const targetDate = moment().add(days, "days");
    const startDate = targetDate.startOf("day").format("YYYY-MM-DD");

    const contractsData = await getAllEmploymentContract(
      null,
      1,
      1000,
      null,
      null,
      null
    );

    const expiringContracts = contractsData.data.filter((contract) => {
      const contractEndDate = moment(contract.contract_end_date).format(
        "YYYY-MM-DD"
      );
      return contractEndDate === startDate;
    });

    if (expiringContracts.length > 0) {
      logger.warn(
        `Found ${expiringContracts.length} contract(s) expiring in ${days} days (${startDate})`
      );

      for (const contract of expiringContracts) {
        await sendContractExpiryAlert(contract, days);
      }

      expiringContracts.forEach((contract) => {
        logger.warn(
          `Contract Expiring - Employee: ${contract.contracted_candidate?.full_name}, Contract ID: ${contract.id}, End Date: ${contract.contract_end_date}`
        );
      });
    } else {
      logger.info(`No contracts expiring in ${days} days (${startDate})`);
    }
  } catch (error) {
    logger.error(`Error checking contracts expiring in ${days} days:`, error);
  }
};

/**
 * Sends contract expiry alert email to employee
 * @description Sends personalized email alert to employee about contract expiry using existing email function
 * @async
 * @param {Object} contract - Contract object with employee details
 * @param {number} daysUntilExpiry - Number of days until contract expires
 * @returns {Promise<void>}
 */
const sendContractExpiryAlert = async (contract, daysUntilExpiry) => {
  try {
    const employeeName = contract.contracted_candidate?.full_name || "Employee";
    const employeeEmail = contract.contracted_candidate?.email;

    if (!employeeEmail) {
      logger.warn(
        `No email found for contract ID: ${contract.id}, Employee: ${employeeName}`
      );
      return;
    }

    await contractExpiryAlertFn(contract.id);

    logger.info(
      `Contract expiry alert sent to ${employeeName} (${employeeEmail}) - ${daysUntilExpiry} days remaining`
    );
  } catch (error) {
    logger.error(
      `Error sending contract expiry alert for contract ID ${contract.id}:`,
      error
    );
  }
};

/**
 * Processes KPI component assignments that are effective from today
 * @description Finds approved KPI component assignments with effective_from matching today's date
 * and creates active pay component assignments with corresponding lines
 * @async
 * @param {string} tenantDb - The tenant database identifier
 * @returns {Promise<void>}
 */

// const processKPIComponentAssignmentsForTenant = async (tenantDb) => {
//   try {
//     const tenantPrisma = getPrismaClient(tenantDb);

//     logger.info(
//       `KPI Component Assignment Task Started for tenant ${tenantDb} at ${moment().format(
//         "YYYY-MM-DD HH:mm:ss"
//       )}`
//     );

//     const todayDateStr = moment
//       .tz("Asia/Kolkata")
//       .startOf("day")
//       .format("YYYY-MM-DD");
//     const todayDateStart = new Date(todayDateStr + "T00:00:00.000Z");
//     const todayDateEnd = new Date(todayDateStr + "T23:59:59.999Z");

//     const kpiComponentAssignments =
//       await tenantPrisma.hrms_d_employee_kpi_component_assignment.findMany({
//         where: {
//           effective_from: {
//             gte: todayDateStart,
//             lte: todayDateEnd,
//           },
//           status: "P",
//         },
//         include: {
//           employee_kpi_header: {
//             select: {
//               id: true,
//               employee_id: true,
//               status: true,
//               revise_component_assignment: true,
//             },
//           },
//           kpi_component_lines: true,
//         },
//       });

//     if (kpiComponentAssignments.length === 0) {
//       logger.info(
//         `No KPI component assignments found with effective_from = ${todayDateStr}`
//       );
//       return;
//     }

//     logger.info(
//       `Found ${kpiComponentAssignments.length} KPI component assignment(s) to process`
//     );

//     for (const kpiAssignment of kpiComponentAssignments) {
//       try {
//         await tenantPrisma.$transaction(
//           async (tx) => {
//             const kpi = kpiAssignment.employee_kpi_header;

//             if (!kpi) {
//               logger.warn(
//                 `Skipping KPI component assignment ${kpiAssignment.id} - No KPI header found`
//               );
//               return;
//             }

//             if (kpi.status !== "A" && kpi.status !== "Active") {
//               logger.warn(
//                 `Skipping KPI ${kpi.id} - Status is "${kpi.status}", not approved`
//               );
//               return;
//             }

//             if (kpi.revise_component_assignment !== "Y") {
//               logger.warn(
//                 `Skipping KPI ${kpi.id} - revise_component_assignment is not "Y"`
//               );
//               return;
//             }

//             const effectiveFromDate = kpiAssignment.effective_from
//               ? moment(kpiAssignment.effective_from).startOf("day").toDate()
//               : moment().startOf("day").toDate();

//             const existingAssignment =
//               await tx.hrms_d_employee_pay_component_assignment_header.findFirst(
//                 {
//                   where: {
//                     employee_id: kpi.employee_id,
//                     effective_from: effectiveFromDate,
//                   },
//                   orderBy: { createdate: "desc" },
//                 }
//               );

//             let componentAssignment;

//             if (existingAssignment) {
//               logger.info(
//                 `Updating existing pay component assignment header ${existingAssignment.id} for employee ${kpi.employee_id} from KPI ${kpi.id}`
//               );

//               await tx.hrms_d_employee_pay_component_assignment_line.deleteMany(
//                 {
//                   where: {
//                     parent_id: existingAssignment.id,
//                   },
//                 }
//               );

//               componentAssignment =
//                 await tx.hrms_d_employee_pay_component_assignment_header.update(
//                   {
//                     where: { id: existingAssignment.id },
//                     data: {
//                       effective_from: effectiveFromDate,
//                       effective_to: kpiAssignment.effective_to,
//                       department_id: kpiAssignment.department_id,
//                       position_id: null,
//                       status: "Active",
//                       remarks: `Updated from Employee KPI #${
//                         kpi.id
//                       } via automated system on ${moment().format(
//                         "YYYY-MM-DD"
//                       )}`,
//                       updatedby: kpiAssignment.createdby || 1,
//                       updatedate: new Date(),
//                     },
//                   }
//                 );

//               logger.info(
//                 `Updated pay component assignment header ${componentAssignment.id}`
//               );
//             } else {
//               const anyExistingAssignment =
//                 await tx.hrms_d_employee_pay_component_assignment_header.findFirst(
//                   {
//                     where: {
//                       employee_id: kpi.employee_id,
//                     },
//                     orderBy: { createdate: "desc" },
//                   }
//                 );

//               if (anyExistingAssignment) {
//                 logger.info(
//                   `Found existing assignment ${anyExistingAssignment.id} for employee ${kpi.employee_id}, updating it from KPI ${kpi.id}`
//                 );

//                 await tx.hrms_d_employee_pay_component_assignment_line.deleteMany(
//                   {
//                     where: {
//                       parent_id: anyExistingAssignment.id,
//                     },
//                   }
//                 );

//                 componentAssignment =
//                   await tx.hrms_d_employee_pay_component_assignment_header.update(
//                     {
//                       where: { id: anyExistingAssignment.id },
//                       data: {
//                         effective_from: effectiveFromDate,
//                         effective_to: kpiAssignment.effective_to,
//                         department_id: kpiAssignment.department_id,
//                         position_id: null,
//                         status: "Active",
//                         remarks: `Updated from Employee KPI #${
//                           kpi.id
//                         } via automated system on ${moment().format(
//                           "YYYY-MM-DD"
//                         )}`,
//                         updatedby: kpiAssignment.createdby || 1,
//                         updatedate: new Date(),
//                       },
//                     }
//                   );

//                 logger.info(
//                   `Updated pay component assignment header ${componentAssignment.id}`
//                 );
//               } else {
//                 logger.info(
//                   `Creating new pay component assignment header for employee ${kpi.employee_id} from KPI ${kpi.id}`
//                 );

//                 componentAssignment =
//                   await tx.hrms_d_employee_pay_component_assignment_header.create(
//                     {
//                       data: {
//                         employee_id: kpi.employee_id,
//                         effective_from: effectiveFromDate,
//                         effective_to: kpiAssignment.effective_to,
//                         department_id: kpiAssignment.department_id,
//                         position_id: null,
//                         status: "Active",
//                         remarks: `Created from Employee KPI #${
//                           kpi.id
//                         } via automated system on ${moment().format(
//                           "YYYY-MM-DD"
//                         )}`,
//                         createdby: kpiAssignment.createdby || 1,
//                         createdate: new Date(),
//                       },
//                     }
//                   );

//                 logger.info(
//                   `Created pay component assignment header ${componentAssignment.id}`
//                 );
//               }
//             }

//             if (
//               !kpiAssignment.kpi_component_lines ||
//               kpiAssignment.kpi_component_lines.length === 0
//             ) {
//               logger.warn(
//                 `Skipping KPI component assignment ${kpiAssignment.id} - No component lines found`
//               );
//               return;
//             }

//             let lineNum = 1;
//             for (const kpiLine of kpiAssignment.kpi_component_lines) {
//               if (!kpiLine || !kpiLine.pay_component_id) {
//                 logger.warn(
//                   `Skipping invalid component line in assignment ${kpiAssignment.id} - Missing pay_component_id`
//                 );
//                 continue;
//               }

//               const amount = Number(kpiLine.amount) || 0;

//               await tx.hrms_d_employee_pay_component_assignment_line.create({
//                 data: {
//                   parent_id: componentAssignment.id,
//                   line_num: lineNum++,
//                   pay_component_id: Number(kpiLine.pay_component_id),
//                   amount: amount,
//                   type_value: amount,
//                   is_taxable: "Y",
//                   is_recurring: "Y",
//                   component_type: "O",
//                   createdby: kpiAssignment.createdby || 1,
//                   createdate: new Date(),
//                 },
//               });
//             }

//             await tx.hrms_d_employee_kpi_component_assignment.update({
//               where: { id: kpiAssignment.id },
//               data: {
//                 status: "Processed",
//                 updatedate: new Date(),
//               },
//             });

//             // Update employee department_id, designation_id, work_location, and header_attendance_rule from KPI component assignment
//             // This matches the behavior in employeeKPIModel.js when revise_component_assignment === "Y"
//             const updateEmployeeData = {};
//             if (kpiAssignment.department_id) {
//               updateEmployeeData.department_id = Number(
//                 kpiAssignment.department_id
//               );
//             }
//             if (kpiAssignment.designation_id) {
//               updateEmployeeData.designation_id = Number(
//                 kpiAssignment.designation_id
//               );
//             }
//             if (kpiAssignment.position) {
//               updateEmployeeData.work_location = kpiAssignment.position;
//             }
//             if (kpiAssignment.header_payroll_rule) {
//               // Map header_payroll_rule to header_attendance_rule (similar to attendance_type)
//               updateEmployeeData.header_attendance_rule =
//                 kpiAssignment.header_payroll_rule;
//             }

//             if (Object.keys(updateEmployeeData).length > 0) {
//               await tx.hrms_d_employee.update({
//                 where: { id: kpi.employee_id },
//                 data: updateEmployeeData,
//               });

//               logger.info(
//                 `Updated employee ${kpi.employee_id} with department_id: ${
//                   updateEmployeeData.department_id || "unchanged"
//                 }, designation_id: ${
//                   updateEmployeeData.designation_id || "unchanged"
//                 }, work_location: ${
//                   updateEmployeeData.work_location || "unchanged"
//                 }, header_attendance_rule: ${
//                   updateEmployeeData.header_attendance_rule || "unchanged"
//                 }`
//               );
//             }

//             logger.info(
//               `Successfully processed KPI component assignment ${kpiAssignment.id} for employee ${kpi.employee_id}`
//             );
//           },
//           {
//             timeout: 30000,
//           }
//         );
//       } catch (error) {
//         logger.error(
//           `Error processing KPI component assignment ${kpiAssignment.id}:`,
//           error
//         );
//       }
//     }

//     logger.info(
//       `KPI Component Assignment Task Completed for tenant ${tenantDb} at ${moment().format(
//         "YYYY-MM-DD HH:mm:ss"
//       )} - Processed ${kpiComponentAssignments.length} assignment(s)`
//     );
//   } catch (error) {
//     logger.error(
//       `Failed to process KPI Component Assignments for tenant ${tenantDb}:`,
//       error
//     );
//   }
// };

// /**
//  * Processes KPI component assignments for all configured tenants
//  * @description Wraps the tenant-specific processing function
//  * @async
//  * @returns {Promise<void>}
//  */
// const processKPIComponentAssignments = async () => {
//   const tenants = process.env.CRON_TENANT_DBS
//     ? process.env.CRON_TENANT_DBS.split(",").map((t) => t.trim())
//     : ["DCC_HRMS_HESU"];

//   for (const tenantDb of tenants) {
//     try {
//       await processKPIComponentAssignmentsForTenant(tenantDb);
//     } catch (error) {
//       logger.error(
//         `Failed to process KPI assignments for tenant ${tenantDb}:`,
//         error
//       );
//     }
//   }
// };

const processKPIComponentAssignmentsForTenant = async (tenantDb) => {
  try {
    const tenantPrisma = getPrismaClient(tenantDb);

    logger.info(
      `KPI Component Assignment Task Started for tenant ${tenantDb} at ${moment().format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );

    const todayDateStr = moment
      .tz("Asia/Kolkata")
      .startOf("day")
      .format("YYYY-MM-DD");
    const todayDateStart = new Date(todayDateStr + "T00:00:00.000Z");
    const todayDateEnd = new Date(todayDateStr + "T23:59:59.999Z");

    const kpiComponentAssignments =
      await tenantPrisma.hrms_d_employee_kpi_component_assignment.findMany({
        where: {
          effective_from: {
            lte: moment().tz("Asia/Kolkata").endOf("day").toDate(),
          },
          effective_from: {
            gt: moment().tz("Asia/Kolkata").endOf("day").toDate(),
          },
          // effective_from: {
          //   gte: todayDateStart,
          //   lte: todayDateEnd,
          // },
          // createdate: {
          //   gte: todayDateStart,
          //   lte: todayDateEnd,
          // },
          status: "P",
        },
        include: {
          employee_kpi_header: {
            select: {
              id: true,
              employee_id: true,
              status: true,
              revise_component_assignment: true,
            },
          },
          kpi_component_lines: true,
        },
      });

    if (kpiComponentAssignments.length === 0) {
      logger.info(
        `No KPI component assignments found with effective_from = ${todayDateStr}`
      );
      return;
    }

    logger.info(
      `Found ${kpiComponentAssignments.length} KPI component assignment(s) to process`
    );

    for (const kpiAssignment of kpiComponentAssignments) {
      try {
        await tenantPrisma.$transaction(
          async (tx) => {
            const kpi = kpiAssignment.employee_kpi_header;

            if (!kpi) {
              logger.warn(
                `Skipping KPI component assignment ${kpiAssignment.id} - No KPI header found`
              );
              return;
            }

            if (kpi.status !== "A" && kpi.status !== "Active") {
              logger.warn(
                `Skipping KPI ${kpi.id} - Status is "${kpi.status}", not approved`
              );
              return;
            }

            if (kpi.revise_component_assignment !== "Y") {
              logger.warn(
                `Skipping KPI ${kpi.id} - revise_component_assignment is not "Y"`
              );
              return;
            }

            const effectiveFromDate = kpiAssignment.effective_from
              ? moment(kpiAssignment.effective_from).startOf("day").toDate()
              : moment().startOf("day").toDate();

            const existingAssignment =
              await tx.hrms_d_employee_pay_component_assignment_header.findFirst(
                {
                  where: {
                    employee_id: kpi.employee_id,
                    effective_from: effectiveFromDate,
                  },
                  orderBy: { createdate: "desc" },
                }
              );

            let componentAssignment;

            if (existingAssignment) {
              logger.info(
                `Updating existing pay component assignment header ${existingAssignment.id} for employee ${kpi.employee_id} from KPI ${kpi.id}`
              );

              await tx.hrms_d_employee_pay_component_assignment_line.deleteMany(
                {
                  where: {
                    parent_id: existingAssignment.id,
                  },
                }
              );

              componentAssignment =
                await tx.hrms_d_employee_pay_component_assignment_header.update(
                  {
                    where: { id: existingAssignment.id },
                    data: {
                      effective_from: effectiveFromDate,
                      effective_to: kpiAssignment.effective_to,
                      department_id: kpiAssignment.department_id,
                      position_id: null,
                      status: "Active",
                      remarks: `Updated from Employee KPI #${
                        kpi.id
                      } via automated system on ${moment().format(
                        "YYYY-MM-DD"
                      )}`,
                      updatedby: kpiAssignment.createdby || 1,
                      updatedate: new Date(),
                    },
                  }
                );

              logger.info(
                `Updated pay component assignment header ${componentAssignment.id}`
              );
            } else {
              const anyExistingAssignment =
                await tx.hrms_d_employee_pay_component_assignment_header.findFirst(
                  {
                    where: {
                      employee_id: kpi.employee_id,
                    },
                    orderBy: { createdate: "desc" },
                  }
                );

              if (anyExistingAssignment) {
                logger.info(
                  `Found existing assignment ${anyExistingAssignment.id} for employee ${kpi.employee_id}, updating it from KPI ${kpi.id}`
                );

                await tx.hrms_d_employee_pay_component_assignment_line.deleteMany(
                  {
                    where: {
                      parent_id: anyExistingAssignment.id,
                    },
                  }
                );

                componentAssignment =
                  await tx.hrms_d_employee_pay_component_assignment_header.update(
                    {
                      where: { id: anyExistingAssignment.id },
                      data: {
                        effective_from: effectiveFromDate,
                        effective_to: kpiAssignment.effective_to,
                        department_id: kpiAssignment.department_id,
                        position_id: null,
                        status: "Active",
                        remarks: `Updated from Employee KPI #${
                          kpi.id
                        } via automated system on ${moment().format(
                          "YYYY-MM-DD"
                        )}`,
                        updatedby: kpiAssignment.createdby || 1,
                        updatedate: new Date(),
                      },
                    }
                  );

                logger.info(
                  `Updated pay component assignment header ${componentAssignment.id}`
                );
              } else {
                logger.info(
                  `Creating new pay component assignment header for employee ${kpi.employee_id} from KPI ${kpi.id}`
                );

                componentAssignment =
                  await tx.hrms_d_employee_pay_component_assignment_header.create(
                    {
                      data: {
                        employee_id: kpi.employee_id,
                        effective_from: effectiveFromDate,
                        effective_to: kpiAssignment.effective_to,
                        department_id: kpiAssignment.department_id,
                        position_id: null,
                        status: "Active",
                        remarks: `Created from Employee KPI #${
                          kpi.id
                        } via automated system on ${moment().format(
                          "YYYY-MM-DD"
                        )}`,
                        createdby: kpiAssignment.createdby || 1,
                        createdate: new Date(),
                      },
                    }
                  );

                logger.info(
                  `Created pay component assignment header ${componentAssignment.id}`
                );
              }
            }

            if (
              !kpiAssignment.kpi_component_lines ||
              kpiAssignment.kpi_component_lines.length === 0
            ) {
              logger.warn(
                `Skipping KPI component assignment ${kpiAssignment.id} - No component lines found`
              );
            } else {
              let lineNum = 1;
              for (const kpiLine of kpiAssignment.kpi_component_lines) {
                if (!kpiLine || !kpiLine.pay_component_id) {
                  logger.warn(
                    `Skipping invalid component line in assignment ${kpiAssignment.id} - Missing pay_component_id`
                  );
                  continue;
                }

                const amount = Number(kpiLine.amount) || 0;
                const gl_account_id = Number(kpiLine.gl_account_id) || 0;
                const payable_glaccount_id =
                  Number(kpiLine.payable_glaccount_id) || 0;
                await tx.hrms_d_employee_pay_component_assignment_line.create({
                  data: {
                    parent_id: componentAssignment.id,
                    line_num: lineNum++,
                    pay_component_id: Number(kpiLine.pay_component_id),
                    payable_glaccount_id: payable_glaccount_id,
                    amount: amount,
                    gl_account_id: gl_account_id,
                    type_value: amount,
                    is_taxable: "Y",
                    is_recurring: "Y",
                    component_type: "O",
                    createdby: kpiAssignment.createdby || 1,
                    createdate: new Date(),
                  },
                });
              }
            }

            try {
              const employeeDetails = await tx.hrms_d_employee.findUnique({
                where: { id: kpi.employee_id },
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  employee_code: true,
                },
              });

              const employeeName = employeeDetails
                ? `${employeeDetails.first_name || ""} ${
                    employeeDetails.last_name || ""
                  }`.trim()
                : "Unknown Employee";

              const contractEndDate = kpiAssignment.effective_to
                ? new Date(
                    moment
                      .tz(kpiAssignment.effective_to, "Asia/Kolkata")
                      .format("YYYY-MM-DD") + "T00:00:00.000Z"
                  )
                : null;

              const existingContract =
                await tx.hrms_d_employment_contract.findFirst({
                  where: {
                    employee_id: kpi.employee_id,
                  },
                  orderBy: { createdate: "desc" },
                });

              if (existingContract) {
                const contractUpdateData = {
                  employee_id: kpi.employee_id,
                  hrms_d_employeeId: kpi.employee_id,
                  updatedate: new Date(),
                  updatedby: kpiAssignment.createdby || 1,
                  description: `Updated from Employee KPI #${
                    kpi.id
                  } for ${employeeName} via automated system on ${moment
                    .tz("Asia/Kolkata")
                    .format("YYYY-MM-DD")}`,
                };

                if (kpiAssignment.effective_to) {
                  contractUpdateData.contract_end_date = contractEndDate;
                }

                await tx.hrms_d_employment_contract.update({
                  where: { id: existingContract.id },
                  data: contractUpdateData,
                });

                logger.info(
                  `Updated employment contract ${existingContract.id} for employee ${employeeName} (ID: ${kpi.employee_id}) - ` +
                    `End Date: ${
                      contractEndDate
                        ? moment(contractEndDate).format("YYYY-MM-DD")
                        : "No end date updated"
                    }`
                );
              } else {
                const newContractData = {
                  employee_id: kpi.employee_id,
                  hrms_d_employeeId: kpi.employee_id,
                  contract_end_date: contractEndDate,
                  createdate: new Date(),
                  createdby: kpiAssignment.createdby || 1,
                  description: `Contract created from Employee KPI #${
                    kpi.id
                  } for ${employeeName} via automated system on ${moment
                    .tz("Asia/Kolkata")
                    .format("YYYY-MM-DD")}`,
                };

                const newContract = await tx.hrms_d_employment_contract.create({
                  data: newContractData,
                });

                logger.info(
                  `Created new employment contract ${newContract.id} for employee ${employeeName} (ID: ${kpi.employee_id}) - ` +
                    `End Date: ${
                      contractEndDate
                        ? moment(contractEndDate).format("YYYY-MM-DD")
                        : "No end date"
                    }`
                );
              }
            } catch (contractError) {
              logger.error(
                `Error updating employment contract for employee ${kpi.employee_id}:`,
                contractError
              );
            }

            await tx.hrms_d_employee_kpi_component_assignment.update({
              where: { id: kpiAssignment.id },
              data: {
                status: "Processed",
                updatedate: new Date(),
              },
            });

            const updateEmployeeData = {};

            if (kpiAssignment.department_id) {
              updateEmployeeData.department_id = Number(
                kpiAssignment.department_id
              );
            }

            if (kpiAssignment.designation_id) {
              updateEmployeeData.designation_id = Number(
                kpiAssignment.designation_id
              );
            }

            if (kpiAssignment.position) {
              updateEmployeeData.work_location = kpiAssignment.position;
            }

            if (kpiAssignment.header_payroll_rule) {
              updateEmployeeData.header_attendance_rule =
                kpiAssignment.header_payroll_rule;
            }

            if (kpiAssignment.employment_type_id) {
              updateEmployeeData.employment_type_id = Number(
                kpiAssignment.employment_type_id
              );
              logger.info(
                `Setting employment_type_id to ${kpiAssignment.employment_type_id} for employee ${kpi.employee_id}`
              );
            }

            if (Object.keys(updateEmployeeData).length > 0) {
              await tx.hrms_d_employee.update({
                where: { id: kpi.employee_id },
                data: updateEmployeeData,
              });

              logger.info(
                `Updated employee ${kpi.employee_id} with ` +
                  `department_id: ${
                    updateEmployeeData.department_id || "unchanged"
                  }, ` +
                  `designation_id: ${
                    updateEmployeeData.designation_id || "unchanged"
                  }, ` +
                  `work_location: ${
                    updateEmployeeData.work_location || "unchanged"
                  }, ` +
                  `header_attendance_rule: ${
                    updateEmployeeData.header_attendance_rule || "unchanged"
                  }, ` +
                  `employment_type_id: ${
                    updateEmployeeData.employment_type_id || "unchanged"
                  }`
              );
            }

            logger.info(
              `Successfully processed KPI component assignment ${kpiAssignment.id} for employee ${kpi.employee_id}`
            );
          },
          {
            timeout: 30000,
          }
        );
      } catch (error) {
        logger.error(
          `Error processing KPI component assignment ${kpiAssignment.id}:`,
          error
        );
      }
    }

    logger.info(
      `KPI Component Assignment Task Completed for tenant ${tenantDb} at ${moment().format(
        "YYYY-MM-DD HH:mm:ss"
      )} - Processed ${kpiComponentAssignments.length} assignment(s)`
    );
  } catch (error) {
    logger.error(
      `Failed to process KPI Component Assignments for tenant ${tenantDb}:`,
      error
    );
  }
};

/**
 * Processes KPI component assignments for all configured tenants
 * @description Wraps the tenant-specific processing function
 * @async
 * @returns {Promise<void>}
 */
const processKPIComponentAssignments = async () => {
  const tenants = process.env.CRON_TENANT_DBS
    ? process.env.CRON_TENANT_DBS.split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : ["DCC_HRMS_HESU"];

  for (const tenantDb of tenants) {
    try {
      await processKPIComponentAssignmentsForTenant(tenantDb);
    } catch (error) {
      logger.error(
        `Failed to process KPI assignments for tenant ${tenantDb}:`,
        error
      );
    }
  }
};
/**
 * Initializes and schedules all HRMS cron jobs
 * @description Sets up health check and contract expiry alert cron jobs with specified schedules
 * Health Check Schedule: "0 10 * * *" - Every day at 10:00 AM (10:00) in Asia/Kolkata timezone
 * Contract Alert Schedule: "0 10 * * *" - Every day at 10:00 AM in Asia/Kolkata timezone
 * @returns {void}
 */
const initializeCronJobs = () => {
  try {
    logger.info("Initializing HRMS Cron Jobs");

    cron.schedule("0 10 * * *", HealthCheckUp, {
      scheduled: true,
      name: "Health Check",
      timezone: "Asia/Kolkata",
    });

    cron.schedule("0 10 * * *", contractExpiryAlert, {
      scheduled: true,
      name: "Contract Expiry Alert",
      timezone: "Asia/Kolkata",
    });

    cron.schedule("0 0 * * *", dailyAttendanceInitializer, {
      timezone: "Asia/Kolkata",
      scheduled: true,
      name: "Daily Attendance Initializer",
    });

    // cron.schedule("0 0 * * *", processKPIComponentAssignments, {
    cron.schedule("* * * * *", processKPIComponentAssignments, {
      scheduled: true,
      name: "KPI Component Assignment Processor",
      timezone: "Asia/Kolkata",
    });
  } catch (error) {
    logger.error("Failed to initialize HRMS cron jobs:", error);
  }
};

/**
 * @exports
 * @description Exports the main initialization function for the HRMS cron job scheduler
 */
module.exports = { initializeCronJobs, processKPIComponentAssignments };
