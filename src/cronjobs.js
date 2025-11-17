/**
 * @fileoverview HRMS Cron Jobs Scheduler
 * @description Handles scheduled health check tasks and contract expiry alerts for the HRMS system
 */

const cron = require("node-cron");
const logger = require("./Comman/logger");
const moment = require("moment-timezone");
const { prisma } = require("./utils/prismaProxy.js");

const {
  contractExpiryAlertFn,
  getAllEmploymentContract,
} = require("./v1/models/employmentContractModel");

const midnightIST = (d = 0) =>
  moment.tz("Asia/Kolkata").add(d, "day").startOf("day").toDate();

const dateStringIST = (d = 0) =>
  moment.tz("Asia/Kolkata").add(d, "day").startOf("day").format("YYYY-MM-DD");

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

// const createMissingTodayAttendance = async () => {
//   console.log(" DEBUG: Function createMissingTodayAttendance started");
//   logger.info(" DEBUG: Function createMissingTodayAttendance started");

//   try {
//     console.log(" DEBUG: Inside try block");
//     logger.info(" DEBUG: Inside try block");
//     const todayISO = dateISO();
//     const today = asDateObj(todayISO);
//     logger.info(` Creating missing attendance records for: ${dateStringIST()}`);

//     logger.info(
//       ` Creating missing attendance records for: ` +
//         moment(today).tz("Asia/Kolkata").format("DD-MMM-YYYY")
//     );

//     console.log("Testing Prisma client access");
//     logger.info("Testing Prisma client access");

//     if (!prisma) {
//       throw new Error("Prisma client is not initialized");
//     }

//     console.log(" Prisma client is available");
//     logger.info("Prisma client is available");

//     // Simple database test first
//     console.log("Testing basic database query");
//     logger.info(" Testing basic database query");

//     const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
//     console.log(" Basic database query successful");
//     logger.info(" Basic database query successful");

//     console.log(" Testing employee table access");
//     logger.info(" Testing employee table access");

//     const employeeCount = await prisma.hrms_d_employee.count();
//     console.log(`  Total employees in database: ${employeeCount}`);
//     logger.info(` Total employees in database: ${employeeCount}`);

//     console.log("Testing attendance table access");
//     logger.info(" Testing attendance table access");

//     const attendanceCount = await prisma.hrms_d_daily_attendance_entry.count();
//     console.log(` Total attendance records in database: ${attendanceCount}`);
//     logger.info(`Total attendance records in database: ${attendanceCount}`);

//     // Now proceed with the actual logic
//     console.log(" Starting main logic - querying active employees");
//     logger.info("Starting main logic - querying active employees");

//     const activeEmployees = await prisma.hrms_d_employee.findMany({
//       where: {
//         status: {
//           in: ["Active", "Probation", "Notice Period"],
//         },
//       },
//       select: {
//         id: true,
//         full_name: true,
//         employee_code: true,
//       },
//     });

//     console.log(` Found ${activeEmployees.length} active employees`);
//     logger.info(`Total active employees found: ${activeEmployees.length}`);

//     if (activeEmployees.length === 0) {
//       logger.warn(" No active employees found");
//       return;
//     }

//     console.log(" Checking existing attendance records");
//     logger.info(" Checking existing attendance records");

//     const existingRecords = await prisma.hrms_d_daily_attendance_entry.findMany(
//       {
//         where: {
//           attendance_date: today,
//           employee_id: {
//             in: activeEmployees.map((emp) => emp.id),
//           },
//         },
//         select: {
//           employee_id: true,
//           status: true,
//         },
//       }
//     );

//     console.log(`Found ${existingRecords.length} existing records`);
//     logger.info(
//       ` Employees with existing attendance today: ${existingRecords.length}`
//     );

//     const existingEmployeeIds = new Set(
//       existingRecords.map((record) => record.employee_id)
//     );

//     const employeesWithoutRecords = activeEmployees.filter(
//       (emp) => !existingEmployeeIds.has(emp.id)
//     );

//     console.log(` ${employeesWithoutRecords.length} employees need records`);
//     logger.info(
//       ` Employees MISSING attendance records: ${employeesWithoutRecords.length}`
//     );

