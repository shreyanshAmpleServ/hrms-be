const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    employee_id: Number(data.employee_id) || null,
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
   await errorNotExist('hrms_d_employee',data.employee_id ,"Employee" );
    const reqData = await prisma.hrms_d_offer_letter.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
                offered_employee:{
          select: {
            full_name: true,
            id:true,
          }
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
    await errorNotExist("hrms_d_employee",data.employee_id , "Employee");

    const updatedOfferLetter = await prisma.hrms_d_offer_letter.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
                offered_employee:{
          select: {
            full_name: true,
            id:true,
          }
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
const getAllOfferLetter = async (search,page,size ,startDate, endDate) => {
  try {
    page = (!page || page == 0) ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          offered_employee: {
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
    const datas = await prisma.hrms_d_offer_letter.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        offered_employee:{
          select: {
            full_name: true,
            id:true,
          }
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_offer_letter.count();
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

module.exports = {
  createOfferLetter,
  findOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
  getAllOfferLetter,
};
