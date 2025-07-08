const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeLoanEmiSchedule = (data) => ({
  loan_request_id: Number(data.loan_request_id),
  employee_id: Number(data.employee_id),
  due_month: data.due_month,
  emi_amount: parseFloat(data.emi_amount),
  status: data.status || "Pending",
  payslip_id: data.payslip_id ? Number(data.payslip_id) : null,
  createdate: new Date(),
  createdby: Number(data.createdby) || 1,
  log_inst: data.log_inst || 1,
});

const createLoanEmiSchedule = async (data) => {
  try {
    const result = await prisma.hrms_d_loan_emi_schedule.create({
      data: serializeLoanEmiSchedule(data),
      include: {
        loan_emi_employee: {
          select: { id: true, full_name: true, employee_code: true },
        },
        loan_emi_loan_request: {
          select: { id: true, amount: true },
        },

        loan_emi_payslip: {
          select: { id: true, month: true },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating Loan EMI Schedule:${error.message}`,
      500
    );
  }
};

const getAllLoanEmiSchedule = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};
    if (search) {
      filters.OR = [{ loan_emi_employee: { contains: search.toLowerCase() } }];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filters.request_date = { gte: start, lte: end };
    }
    const result = await prisma.hrms_d_loan_emi_schedule.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: { createdate: "desc" },
      include: {
        loan_emi_employee: {
          select: { id: true, full_name: true },
        },
        loan_emi_loan_request: {
          select: { id: true, amount: true },
        },

        loan_emi_payslip: {
          select: { id: true, month: true },
        },
      },
    });
    const totalCount = await prisma.hrms_d_loan_emi_schedule.count({
      where: filters,
    });

    return {
      data: result,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(
      `Error creating Loan EMI Schedule:${error.message}`,
      500
    );
  }
};

const findLoanEmiScheduleById = async (id) => {
  try {
    const result = await prisma.hrms_d_loan_emi_schedule.findUnique({
      where: { id: parseInt(id) },
      include: {
        loan_emi_employee: {
          select: { id: true, full_name: true },
        },
        loan_emi_loan_request: {
          select: { id: true, amount: true },
        },

        loan_emi_payslip: {
          select: { id: true, month: true },
        },
      },
    });
    if (!result) throw new Error("Loan EMI Schedule not found");
    return result;
  } catch (error) {
    throw new CustomError(
      `Error getting loan EMI Schedule:${error.message}`,
      500
    );
  }
};

const updateLoanEmiSchedule = async (id, data) => {
  try {
    const result = await prisma.hrms_d_loan_emi_schedule.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeLoanEmiSchedule(data),
        updatedby: Number(data.updatedby) || 1,
        updatedate: new Date(),
      },
      include: {
        loan_emi_employee: { select: { id: true, full_name: true } },
        loan_emi_loan_request: {
          select: { id: true, amount: true },
        },
        loan_emi_payslip: {
          select: { id: true, month: true },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error updating Loan EMI Schedule:${error.message}`,
      500
    );
  }
};
const deleteLoanEmiSchedule = async (id) => {
  try {
    const result = await prisma.hrms_d_loan_emi_schedule.delete({
      where: { id: parseInt(id) },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error deleting Loan EMI Schedule:${error.message}`,
      500
    );
  }
};

const updateLoanEmiScheduleStatus = async (id, data) => {
  try {
    const loanEmiId = parseInt(id);
    console.log("Loan Emi ID: ", loanEmiId);

    if (isNaN(loanEmiId)) {
      throw new CustomError("Invalid Loan Emi ID", 400);
    }

    const existingCandidateMaster =
      await prisma.hrms_d_loan_emi_schedule.findUnique({
        where: { id: loanEmiId },
      });

    if (!existingCandidateMaster) {
      throw new CustomError(`Loan Emi with ID ${loanEmiId} not found`, 404);
    }
    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };
    if (data.status === "Approved") {
      updateData.status = data.status || "";
    } else if (data.status === "Rejected") {
      updateData.status = data.status || "";
    } else {
      updateData.status = "";
    }
    const updatedEntry = await prisma.hrms_d_loan_emi_schedule.update({
      where: { id: loanEmiId },
      data: updateData,
    });

    return updatedEntry;
  } catch (error) {
    console.log(error);

    throw new CustomError(
      `Error updating Loan Emi status: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createLoanEmiSchedule,
  getAllLoanEmiSchedule,
  findLoanEmiScheduleById,
  updateLoanEmiSchedule,
  deleteLoanEmiSchedule,
  updateLoanEmiScheduleStatus,
};
