const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sendEmail = async ({ to, subject, html, log_inst }) => {
  try {
    const config = await prisma.hrms_d_default_configurations.findFirst({
      where: { log_inst },
    });

    if (
      !config?.smtp_host ||
      !config?.smtp_username ||
      !config?.smtp_password
    ) {
      throw new Error(
        `SMTP settings not found for company (log_inst=${log_inst})`
      );
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_username,
        pass: config.smtp_password,
      },
    });

    await transporter.sendMail({
      from: config.smtp_username,
      to,
      subject,
      html,
    });

    console.log(` Email sent to: ${to} from company log_inst=${log_inst}`);
  } catch (err) {
    console.error(`Failed to send email to ${to}: ${err.message}`);
    throw new Error(`${err.message}`);
  }
};

module.exports = sendEmail;
