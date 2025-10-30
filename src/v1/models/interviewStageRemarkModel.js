// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const prisma = new PrismaClient();
// const { createRequest } = require("./requestsModel.js");

// const serializeRemarkData = (data) => ({
//   candidate_id: data.candidate_id ? Number(data.candidate_id) : null,
//   stage_id: Number(data.stage_id),
//   stage_name: data.stage_name || null,
//   interview_date: data.interview_date ? new Date(data.interview_date) : null,
//   status: data.status || "Pending",
//   employee_id: data.employee_id ? Number(data.employee_id) : null,
//   remark: data.remark || null,
//   rating: data.rating ? Number(data.rating) : null,
//   is_completed: data.is_completed ?? false,
// });

// const checkIfPreviousStagesApproved = async (currentStageId, candidateId) => {
//   try {
//     console.log(
//       ` Checking if previous hiring stages are approved for candidate ${candidateId}`
//     );

//     if (!candidateId) {
//       return {
//         allowed: false,
//         message: "Candidate ID is required",
//       };
//     }

//     const candidate = await prisma.hrms_d_candidate_master.findUnique({
//       where: { id: parseInt(candidateId) },
//       include: {
//         candidate_job_posting: {
//           select: {
//             hiring_stage_id: true,
//           },
//         },
//       },
//     });

//     if (!candidate || !candidate.candidate_job_posting) {
//       return {
//         allowed: false,
//         message: "Candidate or job posting not found",
//       };
//     }

//     const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
//     if (!stageIdsString) {
//       return {
//         allowed: true,
//         message: "No hiring stages defined",
//       };
//     }

//     const stageIds = stageIdsString
//       .split(",")
//       .map((id) => parseInt(id.trim()))
//       .filter((id) => !isNaN(id));

//     if (stageIds.length === 0) {
//       return {
//         allowed: true,
//         message: "No valid hiring stage IDs",
//       };
//     }

//     const currentStageIndex = stageIds.indexOf(currentStageId);

//     if (currentStageIndex === -1) {
//       return {
//         allowed: false,
//         message:
//           "Current stage is not part of this job posting's hiring stages",
//       };
//     }

//     if (currentStageIndex === 0) {
//       console.log(" This is the first stage - allowed");
//       return {
//         allowed: true,
//         message: "First stage - allowed",
//       };
//     }

//     const previousStageIds = stageIds.slice(0, currentStageIndex);
//     console.log(`Previous stage IDs: ${previousStageIds.join(", ")}`);

//     const previousRemarks = await prisma.hrms_m_interview_stage_remark.findMany(
//       {
//         where: {
//           stage_id: { in: previousStageIds },
//           candidate_id: parseInt(candidateId),
//         },
//         include: {
//           interview_stage_remark_hiring_stage: {
//             select: {
//               id: true,
//               hiring_stage_hiring_value: {
//                 select: {
//                   value: true,
//                   id: true,
//                 },
//               },
//             },
//           },
//         },
//       }
//     );

//     console.log(`Previous stage remarks found: ${previousRemarks.length}`);
//     previousRemarks.forEach((remark) => {
//       console.log(
//         `  - Stage ${remark.stage_id} (${remark.interview_stage_remark_hiring_stage.hiring_stage_hiring_value.value}): ${remark.status}`
//       );
//     });
//     const anyRejected = previousRemarks.some(
//       (remark) => remark.status === "Rejected" || remark.status === "R"
//     );

//     if (anyRejected) {
//       const rejectedRemark = previousRemarks.find(
//         (remark) => remark.status === "Rejected" || remark.status === "R"
//       );
//       return {
//         allowed: false,
//         message: `Cannot proceed. Previous stage "${rejectedRemark.interview_stage_remark_hiring_stage.hiring_stage_hiring_value.value}" was rejected. Hiring process has been stopped.`,
//       };
//     }

//     if (previousRemarks.length < previousStageIds.length) {
//       return {
//         allowed: false,
//         message: `Cannot proceed. Previous stage(s) must be completed and approved first. Please wait for previous stages to be submitted and approved.`,
//       };
//     }

//     const allPreviousApproved = previousRemarks.every(
//       (remark) => remark.status === "Approved" || remark.status === "A"
//     );

//     if (!allPreviousApproved) {
//       const pendingRemarks = previousRemarks.filter(
//         (remark) =>
//           remark.status !== "Approved" &&
//           remark.status !== "A" &&
//           remark.status !== "Rejected" &&
//           remark.status !== "R"
//       );

