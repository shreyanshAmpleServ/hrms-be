//I. old condition
// module.exports.evaluateConditions = (employee, conditions) => {
//   if (!employee || !conditions?.length) return false;

//   console.log(
//     ` Evaluating conditions for employee: ${employee.full_name} (${employee.employee_code})`
//   );

//   for (const cond of conditions) {
//     const { field, operator, value } = cond;
//     let empValue;

//     console.log(`   Checking: ${field} ${operator} ${value}`);

//     if (field === "probation_end_date") {
//       let probationEndDate = employee.probation_end_date;
//       if (!probationEndDate && employee.w_employee?.length > 0) {
//         const latestReview = employee.w_employee[0];
//         probationEndDate = latestReview.probation_end_date;
//       }

//       if (probationEndDate) {
//         if (typeof value === "number") {
//           const daysUntil = Math.ceil(
//             (new Date(probationEndDate) - new Date()) / (1000 * 60 * 60 * 24)
//           );
//           empValue = daysUntil;
//           console.log(
//             `   Probation end date: ${formatDate(
//               probationEndDate
//             )} (${daysUntil} days from now)`
//           );
//         } else {
//           empValue = formatDate(probationEndDate);
//           console.log(`   Probation end date: ${empValue}`);
//         }
//       } else {
//         empValue = null;
//         console.log(`Probation end date: null`);
//       }
//     } else if (field === "attendance_marked") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );
//         empValue = todayAttendance ? true : false;
//       } else {
//         empValue = false;
//       }
//       console.log(`   Attendance marked for ${today}: ${empValue}`);
//     } else if (field === "has_checked_in") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );
//         empValue =
//           todayAttendance && todayAttendance.checkin_time ? true : false;
//       } else {
//         empValue = false;
//       }
//       console.log(`   Has checked in for ${today}: ${empValue}`);
//     } else if (field === "contract_end_date") {
//       let contractEndDate = null;
//       if (employee.contracted_employee?.length > 0) {
//         const latestContract = employee.contracted_employee.sort(
//           (a, b) =>
//             new Date(b.contract_end_date || 0) -
//             new Date(a.contract_end_date || 0)
//         )[0];
//         contractEndDate = latestContract.contract_end_date;
//       }

//       if (contractEndDate) {
//         if (typeof value === "number") {
//           const daysUntil = Math.ceil(
//             (new Date(contractEndDate) - new Date()) / (1000 * 60 * 60 * 24)
//           );
//           empValue = daysUntil;
//           console.log(
//             `   Contract end date: ${formatDate(
//               contractEndDate
//             )} (${daysUntil} days from now)`
//           );

//           if (daysUntil < 0) {
//             console.log(
//               `    Contract already expired ${Math.abs(
//                 daysUntil
//               )} days ago - skipping`
//             );
//             empValue = null;
//           }
//         } else {
//           empValue = formatDate(contractEndDate);
//           console.log(`   Contract end date: ${empValue}`);
//         }
//       } else {
//         empValue = null;
//         console.log(`   Contract end date: null`);
//       }
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
//     if (operator === "<=") conditionMet = empValue <= value;
//     else if (operator === ">=") conditionMet = empValue >= value;
//     else if (operator === "=") conditionMet = empValue == value;
//     else if (operator === "<") conditionMet = empValue < value;
//     else if (operator === ">") conditionMet = empValue > value;
//     else if (operator === "!=") conditionMet = empValue != value;

//     console.log(`   Condition result: ${conditionMet}`);

//     if (!conditionMet) {
//       console.log(
//         `    Employee ${employee.full_name} failed condition: ${field} ${operator} ${value}`
//       );
//       return false;
//     }
//   }

//   console.log(`    Employee ${employee.full_name} meets ALL conditions`);
//   return true;
// };

// function formatDate(date) {
//   if (!date) return null;
//   try {
//     return new Date(date).toISOString().split("T")[0];
//   } catch (error) {
//     return null;
//   }
// }

//II. New condition

// module.exports.evaluateConditions = (employee, conditions) => {
//   if (!employee || !conditions?.length) return false;

//   console.log(
//     ` Evaluating conditions for employee: ${employee.full_name} (${employee.employee_code})`
//   );

//   for (const cond of conditions) {
//     const { field, operator, value } = cond;
//     let empValue;

//     console.log(`   Checking: ${field} ${operator} ${value}`);

//     if (field === "probation_end_date") {
//       let probationEndDate = employee.probation_end_date;
//       if (!probationEndDate && employee.w_employee?.length > 0) {
//         const latestReview = employee.w_employee[0];
//         probationEndDate = latestReview.probation_end_date;
//       }

