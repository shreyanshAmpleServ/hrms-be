// const { PrismaClient } = require("@prisma/client");
// const sendEmail = require("../../utils/mailer.js");
// const { generateEmailContent } = require("../../utils/emailTemplates.js");

// const prisma = new PrismaClient();

// const processedRequests = new Set();

// const setupNotificationMiddleware = async (
//   req,
//   res,
//   next,
//   action_type,
//   action
// ) => {
//   // const originalJson = res.json.bind(res);

//   console.log(action_type, action);

//   const findNotificationSetup =
//     await prisma.hrms_d_notification_setup.findFirst({
//       where: {
//         action_type,
//         is_active: "Y",
//       },
//       include: {
//         hrms_d_notification_assigned: {
//           include: {
//             assigned_employee: {
//               select: { id: true, full_name: true, email: true },
//             },
//           },
//         },
//       },
//     });

//   console.log(findNotificationSetup);

//   const assigned_employees =
//     findNotificationSetup?.hrms_d_notification_assigned;

//   console.log(assigned_employees);

//   const department_name = "Management";
//   const company_name = "Ampleserv Technologies Pvt. Ltd.";

//   if (action === "create" && findNotificationSetup?.action_create) {
//     const template = await generateEmailContent(
//       templateKeyMap.notificationSetupCreated,
//       {
//         action_type,
//         employee_name: req.user.full_name,
//         action,
//         company_name,
//         department_name,
//       }
//     );
//     console.log("Notification created email sent");
//     assigned_employees?.map(async (item) => {
//       await sendEmail({
//         to: item.assigned_employee.email,
//         subject: template.subject,
//         html: template.body,
//         log_inst: req.user.log_inst,
//       });
//     });
//     console.log("Notification sent successfully");
//   } else if (action === "update" && findNotificationSetup?.action_update) {
//     const template = await generateEmailContent(
//       templateKeyMap.notificationSetupUpdated,
//       {
//         action_type,
//       }
//     );
//     assigned_employees?.map(async (item) => {
//       await sendEmail({
//         to: item.assigned_employee.email,
//         subject: template.subject,
//         html: template.body,
//         log_inst: req.user.log_inst,
//       });
//     });
//   } else if (action === "delete" && findNotificationSetup?.action_delete) {
//     const template = await generateEmailContent(
//       templateKeyMap.notificationSetupDeleted,
//       {
//         action_type,
//       }
//     );
//     assigned_employees?.map(async (item) => {
//       await sendEmail({
//         to: item.assigned_employee.email,
//         subject: template.subject,
//         html: template.body,
//         log_inst: req.user.log_inst,
//       });
//     });
//   } else {
//     console.log("Wrong action type or action not enabled");
//   }

//   // const requestKey = `${req.method}:${req.originalUrl}:${Date.now()}`;

//   // res.json = function (data) {
//   //   if (
//   //     res.statusCode >= 200 &&
//   //     res.statusCode < 300 &&
//   //     !processedRequests.has(requestKey)
//   //   ) {
//   //     processedRequests.add(requestKey);

//   //     if (processedRequests.size > 1000) {
//   //       const entries = Array.from(processedRequests);
//   //       processedRequests.clear();
//   //       entries.slice(-500).forEach((entry) => processedRequests.add(entry));
//   //     }

//   //     handleNotificationTrigger(req, data, action_type, action).catch((error) => {
//   //       console.error("Notification error:", error);
//   //     });
//   //   }

//   //   return originalJson(data);
//   // };

//   next();
// };

// // const handleNotificationTrigger = async (req, responseData) => {
// //   try {
// //     const action = getActionFromRequest(req);
// //     const model = getModelFromRoute(req.route.path);

// //     if (!shouldTriggerNotification(model, action)) {
// //       return;
// //     }

// //     console.log(` Triggering notification for: ${action} ${model}`);

// //     const actionConditions = [];
// //     if (action === "create") actionConditions.push({ action_create: true });
// //     if (action === "update") actionConditions.push({ action_update: true });
// //     if (action === "delete") actionConditions.push({ action_delete: true });

