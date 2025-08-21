const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const { generateEmailContent } = require("../../utils/emailTemplates");
const sendEmail = require("../../utils/mailer");

const previewAnniversaryEmail = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: Number(employeeId) },
      select: { full_name: true, email: true, log_inst: true },
    });

    if (!employee) throw new CustomError("Employee not found", 404);

    const emailContent = await generateEmailContent("work_anniversary", {
      employee_name: employee.full_name,
    });

    res.json({
      to: employee.email,
      subject: emailContent.subject,
      body: emailContent.body,
    });
  } catch (error) {
    next(error);
  }
};

// const sendAnniversaryEmail = async (req, res, next) => {
//   try {
//     const { employeeId } = req.params;

//     const employee = await prisma.hrms_d_employee.findUnique({
//       where: { id: Number(employeeId) },
//       select: {
//         full_name: true,
//         email: true,
//         log_inst: true,
//         join_date: true,
//         hrms_employee_department: {
//           select: { department_name: true },
//         },
//       },
//     });

//     if (!employee) throw new CustomError("Employee not found", 404);

//     const sender = await prisma.hrms_d_employee.findUnique({
//       where: { id: req.user.id },
//       select: {
//         full_name: true,
//         hrms_employee_department: {
//           select: { department_name: true },
//         },
//       },
//     });

//     const joinDate = employee.join_date ? new Date(employee.join_date) : null;
//     const years =
//       joinDate && !isNaN(joinDate)
//         ? new Date().getFullYear() - joinDate.getFullYear()
//         : 0;

//     console.log("Employee:", employee.full_name, "Years:", years);

//     const emailContent = await generateEmailContent("work_anniversary", {
//       employee_name: employee.full_name,
//       department_name:
//         employee.hrms_employee_department?.department_name || "Department",
//       years: String(years),
//       sender_name: sender?.full_name || "HR Team",
//       sender_department_name:
//         sender?.hrms_employee_department?.department_name || "HR Department",
//     });

//     await sendEmail({
//       to: employee.email,
//       subject: emailContent.subject,
//       html: emailContent.body,
//       log_inst: employee.log_inst,
//     });

//     res.status(200).send({
//       success: true,
//       message: "Work Anniversary wish sent successfully!",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const sendAnniversaryEmail = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: Number(employeeId) },
      select: {
        full_name: true,
        email: true,
        log_inst: true,
        join_date: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });

    if (!employee) throw new CustomError("Employee not found", 404);

    // Find the sender (logged-in user)

    console.log("req.user:", req.user);

    const sender = await prisma.hrms_d_employee.findUnique({
      where: { id: req.user.employee_id }, // ✅ correct mapping
      select: {
        full_name: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });

    const joinDate = employee.join_date ? new Date(employee.join_date) : null;
    const years =
      joinDate && !isNaN(joinDate)
        ? new Date().getFullYear() - joinDate.getFullYear()
        : 0;

    console.log("Employee:", employee.full_name, "Years:", years);

    const emailContent = await generateEmailContent("work_anniversary", {
      employee_name: employee.full_name,
      department_name:
        employee.hrms_employee_department?.department_name || "Department",
      years: String(years),
      sender_name: sender?.full_name || "HR Team",
      sender_department_name:
        sender?.hrms_employee_department?.department_name || "HR Department",
    });

    await sendEmail({
      to: employee.email,
      subject: emailContent.subject,
      html: emailContent.body,
      log_inst: employee.log_inst,
    });

    res.status(200).send({
      success: true,
      message: "Work Anniversary wish sent successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { previewAnniversaryEmail, sendAnniversaryEmail };
