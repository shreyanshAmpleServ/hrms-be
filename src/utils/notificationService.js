const { PrismaClient } = require("@prisma/client");
const { generateEmailContent } = require("./emailTemplates");
const sendEmail = require("./mailer");
const prisma = new PrismaClient();

class NotificationService {
  static async sendNotifications({
    notificationSetup,
    recipientIds,
    data,
    action = "triggered",
  }) {
    try {
      const recipients = await this.getRecipients(recipientIds);
      const channels = this.getActiveChannels(notificationSetup);

      console.log(
        `[Notification] Sending to ${
          recipients.length
        } recipients via channels: ${channels.join(", ")}`
      );

      const promises = [];

      if (channels.includes("email")) {
        promises.push(
          this.sendEmailNotifications(
            notificationSetup,
            recipients,
            data,
            action
          )
        );
      }

      if (channels.includes("system")) {
        promises.push(
          this.sendSystemNotifications(
            notificationSetup,
            recipients,
            data,
            action
          )
        );
      }

      if (channels.includes("whatsapp")) {
        promises.push(
          this.sendWhatsAppNotifications(
            notificationSetup,
            recipients,
            data,
            action
          )
        );
      }

      if (channels.includes("sms")) {
        promises.push(
          this.sendSMSNotifications(notificationSetup, recipients, data, action)
        );
      }

      await Promise.allSettled(promises);
      console.log(
        `[Notification] Successfully processed notifications for setup: ${notificationSetup.title}`
      );
    } catch (error) {
      console.error("[Notification Error]:", error);
    }
  }

  static getActiveChannels(notificationSetup) {
    const channels = [];
    if (notificationSetup.channel_email) channels.push("email");
    if (notificationSetup.channel_system) channels.push("system");
    if (notificationSetup.channel_whatsapp) channels.push("whatsapp");
    if (notificationSetup.channel_sms) channels.push("sms");
    return channels;
  }

  static async getRecipients(recipientIds) {
    return await prisma.hrms_d_employee.findMany({
      where: { id: { in: recipientIds } },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });
  }

  static async sendEmailNotifications(
    notificationSetup,
    recipients,
    data,
    action
  ) {
    try {
      const company = await prisma.hrms_d_default_configurations.findFirst({
        select: { company_name: true },
      });
      const company_name = company?.company_name || "HRMS System";

      for (const recipient of recipients) {
        if (recipient.email) {
          const template = await generateEmailContent(
            notificationSetup.template_id,
            {
              employee_name: recipient.full_name,
              notification_title: notificationSetup.title,
              action_type: this.formatActionType(notificationSetup.action_type),
              action: action,
              company_name,
              department_name:
                recipient.hrms_employee_department?.department_name,
              ...data,
            }
          );

          await sendEmail({
            to: recipient.email,
            subject: template.subject,
            html: template.body,
          });

          console.log(`[Email Sent] → ${recipient.email}`);
        }
      }
    } catch (error) {
      console.error("Email notification error:", error);
    }
  }

  static async sendSystemNotifications(
    notificationSetup,
    recipients,
    data,
    action
  ) {
    try {
      const template = await this.getTemplate(notificationSetup.template_id);

      const notifications = recipients.map((recipient) => ({
        employee_id: recipient.id,
        message_title: this.processTemplate(
          template?.subject || notificationSetup.title,
          {
            employee_name: recipient.full_name,
            action_type: this.formatActionType(notificationSetup.action_type),
            ...data,
          }
        ),
        message_body: this.processTemplate(
          template?.body || `${notificationSetup.title} notification`,
          {
            employee_name: recipient.full_name,
            action_type: this.formatActionType(notificationSetup.action_type),
            action: action,
            ...data,
          }
        ),
        channel: "system",
        sent_on: new Date(),
        status: "sent",
        createdate: new Date(),
        createdby: data.createdby || 1,
        log_inst: data.log_inst || null,
      }));

      await prisma.hrms_d_notification_log.createMany({
        data: notifications,
      });

      console.log(
        `[System Notifications] Created ${notifications.length} system notifications`
      );
    } catch (error) {
      console.error("System notification error:", error);
    }
  }

  static async getTemplate(templateId) {
    if (!templateId) return null;

    return await prisma.hrms_d_templates.findUnique({
      where: { id: templateId },
      select: { subject: true, body: true },
    });
  }

  static processTemplate(template, variables) {
    if (!template) return "";

    let processed = template;
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      processed = processed.replace(regex, variables[key] || "");
    });

    return processed;
  }

  static formatActionType(type) {
    const actionTypeMap = {
      leave: "Leave Request",
      asset: "Asset Management",
      employee: "Employee Management",
      attendance: "Attendance",
      payroll: "Payroll",
    };
    return actionTypeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  static async sendWhatsAppNotifications(
    notificationSetup,
    recipients,
    data,
    action
  ) {
    console.log("[WhatsApp] Feature not implemented yet");
  }

  static async sendSMSNotifications(
    notificationSetup,
    recipients,
    data,
    action
  ) {
    console.log("[SMS] Feature not implemented yet");
  }
}

module.exports = NotificationService;