// //     const notificationSetups = await prisma.hrms_d_notification_setup.findMany({
// //       where: {
// //         action_type: getComponentName(model),
// //         is_active: "Y",
// //         OR: actionConditions,
// //       },
// //       distinct: ["title", "action_type"],
// //       include: {
// //         template: true,
// //         hrms_d_notification_assigned: {
// //           include: {
// //             assigned_employee: {
// //               select: { id: true, full_name: true, email: true },
// //             },
// //           },
// //           orderBy: { sort_order: "asc" },
// //         },
// //       },
// //     });

// //     console.log(
// //       ` Found ${notificationSetups.length} unique notification setups to process`
// //     );

// //     const uniqueSetups = notificationSetups.filter((setup) => {
// //       const setupKey = `${setup.id}-${action}-${
// //         responseData?.data?.id || Date.now()
// //       }`;
// //       if (processedNotifications.has(setupKey)) {
// //         console.log(` Skipping already processed setup: ${setup.title}`);
// //         return false;
// //       }
// //       processedNotifications.add(setupKey);
// //       return true;
// //     });

// //     if (processedNotifications.size > 1000) {
// //       const entries = Array.from(processedNotifications);
// //       processedNotifications.clear();
// //       entries.slice(-500).forEach((entry) => processedNotifications.add(entry));
// //     }

// //     console.log(
// //       ` Processing ${uniqueSetups.length} unique setups after deduplication`
// //     );

// //     for (const setup of uniqueSetups) {
// //       await processNotificationSetup(setup, action, model, responseData, req);
// //     }
// //   } catch (error) {
// //     console.error("Error handling notification trigger:", error);
// //   }
// // };

// // const processNotificationSetup = async (
// //   setup,
// //   action,
// //   model,
// //   responseData,
// //   req
// // ) => {
// //   const { template, hrms_d_notification_assigned } = setup;

// //   let templateKey;
// //   if (template && template.key) {
// //     templateKey = template.key;
// //   } else {
// //     templateKey = getDefaultTemplateKey(action);
// //     console.log(
// //       ` Using fallback template key: ${templateKey} for setup: ${setup.title}`
// //     );
// //   }

// //   console.log(
// //     `Processing notifications for ${hrms_d_notification_assigned.length} users`
// //   );

// //   const uniqueUsers = hrms_d_notification_assigned.filter(
// //     (assignment, index, arr) =>
// //       index ===
// //       arr.findIndex(
// //         (a) => a.assigned_employee.email === assignment.assigned_employee.email
// //       )
// //   );

// //   console.log(
// //     `After user deduplication: ${uniqueUsers.length} unique recipients`
// //   );

// //   for (const assignment of uniqueUsers) {
// //     const employee = assignment.assigned_employee;

// //     if (!employee.email) {
// //       console.log(` No email found for ${employee.full_name}`);
// //       continue;
// //     }

// //     let notificationLog;
// //     try {
// //       const company = await prisma.hrms_d_default_configurations.findFirst({
// //         select: { company_name: true },
// //       });
// //       const company_name = company?.company_name || "HRMS System";

// //       const employeeDetails = await prisma.hrms_d_employee.findUnique({
// //         where: { id: employee.id },
// //         select: {
// //           hrms_employee_department: {
// //             select: { department_name: true },
// //           },
// //         },
// //       });

// //       const emailContent = await generateEmailContent(templateKey, {
// //         employee_name: employee.full_name,
// //         notification_title: setup.title || "System Notification",
// //         action_type: formatRequestType(getComponentName(model)),
// //         action: action,
// //         company_name: company_name,
// //         triggers: getActiveTriggers(setup),
// //         department_name:
// //           employeeDetails?.hrms_employee_department?.department_name ||
// //           "General",
// //         setup_date: new Date().toLocaleDateString(),
// //         datetime: new Date().toLocaleString(),
// //         request_type: formatRequestType(getComponentName(model)),

// //         ...responseData?.data,
// //       });

