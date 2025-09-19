function createUniversalPlaceholderMappings(
  eligibleEmployee,
  recipient,
  companyInfo,
  alertType = "Alert"
) {
  let probationEndDate = eligibleEmployee.probation_end_date;
  if (!probationEndDate && eligibleEmployee.w_employee?.length > 0) {
    const latestReview = eligibleEmployee.w_employee.sort(
      (a, b) => new Date(b.createdate || 0) - new Date(a.createdate || 0)
    )[0];
    probationEndDate = latestReview.probation_end_date;
  }

  let alertDate = "N/A";
  if (alertType === "Probation") {
    alertDate = probationEndDate;
  } else if (alertType === "Contract") {
    alertDate = eligibleEmployee.contracted_employee?.[0]?.contract_end_date;
  } else if (alertType === "Attendance") {
    alertDate = new Date();
  }

  // ✅ GET TODAY'S ATTENDANCE DATA
  const todayAttendance = eligibleEmployee.hrms_daily_attendance_employee?.[0];
  const attendanceStatus = todayAttendance?.status || "Not Marked";

  // ✅ GET SHIFT INFORMATION
  const shift = eligibleEmployee.employee_shift_id;
  const shiftStartTime = shift?.start_time || "09:00:00";
  const shiftEndTime = shift?.end_time || "17:00:00";
  const workingHours = parseFloat(shift?.daily_working_hours || 8);

  // ✅ GET ATTENDANCE TIMING DATA
  const checkInTime = todayAttendance?.check_in_time;
  const checkOutTime = todayAttendance?.check_out_time;

  // ✅ CALCULATE LATE INFORMATION
  const minutesLate = checkInTime
    ? calculateMinutesLateValue(checkInTime, shiftStartTime)
    : 0;
  const lateDuration = minutesLate > 0 ? `${minutesLate} minutes` : "On Time";

  // ✅ CREATE LATE MESSAGE
  const lateMessage = checkInTime
    ? minutesLate > 0
      ? `arrived ${minutesLate} minutes late at ${formatTimeValue(
          checkInTime
        )} (Expected: ${shiftStartTime})`
      : `arrived on time at ${formatTimeValue(checkInTime)}`
    : "has not checked in yet";

  // ✅ CALCULATE EXPECTED CHECKOUT
  const expectedCheckoutTime = checkInTime
    ? calculateExpectedCheckoutTimeValue(
        checkInTime,
        workingHours,
        shift?.lunch_time || 60
      )
    : shiftEndTime;

  return {
    // ✅ EMPLOYEE INFORMATION
    employee_name: eligibleEmployee.full_name || "Employee",
    emp_name: eligibleEmployee.full_name || "Employee",
    employee_code: eligibleEmployee.employee_code || "N/A",
    full_name: eligibleEmployee.full_name || "Employee",

    // ✅ RECIPIENT INFORMATION
    recipient_name: recipient.full_name || "Recipient",

    // ✅ JOB INFORMATION
    job_title:
      eligibleEmployee.hrms_employee_designation?.designation_name || "N/A",
    designation:
      eligibleEmployee.hrms_employee_designation?.designation_name || "N/A",
    designation_name:
      eligibleEmployee.hrms_employee_designation?.designation_name || "N/A",
    department:
      eligibleEmployee.hrms_employee_department?.department_name || "N/A",
    department_name:
      eligibleEmployee.hrms_employee_department?.department_name || "N/A",

    // ✅ DATE AND TIME INFORMATION
    current_date: formatDate(new Date()),
    today_date: formatDate(new Date()),
    alert_date: formatDate(alertDate),
    current_time: formatTimeValue(new Date()),
    current_date_time: new Date().toLocaleString(),

    // ✅ SHIFT INFORMATION
    shift_name: shift?.shift_name || "Default Shift",
    shift_start_time: shiftStartTime,
    shift_end_time: shiftEndTime,
    daily_working_hours: workingHours,
    lunch_time: shift?.lunch_time || 60,

    // ✅ ATTENDANCE INFORMATION (THE KEY MISSING PLACEHOLDERS)
    attendance_status: attendanceStatus,
    attendance_date: formatDate(new Date()),
    check_in_time: checkInTime
      ? formatTimeValue(checkInTime)
      : "Not Checked In",
    check_out_time: checkOutTime
      ? formatTimeValue(checkOutTime)
      : "Not Checked Out",
    minutes_late: minutesLate,
    late_duration: lateDuration,
    late_message: lateMessage,
    expected_checkout_time: expectedCheckoutTime,
    remarks: todayAttendance?.remarks || "",

    // ✅ ALERT INFORMATION
    type: alertType,
    alert_type: alertType,
    notification_subject: alertType,

    // ✅ COMPANY INFORMATION
    company_name: companyInfo.company_name || "Company",
    company_email: companyInfo.contact_email || "",
  };
}

// ✅ HELPER FUNCTIONS (ADD THESE TO YOUR actionExecutor.js)
function formatTimeValue(datetime) {
  if (!datetime) return "";
  try {
    const date = new Date(datetime);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return datetime.toString();
  }
}

function calculateMinutesLateValue(checkInTime, shiftStartTime) {
  try {
    if (!checkInTime || !shiftStartTime) return 0;

    const today = new Date().toISOString().split("T")[0];

    let checkInDateTime;
    if (checkInTime instanceof Date) {
      checkInDateTime = checkInTime;
    } else {
      if (checkInTime.includes("T") || checkInTime.includes(" ")) {
        checkInDateTime = new Date(checkInTime);
      } else {
        checkInDateTime = new Date(`${today}T${checkInTime}`);
      }
    }

    const expectedDateTime = new Date(`${today}T${shiftStartTime}`);
    const diffMs = checkInDateTime - expectedDateTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    return Math.max(0, diffMinutes);
  } catch (error) {
    console.error("Error calculating minutes late:", error);
    return 0;
  }
}

function calculateExpectedCheckoutTimeValue(
  checkInTime,
  workingHours,
  lunchTimeMinutes
) {
  try {
    let checkInDateTime;
    if (checkInTime instanceof Date) {
      checkInDateTime = new Date(checkInTime);
    } else {
      checkInDateTime = new Date(checkInTime);
    }

    const expectedCheckout = new Date(checkInDateTime);
    expectedCheckout.setHours(expectedCheckout.getHours() + workingHours);
    expectedCheckout.setMinutes(
      expectedCheckout.getMinutes() + lunchTimeMinutes
    );

    return formatTimeValue(expectedCheckout);
  } catch (error) {
    console.error("Error calculating expected checkout:", error);
    return "17:00:00";
  }
}