//       if (probationEndDate) {
//         if (typeof value === "number") {
//           const daysUntil = Math.ceil(
//             (new Date(probationEndDate) - new Date()) / (1000 * 60 * 60 * 24)
//           );
//           empValue = daysUntil;
//           console.log(
//             `   Probation end date: ${formatDate(
//               probationEndDate
//             )} (${daysUntil} days from now)`
//           );
//         } else {
//           empValue = formatDate(probationEndDate);
//           console.log(`   Probation end date: ${empValue}`);
//         }
//       } else {
//         empValue = null;
//         console.log(`Probation end date: null`);
//       }
//     } else if (field === "attendance_marked") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );
//         empValue = todayAttendance ? true : false;
//       } else {
//         empValue = false;
//       }
//       console.log(`   Attendance marked for ${today}: ${empValue}`);
//     } else if (field === "has_checked_in") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );
//         empValue =
//           todayAttendance && todayAttendance.checkin_time ? true : false;
//       } else {
//         empValue = false;
//       }
//       console.log(`   Has checked in for ${today}: ${empValue}`);
//     } else if (field === "is_late_today") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );

//         if (todayAttendance && todayAttendance.check_in_time) {
//           const shiftStartTime = getEmployeeShiftStartTime(employee);
//           empValue = isEmployeeLate(
//             todayAttendance.check_in_time,
//             shiftStartTime
//           );

//           console.log(
//             ` Is late today: ${empValue} (Check-in: ${formatTime(
//               todayAttendance.check_in_time
//             )}, Shift Start: ${shiftStartTime})`
//           );
//         } else {
//           empValue = false;
//           console.log(` No check-in time found, not late: ${empValue}`);
//         }
//       } else {
//         empValue = false;
//         console.log(` No attendance record today, not late: ${empValue}`);
//       }
//     } else if (field === "minutes_late") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );

//         if (todayAttendance && todayAttendance.check_in_time) {
//           const shiftStartTime = getEmployeeShiftStartTime(employee);
//           empValue = calculateMinutesLate(
//             todayAttendance.check_in_time,
//             shiftStartTime
//           );
//           console.log(
//             ` Minutes late: ${empValue} (vs shift start: ${shiftStartTime})`
//           );
//         } else {
//           empValue = 0;
//         }
//       } else {
//         empValue = 0;
//       }
//     } else if (field === "shift_start_time") {
//       empValue = getEmployeeShiftStartTime(employee);
//       console.log(` Employee shift start time: ${empValue}`);
//     } else if (field === "shift_end_time") {
//       empValue = getEmployeeShiftEndTime(employee);
//       console.log(` Employee shift end time: ${empValue}`);
//     } else if (field === "daily_working_hours") {
//       empValue = getEmployeeShiftWorkingHours(employee);
//       console.log(` Employee daily working hours: ${empValue}`);
//     } else if (field === "is_weekend_today") {
//       const today = new Date();
//       const dayOfWeek = today.getDay();
//       const weekoffDays = getEmployeeWeekoffDays(employee);
//       empValue = weekoffDays.includes(dayOfWeek);
//       console.log(` Is weekend today (day ${dayOfWeek}): ${empValue}`);
//     } else if (field === "expected_checkout_time") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );

//         if (todayAttendance && todayAttendance.check_in_time) {
//           empValue = calculateExpectedCheckoutTime(
//             employee,
//             todayAttendance.check_in_time
//           );
//         } else {
//           empValue = getEmployeeShiftEndTime(employee);
//         }
//       } else {
//         empValue = getEmployeeShiftEndTime(employee);
//       }

//       console.log(` Expected checkout time: ${empValue}`);
//     } else if (field === "is_early_checkout") {
//       const today = new Date().toISOString().split("T")[0];

//       if (employee.hrms_daily_attendance_employee?.length > 0) {
//         const todayAttendance = employee.hrms_daily_attendance_employee.find(
//           (att) =>
//             att.attendance_date && formatDate(att.attendance_date) === today
//         );

//         if (todayAttendance && todayAttendance.check_out_time) {
//           const expectedEndTime = getEmployeeShiftEndTime(employee);
//           empValue = isEarlyCheckout(
//             todayAttendance.check_out_time,
//             expectedEndTime
//           );
//           console.log(
//             ` Is early checkout: ${empValue} (Out: ${formatTime(
//               todayAttendance.check_out_time
//             )}, Expected: ${expectedEndTime})`
//           );
//         } else {
//           empValue = false;
//         }
//       } else {
//         empValue = false;
//       }
//     } else if (field === "contract_end_date") {
//       let contractEndDate = null;
//       if (employee.contracted_employee?.length > 0) {
//         const latestContract = employee.contracted_employee.sort(
//           (a, b) =>
//             new Date(b.contract_end_date || 0) -
//             new Date(a.contract_end_date || 0)
//         )[0];
//         contractEndDate = latestContract.contract_end_date;
//       }

