const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// const createWorkSchedule = async (data) => {
//   try {
//     const finalData = await prisma.hrms_m_work_schedule_template.create({
//       data: {
//         template_name: data.template_name,
//         description: data.description,
//         createdby: data.createdby || 1,
//         log_inst: data.log_inst || 1,
//         is_active: data.is_active || "Y",

//         createdate: new Date(),
//         updatedate: new Date(),
//         updatedby: 1,
//       },
//     });
//     return finalData;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating work schedule: ${error.message}`,
//       500
//     );
//   }
// };

const createWorkSchedule = async (data) => {
  try {
    const newSchedule = await prisma.hrms_m_work_schedule_template.create({
      data: {
        template_name: data.template_name,
        description: data.description,
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
        is_active: data.is_active || "Y",
        createdate: new Date(),
        updatedate: new Date(),
        updatedby: data.updatedby || 1,
      },
    });

    // Fetch approvers from workflow table for request type "WorkSchedule"
    const workflowSteps = await prisma.hrms_d_approval_work_flow.findMany({
      where: { request_type: "WorkSchedule" },
      orderBy: { sequence: "asc" },
    });

    // Insert into hrms_d_requests_approval table
    if (workflowSteps.length > 0) {
      const approvalEntries = workflowSteps.map((step) => ({
        request_id: newSchedule.id, // reuse this as request_id
        approver_id: step.approver_id,
        sequence: step.sequence,
        status: "Pending",
        action_at: null,
        createdby: data.createdby || 1,
        createdate: new Date(),
        updatedby: null,
        updatedate: null,
        log_inst: data.log_inst || 1,
      }));

      await prisma.hrms_d_requests_approval.createMany({
        data: approvalEntries,
      });
    }

    return {
      ...newSchedule,
      approval_steps_created: workflowSteps.length,
    };
  } catch (error) {
    throw new CustomError(
      `Error creating work schedule: ${error.message}`,
      500
    );
  }
};
const findWorkScheduleById = async (id) => {
  try {
    const data = await prisma.hrms_m_work_schedule_template.findUnique({
      where: { id: parseInt(id) },
    });
    if (!data) {
      throw new CustomError("Work schedule not found", 404);
    }
    return data;
  } catch (error) {
    throw new CustomError(
      `Error finding work schedule by ID: ${error.message}`,
      503
    );
  }
};

const updateWorkSchedule = async (id, data) => {
  try {
    const upsertedData = await prisma.hrms_m_work_schedule.upsert({
      where: { id: parseInt(id) },
      update: {
        ...data,
        updatedate: new Date(),
      },
      create: {
        ...data,
        createdate: new Date(),
        updatedate: new Date(),
        createdby: data.createdby || 1,
        updatedby: data.updatedby || 1,
        is_active: data.is_active || "Y",
        log_inst: data.log_inst || 1,
      },
    });
    return upsertedData;
  } catch (error) {
    throw new CustomError(
      `Error updating work schedule: ${error.message}`,
      500
    );
  }
};

const deleteWorkSchedule = async (id) => {
  try {
    await prisma.hrms_m_work_schedule_template.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting work schedule: ${error.message}`,
      500
    );
  }
};

const getAllWorkSchedule = async (
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

    const filters = {};
    if (search) {
      filters.OR = [{ template_name: { contains: search.toLowerCase() } }];
    }
    if (typeof is_active === "boolean") {
      filters.is_active = is_active ? "Y" : "N";
    } else if (typeof is_active === "string") {
      if (is_active.toLowerCase() === "true") filters.is_active = "Y";
      else if (is_active.toLowerCase() === "false") filters.is_active = "N";
    }

    const data = await prisma.hrms_m_work_schedule_template.findMany({
      where: filters,
      skip: skip,
      take: size,

      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_m_work_schedule_template.count({
      where: filters,
    });
    return {
      data: data,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    throw new CustomError("Error retrieving work schedule", 503);
  }
};

module.exports = {
  createWorkSchedule,
  findWorkScheduleById,
  updateWorkSchedule,
  deleteWorkSchedule,
  getAllWorkSchedule,
};
