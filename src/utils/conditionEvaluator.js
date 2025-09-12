module.exports.evaluateConditions = (employee, conditions) => {
  if (!employee || !conditions?.length) return false;

  console.log(
    ` Evaluating conditions for employee: ${employee.full_name} (${employee.employee_code})`
  );

  for (const cond of conditions) {
    const { field, operator, value } = cond;
    let empValue;

    console.log(`   Checking: ${field} ${operator} ${value}`);

    //  attendance cond
    if (field === "attendance_marked") {
      const attendanceCount =
        employee.hrms_daily_attendance_employee?.length || 0;
      empValue = attendanceCount > 0;
      console.log(
        `   Attendance records today: ${attendanceCount}, attendance_marked: ${empValue}`
      );
    } else if (field === "has_checked_in") {
      const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
      empValue = !!todayAttendance?.check_in_time;
      console.log(
        `   Check-in time: ${
          todayAttendance?.check_in_time || "None"
        }, has_checked_in: ${empValue}`
      );
    } else if (field === "has_checked_out") {
      const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
      empValue = !!todayAttendance?.check_out_time;
      console.log(
        `   Check-out time: ${
          todayAttendance?.check_out_time || "None"
        }, has_checked_out: ${empValue}`
      );
    } else if (field === "attendance_status") {
      const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
      empValue = todayAttendance?.status || "Not Marked";
      console.log(`   Attendance status: ${empValue}`);
    } else if (field === "working_hours") {
      // Check working hours
      const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
      empValue = todayAttendance?.working_hours
        ? parseFloat(todayAttendance.working_hours)
        : 0;
      console.log(`   Working hours: ${empValue}`);
    } else if (field === "probation_end_date") {
      let probationEndDate = employee.probation_end_date;
      if (probationEndDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(probationEndDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        empValue = daysUntilExpiry;
      } else {
        empValue = null;
      }
    } else if (
      field === "contract_expiry_date" ||
      field === "contract_end_date"
    ) {
      let contractEndDate = employee.contract_end_date;
      if (contractEndDate) {
        const daysUntilExpiry = Math.ceil(
          (new Date(contractEndDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        empValue = daysUntilExpiry;
      } else {
        empValue = null;
      }
    } else {
      empValue = employee[field];
    }

    console.log(`   Employee value: ${empValue}, Expected: ${value}`);

    if (empValue === undefined || empValue === null) {
      console.log(
        `    Field ${field} not found for employee ${employee.full_name}`
      );
      return false;
    }

    let conditionMet = false;
    if (operator === "=") conditionMet = empValue == value;
    else if (operator === "!=") conditionMet = empValue != value;
    else if (operator === "<=") conditionMet = empValue <= value;
    else if (operator === ">=") conditionMet = empValue >= value;
    else if (operator === "<") conditionMet = empValue < value;
    else if (operator === ">") conditionMet = empValue > value;

    console.log(`   Condition result: ${conditionMet}`);

    if (!conditionMet) {
      console.log(
        `    Employee ${employee.full_name} failed condition: ${field} ${operator} ${value}`
      );
      return false;
    }
  }

  console.log(`  Employee ${employee.full_name} meets ALL conditions`);
  return true;
};