//       if (contractEndDate) {
//         if (typeof value === "number") {
//           const daysUntil = Math.ceil(
//             (new Date(contractEndDate) - new Date()) / (1000 * 60 * 60 * 24)
//           );
//           empValue = daysUntil;
//           console.log(
//             `   Contract end date: ${formatDate(
//               contractEndDate
//             )} (${daysUntil} days from now)`
//           );

//           if (daysUntil < 0) {
//             console.log(
//               `    Contract already expired ${Math.abs(
//                 daysUntil
//               )} days ago - skipping`
//             );
//             empValue = null;
//           }
//         } else {
//           empValue = formatDate(contractEndDate);
//           console.log(`   Contract end date: ${empValue}`);
//         }
//       } else {
//         empValue = null;
//         console.log(`   Contract end date: null`);
//       }
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
//     if (operator === "<=") conditionMet = empValue <= value;
//     else if (operator === ">=") conditionMet = empValue >= value;
//     else if (operator === "=") conditionMet = empValue == value;
//     else if (operator === "<") conditionMet = empValue < value;
//     else if (operator === ">") conditionMet = empValue > value;
//     else if (operator === "!=") conditionMet = empValue != value;

//     console.log(`   Condition result: ${conditionMet}`);

//     if (!conditionMet) {
//       console.log(
//         `    Employee ${employee.full_name} failed condition: ${field} ${operator} ${value}`
//       );
//       return false;
//     }
//   }

//   console.log(`    Employee ${employee.full_name} meets ALL conditions`);
//   return true;
// };

// function formatDate(date) {
//   if (!date) return null;
//   try {
//     return new Date(date).toISOString().split("T")[0];
//   } catch (error) {
//     return null;
//   }
// }

// function getEmployeeShiftStartTime(employee) {
//   try {
//     if (employee.employee_shift_id) {
//       return employee.employee_shift_id.start_time || "09:00:00";
//     }

//     return "09:00:00";
//   } catch (error) {
//     console.error("Error getting shift start time:", error);
//     return "09:00:00";
//   }
// }

// function getEmployeeShiftEndTime(employee) {
//   try {
//     if (employee.employee_shift_id) {
//       return employee.employee_shift_id.end_time || "17:00:00";
//     }

//     return "17:00:00";
//   } catch (error) {
//     console.error("Error getting shift end time:", error);
//     return "17:00:00";
//   }
// }

// function getEmployeeShiftWorkingHours(employee) {
//   try {
//     if (employee.employee_shift_id) {
//       return parseFloat(employee.employee_shift_id.daily_working_hours || 8);
//     }

//     return 8;
//   } catch (error) {
//     console.error("Error getting working hours:", error);
//     return 8;
//   }
// }

// function getEmployeeWeekoffDays(employee) {
//   try {
//     if (employee.employee_shift_id && employee.employee_shift_id.weekoff_days) {
//       const weekoffString = employee.employee_shift_id.weekoff_days;
//       return weekoffString.split(",").map((day) => parseInt(day.trim()));
//     }

//     return [0, 6];
//   } catch (error) {
//     console.error("Error getting weekoff days:", error);
//     return [0, 6];
//   }
// }

// function isEmployeeLate(checkInTime, shiftStartTime, gracePeriodMinutes = 15) {
//   try {
//     if (!checkInTime || !shiftStartTime) return false;

//     const today = new Date().toISOString().split("T")[0];

//     let checkInDateTime;
//     if (checkInTime instanceof Date) {
//       checkInDateTime = checkInTime;
//     } else {
//       if (checkInTime.includes("T") || checkInTime.includes(" ")) {
//         checkInDateTime = new Date(checkInTime);
//       } else {
//         checkInDateTime = new Date(`${today}T${checkInTime}`);
//       }
//     }

//     const expectedDateTime = new Date(`${today}T${shiftStartTime}`);

//     expectedDateTime.setMinutes(
//       expectedDateTime.getMinutes() + gracePeriodMinutes
//     );

//     return checkInDateTime > expectedDateTime;
//   } catch (error) {
//     console.error("Error checking if employee is late:", error);
//     return false;
//   }
// }

