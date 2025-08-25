const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    candidate_id: Number(data.candidate_id) || null,
    currency_id: Number(data.currency_id) || null,
    offer_date: data.offer_date || new Date(),
    position: data.position || "",
    offered_salary: Number(data.offered_salary) || 0,
    valid_until: data.valid_until || new Date(),
    status: data.status || "",
  };
};

// Create a new offer letter
const createOfferLetter = async (data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );
    const reqData = await prisma.hrms_d_offer_letter.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        offered_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(`Error creating offer letter: ${error.message}`, 500);
  }
};

// Find a offer letter by ID
const findOfferLetterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_offer_letter.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("offer letter not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding offer letter by ID: ${error.message}`,
      503
    );
  }
};

// Update a offer letter
const updateOfferLetter = async (id, data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );

    const updatedOfferLetter = await prisma.hrms_d_offer_letter.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        offered_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
    });
    return updatedOfferLetter;
  } catch (error) {
    throw new CustomError(`Error updating offer letter: ${error.message}`, 500);
  }
};

// Delete a offer letter
const deleteOfferLetter = async (id) => {
  try {
    await prisma.hrms_d_offer_letter.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting offer letter: ${error.message}`, 500);
  }
};

// Get all offer letters
const getAllOfferLetter = async (
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
    // Handle search
    if (search) {
      filters.OR = [
        {
          offered_candidate: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          position: { contains: search.toLowerCase() },
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

    if (candidate_id) {
      filters.candidate_id = parseInt(candidate_id);
    }

    const datas = await prisma.hrms_d_offer_letter.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        offered_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.hrms_d_offer_letter.count({
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
    throw new CustomError("Error retrieving offer letters", 503);
  }
};

const updateOfferLetterStatus = async (id, data) => {
  try {
    const offerLetterId = parseInt(id);

    if (isNaN(leaveId)) {
      throw new CustomError("Invalid Offer Letter ID", 400);
    }

    const existingOfferLetter = await prisma.hrms_d_offer_letter.findUnique({
      where: { id: offerLetterId },
    });

    if (!existingOfferLetter) {
      throw new CustomError(
        `Offer letter with ID ${offerLetterId} not found`,
        404
      );
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    if (data.status === "Approved") {
      updateData.status = data.status;
    } else if (data.status === "Rejected") {
      updateData.status = data.status;
    } else {
      updateData.status = data.status;
    }
    const updatedEntry = await prisma.hrms_d_offer_letter.update({
      where: { id: offerLetterId },
      include: {
        offered_caZndidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        offer_letter_currencyId: {
          select: {
            id: true,
            currency_code: true,
            currency_name: true,
          },
        },
      },
      data: updateData,
    });
    return updatedEntry;
  } catch (error) {
    console.error("Error updating offer letter status:", error);
    throw new CustomError(
      `Error updating offer letter status: ${error.message}`,
      error.status || 500
    );
  }
};

module.exports = {
  createOfferLetter,
  findOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
  getAllOfferLetter,
  updateOfferLetterStatus,
};
