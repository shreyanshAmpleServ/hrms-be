const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeTaxRegime = (taxRegime) => {
  return {
    regime_name: taxRegime.regime_name || "",
    is_active:
      taxRegime.is_active?.toString().toUpperCase() === "N" ? "N" : "Y",
    country_code: Number(taxRegime.country_code) || null,
  };
};

const createTaxRegime = async (data) => {
  try {
    const taxRegime = await prisma.hrms_m_tax_regime.create({
      data: {
        ...serializeTaxRegime(data),
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,

        createdate: new Date(),
        updatedate: new Date(),
        updatedby: 1,
      },
      include: {
        regime_country: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return taxRegime;
  } catch (error) {
    console.log("Create tax regime ", error);
    throw new CustomError(`Error creating tax regime: ${error.message}`, 500);
  }
};

const findTaxRegimeById = async (id) => {
  try {
    const taxRegime = await prisma.hrms_m_tax_regime.findUnique({
      where: { id: parseInt(id) },
      include: {
        regime_country: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    if (!taxRegime) {
      throw new CustomError("tax regime not found", 404);
    }
    return taxRegime;
  } catch (error) {
    console.log("tax regime By Id  ", error);
    throw new CustomError(
      `Error finding tax regime by ID: ${error.message}`,
      503
    );
  }
};

const updateTaxRegime = async (id, data) => {
  try {
    const updatedTaxRegime = await prisma.hrms_m_tax_regime.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeTaxRegime(data),
        updatedate: new Date(),
        updatedby: data.updatedby || 1,
      },
      include: {
        regime_country: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return updatedTaxRegime;
  } catch (error) {
    throw new CustomError(`Error updating tax regime: ${error.message}`, 500);
  }
};

const deleteTaxRegime = async (id) => {
  try {
    await prisma.hrms_m_tax_regime.delete({
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

// Get all tax regime
const getAllTaxRegime = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    let filters = {};

    if (search) {
      filters.OR = [
        {
          regime_name: { contains: search.toLowerCase() },
        },
      ];
    }

    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const taxes = await prisma.hrms_m_tax_regime.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        regime_country: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_tax_regime.count({
      where: filters,
    });
    return {
      data: taxes,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving tax regime", 503);
  }
};

module.exports = {
  createTaxRegime,
  findTaxRegimeById,
  updateTaxRegime,
  deleteTaxRegime,
  getAllTaxRegime,
};
