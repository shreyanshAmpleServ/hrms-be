const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

// Create a new call type
const createAttachment = async (data) => {
  try {
    const callType = await prisma.crms_attachments.create({
      data: {
        ...data,
        related_entity_id: Number(data.related_entity_id) || null,
        is_active: data.is_active || "Y",
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
      include: {
        created_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
            crms_d_user_role: {
              select: {
                crms_m_role: {
                  select: {
                    role_name: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return callType;
  } catch (error) {
    console.log("Adding Attachment ", error);
    throw new CustomError(`Error creating call type: ${error.message}`, 500);
  }
};

// Find a call type by ID
const findAttachmentById = async (id) => {
  try {
    const documents = await prisma.crms_attachments.findUnique({
      where: { id: parseInt(id) },
    });
    if (!documents) {
      throw new CustomError("Attachment not found", 404);
    }
    return documents;
  } catch (error) {
    throw new CustomError(
      `Error finding call type by ID: ${error.message}`,
      503
    );
  }
};

// Update a call type
const updateAttachment = async (id, data) => {
  try {
    const updatedCallType = await prisma.crms_attachments.update({
      where: { id: parseInt(Number(id)) },
      data: {
        ...data,
        related_entity_id: Number(data.related_entity_id) || null,
        updatedate: new Date(),
      },
      include: {
        created_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
            crms_d_user_role: {
              select: {
                crms_m_role: {
                  select: {
                    role_name: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return updatedCallType;
  } catch (error) {
    throw new CustomError(
      `Error updating file attachment: ${error.message}`,
      500
    );
  }
};

// Delete a call type
const deleteAttachment = async (id) => {
  try {
    await prisma.crms_attachments.delete({
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

// Get all call types
const getAllAttachment = async (
  search,
  page,
  size,
  startDate,
  endDate,
  related_type
) => {
  try {
    page = page || 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          created_user: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        {
          related_entity_name: { contains: search.toLowerCase() },
        },
        {
          file: { contains: search.toLowerCase() },
        },
        {
          file_type: { contains: search.toLowerCase() },
        },
        {
          filename: { contains: search.toLowerCase() },
        },
      ];
    }
    if (related_type) {
      filters.related_entity_type = { equals: related_type };
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
    const attachments = await prisma.crms_attachments.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        created_user: {
          select: {
            id: true,
            full_name: true,
            profile_img: true,
            crms_d_user_role: {
              select: {
                crms_m_role: {
                  select: {
                    role_name: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    const totalCount = await prisma.crms_attachments.count();

    return {
      data: attachments,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Attachment get error : ", error);
    throw new CustomError("Error retrieving File attachment", 503);
  }
};

module.exports = {
  createAttachment,
  findAttachmentById,
  updateAttachment,
  deleteAttachment,
  getAllAttachment,
};
