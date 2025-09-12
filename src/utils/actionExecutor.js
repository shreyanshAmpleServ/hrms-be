// const logger = require("../Comman/logger");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
// const sendEmail = require("./../utils/mailer.js");

// async function executeActions(employees, actions = []) {
//   const results = [];
//   for (const action of actions) {
//     const { type, recipients, template: templateKey } = action;
//     const toList = recipients?.split(",").map((r) => r.trim()) || [];
//     try {
//       if (type === "Email") {
//         const template = await prisma.hrms_d_templates.findUnique({
//           where: { key: templateKey },
//         });
//         if (!template)
//           throw new Error(`Template not found for key: ${templateKey}`);

//         const employeeList = employees
//           .map((emp) => `${emp.full_name} (${emp.event_date || "N/A"})`)
//           .join("<br>");
//         const emailBody = template.body
//           .replace("{{EMPLOYEE_NAMES}}", employeeList)
//           .replace("{{EVENT_DATE}}", new Date().toJSON().slice(0, 10));

//         for (const to of toList) {
//           await sendEmail({
//             to,
//             subject: template.subject,
//             html: emailBody,
//             log_inst: 1,
//           });
//         }
//       } else if (type === "SMS") {
//       } else if (type === "System") {
//       } else {
//         logger.warn(`Unknown action type: ${type}`);
//       }
//       results.push({ type, status: "SUCCESS" });
//     } catch (error) {
//       results.push({ type, status: "FAILED", error: error.message });
//       logger.error(`Action ${type} failed: ${error.message}`);
//     }
//   }
//   return results;
// }

// async function executeActions(employees, actions = []) {
//   const results = [];
//   for (const action of actions) {
//     const { type, recipients, template } = action;
//     try {
//       if (action.type === "Email") {
//         // Fetch template by ID
//         const template = await prisma.hrms_d_templates.findUnique({
//           where: { id: action.template },
//         });

//         const recipients = await prisma.hrms_d_employee.findMany({
//           where: { id: { in: action.recipients } },
//         });

//         for (const emp of recipients) {
//           if (emp.email) {
//             await sendEmail({
//               to: emp.email,
//               subject: template.subject,
//               html: template.body.replace("{{EMPLOYEE_NAME}}", emp.full_name),
//             });
//           }
//         }
//       } else if (type === "SMS") {
//       } else if (type === "System") {
//       } else {
//         logger.warn(`Unknown action type: ${type}`);
//       }
//       results.push({ type, status: "SUCCESS" });
//     } catch (error) {
//       results.push({ type, status: "FAILED", error: error.message });
//       logger.error(`Action ${type} failed: ${error.message}`);
//     }
//   }
//   return results;
// }
// module.exports = { executeActions };

// II
// const logger = require("../Comman/logger");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
// const sendEmail = require("./../utils/mailer.js");

// async function executeActions(employees, actions = []) {
//   const results = [];

//   for (const action of actions) {
//     try {
//       if (action.type === "Email") {
//         console.log(
//           `Processing Email action for template ID: ${action.template}`
//         );

//         const template = await prisma.hrms_d_templates.findUnique({
//           where: { id: action.template },
//         });

//         if (!template) {
//           throw new Error(`Template not found for ID: ${action.template}`);
//         }

//         const recipients = await prisma.hrms_d_employee.findMany({
//           where: { id: { in: action.recipients } },
//         });

//         if (recipients.length === 0) {
//           throw new Error(
//             `No recipients found for IDs: ${action.recipients.join(", ")}`
//           );
//         }

//         const employeeList = employees
//           .map((emp) => {
//             const probationDate =
//               emp.probation_end_date ||
//               emp.probation_employee?.[0]?.probation_end_date;
//             return `${emp.full_name} - Probation ends: ${
//               probationDate ? new Date(probationDate).toDateString() : "N/A"
//             }`;
//           })
//           .join("\n");

//         for (const recipient of recipients) {
//           const email = recipient.official_email || recipient.email;

//           if (email) {
//             const emailBody = template.body
//               .replace("{{EMPLOYEE_NAME}}", recipient.full_name)
//               .replace("{{EMPLOYEE_NAMES}}", employeeList)
//               .replace("{{EVENT_DATE}}", new Date().toISOString().slice(0, 10));

