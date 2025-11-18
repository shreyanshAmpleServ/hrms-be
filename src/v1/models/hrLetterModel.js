const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

// Serialize incoming data
const serializeHRLetter = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  letter_type: data.letter_type ? Number(data.letter_type) : null,
  request_date: data.request_date ? new Date(data.request_date) : null,
  issue_date: data.issue_date ? new Date(data.issue_date) : null,
  document_path: data.document_path || "",
  letter_subject: data.letter_subject || null,
  letter_content: data.letter_content || null,
  status: data.status || "Pending",
  is_active: data.is_active || "Y",
});

//  Create HR Letter
const createhrLetter = async (data) => {
  try {
    const result = await prisma.hrms_d_hr_letter.create({
      data: {
        ...serializeHRLetter(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        hrms_d_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            full_name: true,
          },
        },
        hr_letter_letter_type: {
          select: { id: true, letter_name: true },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(`Error creating HR letter: ${error.message}`, 500);
  }
};

// Get by ID
const gethrLetterById = async (id) => {
  try {
    const result = await prisma.hrms_d_hr_letter.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_d_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            full_name: true,
          },
        },
        hr_letter_letter_type: {
          select: { id: true, letter_name: true },
        },
      },
    });
    if (!result) throw new CustomError("HR Letter not found", 404);
    return result;
  } catch (error) {
    throw new CustomError(`Error fetching HR letter: ${error.message}`, 500);
  }
};

// Update HR letter
const updatehrLetter = async (id, data) => {
  try {
    const result = await prisma.hrms_d_hr_letter.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeHRLetter(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hrms_d_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            full_name: true,
          },
        },
        hr_letter_letter_type: {
          select: { id: true, letter_name: true },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(`Error updating HR letter: ${error.message}`, 500);
  }
};

//  Delete HR Letter
const deletehrLetter = async (id) => {
  try {
    await prisma.hrms_d_hr_letter.delete({
      where: { id: parseInt(id) },
    });
    return { message: "Deleted successfully" };
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

//Get All HR Letters
const getAllhrLetter = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  try {
    page = !page || page <= 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

    if (search) {
      filters.OR = [
        { letter_subject: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
        {
          hrms_d_employee: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          hr_letter_letter_type: {
            letter_type_name: { contains: search.toLowerCase() },
          },
        },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filters.request_date = { gte: start, lte: end };
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }
    const results = await prisma.hrms_d_hr_letter.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hrms_d_employee: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            full_name: true,
          },
        },
        hr_letter_letter_type: {
          select: { id: true, letter_name: true },
        },
      },
    });

    const totalCount = await prisma.hrms_d_hr_letter.count({ where: filters });

    return {
      data: results,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(`Error fetching HR letters: ${error.message}`, 503);
  }
};

const updatehrLetterStatus = async () => {
  try {
    const hrLetterId = parseInt(id);
    console.log("Hr letter ID: ", hrLetterId);

    if (isNaN(hrLetterId)) {
      throw new CustomError("Invalid Hr letter ID", 400);
    }

    const existingCandidateMaster = await prisma.hrms_d_hr_letter.findUnique({
      where: { id: hrLetterId },
    });

    if (!existingCandidateMaster) {
      throw new CustomError(`Hr Letter with ID ${hrLetterId} not found`, 404);
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };
    if (data.status === "Approved") {
      updateData.status_remarks = data.status_remarks || "";
    } else if (data.status === "Rejected") {
      updateData.status_remarks = data.status_remarks || "";
    } else {
      updateData.status_remarks = "";
    }
    const updatedEntry = await prisma.hrms_d_hr_letter.update({
      where: { id: hrLetterId },
      data: updateData,
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating Hr letter status: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createhrLetter,
  gethrLetterById,
  updatehrLetter,
  deletehrLetter,
  getAllhrLetter,
  updatehrLetterStatus,
};