// //       notificationLog = await prisma.hrms_d_notification_log.create({
// //         data: {
// //           employee_id: employee.id,
// //           message_title: emailContent.subject,
// //           message_body: emailContent.body,
// //           channel: "email",
// //           sent_on: new Date(),
// //           status: "pending",
// //           createdby: req.user?.id || 1,
// //           createdate: new Date(),
// //           log_inst: req.user?.log_inst || 1,
// //         },
// //       });

// //       await sendEmail({
// //         to: employee.email,
// //         subject: emailContent.subject,
// //         html: emailContent.body,
// //         createdby: req.user?.id || 1,
// //         log_inst: req.user?.log_inst || 1,
// //       });

// //       await prisma.hrms_d_notification_log.update({
// //         where: { id: notificationLog.id },
// //         data: {
// //           status: "sent",
// //           sent_on: new Date(),
// //         },
// //       });

// //       console.log(
// //         ` Notification sent to ${employee.full_name} (${employee.email}) for ${action} ${model}`
// //       );
// //     } catch (emailError) {
// //       console.error(
// //         ` Failed to send notification to ${employee.full_name}:`,
// //         emailError
// //       );

// //       if (notificationLog) {
// //         await prisma.hrms_d_notification_log.update({
// //           where: { id: notificationLog.id },
// //           data: {
// //             status: "failed",
// //           },
// //         });
// //       }
// //     }
// //   }
// // };

// const handleNotificationTrigger = async (req, responseData) => {
//   try {
//     const action = getActionFromRequest(req);
//     const model = getModelFromRoute(req.route.path);

//     if (!shouldTriggerNotification(model, action)) {
//       return;
//     }

//     console.log(` Triggering notification for: ${action} ${model}`);

//     const actionConditions = [];
//     if (action === "create") actionConditions.push({ action_create: true });
//     if (action === "update") actionConditions.push({ action_update: true });
//     if (action === "delete") actionConditions.push({ action_delete: true });

//     if (actionConditions.length === 0) {
//       console.log(
//         ` No action conditions for ${action}, skipping notifications`
//       );
//       return;
//     }
//     console.log(
//       ` Action: ${action}, looking for setups with action_${action}: true`
//     );

//     const notificationSetups = await prisma.hrms_d_notification_setup.findMany({
//       where: {
//         action_type: getComponentName(model),
//         is_active: "Y",
//         OR: actionConditions,
//       },
//       distinct: ["title", "action_type"],
//       include: {
//         template: true,
//         hrms_d_notification_assigned: {
//           include: {
//             assigned_employee: {
//               select: {
//                 id: true,
//                 employee_code: true,
//                 full_name: true,
//                 email: true,
//                 profile_pic: true,
//                 department_name: true,
//               },
//             },
//           },
//           orderBy: { sort_order: "asc" },
//         },
//       },
//     });
//     console.log(
//       `Found setups:`,
//       notificationSetups.map((s) => ({
//         id: s.id,
//         title: s.title,
//         action_delete: s.action_delete,
//         action_create: s.action_create,
//         action_update: s.action_update,
//       }))
//     );
//     console.log(
//       `Found ${notificationSetups.length} unique notification setups to process`
//     );

//     notificationSetups.forEach((setup) => {
//       console.log(
//         ` Setup: ${setup.title}, action_delete: ${setup.action_delete}, action_create: ${setup.action_create}, action_update: ${setup.action_update}`
//       );
//     });

//     if (notificationSetups.length === 0) {
//       console.log(
//         ` No notification setups found for ${action} ${model}, skipping`
//       );
//       return;
//     }

//     for (const setup of notificationSetups) {
//       await processNotificationSetup(setup, action, model, responseData, req);
//     }
//   } catch (error) {
//     console.error("Error handling notification trigger:", error);
//   }
// };

// const processNotificationSetup = async (
//   setup,
//   action,
//   model,
//   responseData,
//   req
// ) => {
//   const { template, hrms_d_notification_assigned } = setup;

//   let templateKey;
//   if (template && template.key) {
//     templateKey = template.key;
//   } else {
//     templateKey = getDefaultTemplateKey(action);
//     console.log(
//       `Using fallback template key: ${templateKey} for setup: ${setup.title}`
//     );
//   }

