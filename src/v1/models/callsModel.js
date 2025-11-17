const CustomError = require("../../utils/CustomError");
const { getPrisma } = require("../../config/prismaContext.js");

const {
  sendEmailNotification,
  scheduleCallReminder,
} = require("../../utils/sendMail");

const combineDateAndTime = (date, time) => {
  if (date && time) {
    const dateObj = new Date(date); // Convert due_date (ISO format) to Date object
    const timeObj = new Date(time); // Convert due_time (ISO format) to Date object

    // Extract UTC Hours & Minutes from the time
    const hours = timeObj.getUTCHours();
    const minutes = timeObj.getUTCMinutes();

    // Apply extracted time to the due_date
    dateObj.setUTCHours(hours, minutes, 0, 0);
    return dateObj;
  }
  // else{
  //     return date
  // }
};
// const sendEmailNotification = async (user, call) => {
//     console.log("Send Email data :",user,call,call?.created_by_user?.email)
//     if (!call?.created_by_user?.email) {
//         console.error("Missing sender email");
//         return;
//     }
//     try {
//         let transporter = nodemailer.createTransport({
//             service: "smtp", // Use a valid email service
//             // service: "gmail", // Use a valid email service
//             // host: "smtp.ethereal.email",
//             // host: "smtp.gmail.com",
//             host:"smtp-relay.sendinblue.com",
//             port: 587,
//             secure: false,
//             auth: {
//                 user:"ali.shariff@doubleclick.co.tz", // Your email
//                 pass: process.env.COMPANY_SMTP_PASS,
//                 // pass: process.env.EMAIL_PASS, // App password (not your actual password)
//             },
//         });

//         let mailOptions = {
//             from: `${call?.created_by_user?.email}`,
//             replyTo: call?.created_by_user?.email || process.env.EMAIL_USER,
//             to: user.email,
//             subject: "New Call Assignment",
//             text: `Hello ${user.full_name},

// You have been assigned a new call.

// Call Details:
// Date: ${moment(call.call_start_date).format("ll")}
// Time: ${moment(call.call_start_time).format("HH:mm A")}
// Created By: ${call.createdby}

// Best Regards,
// Your Team`,
//     html: `
//     <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
//         <h2 style="color: #007bff;">📅 New Call Assignment</h2>
//         <p>Hello <strong>${user.full_name}</strong>,</p>
//         <p>You have been assigned a new call. Below are the details:</p>
//         <table style="width: 100%; border-collapse: collapse;">
//             <tr>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📆 Date:</strong></td>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;">${moment(call.call_start_date).format("ll")}</td>
//             </tr>
//             <tr>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>⏰ Time:</strong></td>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;">${moment(call.call_start_time).format("HH:mm A")}</td>
//             </tr>
//             <tr>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📞 Call For:</strong></td>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.call_for}</td>
//             </tr>
//             <tr>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Call To:</strong></td>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.call_for === "Account" ? call.crms_m_contact_call_for?.firstName + call.crms_m_contact_call_for?.lastName : call.call_for === "Leads" ? call.crms_leads?.first_name + call.crms_leads?.last_name  : call.crms_project?.name}</td>
//             </tr>
//             <tr>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📲 Call Purpose:</strong></td>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.crms_m_callpurposes?.name}</td>
//             </tr>
//             <tr>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Created By:</strong></td>
//                 <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.created_by_user?.full_name}</td>
//             </tr>
//         </table>
//         <p>Best Regards,<br><strong>DCC CRM Team</strong></p>
//     </div>
//     `,
// };

//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${user.email}`);
//     } catch (error) {
//         console.error("Error sending email:", error);
//     }
// };

// Create a new call

const createCalls = async (data, user) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    if (!data.call_start_date || !data.call_start_time) {
      throw new CustomError("Call start date and time cannot be null", 400);
    }

    const calls = await prisma.crms_calls.create({
      data: {
        ...data,
        createdate: new Date(),
        call_start_date: combineDateAndTime(
          data.call_start_date,
          data.call_start_time
        ),
        updatedate: new Date(),
        createdby: user?.id || 1,
        log_inst: data.log_inst || 1,
      },
      include: {
        assigned_to_user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        crms_m_callpurposes: {
          select: {
            id: true,
            name: true,
          },
        },
        created_by_user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        crms_m_contact_call_for: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        crms_leads: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        crms_project: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_contact_related_to: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        crms_m_call_statuses: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    (async () => {
      try {
        if (
          calls.assigned_to_user?.email &&
          data?.ongoing_callStatus === "Scheduled" &&
          (calls.reminder_type === "Email" || calls.reminder_type === "Both")
        ) {
          await sendEmailNotification(calls.assigned_to_user, calls);
          scheduleCallReminder(calls, calls.call_reminder || 10);
        }
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr.message);
      }
    })();

    return calls;
  } catch (error) {
    console.log("Error to Creating Calls", error);
    throw new CustomError(`Error creating call : ${error.message}`, 500);
  }
};

// Find a call  by ID
const findCallsById = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const calls = await prisma.crms_calls.findUnique({
      where: { id: parseInt(id) },
    });
    if (!calls) {
      throw new CustomError("Call  not found", 404);
    }
    return calls;
  } catch (error) {
    throw new CustomError(`Error finding call  by ID: ${error.message}`, 503);
  }
};

