// const nodemailer = require("nodemailer");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// const sendEmail = async ({ to, subject, html, log_inst }) => {
//   try {
//     let config = await prisma.hrms_d_default_configurations.findFirst({
//       where: { log_inst },
//     });
//     if (!config) {
//       console.warn(
//         `No SMTP config found for log_inst=${log_inst}, falling back to .env`
//       );
//       config = {};
//     }
//     const transporter = nodemailer.createTransport({
//       host: config.smtp_host || process.env.SMTP_HOST,
//       port: config.smtp_port || process.env.SMTP_PORT,
//       secure: true,
//       auth: {
//         user: config.smtp_username || process.env.SMTP_USERNAME,
//         pass: config.smtp_password || process.env.SMTP_PASSWORD,
//       },
//     });
//     console.log("EMAIL DEBUG:");
//     console.log("To:", to);
//     console.log("Subject:", subject);
//     console.log("HTML Body:", html);
//     await transporter.sendMail({
//       from: config.smtp_username || process.env.SMTP_USERNAME,
//       to,
//       subject,
//       html,
//     });

//     console.log(` Email sent to: ${to} from company log_inst=${log_inst}`);
//   } catch (err) {
//     console.error(`Failed to send email to ${to}: ${err.message}`);
//     throw new Error(`${err.message}`);
//   }
// };

// module.exports = sendEmail;

const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sendEmail = async ({ to, subject, html, log_inst }) => {
  try {
    let config = await prisma.hrms_d_default_configurations.findFirst({
      where: { log_inst },
    });

    if (!config) {
      console.warn(
        `No SMTP config found for log_inst=${log_inst}, falling back to .env`
      );
      config = {};
    }

    const port = Number(config.smtp_port || process.env.SMTP_PORT || 587);

    const transporter = nodemailer.createTransport({
      host: config.smtp_host || process.env.SMTP_HOST,
      port,
      secure: port === 465, // only true for SSL
      auth: {
        user: config.smtp_username || process.env.SMTP_USERNAME,
        pass: config.smtp_password || process.env.SMTP_PASSWORD,
      },
    });

    console.log("EMAIL DEBUG:");
    console.log("SMTP Host:", config.smtp_host || process.env.SMTP_HOST);
    console.log("SMTP Port:", port);
    console.log(
      "SMTP User:",
      config.smtp_username || process.env.SMTP_USERNAME
    );
    console.log("To:", to);
    console.log("Subject:", subject);

    const info = await transporter.sendMail({
      from: config.smtp_username || process.env.SMTP_USERNAME,
      to,
      subject,
      html,
    });

    console.log(`Email sent to: ${to}`);
  } catch (err) {
    console.error("❌ Email error:", err);
    throw new Error(`Email failed: ${err.message}`);
  }
};

module.exports = sendEmail;