// function calculateMinutesLate(checkInTime, shiftStartTime) {
//   try {
//     if (!checkInTime || !shiftStartTime) return 0;

//     const today = new Date().toISOString().split("T")[0];

//     let checkInDateTime;
//     if (checkInTime instanceof Date) {
//       checkInDateTime = checkInTime;
//     } else {
//       if (checkInTime.includes("T") || checkInTime.includes(" ")) {
//         checkInDateTime = new Date(checkInTime);
//       } else {
//         checkInDateTime = new Date(`${today}T${checkInTime}`);
//       }
//     }

//     const expectedDateTime = new Date(`${today}T${shiftStartTime}`);

//     const diffMs = checkInDateTime - expectedDateTime;
//     const diffMinutes = Math.floor(diffMs / (1000 * 60));

//     return Math.max(0, diffMinutes);
//   } catch (error) {
//     console.error("Error calculating minutes late:", error);
//     return 0;
//   }
// }

// function calculateExpectedCheckoutTime(employee, checkInTime) {
//   try {
//     const workingHours = getEmployeeShiftWorkingHours(employee);
//     const lunchTimeMinutes = employee.employee_shift_id?.lunch_time || 60;

//     let checkInDateTime;
//     if (checkInTime instanceof Date) {
//       checkInDateTime = new Date(checkInTime);
//     } else {
//       checkInDateTime = new Date(checkInTime);
//     }

//     const expectedCheckout = new Date(checkInDateTime);
//     expectedCheckout.setHours(expectedCheckout.getHours() + workingHours);
//     expectedCheckout.setMinutes(
//       expectedCheckout.getMinutes() + lunchTimeMinutes
//     );

//     return expectedCheckout.toTimeString().split(" ")[0];
//   } catch (error) {
//     console.error("Error calculating expected checkout:", error);
//     return getEmployeeShiftEndTime(employee);
//   }
// }

// function isEarlyCheckout(checkOutTime, expectedEndTime) {
//   try {
//     if (!checkOutTime || !expectedEndTime) return false;

//     const today = new Date().toISOString().split("T")[0];

//     let checkOutDateTime;
//     if (checkOutTime instanceof Date) {
//       checkOutDateTime = checkOutTime;
//     } else {
//       if (checkOutTime.includes("T") || checkOutTime.includes(" ")) {
//         checkOutDateTime = new Date(checkOutTime);
//       } else {
//         checkOutDateTime = new Date(`${today}T${checkOutTime}`);
//       }
//     }

//     const expectedDateTime = new Date(`${today}T${expectedEndTime}`);

//     expectedDateTime.setMinutes(expectedDateTime.getMinutes() - 30);

//     return checkOutDateTime < expectedDateTime;
//   } catch (error) {
//     console.error("Error checking early checkout:", error);
//     return false;
//   }
// }

// function formatTime(datetime) {
//   if (!datetime) return "";
//   try {
//     const date = new Date(datetime);
//     return date.toLocaleTimeString("en-GB", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch (error) {
//     return datetime.toString();
//   }
// }

// function formatDate(date) {
//   if (!date) return null;
//   try {
//     return new Date(date).toISOString().split("T")[0];
//   } catch (error) {
//     console.error("Error formatting date:", error);
//     return null;
//   }
// }

