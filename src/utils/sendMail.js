const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
const moment = require("moment");
const emailQueue = require("./emailQueue");
require("dotenv").config();

const scheduleCallReminder = (call, reminderMinutes = 10) => {
  const callDate = new Date(call.call_start_date);
  const reminderTime = new Date(callDate.getTime() - reminderMinutes * 60000);

  if (reminderTime <= new Date()) {
    console.log("⏭️ Too late for a reminder.");
    return;
  }

  emailQueue.add(
    { user: call.assigned_to_user, call },
    {
      delay: reminderTime.getTime() - Date.now(),
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    }
  );

  console.log(`📨 Scheduled email for ${call.assigned_to_user.email} at ${reminderTime}`);
};

const sendEmailNotification = async (user, call) => {
    if (!call?.created_by_user?.email) {
        console.error("Missing sender email");
        return;
    }
    try {
        let transporter = nodemailer.createTransport({
            service: "smtp", // Use a valid email service
            // service: "gmail", // Use a valid email service
            // host: "smtp.ethereal.email",
            // host: "smtp.gmail.com",
            host:"smtp-relay.sendinblue.com",
            port: 587,
            secure: false, 
            auth: {
                user:"ali.shariff@doubleclick.co.tz", // Your email
                pass: process.env.COMPANY_SMTP_PASS,
                // pass: process.env.EMAIL_PASS, // App password (not your actual password)
            },
        });

        let mailOptions = {
            from: call?.created_by_user?.email || process.env.EMAIL_USER,
            replyTo: call?.created_by_user?.email || process.env.EMAIL_USER,
            to: user.email,
            subject: "📞 New Call Scheduled",
            text: `Hello ${user.full_name}, You’ve been assigned a new call on ${moment(call.call_start_date).format("ll")} at ${moment(call.call_start_time).format("HH:mm A")} for ${call.created_by_user?.full_name}.
            Call Purpose is ${call.crms_m_callpurposes?.name}.`,     
            html: `<div style="display:none; max-height:0px; overflow:hidden;">
                        Hello ${user.full_name}, you’ve been assigned a new call on ${moment(call.call_start_date).format("ll")} at ${moment(call.call_start_time).format("HH:mm A")} by ${call.created_by_user?.full_name}.
                  Call Purpose is ${call.crms_m_callpurposes?.name}.
                    </div>
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
                     <h2 style="color: #007bff;">📅 New Call Assignment</h2>
                     <p>Hello <strong>${user.full_name}</strong>,</p>
                     <p>You have been assigned a new call. Below are the details:</p>
                     <table style="width: 100%; border-collapse: collapse;">
                         <tr>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📆 Date:</strong></td>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;">${moment(call.call_start_date).format("ll")}</td>
                         </tr>
                         <tr>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>⏰ Time:</strong></td>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;">${moment(call.call_start_time).format("HH:mm A")}</td>
                         </tr>
                         <tr>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📞 Call For:</strong></td>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.call_for}</td>
                         </tr>
                         <tr>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Call To:</strong></td>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.call_for === "Account" ? call.crms_m_contact_call_for?.firstName + call.crms_m_contact_call_for?.lastName : call.call_for === "Leads" ? call.crms_leads?.first_name + call.crms_leads?.last_name  : call.crms_project?.name}</td>
                         </tr>
                         <tr>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📲 Call Purpose:</strong></td>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.crms_m_callpurposes?.name}</td>
                         </tr>
                         <tr>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Created By:</strong></td>
                             <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.created_by_user?.full_name}</td>
                         </tr>
                     </table>
                     <p>Best Regards,<br><strong>DCC CRM Team</strong></p>
                  </div>`,
};

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
const sendEmailNotificationReminder = async (user, call) => {
    if (!call?.created_by_user?.email) {
        console.error("Missing sender email");
        return;
    }
    try {
        let transporter = nodemailer.createTransport({
            service: "smtp", // Use a valid email service
            // service: "gmail", // Use a valid email service
            // host: "smtp.ethereal.email",
            // host: "smtp.gmail.com",
            host:"smtp-relay.sendinblue.com",
            port: 587,
            secure: false, 
            auth: {
                user:"ali.shariff@doubleclick.co.tz", // Your email
                pass: process.env.COMPANY_SMTP_PASS,
                // pass: process.env.EMAIL_PASS, // App password (not your actual password)
            },
        });

        let mailOptions = {
            from: call?.created_by_user?.email || process.env.EMAIL_USER,
            replyTo: call?.created_by_user?.email || process.env.EMAIL_USER,
            to: user.email,
            subject: "🔔Reminder Call ",
            text: `Hello ${user.full_name},You have been assigned a new call on ${moment(call.call_start_date).format("ll")} 
            at ${moment(call.call_start_time).format("HH:mm A")}  by ${call.created_by_user?.full_name}.
            Call Purpose is ${call.crms_m_callpurposes?.name}.`,

            html: `
            <div style="display:none; max-height:0px; overflow:hidden;">
                  Hello ${user.full_name}, you’ve been assigned a new call on ${moment(call.call_start_date).format("ll")} at ${moment(call.call_start_time).format("HH:mm A")} by ${call.created_by_user?.full_name}.
                  Call Purpose is ${call.crms_m_callpurposes?.name}.
            </div>
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
                <h2 style="color: #007bff;">📅 Reminder for Call</h2>
                <p>Hello <strong>${user.full_name}</strong>,</p>
                <p>You have been assigned a new call. Below are the details:</p>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📆 Date:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${moment(call.call_start_date).format("ll")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>⏰ Time:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${moment(call.call_start_time).format("HH:mm A")}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📞 Call For:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.call_for}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Call To:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.call_for === "Account" ? call.crms_m_contact_call_for?.firstName + call.crms_m_contact_call_for?.lastName : call.call_for === "Leads" ? call.crms_leads?.first_name + call.crms_leads?.last_name  : call.crms_project?.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>📲 Call Purpose:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.crms_m_callpurposes?.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>👤 Created By:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${call.created_by_user?.full_name}</td>
                    </tr>
                </table>
                <p>Best Regards,<br><strong>DCC CRM Team</strong></p>
            </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Reminder Email sent to ${user.email}`);
    } catch (error) {
        console.error("Error sending reminder email:", error);
    }
};
// const scheduledJobs = new Map(); // Optional: for tracking jobs
// const scheduleCallReminder = (call, reminderMinutes = 10) => {
//   const callDate = new Date(call.call_start_date);
//   const reminderTime = new Date(callDate.getTime() - reminderMinutes * 60000);
//   console.log("Reminder Time:", new Date(reminderTime))
//   if (reminderTime <= new Date()) {
//       return
//     };
  
//   const job = schedule.scheduleJob(reminderTime, async () => {
//       try {
//         if (call) {
//         await sendEmailNotificationReminder(call.assigned_to_user, call);
//       }
//     } catch (err) {
//       console.error("Failed to send reminder email:", err.message);
//     }
//   });
  
//   scheduledJobs.set(call.id, job); // Optional: track/cancel jobs later
// };
module.exports = {scheduleCallReminder, sendEmailNotification,sendEmailNotificationReminder };
