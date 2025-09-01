const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { errorNotExist } = require("../../Comman/errorNotExist");

const prisma = new PrismaClient();

const serializeJobData = (data) => {
  return {
    candidate_id: Number(data.candidate_id) || null,
    issue_date: data.issue_date || new Date(),
    designation_id: Number(data.designation_id) || null,
    terms_summary: data.terms_summary || "",
  };
};

// Create a new appointment latter
const createAppointmentLatter = async (data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );
    const reqData = await prisma.hrms_d_appointment_letter.create({
      data: {
        ...serializeJobData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        appointment_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        appointment_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating appointment latter: ${error.message}`,
      500
    );
  }
};

// Find a appointment latter by ID
const findAppointmentLatterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_appointment_letter.findUnique({
      where: { id: parseInt(id) },
    });
    if (!AppointmentLatter) {
      throw new CustomError("appointment latter not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding appointment latter by ID: ${error.message}`,
      503
    );
  }
};

// Update a appointment latter
const updateAppointmentLatter = async (id, data) => {
  try {
    await errorNotExist(
      "hrms_d_candidate_master",
      data.candidate_id,
      "Candidate"
    );
    const updatedAppointmentLatter =
      await prisma.hrms_d_appointment_letter.update({
        where: { id: parseInt(id) },
        data: {
          ...serializeJobData(data),
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
        include: {
          appointment_candidate: {
            select: {
              full_name: true,
              id: true,
            },
          },
          appointment_designation: {
            select: {
              designation_name: true,
              id: true,
            },
          },
        },
      });
    return updatedAppointmentLatter;
  } catch (error) {
    throw new CustomError(
      `Error updating appointment latter: ${error.message}`,
      500
    );
  }
};

// Delete a appointment latter
const deleteAppointmentLatter = async (id) => {
  try {
    await prisma.hrms_d_appointment_letter.delete({
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

// Get all appointment latters
const getAllAppointmentLatter = async (
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
          appointment_designation: {
            designation_name: { contains: search.toLowerCase() },
          },
        },
        {
          appointment_candidate: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        // {
        //   job_title: { contains: search.toLowerCase() },
        // },
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
    const datas = await prisma.hrms_d_appointment_letter.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        appointment_candidate: {
          select: {
            full_name: true,
            id: true,
          },
        },
        appointment_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const totalCount = await prisma.hrms_d_appointment_letter.count();
    const totalCount = await prisma.hrms_d_appointment_letter.count({
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
    throw new CustomError("Error retrieving appointment latters", 503);
  }
};

module.exports = {
  createAppointmentLatter,
  findAppointmentLatterById,
  updateAppointmentLatter,
  deleteAppointmentLatter,
  getAllAppointmentLatter,
};
