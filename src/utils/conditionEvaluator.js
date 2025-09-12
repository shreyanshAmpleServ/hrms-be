// module.exports.evaluateConditions = (employee, conditions) => {
//   if (!employee || !conditions?.length) return false;

//   console.log(
//     ` Evaluating conditions for employee: ${employee.full_name} (${employee.employee_code})`
//   );

//   for (const cond of conditions) {
//     const { field, operator, value } = cond;
//     let empValue;

//     console.log(`   Checking: ${field} ${operator} ${value}`);

//     if (field === "attendance_marked") {
//       const attendanceCount =
//         employee.hrms_daily_attendance_employee?.length || 0;
//       empValue = attendanceCount > 0;
//       console.log(
//         `   Attendance records today: ${attendanceCount}, attendance_marked: ${empValue}`
//       );
//     } else if (field === "has_checked_in") {
//       const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
//       empValue = !!todayAttendance?.check_in_time;
//       console.log(
//         `   Check-in time: ${
//           todayAttendance?.check_in_time || "None"
//         }, has_checked_in: ${empValue}`
//       );
//     } else if (field === "has_checked_out") {
//       const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
//       empValue = !!todayAttendance?.check_out_time;
//       console.log(
//         `   Check-out time: ${
//           todayAttendance?.check_out_time || "None"
//         }, has_checked_out: ${empValue}`
//       );
//     } else if (field === "attendance_status") {
//       const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
//       empValue = todayAttendance?.status || "Not Marked";
//       console.log(`   Attendance status: ${empValue}`);
//     } else if (field === "working_hours") {
//       const todayAttendance = employee.hrms_daily_attendance_employee?.[0];
//       empValue = todayAttendance?.working_hours
//         ? parseFloat(todayAttendance.working_hours)
//         : 0;
//       console.log(`   Working hours: ${empValue}`);
//     } else if (
//       field === "contract_end_date" ||
//       field === "contract_expiry_date"
//     ) {
//       let contractEndDate = null;

//       if (employee.contracted_employee?.length > 0) {
//         const latestContract = employee.contracted_employee[0];
//         contractEndDate = latestContract.contract_end_date;
//         console.log(`   Contract from relation: ${contractEndDate}`);
//       }

//       if (!contractEndDate && employee.contract_end_date) {
//         contractEndDate = employee.contract_end_date;
//         console.log(`   Contract from employee field: ${contractEndDate}`);
//       }

//       empValue = contractEndDate ? formatDate(contractEndDate) : null;
//       console.log(`   Contract end date: ${empValue}`);
//     } else if (field === "days_until_contract_expiry") {
//       let contractEndDate = null;

//       if (employee.contracted_employee?.length > 0) {
//         const latestContract = employee.contracted_employee[0];
//         contractEndDate = latestContract.contract_end_date;
//       }

//       if (!contractEndDate && employee.contract_end_date) {
//         contractEndDate = employee.contract_end_date;
//       }

//       if (contractEndDate) {
//         const daysUntil = Math.ceil(
//           (new Date(contractEndDate) - new Date()) / (1000 * 60 * 60 * 24)
//         );
//         empValue = daysUntil;
//       } else {
//         empValue = null;
//       }
//       console.log(`   Days until contract expiry: ${empValue}`);
//     } else if (field === "contract_type") {
//       let contractType = null;

//       if (employee.contracted_employee?.length > 0) {
//         const latestContract = employee.contracted_employee[0];
//         contractType = latestContract.contract_type;
//       }

//       empValue = contractType || "No Contract";
//       console.log(`   Contract type: ${empValue}`);
//     } else if (field === "has_active_contract") {
//       let hasActiveContract = false;

//       if (employee.contracted_employee?.length > 0) {
//         const latestContract = employee.contracted_employee[0];
//         if (latestContract.contract_end_date) {
//           const contractEndDate = new Date(latestContract.contract_end_date);
//           const today = new Date();
//           hasActiveContract = contractEndDate > today;
//         }
//       }

//       empValue = hasActiveContract;
//       console.log(`   Has active contract: ${empValue}`);
//     } else if (field === "contract_start_date") {
//       let contractStartDate = null;

//       if (employee.contracted_employee?.length > 0) {
//         const latestContract = employee.contracted_employee[0];
//         contractStartDate = latestContract.contract_start_date;
//       }

//       empValue = contractStartDate ? formatDate(contractStartDate) : null;
//       console.log(`   Contract start date: ${empValue}`);
//     } else if (field === "probation_end_date") {
//       let probationEndDate = employee.probation_end_date;
//       if (!probationEndDate && employee.w_employee?.length > 0) {
//         const latestReview = employee.w_employee[0];
//         probationEndDate = latestReview.probation_end_date;
//       }
//       empValue = probationEndDate ? formatDate(probationEndDate) : null;
//       console.log(`   Probation end date: ${empValue}`);
//     } else if (field === "days_until_probation_end") {
//       let probationEndDate = employee.probation_end_date;
//       if (!probationEndDate && employee.w_employee?.length > 0) {
//         const latestReview = employee.w_employee[0];
//         probationEndDate = latestReview.probation_end_date;
//       }

