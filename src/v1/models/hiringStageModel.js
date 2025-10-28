// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const prisma = new PrismaClient();

// const serializeHiringStageData = (data) => ({
//   name: data.name || "",
//   code: data.code || "",
//   stage_id: data.stage_id || "",
//   description: data.description || null,
//   planned_date: data.planned_date ? new Date(data.planned_date) : null,
//   completion_date: data.completion_date ? new Date(data.completion_date) : null,
//   status: data.status || "P",
//   feedback: data.feedback || null,
//   competency_level: data.competency_level || null,
//   remarks: data.remarks || null,
// });

// const createHiringStage = async (data) => {
//   try {
//     const newStage = await prisma.hrms_d_hiring_stage.create({
//       data: {
//         ...serializeHiringStageData(data),
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         hiring_stage_hiring_value: {
//           select: {
//             id: true,
//             value: true,
//           },
//         },
//       },
//     });

//     return newStage;
//   } catch (error) {
//     throw new CustomError(`Error creating hiring stage: ${error.message}`, 500);
//   }
// };

// const getHiringStageById = async (id) => {
//   try {
//     const stage = await prisma.hrms_d_hiring_stage.findUnique({
//       where: { id: parseInt(id) },
//     });
//     if (!stage) {
//       throw new CustomError("Hiring stage not found", 404);
//     }
//     return stage;
//   } catch (error) {
//     throw new CustomError(
//       `Error finding hiring stage by ID: ${error.message}`,
//       503
//     );
//   }
// };

// const updateHiringStage = async (id, data) => {
//   try {
//     const updatedStage = await prisma.hrms_d_hiring_stage.update({
//       where: { id: parseInt(id) },
//       include: {
//         hiring_stage_hiring_value: {
//           select: {
//             id: true,
//             value: true,
//           },
//         },
//       },
//       data: {
//         ...serializeHiringStageData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//     });
//     return updatedStage;
//   } catch (error) {
//     throw new CustomError(`Error updating hiring stage: ${error.message}`, 500);
//   }
// };

// const deleteHiringStage = async (id) => {
//   try {
//     await prisma.hrms_d_hiring_stage.delete({
//       where: { id: parseInt(id) },
//     });
//   } catch (error) {
//     if (error.code === "P2003") {
//       throw new CustomError(
//         "This record is connected to other data. Please remove that first.",
//         400
//       );
//     } else {
//       throw new CustomError(error.meta?.constraint || error.message, 500);
//     }
//   }
// };

// const getAllHiringStages = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   status
// ) => {
//   try {
//     page = !page || page == 0 ? 1 : parseInt(page);
//     size = size ? parseInt(size) : 10;
//     const skip = (page - 1) * size;

//     const filters = {};
//     const andFilters = [];

//     if (search) {
//       andFilters.push({
//         OR: [
//           { name: { contains: search.toLowerCase() } },
//           { code: { contains: search.toLowerCase() } },
//           { stage_name: { contains: search.toLowerCase() } },
//           { competency_level: { contains: search.toLowerCase() } },
//           { remarks: { contains: search.toLowerCase() } },
//         ],
//       });
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         andFilters.push({
//           createdate: { gte: start, lte: end },
//         });
//       } else {
//         console.warn("Invalid date format provided:", { startDate, endDate });
//       }
//     }

//     if (status) {
//       andFilters.push({ status });
//     }

//     if (andFilters.length > 0) {
//       filters.AND = andFilters;
//     }

//     const stages = await prisma.hrms_d_hiring_stage.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//       include: {
//         hiring_stage_hiring_value: {
//           select: {
//             id: true,
//             value: true,
//           },
//         },
//       },
//     });

//     const totalCount = await prisma.hrms_d_hiring_stage.count({
//       where: filters,
//     });

//     return {
//       data: stages,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     console.error("Error in getAllHiringStages:");
//     console.error("Error message:", error.message);
//     console.error("Error code:", error.code);
//     console.error("Full error:", error);
//     console.error("Parameters:", {
//       search,
//       page,
//       size,
//       startDate,
//       endDate,
//       status,
//     });

//     throw new CustomError(
//       `Error retrieving hiring stages: ${error.message}`,
//       503
//     );
//   }
// };

// module.exports = {
//   createHiringStage,
//   getHiringStageById,
//   updateHiringStage,
//   deleteHiringStage,
//   getAllHiringStages,
// };

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const { createRequest } = require("./requestsModel.js");

const serializeHiringStageData = (data) => ({
  name: data.name || "",
  code: data.code || "",
  stage_id: data.stage_id,
  description: data.description || null,
  planned_date: data.planned_date ? new Date(data.planned_date) : null,
  completion_date: data.completion_date ? new Date(data.completion_date) : null,
  status: data.status || "P",
  feedback: data.feedback || null,
  competency_level: data.competency_level || null,
  remarks: data.remarks || null,
});

const createHiringStage = async (data) => {
  try {
    const newStage = await prisma.hrms_d_hiring_stage.create({
      data: {
        ...serializeHiringStageData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    return newStage;
  } catch (error) {
    throw new CustomError(`Error creating hiring stage: ${error.message}`, 500);
  }
};

const getHiringStageById = async (id) => {
  try {
    const stage = await prisma.hrms_d_hiring_stage.findUnique({
      where: { id: parseInt(id) },
      include: {
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    if (!stage) {
      throw new CustomError("Hiring stage not found", 404);
    }

    return stage;
  } catch (error) {
    throw new CustomError(
      `Error finding hiring stage by ID: ${error.message}`,
      503
    );
  }
};

// UPDATE FUNCTION - Does everything like interview stage create
const updateHiringStage = async (id, data) => {
  try {
    const updatedStage = await prisma.hrms_d_hiring_stage.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeHiringStageData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    // If remarks/feedback provided, create request (just like interview stage)
    if (data.remarks || data.feedback) {
      await createRequest({
        requester_id: data.requester_id || data.updatedby || 1,
        request_type: "interview_stage",
        reference_id: updatedStage.id,
        stage_name: updatedStage.name,
        request_data: JSON.stringify({
          candidate_id: data.candidate_id,
        }),
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      });

      console.log(
        ` Request created for stage ${id} with candidate_id: ${data.candidate_id}`
      );
    }

    return updatedStage;
  } catch (error) {
    throw new CustomError(`Error updating hiring stage: ${error.message}`, 500);
  }
};

// Update status after approval/rejection
const updateHiringStageStatus = async (id, status, updatedby, candidateId) => {
  try {
    const hiringStageId = parseInt(id);
    if (isNaN(hiringStageId)) {
      throw new CustomError("Invalid hiring stage ID", 400);
    }

    const existingHiringStage = await prisma.hrms_d_hiring_stage.findUnique({
      where: { id: hiringStageId },
    });

    if (!existingHiringStage) {
      throw new CustomError(
        `Hiring stage with ID ${hiringStageId} not found`,
        404
      );
    }

    // Update stage status
    const updatedEntry = await prisma.hrms_d_hiring_stage.update({
      where: { id: hiringStageId },
      data: {
        status: status, // "Approved" or "Rejected"
        updatedby: updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    // IMMEDIATE ACTION: If rejected, stop the entire hiring process
    if (candidateId && status === "Rejected") {
      await stopHiringProcess(candidateId, existingHiringStage.name);
      return updatedEntry;
    }

    // If approved, check if all stages are complete
    if (candidateId && status === "Approved") {
      await checkAndUpdateCandidateStatus(candidateId);
    }

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating hiring stage status: ${error.message}`,
      500
    );
  }
};

// STOP hiring process immediately when any stage is rejected
const stopHiringProcess = async (candidateId, rejectedStageName) => {
  try {
    // Get candidate with job posting
    const candidate = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(candidateId) },
      include: {
        candidate_job_posting: {
          select: {
            hiring_stage_id: true,
          },
        },
      },
    });

    if (!candidate || !candidate.candidate_job_posting) {
      return;
    }

    // Get all hiring stage IDs for this job posting
    const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
    if (!stageIdsString) {
      return;
    }

    const stageIds = stageIdsString
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (stageIds.length === 0) {
      return;
    }

    // Mark all PENDING stages as "Cancelled" (process stopped)
    await prisma.hrms_d_hiring_stage.updateMany({
      where: {
        id: { in: stageIds },
        status: { in: ["P", "Pending"] }, // Only update pending stages
      },
      data: {
        status: "Cancelled",
        remarks: "Hiring process stopped due to rejection in previous stage",
        updatedate: new Date(),
      },
    });

    // Update candidate status to REJECTED
    await prisma.hrms_d_candidate_master.update({
      where: { id: parseInt(candidateId) },
      data: {
        status: "Rejected",
        status_remarks: `Hiring process stopped. Stage "${rejectedStageName}" was rejected.`,
        updatedate: new Date(),
      },
    });

    console.log(
      `Hiring process stopped for candidate ${candidateId} due to rejection in stage: ${rejectedStageName}`
    );
  } catch (error) {
    console.error("Error stopping hiring process:", error);
    // Don't throw error, just log it
  }
};

const checkAndUpdateCandidateStatus = async (candidateId) => {
  try {
    console.log(`Checking candidate status for candidate ID: ${candidateId}`);

    if (!candidateId) {
      console.log("No candidate ID provided");
      return;
    }

    const candidate = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(candidateId) },
      include: {
        candidate_job_posting: {
          select: {
            hiring_stage_id: true,
          },
        },
      },
    });

    if (!candidate || !candidate.candidate_job_posting) {
      console.log("Candidate or job posting not found");
      return;
    }

    const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
    if (!stageIdsString) {
      console.log("No hiring stages found for this job posting");
      return;
    }

    const stageIds = stageIdsString
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (stageIds.length === 0) {
      console.log("No valid hiring stage IDs found");
      return;
    }

    console.log(`Hiring stage IDs for candidate: ${stageIds.join(", ")}`);

    const hiringStages = await prisma.hrms_d_hiring_stage.findMany({
      where: {
        id: { in: stageIds },
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    console.log(`Found ${hiringStages.length} hiring stages`);
    hiringStages.forEach((stage) => {
      console.log(`  - Stage ${stage.id} (${stage.name}): ${stage.status}`);
    });

    const anyRejected = hiringStages.some(
      (stage) => stage.status === "Rejected"
    );

    if (anyRejected) {
      console.log(
        "At least one stage is rejected. Marking candidate as Rejected."
      );
      await prisma.hrms_d_candidate_master.update({
        where: { id: parseInt(candidateId) },
        data: {
          status: "Rejected",
          status_remarks: "Hiring process stopped due to stage rejection",
          updatedate: new Date(),
        },
      });
      return;
    }

    const allApproved = hiringStages.every(
      (stage) => stage.status === "Approved"
    );

    if (allApproved) {
      console.log("All stages approved! Updating candidate status.");
      await prisma.hrms_d_candidate_master.update({
        where: { id: parseInt(candidateId) },
        data: {
          status: "A",
          status_remarks: "All hiring stages have been successfully approved",
          updatedate: new Date(),
        },
      });
      console.log(
        `Candidate ${candidateId} status updated to "All Stages Approved"`
      );
    } else {
      console.log(
        "Some stages still pending. Marking candidate as In Progress."
      );
      await prisma.hrms_d_candidate_master.update({
        where: { id: parseInt(candidateId) },
        data: {
          status: "In Progress",
          status_remarks: "Hiring stages in progress",
          updatedate: new Date(),
        },
      });
    }
  } catch (error) {
    console.error("Error checking candidate status:", error);
  }
};

const deleteHiringStage = async (id) => {
  try {
    await prisma.hrms_d_hiring_stage.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.meta?.constraint || error.message, 500);
    }
  }
};

const getAllHiringStages = async (
  search,
  page,
  size,
  startDate,
  endDate,
  status
) => {
  try {
    page = !page || page == 0 ? 1 : parseInt(page);
    size = size ? parseInt(size) : 10;
    const skip = (page - 1) * size;

    const filters = {};
    const andFilters = [];

    if (search) {
      andFilters.push({
        OR: [
          { name: { contains: search.toLowerCase() } },
          { code: { contains: search.toLowerCase() } },
          { competency_level: { contains: search.toLowerCase() } },
          { remarks: { contains: search.toLowerCase() } },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        andFilters.push({
          createdate: { gte: start, lte: end },
        });
      }
    }

    if (status) {
      andFilters.push({ status });
    }

    if (andFilters.length > 0) {
      filters.AND = andFilters;
    }

    const stages = await prisma.hrms_d_hiring_stage.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_hiring_stage.count({
      where: filters,
    });

    return {
      data: stages,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    throw new CustomError(
      `Error retrieving hiring stages: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createHiringStage,
  getHiringStageById,
  updateHiringStage,
  deleteHiringStage,
  getAllHiringStages,
  updateHiringStageStatus,
};
