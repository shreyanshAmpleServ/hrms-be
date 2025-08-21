const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sendEmail = async ({ to, subject, html, log_inst }) => {
  try {
    const config = await prisma.hrms_d_default_configurations.findFirst({
      where: { log_inst },
    });
    const transporter = nodemailer.createTransport({
      host: config.smtp_host || process.env.SMTP_HOST,
      port: config.smtp_port || process.env.SMTP_PORT,
      secure: config.smtp_port === 465,
      auth: {
        user: config.smtp_username || process.env.SMTP_USERNAME,
        pass: config.smtp_password || process.env.SMTP_PASSWORD,
      },
    });
    console.log("EMAIL DEBUG:");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML Body:", html);
    await transporter.sendMail({
      from: config.smtp_username || process.env.SMTP_USERNAME,
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