// Update a call
const updateCalls = async (id, data) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    const updatedCalls = await prisma.crms_calls.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        call_start_date: combineDateAndTime(
          data.call_start_date,
          data.call_start_time
        ),
        updatedate: new Date(),
      },
      include: {
        crms_m_callpurposes: {
          select: {
            id: true,
            name: true,
          },
        },
        assigned_to_user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        created_by_user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        crms_m_contact_call_for: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        crms_leads: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        crms_project: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_contact_related_to: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        crms_m_call_statuses: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    (async () => {
      try {
        if (
          updatedCalls.assigned_to_user?.email &&
          data?.ongoing_callStatus === "Scheduled" &&
          (updatedCalls.reminder_type === "Email" ||
            updatedCalls.reminder_type === "Both")
        ) {
          await sendEmailNotification(
            updatedCalls.assigned_to_user,
            updatedCalls
          );
          scheduleCallReminder(updatedCalls, updatedCalls.call_reminder || 30);
        }
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr.message);
      }
    })();

    return updatedCalls;
  } catch (error) {
    throw new CustomError(`Error updating call : ${error.message}`, 500);
  }
};

// Delete a call
const deleteCalls = async (id) => {
  const prisma = getPrisma();
  try {
    const prisma = getPrisma();
    await prisma.crms_calls.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

// Get all call results
const getAllCalls = async (data) => {
  const prisma = getPrisma();
  try {
    page = !data?.page || data?.page == 0 ? 1 : data?.page;
    size = data?.size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (data?.search) {
      filters.OR = [
        {
          created_by_user: {
            full_name: { contains: data.search.toLowerCase() },
          },
        },
        {
          crms_m_contact_call_for: {
            firstName: { contains: data.search.toLowerCase() },
          },
        },
        {
          crms_leads: {
            first_name: { contains: data.search.toLowerCase() },
          },
        },
        {
          crms_project: {
            name: { contains: data.search.toLowerCase() },
          },
        },
        {
          crms_m_contact_related_to: {
            firstName: { contains: data.search.toLowerCase() },
          },
        },
      ];
    }
    if (data.lead_id) {
      filters.call_for_lead_id = { equals: Number(data.lead_id) };
    }
    if (data.project_id) {
      filters.call_for_project_id = { equals: Number(data.project_id) };
    }
    if (data.callType) {
      filters.ongoing_callStatus = { equals: data.callType };
    }
    // if(data.contact_id){
    //   filters.crms_m_activitytypes = {
    //     is: {
    //       name: {
    //         equals: data.filter2
    //       },
    //     },
    // }}
    // Combine extended filters (contact_id and category conditions)
    if (data?.contact_id) {
      filters.OR = [
        ...(filters.OR || []),
        {
          call_for: "Accounts",
          call_for_contact_id: Number(data.contact_id),
        },
        {
          assigned_to: Number(data.contact_id),
        },
        {
          // related_to: Number(2),
          related_to_id: Number(data.contact_id),
        },
      ];
    }

    if (data?.callCategory) {
      filters.OR = [
        ...(filters.OR || []),
        {
          call_for: data.callCategory,
        },
        {
          related_to: data.callCategory,
        },
      ];
    }

    if (data?.startDate && data?.endDate) {
      const start = new Date(data?.startDate);
      const end = new Date(data?.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }
    const calls = await prisma.crms_calls.findMany({
      where: filters,
      skip: skip,
      take: size,
      //     where: {
      //     // ...(data?.lead_id && {
      //     //     call_for_lead_id: Number(data.lead_id),
      //     // }),
      //     // ...(data?.project_id && {
      //     //     call_for_project_id: Number(data.project_id),
      //     // }),
      //     // ...(data?.callType && {
      //     //     ongoing_callStatus: data.callType,
      //     // }),
      //     ...(data?.contact_id && {
      //         OR: [
      //             {
      //                 call_for: "Accounts", // Match where call_for is "Accounts"
      //                 call_for_contact_id: Number(data.contact_id), // Compare with contact_id
      //             },
      //             {
      //                 assigned_to: Number(data.contact_id), // Match assigned_to key with contact_id
      //             },
      //             {
      //                 related_to: Number(2), // Match related_to with value 2
      //                 related_to_id: Number(data.contact_id), // Compare with related_to_id

      //             },
      //         ],
      //     }),
      //     ...(data?.callCategory && {
      //         OR: [
      //             {
      //                 call_for: data?.callCategory,
      //             },
      //             {
      //                 related_to: data?.callCategory, // Match related_to key with contact_id
      //             },
      //         ],
      //     }),

      // },
      include: {
        crms_m_callpurposes: {
          select: {
            id: true,
            name: true,
          },
        },
        assigned_to_user: {
          select: {
            id: true,
            full_name: true,
          },
        },
        created_by_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
          },
        },
        crms_m_contact_call_for: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        crms_leads: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        crms_project: {
          select: {
            id: true,
            name: true,
          },
        },
        crms_m_contact_related_to: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        crms_m_call_statuses: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const finalCalls = calls.map((activity) => {
      const { call_start_date, call_start_time, ...rest } = activity;

      const combinedDueDateTime =
        call_start_date && call_start_time
          ? combineDateAndTime(call_start_date, call_start_time)
          : null;
      return {
        ...rest,
        call_start_date: combinedDueDateTime
          ? combinedDueDateTime
          : call_start_date,
        call_start_time: call_start_time,
      };
    });
    const totalCount = await prisma.crms_calls.count();
    return {
      data: finalCalls,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
    // return finalCalls;
  } catch (error) {
    console.log("Error getting Calls", error);
    throw new CustomError("Error retrieving call results", 503);
  }
};

module.exports = {
  createCalls,
  findCallsById,
  updateCalls,
  deleteCalls,
  getAllCalls,
};
