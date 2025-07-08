const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize payroll data
const serializePayrollData = (data) => ({
  employee_id: Number(data.employee_id), // ✅ ADD THIS LINE BACK
  payroll_month: Number(data.payroll_month),
  payroll_year: Number(data.payroll_year),
  payroll_week: Number(data.payroll_week) || 0,
  basic_salary: Number(data.basic_salary || 0),
  total_earnings: Number(data.total_earnings || 0),
  total_deductions: Number(data.total_deductions || 0),
  taxable_earnings: data.taxable_earnings ? Number(data.taxable_earnings) : 0,
  tax_amount: data.tax_amount ? Number(data.tax_amount) : 0,
  net_pay: Number(data.net_pay || 0),
  status: data.status || "",
  processed_on: data.processed_on ? new Date(data.processed_on) : null,
  remarks: data.remarks || "",
});

// const createMonthlyPayroll = async (data) => {
//   try {
//     const serializedData = serializePayrollData(data);
//     const { employee_id, payroll_month } = serializedData;

//     // Check if payroll already exists for the same employee and month
//     const existing = await prisma.hrms_d_monthly_payroll_processing.findFirst({
//       where: {
//         hrms_monthly_payroll_employee: { id: employee_id },
//         payroll_month: payroll_month,
//       },
//     });

//     if (existing) {
//       throw new CustomError(
//         `Payroll already exists for employee ID ${employee_id} in month ${payroll_month}`,
//         400
//       );
//     }

//     const reqData = await prisma.hrms_d_monthly_payroll_processing.create({
//       data: {
//         ...serializedData,
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//         hrms_monthly_payroll_employee: {
//           connect: { id: employee_id },
//         },
//       },
//       include: {
//         hrms_monthly_payroll_employee: {
//           select: {
//             id: true,
//             employee_code: true,
//             full_name: true,
//           },
//         },
//       },
//     });

//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating payroll entry: ${error.message}`,
//       500
//     );
//   }
// };
const createMonthlyPayroll = async (data) => {
  try {
    const serializedData = serializePayrollData(data);
    const { employee_id, payroll_month } = serializedData;

    // Check if payroll already exists for the same employee and month
    // const existing = await prisma.hrms_d_monthly_payroll_processing.findFirst({
    //   where: {
    //     hrms_monthly_payroll_employee: { id: employee_id },
    //     payroll_month: payroll_month,
    //   },
    // });
    try {
      if (!employee_id || !payroll_month) {
        throw new CustomError("Missing employee_id or payroll_month", 400);
      }

      const result = await prisma.$queryRawUnsafe(`
  SELECT TOP 1 *
  FROM hrms_d_monthly_payroll_processing
  WHERE employee_id = ${Number(employee_id)}
    AND payroll_month = ${Number(payroll_month)}
`);

      if (!result || result.length > 0) {
        throw new CustomError(
          `Payroll already exists for employee ID ${employee_id} in month ${payroll_month}`,
          400
        );
      }
    } catch (error) {
      throw new CustomError(
        `Error fetching payroll entry: ${error.message}`,
        500
      );
    }

    const reqData = await prisma.hrms_d_monthly_payroll_processing.create({
      data: {
        ...serializedData,
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
        hrms_monthly_payroll_employee: {
          connect: { id: Number(data.employee_id) }, // ✅ Correct way
        },
      },
      include: {
        hrms_monthly_payroll_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating payroll entry: ${error.message}`,
      500
    );
  }
};

// Find payroll entry by ID
const findMonthlyPayrollById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_monthly_payroll_processing.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Payroll entry not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding payroll entry by ID: ${error.message}`,
      503
    );
  }
};

// Update payroll entry
const updateMonthlyPayroll = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_monthly_payroll_processing.update({
      where: { id: parseInt(id) },
      include: {
        hrms_monthly_payroll_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
      data: {
        ...serializePayrollData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating payroll entry: ${error.message}`,
      500
    );
  }
};

// Delete payroll entry
const deleteMonthlyPayroll = async (id) => {
  try {
    await prisma.hrms_d_monthly_payroll_processing.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting payroll entry: ${error.message}`,
      500
    );
  }
};

// Get all payroll entries
const getAllMonthlyPayroll = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          hrms_monthly_payroll_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { payroll_month: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }
    // if (startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);
    //   if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    //     filters.createdate = { gte: start, lte: end };
    //   }
    // }

    const datas = await prisma.hrms_d_monthly_payroll_processing.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_monthly_payroll_employee: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    const totalCount = await prisma.hrms_d_monthly_payroll_processing.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.log("Payroll retreival error", error);

    throw new CustomError("Error retrieving payroll entries", 503);
  }
};

module.exports = {
  createMonthlyPayroll,
  findMonthlyPayrollById,
  updateMonthlyPayroll,
  deleteMonthlyPayroll,
  getAllMonthlyPayroll,
};