//             await sendEmail({
//               to: email,
//               subject: template.subject,
//               html: emailBody,
//               log_inst: 1,
//             });

//             console.log(
//               ` Email sent to ${email} at ${new Date().toISOString()}`
//             );
//           } else {
//             console.warn(
//               ` No email found for recipient ${recipient.full_name}`
//             );
//           }
//         }

//         results.push({ type: action.type, status: "SUCCESS" });
//       } else {
//         results.push({
//           type: action.type,
//           status: "SKIPPED",
//           message: "Not implemented",
//         });
//       }
//     } catch (error) {
//       console.error(`Action ${action.type} failed:`, error.message);
//       results.push({
//         type: action.type,
//         status: "FAILED",
//         error: error.message,
//       });
//     }
//   }

//   return results;
// }

// module.exports = { executeActions };

/// III working
// const logger = require("../Comman/logger");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
// const sendEmail = require("./../utils/mailer.js");

// async function executeActions(employees, actions = []) {
//   const results = [];

//   for (const action of actions) {
//     const { type, recipients, template } = action;

//     try {
//       if (action.type === "Email") {
//         // Fetch template by ID
//         const emailTemplate = await prisma.hrms_d_templates.findUnique({
//           where: { id: action.template },
//         });

//         if (!emailTemplate) {
//           throw new Error(`Template not found for ID: ${action.template}`);
//         }

//         //  SEND EMAILS TO ASSIGNED RECIPIENTS (not eligible employees)
//         if (action.recipients && action.recipients.length > 0) {
//           // Fetch employees specified in action.recipients
//           const assignedEmployees = await prisma.hrms_d_employee.findMany({
//             where: {
//               id: { in: action.recipients },
//               status: "Active", // Only active employees
//             },
//             include: {
//               hrms_employee_designation: true,
//               hrms_employee_department: true,
//             },
//           });

//           console.log(
//             ` Sending emails to ${assignedEmployees.length} assigned recipients`
//           );

//           // Send emails to assigned employees
//           for (const employee of assignedEmployees) {
//             if (employee.email || employee.official_email) {
//               const emailAddress = employee.email || employee.official_email;

//               // Enhanced placeholder replacement
//               const personalizedSubject = replacePlaceholders(
//                 emailTemplate.subject,
//                 employee
//               );
//               const personalizedBody = replacePlaceholders(
//                 emailTemplate.body,
//                 employee
//               );

//               await sendEmail({
//                 to: emailAddress,
//                 subject: personalizedSubject,
//                 html: personalizedBody,
//                 log_inst: 1,
//               });

//               logger.info(
//                 ` Email sent to assigned recipient: ${employee.full_name} (${emailAddress})`
//               );
//             } else {
//               logger.warn(
//                 ` No email address for assigned employee: ${employee.full_name}`
//               );
//             }
//           }

//           results.push({
//             type: action.type,
//             status: "SUCCESS",
//             count: assignedEmployees.length,
//             sent_to: assignedEmployees
//               .filter((e) => e.email || e.official_email)
//               .map((e) => e.full_name),
//           });
//         } else {
//           logger.warn("❌ No recipients specified in action");
//           results.push({
//             type: action.type,
//             status: "FAILED",
//             error: "No recipients specified",
//           });
//         }
//       } else if (type === "SMS") {
//         // SMS implementation
//       } else if (type === "System") {
//         // System notification implementation
//       } else {
//         logger.warn(`Unknown action type: ${type}`);
//       }
//     } catch (error) {
//       results.push({
//         type: action.type,
//         status: "FAILED",
//         error: error.message,
//       });
//       logger.error(`Action ${action.type} failed: ${error.message}`);
//     }
//   }

//   return results;
// }

// function replacePlaceholders(template, employee) {
//   if (!template) return template;

//   const placeholderMappings = {
//     // Employee name variations
//     employee_name: employee.full_name || "Employee",
//     user_name: employee.full_name || "Employee",
//     name: employee.full_name || "Employee",
//     full_name: employee.full_name || "Employee",
//     emp_name: employee.full_name || "Employee",