//     if (employeesWithoutRecords.length === 0) {
//       logger.info(" All employees already have attendance records for today!");
//       return;
//     }

//     // Create records one by one for better error handling
//     console.log("  Creating attendance records one by one");
//     logger.info("  Creating attendance records one by one");

//     let successCount = 0;
//     let errorCount = 0;

//     for (const employee of employeesWithoutRecords) {
//       try {
//         const attendanceRecord = {
//           employee_id: employee.id,
//           attendance_date: today,
//           status: "Absent",
//           createdby: 1,
//           remarks: "Auto-generated - Default absent status",
//         };

//         console.log(
//           ` Creating record for employee ${employee.id} (${employee.full_name})`
//         );

//         const result = await prisma.hrms_d_daily_attendance_entry.create({
//           data: attendanceRecord,
//         });

//         console.log(` Created record ${result.id} for employee ${employee.id}`);
//         successCount++;
//       } catch (individualError) {
//         console.error(
//           ` Failed to create record for employee ${employee.id}:`,
//           individualError
//         );
//         logger.error(` Failed to create record for employee ${employee.id}:`, {
//           error: individualError.message,
//           code: individualError.code,
//           employee: employee,
//         });
//         errorCount++;
//       }
//     }

//     console.log(
//       `Creation complete. Success: ${successCount}, Errors: ${errorCount}`
//     );
//     logger.info(` Created ${successCount} attendance records for today!`);

//     if (errorCount > 0) {
//       logger.warn(` ${errorCount} records failed to create`);
//     }

//     // Log summary
//     logger.info(
//       `    Total Active/Probation Employees: ${activeEmployees.length}`
//     );
//     logger.info(`   Already Had Records: ${existingRecords.length}`);
//     logger.info(`    Records Created: ${successCount}`);
//     logger.info(`    Failed Records: ${errorCount}`);

//     console.log("Function completed successfully");
//   } catch (error) {
//     console.error("Error caught in catch block");
//     console.error(" Error type:", typeof error);
//     console.error(" Error constructor:", error?.constructor?.name);
//     console.error(" Error string representation:", String(error));

//     logger.error("  Error in attendance creation");

//     try {
//       logger.error("Error as string:", String(error));
//     } catch (e) {
//       console.error("Failed to log error as string");
//     }

//     try {
//       logger.error("Error message:", error?.message || "No message available");
//     } catch (e) {
//       console.error("Failed to log error message");
//     }

//     try {
//       logger.error("Error code:", error?.code || "No code available");
//     } catch (e) {
//       console.error("Failed to log error code");
//     }

//     try {
//       logger.error("Error name:", error?.name || "No name available");
//     } catch (e) {
//       console.error("Failed to log error name");
//     }

//     try {
//       if (error?.stack) {
//         logger.error("Stack trace:", error.stack);
//       } else {
//         logger.error("No stack trace available");
//       }
//     } catch (e) {
//       console.error("Failed to log stack trace");
//     }

//     try {
//       await prisma.$queryRaw`SELECT 1 as test`;
//       logger.info(" Database connection is working");
//     } catch (dbError) {
//       logger.error(" Database connection issue:", dbError.message);
//     }
//   }
// };
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
 * Initializes and schedules all HRMS cron jobs
 * @description Sets up health check and contract expiry alert cron jobs with specified schedules
 * Health Check Schedule: "0 10 * * *" - Every day at 10:00 AM (10:00) in Asia/Kolkata timezone
 * Contract Alert Schedule: "0 10 * * *" - Every day at 10:00 AM in Asia/Kolkata timezone
 * @returns {void}
 */
const initializeCronJobs = () => {
  try {
    logger.info("Initializing HRMS Cron Jobs");
    // createMissingTodayAttendance();

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

    logger.info("All HRMS cron jobs scheduled successfully");
    logger.info("Attendance Initializer: Daily at 12:00 AM IST (Midnight)");
  } catch (error) {
    logger.error("Failed to initialize HRMS cron jobs:", error);
  }
};

/**
 * @exports
 * @description Exports the main initialization function for the HRMS cron job scheduler
 */
module.exports = { initializeCronJobs };