//   let requesterInfo = null;
//   try {
//     if (responseData?.data) {
//       const employeeId =
//         responseData.data.employee_id ||
//         responseData.data.leave_employee?.id ||
//         responseData.data.createdby;

//       if (employeeId) {
//         console.log(
//           ` Looking up requester info for employee ID: ${employeeId}`
//         );
//         requesterInfo = await prisma.hrms_d_employee.findUnique({
//           where: { id: parseInt(employeeId) },
//           select: {
//             full_name: true,
//             hrms_employee_department: {
//               select: { department_name: true },
//             },
//           },
//         });
//         console.log(` Found requester: ${requesterInfo?.full_name}`);
//       }
//     }
//   } catch (error) {
//     console.error(" Error fetching requester info:", error);
//   }

//   console.log(
//     ` Processing notifications for ${hrms_d_notification_assigned.length} users`
//   );

//   const uniqueUsers = hrms_d_notification_assigned.filter(
//     (assignment, index, arr) =>
//       index ===
//       arr.findIndex(
//         (a) => a.assigned_employee.email === assignment.assigned_employee.email
//       )
//   );

//   console.log(
//     ` After user deduplication: ${uniqueUsers.length} unique recipients`
//   );

//   for (const assignment of uniqueUsers) {
//     const employee = assignment.assigned_employee;

//     if (!employee.email) {
//       console.log(` No email found for ${employee.full_name}`);
//       continue;
//     }

//     let notificationLog;
//     try {
//       const company = await prisma.hrms_d_default_configurations.findFirst({
//         select: { company_name: true },
//       });
//       const company_name = company?.company_name || "HRMS System";

//       const employeeDetails = await prisma.hrms_d_employee.findUnique({
//         where: { id: employee.id },
//         select: {
//           hrms_employee_department: {
//             select: { department_name: true },
//           },
//         },
//       });

//       const emailContent = await generateEmailContent(templateKey, {
//         employee_name: employee.full_name,
//         requester_name: requesterInfo?.full_name || "System User",
//         requester_department:
//           requesterInfo?.hrms_employee_department?.department_name ||
//           "Unknown Department",
//         notification_title: setup.title || "System Notification",
//         action_type: formatRequestType(getComponentName(model)),
//         action: action,
//         company_name: company_name,
//         triggers: getActiveTriggers(setup),
//         department_name:
//           employeeDetails?.hrms_employee_department?.department_name ||
//           "General",
//         setup_date: new Date().toLocaleDateString(),
//         datetime: new Date().toLocaleString(),
//         request_type: formatRequestType(getComponentName(model)),
//         ...responseData?.data,
//       });

//       notificationLog = await prisma.hrms_d_notification_log.create({
//         data: {
//           employee_id: employee.id,
//           message_title: emailContent.subject,
//           message_body: emailContent.body,
//           channel: "email",
//           sent_on: new Date(),
//           status: "pending",
//           createdby: req.user?.id || 1,
//           createdate: new Date(),
//           log_inst: req.user?.log_inst || 1,
//         },
//       });

//       await sendEmail({
//         to: employee.email,
//         subject: emailContent.subject,
//         html: emailContent.body,
//         createdby: req.user?.id || 1,
//         log_inst: req.user?.log_inst || 1,
//       });

//       await prisma.hrms_d_notification_log.update({
//         where: { id: notificationLog.id },
//         data: {
//           status: "sent",
//           sent_on: new Date(),
//         },
//       });

//       console.log(
//         ` Notification sent to ${employee.full_name} (${employee.email}) for ${action} ${model}`
//       );
//     } catch (emailError) {
//       console.error(
//         ` Failed to send notification to ${employee.full_name}:`,
//         emailError
//       );

//       if (notificationLog) {
//         await prisma.hrms_d_notification_log.update({
//           where: { id: notificationLog.id },
//           data: { status: "failed" },
//         });
//       }
//     }
//   }
// };

// const getDefaultTemplateKey = (action) => {
//   const defaultTemplates = {
//     create: "notification_setup_created",
//     update: "notification_setup_updated",
//     delete: "notification_setup_deleted",
//   };
//   return defaultTemplates[action] || "notification_setup_created";
// };