//     // Employee details
//     employee_code: employee.employee_code || "N/A",
//     emp_code: employee.employee_code || "N/A",
//     department: employee.hrms_employee_department?.department_name || "N/A",
//     dept: employee.hrms_employee_department?.department_name || "N/A",
//     job_title:
//       employee.hrms_employee_designation?.designation_name || "Employee",
//     position:
//       employee.hrms_employee_designation?.designation_name || "Employee",
//     designation:
//       employee.hrms_employee_designation?.designation_name || "Employee",

//     // Date fields
//     probation_end_date: formatDate(employee.probation_end_date),
//     confirmation_date: formatDate(
//       employee.date_of_confirmation || employee.confirm_date
//     ),
//     join_date: formatDate(employee.join_date),
//     joining_date: formatDate(employee.join_date),

//     // Contact information
//     email: employee.email || employee.official_email || "N/A",
//     official_email: employee.official_email || employee.email || "N/A",
//     phone: employee.phone_number || employee.office_phone || "N/A",

//     // Company name (you can add company logic here)
//     company_name: "Your Company",
//     company: "Your Company",
//     organization: "Your Company",
//   };

//   let processedTemplate = template;

//   // Replace all placeholders
//   Object.keys(placeholderMappings).forEach((placeholder) => {
//     const regex = new RegExp(`\\{\\{${placeholder}\\}\\}`, "gi");
//     processedTemplate = processedTemplate.replace(
//       regex,
//       placeholderMappings[placeholder]
//     );
//   });

//   return processedTemplate;
// }

// function formatDate(date) {
//   if (!date) return "N/A";
//   return new Date(date).toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// }

// module.exports = { executeActions };
const logger = require("../Comman/logger");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const sendEmail = require("./../utils/mailer.js");

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

  //attendance= this creted for emp
  const todayAttendance = eligibleEmployee.hrms_daily_attendance_employee?.[0];
  const attendanceStatus = todayAttendance?.status || "Not Marked";

  return {
    //  emp inf
    employee_name: eligibleEmployee.full_name || "Employee",
    emp_name: eligibleEmployee.full_name || "Employee",
    employee_code: eligibleEmployee.employee_code || "N/A",
    full_name: eligibleEmployee.full_name || "Employee",

    //   recipt info
    recipient_name: recipient.full_name || "Recipient",

    //  deg info
    job_title:
      eligibleEmployee.hrms_employee_designation?.designation_name || "N/A",
    designation_name:
      eligibleEmployee.hrms_employee_designation?.designation_name || "N/A",
    department:
      eligibleEmployee.hrms_employee_department?.department_name || "N/A",
    department_name:
      eligibleEmployee.hrms_employee_department?.department_name || "N/A",

    // date
    current_date: formatDate(new Date()),
    today_date: formatDate(new Date()),

    // attendance info
    attendance_status: attendanceStatus,
    attendance_date: formatDate(new Date()),

    // alert info
    type: alertType,
    alert_type: alertType,

    // company
    company_name: companyInfo.company_name || "Company",
    company_email: companyInfo.contact_email || "hr@company.com",
  };
}

function formatDate(date) {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
}

function replaceAllPlaceholders(text, placeholders) {
  let result = text;

  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`{{${key}}}`, "gi");
    result = result.replace(regex, value || "");
  }

  return result;
}

function determineAlertType(employee) {
  if (employee.hrms_daily_attendance_employee?.length === 0) {
    return "Attendance";
  }

  if (
    employee.probation_end_date ||
    (employee.w_employee && employee.w_employee.length > 0)
  ) {
    return "Probation";
  }

  if (
    employee.contract_end_date ||
    (employee.contracted_employee && employee.contracted_employee.length > 0)
  ) {
    return "Contract";
  }

  return "Alert";
}