//       const pendingStageNames = pendingRemarks
//         .map(
//           (r) =>
//             r.interview_stage_remark_hiring_stage.hiring_stage_hiring_value
//               .value
//         )
//         .join(", ");

//       return {
//         allowed: false,
//         message: `Cannot proceed. Previous stage(s) must be approved first: ${pendingStageNames}. Please wait for approval before submitting this stage.`,
//       };
//     }

//     console.log("All previous stages are approved - allowed to proceed");
//     return {
//       allowed: true,
//       message: "All previous stages approved",
//     };
//   } catch (error) {
//     console.error("Error checking previous stages:", error);
//     return {
//       allowed: false,
//       message: `Error checking previous stages: ${error.message}`,
//     };
//   }
// };

// const createInterviewStageRemark = async (data) => {
//   try {
//     console.log(
//       " Creating interview stage remark for hiring stage:",
//       data.stage_id
//     );

//     const canProceed = await checkIfPreviousStagesApproved(
//       Number(data.stage_id),
//       Number(data.candidate_id)
//     );

//     if (!canProceed.allowed) {
//       throw new CustomError(canProceed.message, 400);
//     }

//     const result = await prisma.hrms_m_interview_stage_remark.create({
//       data: {
//         ...serializeRemarkData(data),
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         interview_stage_candidate: {
//           select: { id: true, full_name: true, candidate_code: true },
//         },
//         interview_stage_remark_hiring_stage: {
//           select: {
//             id: true,
//             code: true,
//             hiring_stage_hiring_value: {
//               select: {
//                 id: true,
//                 value: true,
//               },
//             },
//           },
//         },
//         interview_stage_employee_id: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//           },
//         },
//       },
//     });

//     console.log("Interview stage remark created, creating request...");

//     await createRequest({
//       requester_id: data.employee_id || data.createdby || 1,
//       request_type: "interview_stage",
//       reference_id: result.id,
//       stage_name:
//         result.interview_stage_remark_hiring_stage.hiring_stage_hiring_value
//           .value,
//       request_data: JSON.stringify({
//         candidate_id: data.candidate_id,
//         hiring_stage_id: data.stage_id,
//       }),
//       createdby: data.createdby || 1,
//       log_inst: data.log_inst || 1,
//     });

//     console.log("Request created for approval");

//     return result;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating interview stage remark: ${error.message}`,
//       500
//     );
//   }
// };

// const findInterviewStageRemarkById = async (id) => {
//   try {
//     const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         interview_stage_candidate: {
//           select: { id: true, full_name: true, candidate_code: true },
//         },
//         interview_stage_remark_hiring_stage: {
//           select: {
//             id: true,
//             hiring_stage_hiring_value: {
//               select: {
//                 id: true,
//                 value: true,
//               },
//             },
//             code: true,
//           },
//         },
//       },
//     });
//     if (!remark) throw new CustomError("Interview stage remark not found", 404);
//     return remark;
//   } catch (error) {
//     throw new CustomError(`Error fetching remark: ${error.message}`, 500);
//   }
// };

// const updateInterviewStageRemark = async (id, data) => {
//   try {
//     const updatedRemark = await prisma.hrms_m_interview_stage_remark.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializeRemarkData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//       include: {
//         interview_stage_candidate: {
//           select: { id: true, full_name: true, candidate_code: true },
//         },
//         interview_stage_remark_hiring_stage: {
//           select: {
//             id: true,
//             hiring_stage_hiring_value: {
//               select: {
//                 value: true,
//                 id: true,
//               },
//             },
//             code: true,
//           },
//         },
//         interview_stage_employee_id: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//           },
//         },
//       },
//     });

//     return updatedRemark;
//   } catch (error) {
//     throw new CustomError(
//       `Error updating interview stage remark: ${error.message}`,
//       500
//     );
//   }
// };

// const deleteInterviewStageRemark = async (id) => {
//   try {
//     await prisma.hrms_m_interview_stage_remark.delete({
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

// const getAllInterviewStageRemark = async (search, page, size, candidateId) => {
//   try {
//     page = page && page > 0 ? page : 1;
//     size = size || 10;
//     const skip = (page - 1) * size;

//     const filters = { AND: [] };

//     if (candidateId) {
//       filters.AND.push({ candidate_id: Number(candidateId) });
//     }

//     if (search) {
//       filters.AND.push({
//         OR: [
//           { stage_name: { contains: search.toLowerCase() } },
//           { remark: { contains: search.toLowerCase() } },
//           {
//             interview_stage_candidate: {
//               full_name: { contains: search.toLowerCase() },
//             },
//           },
//         ],
//       });
//     }

//     const data = await prisma.hrms_m_interview_stage_remark.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//       include: {
//         interview_stage_candidate: {
//           select: { id: true, full_name: true, candidate_code: true },
//         },
//         interview_stage_remark_hiring_stage: {
//           select: {
//             id: true,
//             hiring_stage_hiring_value: {
//               select: {
//                 value: true,
//                 id: true,
//               },
//             },
//             code: true,
//           },
//         },
//         interview_stage_employee_id: {
//           select: {
//             id: true,
//             full_name: true,
//             employee_code: true,
//             profile_pic: true,
//           },
//         },
//       },
//     });

//     const totalCount = await prisma.hrms_m_interview_stage_remark.count({
//       where: filters,
//     });

//     return {
//       data,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     throw new CustomError(`Error fetching remarks: ${error.message}`, 503);
//   }
// };

// const checkAndUpdateCandidateStatus = async (candidateId, hiringStageId) => {
//   try {
//     console.log(
//       `Checking candidate ${candidateId} status for hiring stage ${hiringStageId}`
//     );

//     if (!candidateId) {
//       console.log("No candidate ID provided");
//       return;
//     }

//     const candidate = await prisma.hrms_d_candidate_master.findUnique({
//       where: { id: parseInt(candidateId) },
//       include: {
//         candidate_job_posting: {
//           select: {
//             hiring_stage_id: true,
//           },
//         },
//       },
//     });

//     if (!candidate || !candidate.candidate_job_posting) {
//       console.log("Candidate or job posting not found");
//       return;
//     }

//     const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
//     if (!stageIdsString) {
//       console.log("No hiring stages found");
//       return;
//     }

//     const stageIds = stageIdsString
//       .split(",")
//       .map((id) => parseInt(id.trim()))
//       .filter((id) => !isNaN(id));

//     if (stageIds.length === 0) {
//       console.log("No valid hiring stage IDs");
//       return;
//     }

//     console.log(`Hiring stage IDs for candidate: ${stageIds.join(", ")}`);

//     const allRemarks = await prisma.hrms_m_interview_stage_remark.findMany({
//       where: {
//         stage_id: { in: stageIds },
//         candidate_id: parseInt(candidateId),
//       },
//       include: {
//         interview_stage_remark_hiring_stage: {
//           select: {
//             id: true,
//             hiring_stage_hiring_value: {
//               select: {
//                 value: true,
//                 id: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     console.log(` Found ${allRemarks.length} remarks`);
//     allRemarks.forEach((remark) => {
//       console.log(
//         `  - Stage ${remark.stage_id} (${remark.interview_stage_remark_hiring_stage.hiring_stage_hiring_value.value}): ${remark.status}`
//       );
//     });

//     const anyRejected = allRemarks.some(
//       (remark) => remark.status === "Rejected" || remark.status === "R"
//     );

//     if (anyRejected) {
//       console.log(
//         " At least one stage is rejected. Marking candidate as Rejected."
//       );
//       await prisma.hrms_d_candidate_master.update({
//         where: { id: parseInt(candidateId) },
//         data: {
//           status: "Rejected",
//           status_remarks: "Hiring process stopped due to stage rejection",
//           updatedate: new Date(),
//         },
//       });
//       return;
//     }

//     const allApproved =
//       allRemarks.length === stageIds.length &&
//       allRemarks.every(
//         (remark) => remark.status === "Approved" || remark.status === "A"
//       );

//     if (allApproved) {
//       console.log(" All stages approved! Updating candidate status.");
//       await prisma.hrms_d_candidate_master.update({
//         where: { id: parseInt(candidateId) },
//         data: {
//           status: "A",
//           status_remarks: "All hiring stages have been successfully approved",
//           updatedate: new Date(),
//         },
//       });
//       console.log(
//         ` Candidate ${candidateId} status updated to "All Stages Approved"`
//       );
//     } else {
//       console.log(
//         " Some stages still pending. Marking candidate as In Progress."
//       );
//       await prisma.hrms_d_candidate_master.update({
//         where: { id: parseInt(candidateId) },
//         data: {
//           status: "In Progress",
//           status_remarks: "Hiring stages in progress",
//           updatedate: new Date(),
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error checking candidate status:", error);
//   }
// };

// const stopHiringProcess = async (
//   candidateId,
//   hiringStageId,
//   rejectedStageName
// ) => {
//   try {
//     console.log(`Stopping hiring process for candidate ${candidateId}`);

//     const candidate = await prisma.hrms_d_candidate_master.findUnique({
//       where: { id: parseInt(candidateId) },
//       include: {
//         candidate_job_posting: {
//           select: {
//             hiring_stage_id: true,
//           },
//         },
//       },
//     });

//     if (!candidate || !candidate.candidate_job_posting) {
//       return;
//     }

//     const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
//     if (!stageIdsString) {
//       return;
//     }

//     const stageIds = stageIdsString
//       .split(",")
//       .map((id) => parseInt(id.trim()))
//       .filter((id) => !isNaN(id));

//     const currentStageIndex = stageIds.indexOf(parseInt(hiringStageId));
//     if (currentStageIndex === -1) {
//       return;
//     }

//     const futureStageIds = stageIds.slice(currentStageIndex + 1);

//     if (futureStageIds.length > 0) {
//       await prisma.hrms_m_interview_stage_remark.updateMany({
//         where: {
//           stage_id: { in: futureStageIds },
//           candidate_id: parseInt(candidateId),
//           status: { in: ["Pending", "P"] },
//         },
//         data: {
//           status: "Cancelled",
//           remark: "Hiring process stopped due to rejection in previous stage",
//           updatedate: new Date(),
//         },
//       });
//     }

//     await prisma.hrms_d_candidate_master.update({
//       where: { id: parseInt(candidateId) },
//       data: {
//         status: "Rejected",
//         status_remarks: `Hiring process stopped. Stage "${rejectedStageName}" was rejected.`,
//         updatedate: new Date(),
//       },
//     });

//     console.log(` Hiring process stopped for candidate ${candidateId}`);
//   } catch (error) {
//     console.error("Error stopping hiring process:", error);
//   }
// };

// const updateInterviewStageRemarkStatus = async (id, data) => {
//   try {
//     const interviewStageRemarkId = parseInt(id);
//     if (isNaN(interviewStageRemarkId)) {
//       throw new CustomError("Invalid interview stage remark ID", 400);
//     }

//     const existingRemark =
//       await prisma.hrms_m_interview_stage_remark.findUnique({
//         where: { id: interviewStageRemarkId },
//         include: {
//           interview_stage_remark_hiring_stage: {
//             select: {
//               id: true,
//               hiring_stage_hiring_value: {
//                 select: {
//                   value: true,
//                   id: true,
//                 },
//               },
//             },
//           },
//         },
//       });

//     if (!existingRemark) {
//       throw new CustomError(
//         `Interview stage remark with ID ${interviewStageRemarkId} not found`,
//         404
//       );
//     }

//     const updateData = {
//       status: data.status,
//       updatedby: data.updatedby || 1,
//       updatedate: new Date(),
//     };

//     const updatedEntry = await prisma.hrms_m_interview_stage_remark.update({
//       where: { id: interviewStageRemarkId },
//       data: updateData,
//     });

//     if (data.status === "Approved" || data.status === "A") {
//       await checkAndUpdateCandidateStatus(
//         existingRemark.candidate_id,
//         existingRemark.stage_id
//       );
//     } else if (data.status === "Rejected" || data.status === "R") {
//       await stopHiringProcess(
//         existingRemark.candidate_id,
//         existingRemark.stage_id,
//         existingRemark.interview_stage_remark_hiring_stage
//           .hiring_stage_hiring_value.value
//       );
//     }

//     return updatedEntry;
//   } catch (error) {
//     throw new CustomError(
//       `Error updating remark status: ${error.message}`,
//       500
//     );
//   }
// };

// module.exports = {
//   createInterviewStageRemark,
//   findInterviewStageRemarkById,
//   updateInterviewStageRemark,
//   deleteInterviewStageRemark,
//   getAllInterviewStageRemark,
//   updateInterviewStageRemarkStatus,
//   checkIfPreviousStagesApproved,
//   checkAndUpdateCandidateStatus,
//   stopHiringProcess,
// };

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const { createRequest } = require("../models/requestsModel");
const prisma = new PrismaClient();

const serializeRemarkData = (data) => ({
  candidate_id: data.candidate_id ? Number(data.candidate_id) : null,
  stage_id: Number(data.stage_id),
  stage_name: data.stage_name || null,
  interview_date: data.interview_date ? new Date(data.interview_date) : null,
  status: data.status || "Pending",
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  remark: data.remark || null,
  rating: data.rating ? Number(data.rating) : null,
  is_completed: data.is_completed ?? false,
});

const checkIfPreviousStagesApproved = async (currentStageId, candidateId) => {
  try {
    console.log(
      `Checking if previous hiring stages are approved for candidate ${candidateId}`
    );

    if (!candidateId) {
      return {
        allowed: false,
        message: "Candidate ID is required",
      };
    }

    const candidate = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(candidateId) },
    });

    if (!candidate) {
      return {
        allowed: false,
        message: "Candidate not found",
      };
    }

    const candidateStages = await prisma.hrms_d_candidate_hiring_stage.findMany(
      {
        where: {
          candidate_id: parseInt(candidateId),
        },
        include: {
          candidate_hiring_stage_hiring_stage: {
            include: {
              hiring_stage_hiring_value: {
                select: {
                  value: true,
                  id: true,
                },
              },
            },
          },
        },
        orderBy: {
          sequence_order: "asc",
        },
      }
    );

    if (candidateStages.length === 0) {
      return {
        allowed: true,
        message: "No hiring stages defined for this candidate",
      };
    }

    console.log(
      `📋 Candidate has ${candidateStages.length} snapshotted stages:`
    );
    candidateStages.forEach((stage) => {
      console.log(
        `   - Stage ${stage.stage_id}: ${stage.stage_name} (Seq: ${stage.sequence_order}, Status: ${stage.stage_status})`
      );
    });

    // Find current stage in candidate's snapshots
    const currentStageIndex = candidateStages.findIndex(
      (stage) => stage.stage_id === parseInt(currentStageId)
    );

    if (currentStageIndex === -1) {
      console.error(
        `❌ Stage ${currentStageId} not found in candidate's snapshotted stages`
      );
      console.error(
        `   Available stages: [${candidateStages
          .map((s) => s.stage_id)
          .join(", ")}]`
      );
      return {
        allowed: false,
        message: `Stage ${currentStageId} is not part of this candidate's hiring stages. Available stages: ${candidateStages
          .map((s) => `${s.stage_id} (${s.stage_name})`)
          .join(", ")}`,
      };
    }

    if (currentStageIndex === 0) {
      console.log("✅ This is the first stage - allowed");
      return {
        allowed: true,
        message: "First stage - allowed",
      };
    }

    // Get previous stages from candidate's snapshots
    const previousStages = candidateStages.slice(0, currentStageIndex);
    const previousStageIds = previousStages.map((s) => s.stage_id);

    console.log(`📋 Previous stage IDs: [${previousStageIds.join(", ")}]`);

    // Check if remarks exist for previous stages
    const previousRemarks = await prisma.hrms_m_interview_stage_remark.findMany(
      {
        where: {
          stage_id: { in: previousStageIds },
          candidate_id: parseInt(candidateId),
        },
        include: {
          interview_stage_remark_hiring_stage: {
            select: {
              id: true,
              hiring_stage_hiring_value: {
                select: {
                  value: true,
                  id: true,
                },
              },
            },
          },
        },
      }
    );

    console.log(`📝 Previous stage remarks found: ${previousRemarks.length}`);
    previousRemarks.forEach((remark) => {
      console.log(
        `   - Stage ${remark.stage_id}: ${
          remark.interview_stage_remark_hiring_stage?.hiring_stage_hiring_value
            ?.value || "Unknown"
        } - ${remark.status}`
      );
    });

    const anyRejected = previousRemarks.some(
      (remark) => remark.status === "Rejected" || remark.status === "R"
    );

    if (anyRejected) {
      const rejectedRemark = previousRemarks.find(
        (remark) => remark.status === "Rejected" || remark.status === "R"
      );
      return {
        allowed: false,
        message: `Cannot proceed. Previous stage "${rejectedRemark.interview_stage_remark_hiring_stage?.hiring_stage_hiring_value?.value}" was rejected. Hiring process has been stopped.`,
      };
    }

    if (previousRemarks.length < previousStageIds.length) {
      const remarkedStageIds = new Set(previousRemarks.map((r) => r.stage_id));
      const missingStageIds = previousStageIds.filter(
        (id) => !remarkedStageIds.has(id)
      );
      const missingStages = candidateStages
        .filter((s) => missingStageIds.includes(s.stage_id))
        .map((s) => s.stage_name);

      return {
        allowed: false,
        message: `Cannot proceed. Previous stages must be completed first: ${missingStages.join(
          ", "
        )}. Please wait for previous stages to be submitted.`,
      };
    }

    const allPreviousApproved = previousRemarks.every(
      (remark) => remark.status === "Approved" || remark.status === "A"
    );

    if (!allPreviousApproved) {
      const pendingRemarks = previousRemarks.filter(
        (remark) =>
          remark.status !== "Approved" &&
          remark.status !== "A" &&
          remark.status !== "Rejected" &&
          remark.status !== "R"
      );
      const pendingStageNames = pendingRemarks
        .map(
          (r) =>
            r.interview_stage_remark_hiring_stage?.hiring_stage_hiring_value
              ?.value
        )
        .join(", ");

      return {
        allowed: false,
        message: `Cannot proceed. Previous stages must be approved first: ${pendingStageNames}. Please wait for approval before submitting this stage.`,
      };
    }

    return {
      allowed: true,
      message: "All previous stages approved",
    };
  } catch (error) {
    console.error("Error checking previous stages:", error);
    return {
      allowed: false,
      message: `Error checking previous stages: ${error.message}`,
    };
  }
};
const convertSnapshotIdToStageId = async (candidateId, possibleSnapshotId) => {
  try {
    console.log(
      `Checking if stage_id ${possibleSnapshotId} is a snapshot ID for candidate ${candidateId}`
    );

    const isActualStage = await prisma.hrms_d_hiring_stage.findUnique({
      where: { id: parseInt(possibleSnapshotId) },
    });

    if (isActualStage) {
      console.log(
        `stage_id ${possibleSnapshotId} is already an actual hiring stage ID`
      );
      return parseInt(possibleSnapshotId);
    }

    console.log(
      ` stage_id ${possibleSnapshotId} not found in hiring_stage table, checking snapshot table...`
    );

    const snapshotRecord = await prisma.hrms_d_candidate_hiring_stage.findFirst(
      {
        where: {
          id: parseInt(possibleSnapshotId),
          candidate_id: parseInt(candidateId),
        },
        select: {
          id: true,
          stage_id: true,
          stage_name: true,
        },
      }
    );

    if (snapshotRecord) {
      console.log(
        ` Converted snapshot ID ${possibleSnapshotId} to actual stage ID ${snapshotRecord.stage_id} (${snapshotRecord.stage_name})`
      );
      return snapshotRecord.stage_id;
    }

    throw new CustomError(
      `Stage ID ${possibleSnapshotId} not found for candidate ${candidateId}`,
      404
    );
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(`Error converting stage ID: ${error.message}`, 500);
  }
};