// const getActiveTriggers = (setup) => {
//   const triggers = [];
//   if (setup.action_create) triggers.push("Create");
//   if (setup.action_update) triggers.push("Update");
//   if (setup.action_delete) triggers.push("Delete");
//   return triggers.join(", ");
// };

// const shouldTriggerNotification = (model, action) => {
//   const watchedModels = [
//     "hrms_d_leave_application",
//     "hrms_d_asset_assignment",
//     "hrms_d_employee",
//     "hrms_d_daily_attendance_entry",
//     "hrms_d_payroll",
//   ];
//   const watchedActions = ["create", "update", "delete"];

//   return watchedModels.includes(model) && watchedActions.includes(action);
// };

// const getActionFromRequest = (req) => {
//   const method = req.method.toLowerCase();
//   if (method === "post") return "create";
//   if (method === "put" || method === "patch") return "update";
//   if (method === "delete") return "delete";
//   return null;
// };

// const getModelFromRoute = (routePath) => {
//   const routeToModelMap = {
//     "/leave-application": "hrms_d_leave_application",
//     "/asset-assignment": "hrms_d_asset_assignment",
//     "/employee": "hrms_d_employee",
//     "/attendance": "hrms_d_daily_attendance_entry",
//     "/payroll": "hrms_d_payroll",
//   };

//   for (const [route, model] of Object.entries(routeToModelMap)) {
//     if (routePath.includes(route)) {
//       return model;
//     }
//   }

//   return null;
// };

// const getComponentName = (model) => {
//   const componentMap = {
//     hrms_d_leave_application: "leave",
//     hrms_d_asset_assignment: "asset",
//     hrms_d_employee: "employee",
//     hrms_d_daily_attendance_entry: "attendance",
//     hrms_d_payroll: "payroll",
//   };
//   return componentMap[model] || model;
// };

// const formatRequestType = (type) => {
//   return type
//     .replace(/_/g, " ")
//     .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1));
// };

// module.exports = { setupNotificationMiddleware };

const { PrismaClient } = require("@prisma/client");
const sendEmail = require("../../utils/mailer.js");
const { generateEmailContent } = require("../../utils/emailTemplates.js");

const prisma = new PrismaClient();

const templateKeyMap = {
  notificationSetupCreated: "notification_setup_created",
  notificationSetupUpdated: "notification_setup_updated",
  notificationSetupDeleted: "notification_setup_deleted",
};

const setupNotificationMiddleware = (req, res, next, action_type, action) => {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    const result = originalJson(data);

    if (res.statusCode >= 200 && res.statusCode < 300) {
      processNotification(req, res, data, action_type, action).catch(
        (error) => {
          console.error("Notification processing error:", error);
        }
      );
    }

    return result;
  };

  next();
};