// III-New condition-final changes (To be tested in frontend)
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
        console.log(`Probation end date: null`);
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
          todayAttendance && todayAttendance.check_in_time ? true : false;
      } else {
        empValue = false;
      }
      console.log(`   Has checked in for ${today}: ${empValue}`);
    } else if (field === "is_late_today") {
      const today = new Date().toISOString().split("T")[0];

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );

        if (todayAttendance && todayAttendance.check_in_time) {
          const shiftStartTime = getEmployeeShiftStartTime(employee);
          empValue = isEmployeeLate(
            todayAttendance.check_in_time,
            shiftStartTime
          );

          console.log(
            ` Is late today: ${empValue} (Check-in: ${todayAttendance.check_in_time}, Shift Start: ${shiftStartTime})`
          );
        } else {
          empValue = false;
          console.log(` No check-in time found, not late: ${empValue}`);
        }
      } else {
        empValue = false;
        console.log(` No attendance record today, not late: ${empValue}`);
      }
    } else if (field === "minutes_late") {
      const today = new Date().toISOString().split("T")[0];

      if (employee.hrms_daily_attendance_employee?.length > 0) {
        const todayAttendance = employee.hrms_daily_attendance_employee.find(
          (att) =>
            att.attendance_date && formatDate(att.attendance_date) === today
        );

        if (todayAttendance && todayAttendance.check_in_time) {
          const shiftStartTime = getEmployeeShiftStartTime(employee);
          empValue = calculateMinutesLate(
            todayAttendance.check_in_time,
            shiftStartTime
          );
          console.log(
            ` Minutes late: ${empValue} (vs shift start: ${shiftStartTime})`
          );
        } else {
          empValue = 0;
        }
      } else {
        empValue = 0;
      }
    } else if (field === "is_absent_today") {
      const today = new Date().toISOString().split("T")[0];
      const currentHour = new Date().getHours();

      if (currentHour >= 10) {
        if (employee.hrms_daily_attendance_employee?.length > 0) {
          const todayAttendance = employee.hrms_daily_attendance_employee.find(
            (att) =>
              att.attendance_date && formatDate(att.attendance_date) === today
          );

          empValue = !todayAttendance || !todayAttendance.check_in_time;
          console.log(` Is absent today (${currentHour}:XX): ${empValue}`);
        } else {
          empValue = true;
          console.log(` No attendance record = absent: ${empValue}`);
        }
      } else {
        empValue = false;
        console.log(
          ` Too early to check absence (${currentHour}:XX): ${empValue}`
        );
      }
    } else if (field === "shift_start_time") {
      empValue = getEmployeeShiftStartTime(employee);
      console.log(` Employee shift start time: ${empValue}`);
    } else if (field === "shift_end_time") {
      empValue = getEmployeeShiftEndTime(employee);
      console.log(` Employee shift end time: ${empValue}`);
    } else if (field === "daily_working_hours") {
      empValue = getEmployeeShiftWorkingHours(employee);
      console.log(` Employee daily working hours: ${empValue}`);
    } else if (field === "is_weekend_today") {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const weekoffDays = getEmployeeWeekoffDays(employee);
      empValue = weekoffDays.includes(dayOfWeek);
      console.log(` Is weekend today (day ${dayOfWeek}): ${empValue}`);
    } else if (field === "current_time_hour") {
      empValue = new Date().getHours();
      console.log(` Current hour: ${empValue}`);
    } else if (field === "contract_end_date") {
      let contractEndDate = null;
      if (employee.contracted_employee?.length > 0) {
        const latestContract = employee.contracted_employee.sort(
          (a, b) =>
            new Date(b.contract_end_date || 0) -
            new Date(a.contract_end_date || 0)
        )[0];
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

          if (daysUntil < 0) {
            console.log(
              `    Contract already expired ${Math.abs(
                daysUntil
              )} days ago - skipping`
            );
            empValue = null;
          }
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
    console.error("Error formatting date:", error);
    return null;
  }
}

function getEmployeeShiftStartTime(employee) {
  try {
    if (employee.employee_shift_id) {
      return employee.employee_shift_id.start_time || "09:00:00";
    }
    return "09:00:00";
  } catch (error) {
    console.error("Error getting shift start time:", error);
    return "09:00:00";
  }
}

function getEmployeeShiftEndTime(employee) {
  try {
    if (employee.employee_shift_id) {
      return employee.employee_shift_id.end_time || "17:00:00";
    }
    return "17:00:00";
  } catch (error) {
    console.error("Error getting shift end time:", error);
    return "17:00:00";
  }
}

function getEmployeeShiftWorkingHours(employee) {
  try {
    if (employee.employee_shift_id) {
      return parseFloat(employee.employee_shift_id.daily_working_hours || 8);
    }
    return 8;
  } catch (error) {
    console.error("Error getting working hours:", error);
    return 8;
  }
}

function getEmployeeWeekoffDays(employee) {
  try {
    if (employee.employee_shift_id && employee.employee_shift_id.weekoff_days) {
      const weekoffString = employee.employee_shift_id.weekoff_days;
      return weekoffString.split(",").map((day) => parseInt(day.trim()));
    }
    return [0, 6];
  } catch (error) {
    console.error("Error getting weekoff days:", error);
    return [0, 6];
  }
}

function isEmployeeLate(checkInTime, shiftStartTime, gracePeriodMinutes = 15) {
  try {
    if (!checkInTime || !shiftStartTime) return false;

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
    expectedDateTime.setMinutes(
      expectedDateTime.getMinutes() + gracePeriodMinutes
    );

    return checkInDateTime > expectedDateTime;
  } catch (error) {
    console.error("Error checking if employee is late:", error);
    return false;
  }
}

function calculateMinutesLate(checkInTime, shiftStartTime) {
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
