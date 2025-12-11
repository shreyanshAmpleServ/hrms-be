const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");

const serializeJobData = (data) => {
  return {
    candidate_id: Number(data.candidate_id) || null,
    contract_start_date: data.contract_start_date || new Date(),
    contract_end_date: data.contract_end_date || new Date(),
    contract_type: data.contract_type || "",
    document_path: data.document_path || "",
    description: data.description || "",
  };
};

const createEmploymentContract = async (data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    if (
      data.contract_start_date &&
      data.contract_end_date &&
      new Date(data.contract_end_date) <= new Date(data.contract_start_date)
    ) {
      throw new CustomError(
        "Contract End  date must be greater than Contract Start Date",
        400
      );
    }
    const reqData = await prisma.hrms_d_employment_contract.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        contracted_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(` ${error.message}`, 500);
  }
};

const findEmploymentContractById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_employment_contract.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("employment contract not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding employment contract by ID: ${error.message}`,
      503
    );
  }
};

const updateEmploymentContract = async (id, data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    if (
      data.contract_start_date &&
      data.contract_end_date &&
      new Date(data.contract_end_date) <= new Date(data.contract_start_date)
    ) {
      throw new CustomError(
        "Contract End Date must be greater than Contract Start Date",
        400
      );
    }

    const updatedEmploymentContract =
      await prisma.hrms_d_employment_contract.update({
        where: { id: parseInt(id) },
        data: {
          ...serializeJobData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
        include: {
          contracted_candidate: {
            select: {
              full_name: true,
              id: true,
            },
          },
        },
      });
    return updatedEmploymentContract;
  } catch (error) {
    throw new CustomError(
      `Error updating employment contract: ${error.message}`,
      500
    );
  }
};

const deleteEmploymentContract = async (id) => {
  try {
    await prisma.hrms_d_employment_contract.delete({
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

const getAllEmploymentContract = async (
  search,
  page,
  size,
  startDate,
  endDate,
  candidate_id
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        {
          contracted_candidate: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          contract_type: { contains: search.toLowerCase() },
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
    if (candidate_id) {
      filters.candidate_id = parseInt(candidate_id);
    }
    const datas = await prisma.hrms_d_employment_contract.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        contracted_candidate: {
          select: {
            full_name: true,
            email: true,
            id: true,
          },
        },
      },
      orderBy: [{ createdate: "desc" }, { updatedate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_employment_contract.count({
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
    throw new CustomError("Error retrieving employment contracts", 503);
  }
};

module.exports = {
  createEmploymentContract,
  findEmploymentContractById,
  updateEmploymentContract,
  deleteEmploymentContract,
  getAllEmploymentContract,
};
