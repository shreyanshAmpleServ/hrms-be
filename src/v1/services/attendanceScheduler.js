const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Schedule to run at midnight (00:00) every day
const scheduleDefaultAttendance = () => {
  // Cron pattern: '0 0 * * *' means every day at midnight
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        console.log(
          "Starting daily attendance initialization at:",
          new Date().toISOString()
        );

        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Set to start of day

        // Get all active employees
        const activeEmployees = await prisma.hrms_d_employee.findMany({
          where: {
            status: "Active", // Assuming you have a status field
          },
          select: {
            id: true,
          },
        });

        console.log(`Found ${activeEmployees.length} active employees`);

        if (activeEmployees.length === 0) {
          console.log("No active employees found");
          return;
        }

        // Check for existing attendance records for tomorrow
        const existingRecords =
          await prisma.hrms_d_daily_attendance_entry.findMany({
            where: {
              attendance_date: tomorrow,
              employee_id: {
                in: activeEmployees.map((emp) => emp.id),
              },
            },
            select: {
              employee_id: true,
            },
          });

        const existingEmployeeIds = new Set(
          existingRecords.map((record) => record.employee_id)
        );

        // Filter out employees who already have attendance records for tomorrow
        const employeesNeedingRecords = activeEmployees.filter(
          (emp) => !existingEmployeeIds.has(emp.id)
        );

        console.log(
          `Creating attendance records for ${employeesNeedingRecords.length} employees`
        );

        if (employeesNeedingRecords.length === 0) {
          console.log(
            "All employees already have attendance records for tomorrow"
          );
          return;
        }

        // Prepare bulk insert data
        const attendanceData = employeesNeedingRecords.map((employee) => ({
          employee_id: employee.id,
          attendance_date: tomorrow,
          status: "Absent",
          remarks: "Auto-generated default attendance",
          createdby: 1, // System user ID
          createdate: new Date(),
          log_inst: 1,
        }));

        // Bulk create attendance records using createMany
        const result = await prisma.hrms_d_daily_attendance_entry.createMany({
          data: attendanceData,
          skipDuplicates: true, // Skip if duplicate records exist
        });

        console.log(
          `Successfully created ${
            result.count
          } default attendance records for ${tomorrow.toDateString()}`
        );
      } catch (error) {
        console.error("Error in daily attendance scheduler:", error);
        // You might want to send an alert or notification about this failure
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata", // Adjust timezone as needed
    }
  );

  console.log(
    "Daily attendance scheduler initialized - will run every day at midnight"
  );
};

// Function to manually trigger the attendance creation (for testing)
const createDefaultAttendanceForDate = async (targetDate = null) => {
  try {
    const date = targetDate ? new Date(targetDate) : new Date();
    date.setHours(0, 0, 0, 0);

    console.log(
      `Manually creating default attendance for ${date.toDateString()}`
    );

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

    if (activeEmployees.length === 0) {
      return { success: false, message: "No active employees found" };
    }

    // Check for existing records
    const existingRecords = await prisma.hrms_d_daily_attendance_entry.findMany(
      {
        where: {
          attendance_date: date,
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

    if (employeesNeedingRecords.length === 0) {
      return {
        success: true,
        message: "All employees already have attendance records for this date",
        recordsCreated: 0,
        totalEmployees: activeEmployees.length,
      };
    }

    const attendanceData = employeesNeedingRecords.map((employee) => ({
      employee_id: employee.id,
      attendance_date: date,
      status: "Absent",
      remarks: "Auto-generated default attendance",
      createdby: 1,
      createdate: new Date(),
      log_inst: 1,
    }));

    const result = await prisma.hrms_d_daily_attendance_entry.createMany({
      data: attendanceData,
      skipDuplicates: true,
    });

    return {
      success: true,
      message: `Successfully created default attendance records`,
      recordsCreated: result.count,
      totalEmployees: activeEmployees.length,
      date: date.toDateString(),
    };
  } catch (error) {
    console.error("Error creating manual attendance records:", error);
    return {
      success: false,
      message: `Error: ${error.message}`,
    };
  }
};

module.exports = {
  scheduleDefaultAttendance,
  createDefaultAttendanceForDate,
};
