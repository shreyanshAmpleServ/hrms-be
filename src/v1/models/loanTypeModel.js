const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const serializeData = (data) => {
  return {
    loan_name: data.loan_name || "",
    interest_rate: Number(data.interest_rate) || 0,
    pay_component_id: Number(data.pay_component_id) || 0,
    is_active: data.is_active || "Y",
  };
};

const createLoanType = async (data) => {
  try {
    const existing = await prisma.hrms_m_loan_type.findFirst({
      where: {
        loan_name: data.loan_name,
      },
    });
    if (existing) {
      throw new CustomError("Loan name already exists", 400);
    }
    const reqData = await prisma.hrms_m_loan_type.create({
      data: {
        ...serializeData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        loan_type_pay_component: true,
      },
    });
    return reqData;
  } catch (error) {
    console.error("Error creating loan type:", error);
    throw new CustomError(`Error creating loan type: ${error.message}`, 500);
  }
};

const findLoanTypeById = async (id) => {
  try {
    const reqData = await prisma.hrms_m_loan_type.findUnique({
      where: { id: parseInt(id) },
      include: {
        loan_type_pay_component: true,
      },
    });
    if (!reqData) {
      throw new CustomError("loan type not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding loan type by ID: ${error.message}`,
      503
    );
  }
};

const updateLoanType = async (id, data) => {
  try {
    const existing = await prisma.hrms_m_loan_type.findFirst({
      where: {
        loan_name: data.loan_name,
        NOT: { id: parseInt(id) },
      },
    });

    if (existing) {
      throw new CustomError("Loan name already exists", 400);
    }

    const updatedLoanType = await prisma.hrms_m_loan_type.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        loan_type_pay_component: true,
      },
    });

    return updatedLoanType;
  } catch (error) {
    throw new CustomError(`${error.message}`, 500);
  }
};

const deleteLoanType = async (id) => {
  try {
    await prisma.hrms_m_loan_type.delete({
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

const getAllLoanType = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          loan_name: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const datas = await prisma.hrms_m_loan_type.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        loan_type_pay_component: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_m_loan_type.count({
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
    throw new CustomError("Error retrieving loan types", 503);
  }
};

module.exports = {
  createLoanType,
  findLoanTypeById,
  updateLoanType,
  deleteLoanType,
  getAllLoanType,
};
