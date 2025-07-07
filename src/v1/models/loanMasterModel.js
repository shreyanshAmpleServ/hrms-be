const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeLoanMasterData = (data) => ({
  loan_code: data.loan_code || null,
  loan_name: data.loan_name || null,
  //   loan_type_id: data.loan_type_id ? Number(data.loan_type_id) : null,
  wage_type: data.wage_type || null,
  minimum_tenure: data.minimum_tenure || null,
  maximum_tenure: data.maximum_tenure || null,
  tenure_divider: data.tenure_divider ? Number(data.tenure_divider) : null,
  maximum_amount: data.maximum_amount ? Number(data.maximum_amount) : null,
  //   amount_currency_id: data.amount_currency_id
  //     ? Number(data.amount_currency_id)
  //     : null,
  in_active: data.in_active === "true" || data.in_active === true || false,
});

// Create
const createLoanMaster = async (data) => {
  try {
    const result = await prisma.hrms_m_loan_master.create({
      data: {
        ...serializeLoanMasterData({
          ...data,
          loan_type_id: undefined,
          amount_currency: undefined,
        }),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
        loan_master_loan_type: data.loan_type_id
          ? { connect: { id: Number(data.loan_type_id) } }
          : undefined,
        loan_master_amount_currency: data.amount_currency
          ? { connect: { id: Number(data.amount_currency) } }
          : undefined,
      },
      include: {
        loan_master_loan_type: {
          select: {
            loan_name: true,
          },
        },
        loan_master_amount_currency: {
          select: {
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });
    return result;
  } catch (error) {
    console.log("Error creating loan master:", error);
    throw new CustomError(`Error creating loan master: ${error.message}`, 500);
  }
};

// Get by ID
const getLoanMasterById = async (id) => {
  try {
    const result = await prisma.hrms_m_loan_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!result) throw new CustomError("Loan master not found", 404);
    return result;
  } catch (error) {
    throw new CustomError(
      `Error retrieving loan master: ${error.message}`,
      500
    );
  }
};

// Update
const updateLoanMaster = async (id, data) => {
  try {
    const updated = await prisma.hrms_m_loan_master.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeLoanMasterData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        loan_master_loan_type: {
          select: {
            id: true,
            loan_name: true,
          },
        },
        loan_master_amount_currency: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });
    return updated;
  } catch (error) {
    throw new CustomError(`Error updating loan master: ${error.message}`, 500);
  }
};

// Delete
const deleteLoanMaster = async (id) => {
  try {
    await prisma.hrms_m_loan_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting loan master: ${error.message}`, 500);
  }
};

// Get all with search + pagination
const getAllLoanMasters = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;
    const filters = {};

    if (search) {
      filters.OR = [
        {
          loan_master_loan_type: {
            loan_name: { contains: search.toLowerCase() },
          },
        },
        {
          loan_master_amount_currency: {
            currency_name: { contains: search.toLowerCase() },
          },
        },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.probation_end_date = { gte: start, lte: end };
      }
    }

    const data = await prisma.hrms_m_loan_master.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        loan_master_loan_type: {
          select: {
            id: true,
            loan_name: true,
          },
        },
        loan_master_amount_currency: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_m_loan_master.count({
      where: filters,
    });

    return {
      data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving loan masters", 503);
  }
};

module.exports = {
  createLoanMaster,
  getLoanMasterById,
  updateLoanMaster,
  deleteLoanMaster,
  getAllLoanMasters,
};
