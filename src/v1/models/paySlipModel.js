const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
    month: data.month || "",
    year: data.year || "",
    net_salary: data.net_salary || 0,
    pdf_path: data.pdf_path || "",
  };
};

// Create a new payslip
const createPaySlip = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_payslip.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        payslip_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating payslip: ${error.message}`, 500);
  }
};

// Find a payslip by ID
const findPaySlipById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_payslip.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("payslip not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding payslip by ID: ${error.message}`,
      503
    );
  }
};

// Update a payslip
const updatePaySlip = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const updatedPaySlip = await prisma.hrms_d_payslip.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        payslip_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return updatedPaySlip;
  } catch (error) {
    throw new CustomError(`Error updating payslip: ${error.message}`, 500);
  }
};

// Delete a payslip
const deletePaySlip = async (id) => {
  try {
    await prisma.hrms_d_payslip.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting payslip: ${error.message}`, 500);
  }
};

// Get all payslips
const getAllPaySlip = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          payslip_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = {
          gte: start,
          lte: end,
        };
      }
    }
    const datas = await prisma.hrms_d_payslip.findMany({
      where: filters,
      skip: skip,
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
    // const totalCount = await prisma.hrms_d_payslip.count();
    const totalCount = await prisma.hrms_d_payslip.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
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