//       if (probationEndDate) {
//         const daysUntil = Math.ceil(
//           (new Date(probationEndDate) - new Date()) / (1000 * 60 * 60 * 24)
//         );
//         empValue = daysUntil;
//       } else {
//         empValue = null;
//       }
//       console.log(`   Days until probation end: ${empValue}`);
//     } else if (field === "department_name") {
//       empValue = employee.hrms_employee_department?.department_name;
//       console.log(`   Department: ${empValue}`);
//     } else if (field === "designation_name") {
//       empValue = employee.hrms_employee_designation?.designation_name;
//       console.log(`   Designation: ${empValue}`);
//     } else if (field === "join_date") {
//       empValue = employee.join_date ? formatDate(employee.join_date) : null;
//       console.log(`   Join date: ${empValue}`);
//     } else if (field === "days_since_joining") {
//       if (employee.join_date) {
//         const daysSince = Math.floor(
//           (new Date() - new Date(employee.join_date)) / (1000 * 60 * 60 * 24)
//         );
//         empValue = daysSince;
//       } else {
//         empValue = null;
//       }
//       console.log(`   Days since joining: ${empValue}`);
//     } else {
//       empValue = employee[field];
//       console.log(`   Direct field ${field}: ${empValue}`);
//     }

//     console.log(`   Employee value: ${empValue}, Expected: ${value}`);

//     if (empValue === undefined || empValue === null) {
//       console.log(
//         `    Field ${field} not found for employee ${employee.full_name}`
//       );
//       return false;
//     }

//     let conditionMet = false;
//     if (operator === "=") conditionMet = empValue == value;
//     else if (operator === "!=") conditionMet = empValue != value;
//     else if (operator === "<=") conditionMet = empValue <= value;
//     else if (operator === ">=") conditionMet = empValue >= value;
//     else if (operator === "<") conditionMet = empValue < value;
//     else if (operator === ">") conditionMet = empValue > value;
//     else if (operator === "contains")
//       conditionMet = String(empValue)
//         .toLowerCase()
//         .includes(String(value).toLowerCase());
//     else if (operator === "not_contains")
//       conditionMet = !String(empValue)
//         .toLowerCase()
//         .includes(String(value).toLowerCase());

//     console.log(`   Condition result: ${conditionMet}`);

//     if (!conditionMet) {
//       console.log(
//         `    Employee ${employee.full_name} failed condition: ${field} ${operator} ${value}`
//       );
//       return false;
//     }
//   }

//   console.log(` Employee ${employee.full_name} meets ALL conditions`);
//   return true;
// };

// function formatDate(date) {
//   if (!date) return null;
//   try {
//     return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD format
//   } catch (error) {
//     return null;
//   }
// }

module.exports.evaluateConditions = (employee, conditions) => {
  if (!employee || !conditions?.length) return false;

  console.log(
    ` Evaluating conditions for employee: ${employee.full_name} (${employee.employee_code})`
  );

  for (const cond of conditions) {
    const { field, operator, value } = cond;
    let empValue;

    console.log(`   Checking: ${field} ${operator} ${value}`);

    if (field === "probation_end_date") {
      let probationEndDate = employee.probation_end_date;
      if (!probationEndDate && employee.w_employee?.length > 0) {
        const latestReview = employee.w_employee[0];
        probationEndDate = latestReview.probation_end_date;
      }

      if (probationEndDate) {
        if (typeof value === "number") {
          const daysUntil = Math.ceil(
            (new Date(probationEndDate) - new Date()) / (1000 * 60 * 60 * 24)
          );
          empValue = daysUntil;
          console.log(
            `   Probation end date: ${formatDate(
              probationEndDate
            )} (${daysUntil} days from now)`
          );
        } else {
          empValue = formatDate(probationEndDate);
          console.log(`   Probation end date: ${empValue}`);
        }
      } else {
        empValue = null;
        console.log(`   Probation end date: null`);
      }
    } else if (field === "attendance_marked") {
      const today = new Date().toISOString().split("T")[0];

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
    } else if (field === "has_checked_in") {
      const today = new Date().toISOString().split("T")[0];

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );
        empValue =
          todayAttendance && todayAttendance.checkin_time ? true : false;
      } else {
        empValue = false;
      }
      console.log(`   Has checked in for ${today}: ${empValue}`);
    } else if (
      field === "contract_end_date" ||
      field === "contract_expiry_date"
    ) {
      let contractEndDate = null;
      if (employee.contracted_employee?.length > 0) {
        const latestContract = employee.contracted_employee[0];
        contractEndDate = latestContract.contract_end_date;
      }

      if (contractEndDate) {
        if (typeof value === "number") {
          const daysUntil = Math.ceil(
            (new Date(contractEndDate) - new Date()) / (1000 * 60 * 60 * 24)
          );
          empValue = daysUntil;
          console.log(
            `   Contract end date: ${formatDate(
              contractEndDate
            )} (${daysUntil} days from now)`
          );
        } else {
          empValue = formatDate(contractEndDate);
          console.log(`   Contract end date: ${empValue}`);
        }
      } else {
        empValue = null;
        console.log(`   Contract end date: null`);
      }
    } else {
      empValue = employee[field];
      console.log(`   Direct field ${field}: ${empValue}`);
    }

    console.log(`   Employee value: ${empValue}, Expected: ${value}`);

    if (empValue === undefined || empValue === null) {
      console.log(
        `    Field ${field} not found for employee ${employee.full_name}`
      );
      return false;
    }

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
        `    Employee ${employee.full_name} failed condition: ${field} ${operator} ${value}`
      );
      return false;
    }
  }

  console.log(`    Employee ${employee.full_name} meets ALL conditions`);
  return true;
};

function formatDate(date) {
  if (!date) return null;
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch (error) {
    return null;
  }
}
