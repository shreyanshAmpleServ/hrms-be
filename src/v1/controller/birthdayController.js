const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const { generateEmailContent } = require("../../utils/emailTemplates");
const sendEmail = require("../../utils/mailer");

const previewBirthdayEmail = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: Number(employeeId) },
      select: {
        full_name: true,
        email: true,
        log_inst: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });

    if (!employee) throw new CustomError("Employee not found", 404);

    const emailContent = await generateEmailContent("birthday_wish", {
      employee_name: employee.full_name,
      department_name:
        employee.hrms_employee_department?.department_name || "Department",
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

const sendBirthdayEmail = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: Number(employeeId) },
      select: {
        full_name: true,
        email: true,
        log_inst: true,
        hrms_employee_department: {
          select: { department_name: true },
        },
      },
    });

    if (!employee) throw new CustomError("Employee not found", 404);

    const emailContent = await generateEmailContent("birthday_wish", {
      employee_name: employee.full_name,
      department_name:
        employee.hrms_employee_department?.department_name || "Department",
    });

    await sendEmail({
      to: employee.email,
      subject: emailContent.subject,
      html: emailContent.body,
      log_inst: employee.log_inst,
    });

    res
      .status(200)
      .send({ success: true, message: "Birthday wish sent successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports = { previewBirthdayEmail, sendBirthdayEmail };
