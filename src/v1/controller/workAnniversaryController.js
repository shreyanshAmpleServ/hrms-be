const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const { generateEmailContent } = require("../../utils/emailTemplates");
const sendEmail = require("../../utils/mailer");

const moment = require("moment");

const previewAnniversaryEmail = async (req, res, next) => {
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

    if (!employee) {
      throw new CustomError("Employee not found", 404);
    }

    if (!employee.join_date) {
      throw new CustomError("Employee join date is not available", 400);
    }

    const joinDate = moment(employee.join_date);
    const today = moment();

    if (!joinDate.isValid()) {
      throw new CustomError("Invalid join date", 400);
    }

    const years = today.diff(joinDate, "years");
    const months = today.diff(joinDate, "months");

    if (years < 1) {
      throw new CustomError(
        `Employee has only ${months} month of experience. Minimum 1 year required for anniversary email.`,
        400
      );
    }
    let sender = null;
    if (req.user.employee_id) {
      sender = await prisma.hrms_d_employee.findUnique({
        where: { id: req.user.employee_id },
        select: {
          full_name: true,
          hrms_employee_department: {
            select: { department_name: true },
          },
        },
      });
    }

    const emailContent = await generateEmailContent("work_anniversary", {
      employee_name: employee.full_name,
      department_name:
        employee.hrms_employee_department?.department_name || "Department",
      years: String(years),
      sender_name: sender ? sender?.full_name : "HR Team",
      sender_department_name:
        sender?.hrms_employee_department?.department_name || "HR Department",
    });

    res.json({
      success: true,
      to: employee.email,
      subject: emailContent.subject,
      body: emailContent.body,
      years_of_service: years,
      join_date: joinDate.format("YYYY-MM-DD"),
      next_anniversary: joinDate
        .clone()
        .year(today.year())
        .add(today.isAfter(joinDate.clone().year(today.year())) ? 1 : 0, "year")
        .format("YYYY-MM-DD"),

      message: `Anniversary email preview for ${years} year(s) of service`,
    });
  } catch (error) {
    console.log("Print ing error : ", error);
    next(error);
  }
};

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

    console.log("req.user:", req.user);

    const sender = await prisma.hrms_d_employee.findUnique({
      where: { id: req.user.employee_id },
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