async function sendSystemNotification(
  eligibleEmployee,
  recipient,
  template,
  placeholders,
  createdBy = 1
) {
  try {
    const notificationTitle = replaceAllPlaceholders(
      template.subject,
      placeholders
    );
    const notificationBody = replaceAllPlaceholders(
      template.body,
      placeholders
    );

    const notification = await prisma.hrms_d_notification_log.create({
      data: {
        employee_id: recipient.id,
        message_title: notificationTitle,
        message_body: notificationBody,
        channel: "System",
        sent_on: new Date(),
        status: "Sent",
        createdby: createdBy,
        log_inst: 1,
      },
    });

    logger.info(
      `System notification sent to ${recipient.full_name} (ID: ${recipient.id}) regarding ${eligibleEmployee.full_name}`
    );
    return notification;
  } catch (error) {
    logger.error(
      `Failed to send system notification to ${recipient.full_name}: ${error.message}`
    );
    throw error;
  }
}

async function executeActions(employees, actions = []) {
  console.log(` Processing actions for ${employees.length} eligible employees`);

  const results = [];

  for (const action of actions) {
    const { type, recipients, template } = action;

    try {
      if (action.type === "Email") {
        console.log(
          `Sending emails to ${action.recipients.length} assigned recipients`
        );

        const emailTemplate = await prisma.hrms_d_templates.findUnique({
          where: { id: action.template },
        });

        if (!emailTemplate) {
          throw new Error(`Template not found for ID: ${action.template}`);
        }

        const recipientEmployees = await prisma.hrms_d_employee.findMany({
          where: { id: { in: action.recipients } },
          include: {
            hrms_employee_designation: true,
            hrms_employee_department: true,
          },
        });

        // company info
        const companyInfo = await prisma.hrms_m_company_master.findFirst({
          where: { is_active: "Y" },
        });

        for (const eligibleEmployee of employees) {
          const alertType = determineAlertType(eligibleEmployee);

          for (const recipient of recipientEmployees) {
            if (recipient.email) {
              const placeholders = createUniversalPlaceholderMappings(
                eligibleEmployee,
                recipient,
                companyInfo || {},
                alertType
              );

              const personalizedSubject = replaceAllPlaceholders(
                emailTemplate.subject,
                placeholders
              );
              const personalizedBody = replaceAllPlaceholders(
                emailTemplate.body,
                placeholders
              );

              await sendEmail({
                to: recipient.email,
                subject: personalizedSubject,
                html: personalizedBody,
                log_inst: 1,
              });

              logger.info(
                `Alert email sent to ${recipient.full_name} (${recipient.email}) regarding ${eligibleEmployee.full_name}`
              );
            }
          }
        }

        results.push({ type, status: "SUCCESS" });
      } else if (action.type === "System") {
        console.log(
          ` Sending system notifications to ${action.recipients.length} assigned recipients`
        );

        const notificationTemplate = await prisma.hrms_d_templates.findUnique({
          where: { id: action.template },
        });

        if (!notificationTemplate) {
          throw new Error(`Template not found for ID: ${action.template}`);
        }

        const recipientEmployees = await prisma.hrms_d_employee.findMany({
          where: { id: { in: action.recipients } },
          include: {
            hrms_employee_designation: true,
            hrms_employee_department: true,
          },
        });

        const companyInfo = await prisma.hrms_m_company_master.findFirst({
          where: { is_active: "Y" },
        });

        for (const eligibleEmployee of employees) {
          const alertType = determineAlertType(eligibleEmployee);

          for (const recipient of recipientEmployees) {
            const placeholders = createUniversalPlaceholderMappings(
              eligibleEmployee,
              recipient,
              companyInfo || {},
              alertType
            );

            await sendSystemNotification(
              eligibleEmployee,
              recipient,
              notificationTemplate,
              placeholders,
              1
            );
          }
        }

        results.push({ type, status: "SUCCESS" });
      } else if (type === "SMS") {
        results.push({
          type,
          status: "SUCCESS",
          message: "SMS not implemented yet",
        });
      } else {
        logger.warn(`Unknown action type: ${type}`);
        results.push({
          type,
          status: "FAILED",
          error: `Unknown action type: ${type}`,
        });
      }
    } catch (error) {
      results.push({ type, status: "FAILED", error: error.message });
      logger.error(`Action ${type} failed: ${error.message}`);
    }
  }

  return results;
}

module.exports = { executeActions };