const processNotification = async (
  req,
  res,
  responseData,
  action_type,
  action
) => {
  try {
    console.log(
      `Processing notification for action_type: ${action_type}, action: ${action}`
    );

    const findNotificationSetup =
      await prisma.hrms_d_notification_setup.findFirst({
        where: {
          action_type,
          is_active: "Y",
        },
        include: {
          hrms_d_notification_assigned: {
            include: {
              assigned_employee: {
                select: { id: true, full_name: true, email: true },
              },
            },
          },
        },
      });

    if (!findNotificationSetup) {
      console.log(
        `No notification setup found for action_type: ${action_type}`
      );
      return;
    }

    const assigned_employees =
      findNotificationSetup.hrms_d_notification_assigned;

    if (!assigned_employees || assigned_employees.length === 0) {
      console.log(`No assigned employees found for notification setup`);
      return;
    }

    const company = await prisma.hrms_d_default_configurations.findFirst({
      select: { company_name: true },
    });
    const company_name = company?.company_name || "Company";

    let requesterInfo = null;
    try {
      if (req.user?.id) {
        requesterInfo = await prisma.hrms_d_employee.findUnique({
          where: { id: req.user.id },
          select: {
            id: true,
            full_name: true,
            email: true,
            hrms_employee_department: {
              select: { department_name: true },
            },
          },
        });
      }

      if (!requesterInfo && responseData?.data) {
        const employeeId =
          responseData.data.employee_id ||
          responseData.data.leave_employee?.id ||
          responseData.data.createdby;

        if (employeeId) {
          requesterInfo = await prisma.hrms_d_employee.findUnique({
            where: { id: parseInt(employeeId) },
            select: {
              id: true,
              full_name: true,
              email: true,
              hrms_employee_department: {
                select: { department_name: true },
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching requester info:", error);
    }

    const requester_name =
      requesterInfo?.full_name || req.user?.full_name || "System User";
    const requester_department =
      requesterInfo?.hrms_employee_department?.department_name || " Department";

    console.log(
      `Requester identified as: ${requester_name} from ${requester_department}`
    );

    let shouldSendNotification = false;
    let templateKey = null;

    if (action === "create" && findNotificationSetup.action_create) {
      shouldSendNotification = true;
      templateKey = templateKeyMap.notificationSetupCreated;
    } else if (action === "update" && findNotificationSetup.action_update) {
      shouldSendNotification = true;
      templateKey = templateKeyMap.notificationSetupUpdated;
    } else if (action === "delete" && findNotificationSetup.action_delete) {
      shouldSendNotification = true;
      templateKey = templateKeyMap.notificationSetupDeleted;
    }

    if (!shouldSendNotification) {
      console.log(`Notification not enabled for action: ${action}`);
      return;
    }

    console.log(
      `Sending notifications to ${assigned_employees.length} employees`
    );

    const notificationPromises = assigned_employees.map(async (item) => {
      try {
        const assignedEmployee = item.assigned_employee;

        if (!assignedEmployee.email) {
          console.log(
            `No email found for employee: ${assignedEmployee.full_name}`
          );
          return;
        }

        const emailTemplateData = {
          employee_name: assignedEmployee.full_name,
          recipient_name: assignedEmployee.full_name,

          requester_name: requester_name,
          requester_department: requester_department,

          action_type: formatActionType(action_type),
          action: formatAction(action),
          company_name,
          department_name: requester_department,
          notification_title: `${formatActionType(action_type)} ${formatAction(
            action
          )}`,
          datetime: new Date().toLocaleString(),

          ...responseData?.data,
        };

        console.log(
          `Sending notification to: ${assignedEmployee.full_name} about request by: ${requester_name}`
        );

        const template = await generateEmailContent(
          templateKey,
          emailTemplateData
        );

        const notificationLog = await prisma.hrms_d_notification_log.create({
          data: {
            employee_id: assignedEmployee.id,
            message_title: template.subject,
            message_body: template.body,
            channel: "email",
            status: "pending",
            createdby: req.user?.id || 1,
            createdate: new Date(),
            log_inst: req.user?.log_inst || 1,
          },
        });

        await sendEmail({
          to: assignedEmployee.email,
          subject: template.subject,
          html: template.body,
          log_inst: req.user?.log_inst || 1,
        });

        await prisma.hrms_d_notification_log.update({
          where: { id: notificationLog.id },
          data: {
            status: "sent",
            sent_on: new Date(),
          },
        });

        console.log(
          `Notification sent successfully to: ${assignedEmployee.email}`
        );
      } catch (emailError) {
        console.error(
          `Failed to send notification to ${item.assigned_employee.email}:`,
          emailError
        );

        try {
          await prisma.hrms_d_notification_log.updateMany({
            where: {
              employee_id: item.assigned_employee.id,
              status: "pending",
              message_title: { contains: formatActionType(action_type) },
            },
            data: { status: "failed" },
          });
        } catch (updateError) {
          console.error(
            "Failed to update notification log status:",
            updateError
          );
        }
      }
    });

    await Promise.allSettled(notificationPromises);
    console.log("All notifications processed");
  } catch (error) {
    console.error("Error in processNotification:", error);
  }
};

const formatActionType = (actionType) => {
  return actionType.charAt(0).toUpperCase() + actionType.slice(1);
};

const formatAction = (action) => {
  const actionMap = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
  };
  return actionMap[action] || action;
};

module.exports = { setupNotificationMiddleware };
