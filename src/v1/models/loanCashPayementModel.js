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
    if (error.code === "P2003") {
      throw new CustomError(
        "This record cannot be deleted because it has associated data other records. Please remove the dependent data first.",
        400
      );
    } else {
      throw new CustomError(error.meta.constraint, 500);
    }
  }
};

const getAllLoanCashPayement = async (
  search,
  page,
  size,
  startDate,
  endDate,
  loan_request_id
) => {
  try {
    const filters = {};

    if (loan_request_id) {
      const parsedId = parseInt(loan_request_id, 10);
      if (!isNaN(parsedId)) {
        filters.loan_request_id = parsedId;
      }
    }

    if (search && !loan_request_id) {
      filters.OR = [{ due_year: { contains: search.toLowerCase() } }];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const pagination = !loan_request_id
      ? {
          skip:
            (page && parseInt(page)) > 0
              ? (parseInt(page) - 1) * (parseInt(size) || 10)
              : 0,
          take: parseInt(size) || 10,
        }
      : {};

    const datas = await prisma.hrms_d_loan_cash_payment.findMany({
      where: filters,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_d_loan_request: true,
      },
      ...pagination,
    });

    const totalCount = await prisma.hrms_d_loan_cash_payment.count({
      where: filters,
    });

    return {
      data: datas,
      ...(loan_request_id
        ? {}
        : {
            currentPage: parseInt(page) || 1,
            size: parseInt(size) || 10,
            totalPages: Math.ceil(totalCount / (parseInt(size) || 10)),
            totalCount,
          }),
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
