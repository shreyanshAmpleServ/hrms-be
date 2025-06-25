const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize
const serializeRemarkData = (data) => ({
  candidate_id: data.candidate_id ? Number(data.candidate_id) : null,
  stage_id: Number(data.stage_id),
  stage_name: data.stage_name || null,
  description: data.description,
  interview_date: new Date(data.interview_date),
  status: data.status || "Pending",
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  remark: data.remark || null,
  rating: data.rating ? Number(data.rating) : null,
  is_completed: data.is_completed ?? false,
});

// Create
const createInterviewStageRemark = async (data) => {
  try {
    const result = await prisma.hrms_m_interview_stage_remark.create({
      data: {
        ...serializeRemarkData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
        interview_stage_employee_id: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            profile_pic: true,
          },
        },
      },
    });
    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating interview stage remark: ${error.message}`,
      500
    );
  }
};

//  Read by ID
const findInterviewStageRemarkById = async (id) => {
  try {
    const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
      where: { id: parseInt(id) },
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
      },
    });
    if (!remark) throw new CustomError("Interview stage remark not found", 404);
    return remark;
  } catch (error) {
    throw new CustomError(`Error fetching remark: ${error.message}`, 500);
  }
};

//  Update
const updateInterviewStageRemark = async (id, data) => {
  try {
    const updatedRemark = await prisma.hrms_m_interview_stage_remark.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeRemarkData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
        interview_stage_employee_id: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            profile_pic: true,
          },
        },
      },
    });

    if (data.stage_id) {
      await prisma.hrms_d_candidate_master.update({
        where: { id: updatedRemark.candidate_id },
        data: {
          interview_stage: data.stage_id,
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
      });
    }

    return updatedRemark;
  } catch (error) {
    throw new CustomError(
      `Error updating interview stage remark: ${error.message}`,
      500
    );
  }
};

//  Delete
const deleteInterviewStageRemark = async (id) => {
  try {
    await prisma.hrms_m_interview_stage_remark.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(`Error deleting remark: ${error.message}`, 500);
  }
};

const getAllInterviewStageRemark = async (search, page, size, candidateId) => {
  try {
    page = page && page > 0 ? page : 1;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = { AND: [] };

    if (candidateId) {
      filters.AND.push({ candidate_id: Number(candidateId) });
    }

    if (search) {
      filters.AND.push({
        OR: [
          { stage_name: { contains: search.toLowerCase() } },
          { remark: { contains: search.toLowerCase() } },
          {
            interview_stage_candidate: {
              full_name: { contains: search.toLowerCase() },
            },
          },
          {
            interview_stage_stage_id: {
              stage_name: { contains: search.toLowerCase() },
            },
          },
        ],
      });
    }

    const data = await prisma.hrms_m_interview_stage_remark.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_stage_id: {
          select: { id: true, stage_name: true },
        },
        interview_stage_employee_id: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
            profile_pic: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_m_interview_stage_remark.count({
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
    throw new CustomError(`Error fetching remarks: ${error.message}`, 503);
  }
};

const updateInterviewStageRemarkStatus = async (id, data) => {
  try {
    const interviewStageRemarkId = parseInt(id);
    if (isNaN(interviewStageRemarkId)) {
      throw new CustomError("Invalid interview stage reamark ID", 400);
    }

    const existingInterviewStageRemark =
      await prisma.hrms_m_interview_stage_remark.findUnique({
        where: { id: interviewStageRemarkId },
      });

    if (!existingInterviewStageRemark) {
      throw new CustomError(
        `Leave application with ID ${interviewStageRemarkId} not found`,
        404
      );
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    if (data.status === "Approved") {
      updateData.status = data.status || "";
    } else if (data.status === "Rejected") {
      updateData.status = data.status || "";
    } else {
      updateData.status = data.status || "";
    }

    const updatedEntry = await prisma.hrms_m_interview_stage_remark.update({
      where: { id: interviewStageRemarkId },
      data: updateData,
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(`Error updating leave status: ${error.message}`, 500);
  }
};
module.exports = {
  createInterviewStageRemark,
  findInterviewStageRemarkById,
  updateInterviewStageRemark,
  deleteInterviewStageRemark,
  getAllInterviewStageRemark,
  updateInterviewStageRemarkStatus,
};
