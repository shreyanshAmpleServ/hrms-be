const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const {
  status,
} = require("../../../../crm-fe/src/components/common/selectoption/selectoption");
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

// Create a new loan request
const createLoanRequest = async (data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");
    const reqData = await prisma.hrms_d_loan_request.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        loan_req_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        loan_types: {
          select: {
            loan_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating loan request: ${error.message}`, 500);
  }
};

// Find a loan request by ID
const findLoanRequestById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_loan_request.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("loan request not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding loan request by ID: ${error.message}`,
      503
    );
  }
};

// Update a loan request
const updateLoanRequest = async (id, data) => {
  try {
    await errorNotExist("hrms_d_employee", data.employee_id, "Employee");

    const updatedLoanRequest = await prisma.hrms_d_loan_request.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        loan_req_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        loan_types: {
          select: {
            loan_name: true,
            id: true,
          },
        },
      },
    });
    return updatedLoanRequest;
  } catch (error) {
    throw new CustomError(`Error updating loan request: ${error.message}`, 500);
  }
};

// Delete a loan request
const deleteLoanRequest = async (id) => {
  try {
    await prisma.hrms_d_loan_request.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting loan request: ${error.message}`, 500);
  }
};

// Get all loan requests
const getAllLoanRequest = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          loan_req_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          loan_types: {
            loan_name: { contains: search.toLowerCase() },
          },
        },
        {
          status: { contains: search.toLowerCase() },
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
    const datas = await prisma.hrms_d_loan_request.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        loan_req_employee: {
          select: {
            full_name: true,
            id: true,
          },
        },
        loan_types: {
          select: {
            loan_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_loan_request.count();
    const totalCount = await prisma.hrms_d_loan_request.count({
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
    throw new CustomError("Error retrieving loan requests", 503);
  }
};

module.exports = {
  createLoanRequest,
  findLoanRequestById,
  updateLoanRequest,
  deleteLoanRequest,
  getAllLoanRequest,
};
