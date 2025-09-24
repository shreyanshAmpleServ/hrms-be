/**
 * @fileoverview HRMS Cron Jobs Scheduler
 * @description Handles scheduled health check tasks and contract expiry alerts for the HRMS system
 */

const cron = require("node-cron");
const logger = require("./Comman/logger");
const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  contractExpiryAlertFn,
  getAllEmploymentContract,
} = require("./v1/models/employmentContractModel");

const dailyAttendanceInitializer = async () => {
  try {
    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    logger.info(` Daily Attendance Initializer Started at ${currentTime}`);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    logger.info(` Creating attendance records for: ${tomorrow.toDateString()}`);

    const activeEmployees = await prisma.hrms_d_employee.findMany({
      where: {
        status: "Active",
      },
      select: {
        id: true,
        full_name: true,
        employee_code: true,
      },
    });

    logger.info(`Found ${activeEmployees.length} active employees`);

    if (activeEmployees.length === 0) {
      logger.warn(" No active employees found - skipping attendance creation");
      return;
    }

    const existingRecords = await prisma.hrms_d_daily_attendance_entry.findMany(
      {
        where: {
          attendance_date: tomorrow,
          employee_id: {
            in: activeEmployees.map((emp) => emp.id),
          },
        },
        select: {
          employee_id: true,
        },
      }
    );

    const existingEmployeeIds = new Set(
      existingRecords.map((record) => record.employee_id)
    );

    const employeesNeedingRecords = activeEmployees.filter(
      (emp) => !existingEmployeeIds.has(emp.id)
    );

    logger.info(
      ` Employees needing attendance records: ${employeesNeedingRecords.length}`
    );
    logger.info(` Employees with existing records: ${existingRecords.length}`);

    if (employeesNeedingRecords.length === 0) {
      logger.info("All employees already have attendance records for tomorrow");
      return;
    }

    // Prepare bulk insert data
    const attendanceData = employeesNeedingRecords.map((employee) => ({
      employee_id: employee.id,
      attendance_date: tomorrow,
      status: "Absent",
      remarks: "Auto-generated at midnight - Default status",
      createdby: 1, // System user ID
      createdate: new Date(),
      log_inst: 1,
    }));

    // Bulk create attendance records using createMany
    const result = await prisma.hrms_d_daily_attendance_entry.createMany({
      data: attendanceData,
      skipDuplicates: true,
    });

    logger.info(`SUCCESS: Created ${result.count} default attendance records`);
    logger.info(
      `Summary - Total Active: ${activeEmployees.length}, Created: ${result.count}, Existing: ${existingRecords.length}`
    );

    // Log some employee details for verification
    employeesNeedingRecords.slice(0, 5).forEach((emp) => {
      logger.info(
        ` Created record for: ${emp.full_name} (${emp.employee_code})`
      );
    });

    if (employeesNeedingRecords.length > 5) {
      logger.info(` and ${employeesNeedingRecords.length - 5} more employees`);
    }

    logger.info(
      `Daily Attendance Initializer Completed at ${moment().format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
  } catch (error) {
    logger.error(" Failed to perform Daily Attendance Initialization:", error);
    // You might want to send an alert about this failure
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
 * Initializes and schedules all HRMS cron jobs
 * @description Sets up health check and contract expiry alert cron jobs with specified schedules
 * Health Check Schedule: "0 10 * * *" - Every day at 10:00 AM (10:00) in Asia/Kolkata timezone
 * Contract Alert Schedule: "0 10 * * *" - Every day at 10:00 AM in Asia/Kolkata timezone
 * @returns {void}
 */
const initializeCronJobs = () => {
  try {
    logger.info("=== Initializing HRMS Cron Jobs ===");

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
      scheduled: true,
      name: "Daily Attendance Initializer",
      timezone: "Asia/Kolkata",
    });
    logger.info("=== All HRMS cron jobs scheduled successfully ===");
    logger.info("   Attendance Initializer: Daily at 12:00 AM IST (Midnight)");
  } catch (error) {
    logger.error("Failed to initialize HRMS cron jobs:", error);
  }
};

/**
 * @exports
 * @description Exports the main initialization function for the HRMS cron job scheduler
 */
module.exports = { initializeCronJobs };
