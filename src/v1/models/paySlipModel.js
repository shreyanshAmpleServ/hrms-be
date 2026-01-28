const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { generateEmailContent } = require("../../utils/emailTemplates.js");
const { email } = require("zod/v4");
const sendEmail = require("../../utils/mailer.js");

// Serialize payslip data
const serializePayslipData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  month: data.month || "",
  net_salary: data.net_salary ? Number(data.net_salary) : null,
  pdf_path: data.pdf_path || "",
  year: data.year || "",
  gross_salary: data.gross_salary ? Number(data.gross_salary) : null,
  total_earnings: data.total_earnings ? Number(data.total_earnings) : null,
  total_deductions: data.total_deductions
    ? Number(data.total_deductions)
    : null,
  pay_component_summary: data.pay_component_summary || "",
  tax_deductions: data.tax_deductions ? Number(data.tax_deductions) : null,
  loan_deductions: data.loan_deductions ? Number(data.loan_deductions) : null,
  other_adjustments: data.other_adjustments
    ? Number(data.other_adjustments)
    : null,
  status: data.status || "Generated",
  remarks: data.remarks || "",
});

// Create a new payslip
const createPaySlip = async (data) => {
  try {
    const { isEmailEnabled, ...datas } = data;
    const reqData = await prisma.hrms_d_payslip.create({
      data: {
        ...serializePayslipData(datas),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        payslip_employee: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
    console.log("Sending payslip email to:", data);

    // if (isEmailEnabled == true) {
    //   const monthNames = [
    //     "",
    //     "January",
    //     "February",
    //     "March",
    //     "April",
    //     "May",
    //     "June",
    //     "July",
    //     "August",
    //     "September",
    //     "October",
    //     "November",
    //     "December",
    //   ];
    //   const company = await prisma.hrms_d_default_configurations.findFirst({
    //     select: { company_name: true },
    //   });
    //   const company_name = company?.company_name || "HRMS System";
    //   const employee = reqData?.payslip_employee;
    //   const emailContent = await generateEmailContent("payslip_email", {
    //     employee_name: employee.full_name,
    //     month: monthNames?.[Number(reqData.month)],
    //     years: String(data?.payroll_year),
    //     company_name: company_name,
    //   });
    //   console.log("Email content generated:", emailContent);
    //   await sendEmail({
    //     to: "shreyansh.tripathi@ampleserv.com",
    //     // to: reqData?.employee.email,
    //     subject: emailContent.subject,
    //     html: emailContent.body,
    //     log_inst: reqData?.log_inst || 1,
    //   });
    //   console.log(`Payslip email sent to: ${employee.email}`);
    // }

    return reqData;
  } catch (error) {
    console.log("Error creating payslip:", error);
    throw new CustomError(`Error creating payslip: ${error.message}`, 500);
  }
};

// Find payslip by ID
const findPaySlipById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_payslip.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Payslip not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(`Error finding payslip by ID: ${error.message}`, 503);
  }
};

// Update payslip
const updatePaySlip = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_payslip.update({
      where: { id: parseInt(id) },
      data: {
        ...serializePayslipData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        payslip_employee: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(`Error updating payslip: ${error.message}`, 500);
  }
};

// Delete payslip
const deletePaySlip = async (id) => {
  try {
    await prisma.hrms_d_payslip.delete({
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

// Get all payslips with pagination and search
// const getAllPaySlip = async (search, page, size, startDate, endDate) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filters = {};
//     if (search) {
//       filters.OR = [
//         {
//           payslip_employee: {
//             full_name: {
//               contains: search.toLowerCase(),
//             },
//           },
//         },
//         { month: { contains: search.toLowerCase() } },
//         { year: { contains: search.toLowerCase() } },
//         { status: { contains: search.toLowerCase() } },
//         { remarks: { contains: search.toLowerCase() } },
//       ];
//     }
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = { gte: start, lte: end };
//       }
//     }

//     const datas = await prisma.hrms_d_payslip.findMany({
//       where: filters,
//       skip,
//       take: size,
//       include: {
//         payslip_employee: {
//           select: {
//             full_name: true,
//             id: true,
//           },
//         },
//       },

//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//     });
//     const totalCount = await prisma.hrms_d_payslip.count({ where: filters });

//     return {
//       data: datas,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     throw new CustomError("Error retrieving payslips", 503);
//   }
// };

const getAllPaySlip = async (
  search,
  page,
  size,
  startDate,
  endDate,
  employee_id,
  month,
  year
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          payslip_employee: {
            full_name: {
              contains: search.toLowerCase(),
            },
          },
        },
        { month: { contains: search.toLowerCase() } },
        { year: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }
    if (employee_id) {
      filters.employee_id = Number(employee_id);
    }
    if (month) {
      const monthNames = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthName = monthNames[parseInt(month)];
      filters.month = monthName;
    }

    if (year) {
      filters.year = String(year);
    }

    const datas = await prisma.hrms_d_payslip.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        payslip_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_payslip.count({ where: filters });

    const monthNames = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const resultData = datas.map((item) => ({
      ...item,
      monthName: monthNames[parseInt(item.month, 10)],
      year: item.year,
    }));

    return {
      data: resultData,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.log("Error in get", error);

    throw new CustomError("Error retrieving payslips", 503);
  }
};

module.exports = {
  createPaySlip,
  findPaySlipById,
  updatePaySlip,
  deletePaySlip,
  getAllPaySlip,
};