const createInterviewStageRemark = async (data) => {
  try {
    const actualStageId = await convertSnapshotIdToStageId(
      Number(data.candidate_id),
      Number(data.stage_id)
    );

    console.log(
      ` Creating interview stage remark for hiring stage ${actualStageId}`
    );

    const canProceed = await checkIfPreviousStagesApproved(
      actualStageId,
      Number(data.candidate_id)
    );

    if (!canProceed.allowed) {
      throw new CustomError(canProceed.message, 400);
    }

    const result = await prisma.hrms_m_interview_stage_remark.create({
      data: {
        ...serializeRemarkData({
          ...data,
          stage_id: actualStageId,
        }),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        interview_stage_candidate: {
          select: {
            id: true,
            full_name: true,
            candidate_code: true,
          },
        },
        interview_stage_remark_hiring_stage: {
          select: {
            id: true,
            code: true,
            hiring_stage_hiring_value: {
              select: {
                id: true,
                value: true,
              },
            },
          },
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

    console.log("Interview stage remark created, creating request...");

    await createRequest({
      requester_id: data.employee_id || data.createdby || 1,
      request_type: "interview_stage",
      reference_id: result.id,
      stage_name:
        result.interview_stage_remark_hiring_stage.hiring_stage_hiring_value
          .value,
      request_data: JSON.stringify({
        candidate_id: data.candidate_id,
        hiring_stage_id: actualStageId,
      }),
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });

    console.log("Request created for approval");

    await prisma.hrms_d_candidate_hiring_stage.updateMany({
      where: {
        candidate_id: parseInt(data.candidate_id),
        stage_id: actualStageId,
      },
      data: {
        stage_status: "in_progress",
        started_date: new Date(),
        updatedate: new Date(),
      },
    });

    console.log("Candidate stage status updated in snapshot table");

    return result;
  } catch (error) {
    console.error("Error creating interview stage remark:", error);
    throw new CustomError(
      `Error creating interview stage remark: ${error.message}`,
      500
    );
  }
};

const checkAndUpdateCandidateStatus = async (candidateId, hiringStageId) => {
  try {
    console.log(
      ` Checking candidate ${candidateId} status for hiring stage ${hiringStageId}`
    );

    if (!candidateId) {
      console.log("No candidate ID provided");
      return;
    }

    const candidateStages = await prisma.hrms_d_candidate_hiring_stage.findMany(
      {
        where: {
          candidate_id: parseInt(candidateId),
        },
        include: {
          candidate_hiring_stage_hiring_stage: {
            include: {
              hiring_stage_hiring_value: {
                select: {
                  value: true,
                  id: true,
                },
              },
            },
          },
        },
        orderBy: {
          sequence_order: "asc",
        },
      }
    );

    if (candidateStages.length === 0) {
      console.log("No hiring stages found for candidate");
      return;
    }

    const stageIds = candidateStages.map((s) => s.stage_id);
    console.log(`Hiring stage IDs for candidate: [${stageIds.join(", ")}]`);

    const allRemarks = await prisma.hrms_m_interview_stage_remark.findMany({
      where: {
        stage_id: { in: stageIds },
        candidate_id: parseInt(candidateId),
      },
      include: {
        interview_stage_remark_hiring_stage: {
          select: {
            id: true,
            hiring_stage_hiring_value: {
              select: {
                value: true,
                id: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${allRemarks.length} remarks`);
    allRemarks.forEach((remark) => {
      console.log(
        `   - Stage ${remark.stage_id}: ${
          remark.interview_stage_remark_hiring_stage?.hiring_stage_hiring_value
            ?.value || "Unknown"
        } - ${remark.status}`
      );
    });

    const anyRejected = allRemarks.some(
      (remark) => remark.status === "Rejected" || remark.status === "R"
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

      await prisma.hrms_d_candidate_hiring_stage.updateMany({
        where: {
          candidate_id: parseInt(candidateId),
          stage_status: { in: ["pending", "in_progress"] },
        },
        data: {
          stage_status: "rejected",
          completed_date: new Date(),
          updatedate: new Date(),
        },
      });

      return;
    }

    const allApproved =
      allRemarks.length === stageIds.length &&
      allRemarks.every(
        (remark) => remark.status === "Approved" || remark.status === "A"
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

      await prisma.hrms_d_candidate_hiring_stage.updateMany({
        where: {
          candidate_id: parseInt(candidateId),
        },
        data: {
          stage_status: "completed",
          completed_date: new Date(),
          updatedate: new Date(),
        },
      });

      console.log(
        `Candidate ${candidateId} status updated to 'All Stages Approved'`
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
    console.error("   Error checking candidate status:", error);
  }
};

const stopHiringProcess = async (
  candidateId,
  hiringStageId,
  rejectedStageName
) => {
  try {
    console.log(`Stopping hiring process for candidate ${candidateId}`);

    const candidateStages = await prisma.hrms_d_candidate_hiring_stage.findMany(
      {
        where: {
          candidate_id: parseInt(candidateId),
        },
        orderBy: {
          sequence_order: "asc",
        },
      }
    );

    if (candidateStages.length === 0) {
      return;
    }

    const currentStageIndex = candidateStages.findIndex(
      (stage) => stage.stage_id === parseInt(hiringStageId)
    );

    if (currentStageIndex === -1) {
      return;
    }

    const futureStages = candidateStages.slice(currentStageIndex + 1);
    const futureStageIds = futureStages.map((s) => s.stage_id);

    if (futureStageIds.length > 0) {
      await prisma.hrms_m_interview_stage_remark.updateMany({
        where: {
          stage_id: { in: futureStageIds },
          candidate_id: parseInt(candidateId),
          status: { in: ["Pending", "P"] },
        },
        data: {
          status: "Cancelled",
          remark: "Hiring process stopped due to rejection in previous stage",
          updatedate: new Date(),
        },
      });

      await prisma.hrms_d_candidate_hiring_stage.updateMany({
        where: {
          candidate_id: parseInt(candidateId),
          sequence_order: { gt: currentStageIndex + 1 },
        },
        data: {
          stage_status: "cancelled",
          updatedate: new Date(),
        },
      });
    }

    await prisma.hrms_d_candidate_master.update({
      where: { id: parseInt(candidateId) },
      data: {
        status: "Rejected",
        status_remarks: `Hiring process stopped. Stage "${rejectedStageName}" was rejected.`,
        updatedate: new Date(),
      },
    });

    console.log(` Hiring process stopped for candidate ${candidateId}`);
  } catch (error) {
    console.error("Error stopping hiring process:", error);
  }
};

const updateInterviewStageRemarkStatus = async (id, data) => {
  try {
    const interviewStageRemarkId = parseInt(id);

    if (isNaN(interviewStageRemarkId)) {
      throw new CustomError("Invalid interview stage remark ID", 400);
    }

    const existingRemark =
      await prisma.hrms_m_interview_stage_remark.findUnique({
        where: { id: interviewStageRemarkId },
        include: {
          interview_stage_remark_hiring_stage: {
            select: {
              id: true,
              hiring_stage_hiring_value: {
                select: {
                  value: true,
                  id: true,
                },
              },
            },
          },
        },
      });

    if (!existingRemark) {
      throw new CustomError(
        `Interview stage remark with ID ${interviewStageRemarkId} not found`,
        404
      );
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    const updatedEntry = await prisma.hrms_m_interview_stage_remark.update({
      where: { id: interviewStageRemarkId },
      data: updateData,
    });

    if (data.status === "Approved" || data.status === "A") {
      await prisma.hrms_d_candidate_hiring_stage.updateMany({
        where: {
          candidate_id: existingRemark.candidate_id,
          stage_id: existingRemark.stage_id,
        },
        data: {
          stage_status: "completed",
          completed_date: new Date(),
          updatedate: new Date(),
        },
      });

      const currentStage = await prisma.hrms_d_candidate_hiring_stage.findFirst(
        {
          where: {
            candidate_id: existingRemark.candidate_id,
            stage_id: existingRemark.stage_id,
          },
        }
      );

      if (currentStage) {
        const nextStage = await prisma.hrms_d_candidate_hiring_stage.findFirst({
          where: {
            candidate_id: existingRemark.candidate_id,
            sequence_order: currentStage.sequence_order + 1,
          },
        });

        if (nextStage) {
          await prisma.hrms_d_candidate_hiring_stage.update({
            where: { id: nextStage.id },
            data: {
              stage_status: "in_progress",
              started_date: new Date(),
              updatedate: new Date(),
            },
          });
          console.log(` Moved to next stage: ${nextStage.stage_name}`);
        }
      }

      await checkAndUpdateCandidateStatus(
        existingRemark.candidate_id,
        existingRemark.stage_id
      );
    } else if (data.status === "Rejected" || data.status === "R") {
      await prisma.hrms_d_candidate_hiring_stage.updateMany({
        where: {
          candidate_id: existingRemark.candidate_id,
          stage_id: existingRemark.stage_id,
        },
        data: {
          stage_status: "rejected",
          completed_date: new Date(),
          updatedate: new Date(),
        },
      });

      await stopHiringProcess(
        existingRemark.candidate_id,
        existingRemark.stage_id,
        existingRemark.interview_stage_remark_hiring_stage
          ?.hiring_stage_hiring_value?.value
      );
    }

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating remark status: ${error.message}`,
      500
    );
  }
};

const findInterviewStageRemarkById = async (id) => {
  try {
    const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
      where: { id: parseInt(id) },
      include: {
        interview_stage_candidate: {
          select: { id: true, full_name: true, candidate_code: true },
        },
        interview_stage_remark_hiring_stage: {
          select: {
            id: true,
            hiring_stage_hiring_value: {
              select: {
                id: true,
                value: true,
              },
            },
            code: true,
          },
        },
      },
    });
    if (!remark) throw new CustomError("Interview stage remark not found", 404);
    return remark;
  } catch (error) {
    throw new CustomError(`Error fetching remark: ${error.message}`, 500);
  }
};

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
        interview_stage_remark_hiring_stage: {
          select: {
            id: true,
            hiring_stage_hiring_value: {
              select: {
                value: true,
                id: true,
              },
            },
            code: true,
          },
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

    return updatedRemark;
  } catch (error) {
    throw new CustomError(
      `Error updating interview stage remark: ${error.message}`,
      500
    );
  }
};

const deleteInterviewStageRemark = async (id) => {
  try {
    await prisma.hrms_m_interview_stage_remark.delete({
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
        interview_stage_remark_hiring_stage: {
          select: {
            id: true,
            hiring_stage_hiring_value: {
              select: {
                value: true,
                id: true,
              },
            },
            code: true,
          },
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

module.exports = {
  createInterviewStageRemark,
  findInterviewStageRemarkById,
  updateInterviewStageRemark,
  deleteInterviewStageRemark,
  getAllInterviewStageRemark,
  updateInterviewStageRemarkStatus,
  checkIfPreviousStagesApproved,
  checkAndUpdateCandidateStatus,
  stopHiringProcess,
};
