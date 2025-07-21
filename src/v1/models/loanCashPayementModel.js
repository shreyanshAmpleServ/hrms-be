const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize loan cash payment data
const serializeLoanCashPaymentData = (data) => ({
  loan_request_id: Number(data.loan_request_id),
  balance_amount: data.balance_amount ? Number(data.balance_amount) : 0,
  amount: data.amount ? Number(data.amount) : 0,
  pending_amount: data.pending_amount ? Number(data.pending_amount) : 0,
  due_year: data.due_year || "",
  log_inst: data.log_inst ? Number(data.log_inst) : 1,
});

// Create a new loan cash payment
const createLoanCashPayement = async (data) => {
  try {
    const reqData = await prisma.hrms_d_loan_cash_payment.create({
      data: {
        ...serializeLoanCashPaymentData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
      },
      include: {
        hrms_d_loan_request: true,
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating loan cash payment: ${error.message}`,
      500
    );
  }
};

// Find loan cash payment by ID
const findLoanCashPayement = async (id) => {
  try {
    const reqData = await prisma.hrms_d_loan_cash_payment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Loan cash payment not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding loan cash payment by ID: ${error.message}`,
      503
    );
  }
};

// Update loan cash payment
const updateLoanCashPayement = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_loan_cash_payment.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeLoanCashPaymentData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hrms_d_loan_request: true,
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating loan cash payment: ${error.message}`,
      500
    );
  }
};

// Delete loan cash payment
const deleteLoanCashPayement = async (id) => {
  try {
    await prisma.hrms_d_loan_cash_payment.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting loan cash payment: ${error.message}`,
      500
    );
  }
};

// Get all loan cash payments
const getAllLoanCashPayement = async (
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
      filters.OR = [{ due_year: { contains: search.toLowerCase() } }];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_loan_cash_payment.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_d_loan_request: true,
      },
    });
    const totalCount = await prisma.hrms_d_loan_cash_payment.count({
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
    throw new CustomError("Error retrieving loan cash payments", 503);
  }
};

module.exports = {
  createLoanCashPayement,
  getAllLoanCashPayement,
  deleteLoanCashPayement,
  getAllLoanCashPayement,
  findLoanCashPayement,
  updateLoanCashPayement,
};
