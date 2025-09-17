// Evaluates if an employee matches all conditions (field, operator, value)
module.exports.evaluateConditions = (employee, conditions) => {
  if (!employee || !conditions?.length) return false;

  console.log(
    `🔍 Evaluating conditions for employee: ${employee.full_name} (${employee.employee_code})`
  );

  for (const cond of conditions) {
    const { field, operator, value } = cond;
    let empValue;

    console.log(`   Checking: ${field} ${operator} ${value}`);

    // ✅ EXISTING: ATTENDANCE MARKED CHECK (UNCHANGED)
    if (field === "attendance_marked") {
      const today = formatDate(new Date());

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );
        empValue = todayAttendance ? true : false;
      } else {
        empValue = false;
      }
      console.log(`   Attendance marked for ${today}: ${empValue}`);
    }

    // ✅ NEW: ATTENDANCE STATUS CHECK
    else if (field === "attendance_status") {
      const today = formatDate(new Date());

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );

        if (todayAttendance) {
          empValue = todayAttendance.status; // "Present", "Absent", "Late", etc.
          console.log(`   Attendance status for ${today}: ${empValue}`);
        } else {
          empValue = "Not Marked";
          console.log(`   Attendance status for ${today}: Not Marked`);
        }
      } else {
        empValue = "Not Marked";
        console.log(`   Attendance status for ${today}: Not Marked`);
      }
    }

    // ✅ NEW: LATE ARRIVAL CHECK
    else if (field === "is_late") {
      const today = formatDate(new Date());

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );

        if (todayAttendance && todayAttendance.check_in_time) {
          // Define office start time (you can make this configurable)
          const checkInDate = new Date(todayAttendance.check_in_time);
          const officeStartTime = new Date(checkInDate);
          officeStartTime.setHours(9, 0, 0, 0); // 9:00 AM office start time

          empValue = checkInDate > officeStartTime;

          console.log(`   Check-in time: ${checkInDate.toLocaleTimeString()}`);
          console.log(
            `   Office start time: ${officeStartTime.toLocaleTimeString()}`
          );
          console.log(`   Is late: ${empValue}`);
        } else {
          empValue = false;
          console.log(`   No check-in time found for ${today}: Not late`);
        }
      } else {
        empValue = false;
        console.log(`   No attendance record for ${today}: Not late`);
      }
    }

    // ✅ NEW: ABSENT CHECK
    else if (field === "is_absent") {
      const today = formatDate(new Date());

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );

        if (todayAttendance) {
          empValue = todayAttendance.status === "Absent";
          console.log(
            `   Attendance status for ${today}: ${todayAttendance.status}`
          );
          console.log(`   Is absent: ${empValue}`);
        } else {
          empValue = true; // No attendance record = considered absent
          console.log(
            `   No attendance record for ${today}: Considered absent`
          );
        }
      } else {
        empValue = true; // No attendance data = considered absent
        console.log(`   No attendance data: Considered absent`);
      }
    }

    // ✅ NEW: WORKING HOURS CHECK
    else if (field === "working_hours") {
      const today = formatDate(new Date());

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );

        if (todayAttendance && todayAttendance.working_hours) {
          empValue = parseFloat(todayAttendance.working_hours);
          console.log(`   Working hours for ${today}: ${empValue}`);
        } else {
          empValue = 0;
          console.log(`   Working hours for ${today}: 0 (no data)`);
        }
      } else {
        empValue = 0;
        console.log(`   Working hours for ${today}: 0 (no attendance record)`);
      }
    }

    // ✅ EXISTING: DEFAULT FIELD ACCESS (UNCHANGED)
    else {
      empValue = employee[field];
      console.log(`   Direct field ${field}: ${empValue}`);
    }

    console.log(`   Employee value: ${empValue}, Expected: ${value}`);

    // ✅ EXISTING: NULL/UNDEFINED HANDLING (UNCHANGED)
    if (empValue === undefined) {
      console.log(
        `   ❌ Field ${field} not found for employee ${employee.full_name}`
      );
      return false;
    }

    // ✅ EXISTING: EVALUATE CONDITION (UNCHANGED)
    let conditionMet = false;
    if (operator === "<=") conditionMet = empValue <= value;
    else if (operator === ">=") conditionMet = empValue >= value;
    else if (operator === "=") conditionMet = empValue == value;
    else if (operator === "<") conditionMet = empValue < value;
    else if (operator === ">") conditionMet = empValue > value;
    else if (operator === "!=") conditionMet = empValue != value;

    console.log(`   Condition result: ${conditionMet}`);

    if (!conditionMet) {
      console.log(
        `   ❌ Employee ${employee.full_name} failed condition: ${field} ${operator} ${value}`
      );
      return false;
    }
  }

  console.log(`   ✅ Employee ${employee.full_name} meets ALL conditions`);
  return true;
};

// ✅ HELPER FUNCTION
function formatDate(date) {
  if (!date) return null;
  try {
    return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD format
  } catch (error) {
    return null;
  }
}
