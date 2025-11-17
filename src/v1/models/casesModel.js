const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Create a new case
const createCases = async (data) => {
  try {
    // Create the case
    const cases = await prisma.crms_d_cases.create({
      data: {
        ...data,
        createdate: new Date(),
        updatedate: new Date(),
        createdby: data.createdby || 1,
        updatedby: data.createdby || 1,
        // case_owner: data.case_owner ? Number(data.case_owner) : null,
      },
      include: {
        cases_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        case_reasons: true,
        case_product: true,
        case_contact: true,
        case_deal: true,
      },
    });

    // Return the case with references
    return cases;
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error creating case: ${error.message}`, 500);
  }
};

// Update a case
const updateCases = async (id, data) => {
  try {
    const updatedCase = await prisma.crms_d_cases.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        // product_id: Number(data?.product_id) || null,
        // case_reason: Number(data?.case_reason) || null,
        // contact_id: Number(data?.contact_id) || null,
        // deal_id: Number(data?.deal_id) || null,
        // case_owner: Number(data?.case_owner) || null,
        // account_id: Number(data?.account_id) || null,
        // reported_by: Number(data?.reported_by) || null,
        // is_active: data.is_active || "Y",
        // log_inst: data.log_inst || 1,
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        cases_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        case_reasons: true,
        case_product: true,
        case_contact: true,
        case_deal: true,
      },
    });

    // Return the updated case
    return updatedCase;
  } catch (error) {
    console.log(error);
    throw new CustomError(`Error updating case: ${error.message}`, 500);
  }
};

// Find a case by ID
const findCasesById = async (id) => {
  try {
    const caseData = await prisma.crms_d_cases.findUnique({
      where: { id: parseInt(id) },
      include: {
        cases_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        case_reasons: true,
        case_product: true,
        case_contact: true,
        case_deal: true,
      },
    });
    return await caseData;
  } catch (error) {
    throw new CustomError(`Error finding case by ID: ${error.message}`, 503);
  }
};

// Delete a case
const deleteCase = async (id) => {
  try {
    await prisma.crms_d_cases.delete({
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

// Get all cases
const getAllCases = async (search, page, size, startDate, endDate) => {
  try {
    page = page || 1;
    size = size || 10;
    const filters = {};

    // Handle search
    if (search) {
      filters.OR = [
        { name: { contains: search.toLowerCase() } },
        { case_number: { contains: search.toLowerCase() } },
        {
          case_contact: {
            is: {
              OR: [
                { firstName: { contains: search.toLowerCase() } },
                { lastName: { contains: search.toLowerCase() } },
              ],
            },
          },
        },
        {
          case_product: {
            name: { contains: search.toLowerCase() },
          },
        },
      ];
    }

    // Handle date filtering
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
    const cases = await prisma.crms_d_cases.findMany({
      where: filters,
      include: {
        cases_user_owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        case_reasons: true,
        case_product: true,
        case_contact: true,
        case_deal: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.crms_d_cases.count();

    return {
      data: cases,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving cases", 503);
  }
};
// Get all case reasons
const getAllCaseReasons = async () => {
  try {
    const cases = await prisma.crms_m_case_reasons.findMany({
      include: {
        case_reasons: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    return cases;
  } catch (error) {
    console.log(error);
    throw new CustomError("Error retrieving cases", 503);
  }
};
// Generate Case number
const generateCaseNumber = async () => {
  try {
    const cases = await prisma.crms_d_cases.findFirst({
      orderBy: { id: "desc" },
    });
    const nextId = cases ? cases.id + 1 : 1;
    return `CASE-00${nextId}`;
  } catch (error) {
    console.log("Error to generation case number : ", error);
    throw new CustomError("Error retrieving case number", 503);
  }
};

module.exports = {
  createCases,
  findCasesById,
  updateCases,
  deleteCase,
  getAllCases,
  getAllCaseReasons,
  generateCaseNumber,
};
