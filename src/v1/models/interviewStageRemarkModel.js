// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const prisma = new PrismaClient();
// const { createRequest } = require("./requestsModel.js");
// // Serialize
// const serializeRemarkData = (data) => ({
//   candidate_id: data.candidate_id ? Number(data.candidate_id) : null,
//   stage_id: Number(data.stage_id),
//   stage_name: data.stage_name || null,
//   // description: data.description,
//   interview_date: new Date(data.interview_date),
//   status: data.status || "Pending",
//   employee_id: data.employee_id ? Number(data.employee_id) : null,
//   remark: data.remark || null,
//   rating: data.rating ? Number(data.rating) : null,
//   is_completed: data.is_completed ?? false,
// });

// // Create
// const createInterviewStageRemark = async (data) => {
//   try {
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
//         interview_stage_stage_id: {
//           select: { id: true, stage_name: true },
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
//     if (data.stage_id) {
//       await prisma.hrms_d_candidate_master.update({
//         where: { id: result.candidate_id },
//         data: {
//           interview_stage: data.stage_id,
//           updatedby: data.updatedby || 1,
//           updatedate: new Date(),
//         },
//       });
//     }

//     await createRequest({
//       requester_id: data.employee_id,
//       request_type: "interview_stage",
//       reference_id: result.id,
//       stage_name: data.stage_name,
//       // request_data:
//       //   reqData.reason ||
//       //   `Leave from ${reqData.start_date} to ${reqData.end_date}`,
//       createdby: data.createdby || 1,
//       log_inst: data.log_inst || 1,
//     });

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
//         interview_stage_stage_id: {
//           select: { id: true, stage_name: true },
//         },
//       },
//     });
//     if (!remark) throw new CustomError("Interview stage remark not found", 404);
//     return remark;
//   } catch (error) {
//     throw new CustomError(`Error fetching remark: ${error.message}`, 500);
//   }
// };

// //  Update
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
//         interview_stage_stage_id: {
//           select: { id: true, stage_name: true },
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

//     if (data.stage_id) {
//       await prisma.hrms_d_candidate_master.update({
//         where: { id: updatedRemark.candidate_id },
//         data: {
//           interview_stage: data.stage_id,
//           updatedby: data.updatedby || 1,
//           updatedate: new Date(),
//         },
//       });
//     }

//     return updatedRemark;
//   } catch (error) {
//     throw new CustomError(
//       `Error updating interview stage remark: ${error.message}`,
//       500
//     );
//   }
// };

// //  Delete
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
//       throw new CustomError(error.meta.constraint, 500);
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
//           {
//             interview_stage_stage_id: {
//               stage_name: { contains: search.toLowerCase() },
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
//         interview_stage_stage_id: {
//           select: { id: true, stage_name: true },
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

// const updateInterviewStageRemarkStatus = async (id, data) => {
//   try {
//     const interviewStageRemarkId = parseInt(id);
//     if (isNaN(interviewStageRemarkId)) {
//       throw new CustomError("Invalid interview stage reamark ID", 400);
//     }

//     const existingInterviewStageRemark =
//       await prisma.hrms_m_interview_stage_remark.findUnique({
//         where: { id: interviewStageRemarkId },
//       });

//     if (!existingInterviewStageRemark) {
//       throw new CustomError(
//         `Leave application with ID ${interviewStageRemarkId} not found`,
//         404
//       );
//     }

//     const updateData = {
//       status: data.status,
//       updatedby: data.updatedby || 1,
//       updatedate: new Date(),
//     };

//     if (data.status === "Approved") {
//       updateData.status = data.status || "";
//     } else if (data.status === "Rejected") {
//       updateData.status = data.status || "";
//     } else {
//       updateData.status = data.status || "";
//     }

//     const updatedEntry = await prisma.hrms_m_interview_stage_remark.update({
//       where: { id: interviewStageRemarkId },
//       data: updateData,
//     });

//     return updatedEntry;
//   } catch (error) {
//     throw new CustomError(`Error updating leave status: ${error.message}`, 500);
//   }
// };
// module.exports = {
//   createInterviewStageRemark,
//   findInterviewStageRemarkById,
//   updateInterviewStageRemark,
//   deleteInterviewStageRemark,
//   getAllInterviewStageRemark,
//   updateInterviewStageRemarkStatus,
// };
// // const { PrismaClient } = require("@prisma/client");
// // const CustomError = require("../../utils/CustomError");
// // const { generateEmailContent } = require("../../utils/emailTemplates");
// // const sendEmail = require("../../utils/mailer");
// // const prisma = new PrismaClient();

// // const serializeRemarkData = (data) => ({
// //   candidate_id: Number(data.candidate_id),
// //   stage_id: Number(data.stage_id),
// //   stage_name: data.stage_name || null,
// //   interview_date: data.interview_date ? new Date(data.interview_date) : null,
// //   status: data.status || "Pending",
// //   employee_id: data.employee_id ? Number(data.employee_id) : null,
// //   remark: data.remark || null,
// //   rating: data.rating ? Number(data.rating) : null,
// //   is_completed: data.is_completed ?? false,
// // });

// // const seqFromSortOrder = (sortOrder) => Number(sortOrder) + 1;

// // async function getWorkflowApprovers(request_type, sequence) {
// //   const rows = await prisma.hrms_d_approval_work_flow.findMany({
// //     where: {
// //       request_type,
// //       sequence,
// //       is_active: "Y",
// //     },
// //     include: { approval_work_approver: true },
// //     orderBy: { id: "asc" },
// //   });
// //   return rows.filter((r) => r.approval_work_approver);
// // }

// // const createInterviewStageRemark = async (data) => {
// //   console.log(" [createInterviewStageRemark] Input Data:", data);

// //   // 1) Create remark
// //   const result = await prisma.hrms_m_interview_stage_remark.create({
// //     data: {
// //       ...serializeRemarkData(data),
// //       createdby: data.createdby || 1,
// //       createdate: new Date(),
// //       log_inst: data.log_inst || 1,
// //     },
// //     include: {
// //       interview_stage_candidate: {
// //         select: { id: true, full_name: true, email: true },
// //       },
// //       interview_stage_stage_id: {
// //         select: { id: true, stage_name: true, sort_order: true },
// //       },
// //     },
// //   });
// //   console.log(" Remark Created:", result);

// //   // 2) Update candidate current stage pointer
// //   await prisma.hrms_d_candidate_master.update({
// //     where: { id: result.candidate_id },
// //     data: {
// //       interview_stage: result.stage_id,
// //       updatedby: data.updatedby || 1,
// //       updatedate: new Date(),
// //     },
// //   });
// //   console.log("Candidate Updated to stage:", result.stage_id);

// //   // 3) Notify ALL approvers for this stage (sequence = sort_order + 1)
// //   const sequence = seqFromSortOrder(result.interview_stage_stage_id.sort_order);
// //   console.log(" Fetching approvers for sequence:", sequence);

// //   const approvers = await getWorkflowApprovers("interview_stage", sequence);
// //   console.log(
// //     " Approvers Found:",
// //     approvers.map((a) => ({
// //       id: a.approval_work_approver.id,
// //       name: a.approval_work_approver.full_name,
// //       email: a.approval_work_approver.email,
// //     }))
// //   );

// //   if (approvers.length > 0) {
// //     await prisma.hrms_m_interview_stage_remark.update({
// //       where: { id: result.id },
// //       data: { employee_id: approvers[0].approval_work_approver.id },
// //     });

// //     for (const wf of approvers) {
// //       const approver = wf.approval_work_approver;

// //       const emailContent = await generateEmailContent(
// //         "INTERVIEW_ASSIGNED", // <-- make sure this template exists (see section 3 below)
// //         {
// //           approverName: approver.full_name,
// //           candidateName: result.interview_stage_candidate.full_name,
// //           stageName: result.interview_stage_stage_id.stage_name,
// //         }
// //       );

// //       console.log("EMAIL PREVIEW (assigned):", {
// //         to: approver.email,
// //         subject:
// //           emailContent.subject ||
// //           `Interview Assigned: ${result.interview_stage_candidate.full_name}`,
// //         html: emailContent.body,
// //       });

// //       await sendEmail({
// //         to: approver.email,
// //         subject:
// //           emailContent.subject ||
// //           `Interview Assigned: ${result.interview_stage_candidate.full_name}`,
// //         html: emailContent.body,
// //         log_inst: data.log_inst,
// //       });
// //     }
// //   } else {
// //     console.warn(" No approvers configured for sequence:", sequence);
// //   }

// //   return result;
// // };

// // const findInterviewStageRemarkById = async (id) => {
// //   try {
// //     const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
// //       where: { id: parseInt(id) },
// //       include: {
// //         interview_stage_candidate: {
// //           select: {
// //             id: true,
// //             full_name: true,
// //             candidate_code: true,
// //             email: true,
// //           },
// //         },
// //         interview_stage_stage_id: {
// //           select: { id: true, stage_name: true, sort_order: true },
// //         },
// //       },
// //     });
// //     if (!remark) throw new CustomError("Interview stage remark not found", 404);
// //     return remark;
// //   } catch (error) {
// //     throw new CustomError(`Error fetching remark: ${error.message}`, 500);
// //   }
// // };

// // // Update
// // const updateInterviewStageRemark = async (id, data) => {
// //   try {
// //     const updatedRemark = await prisma.hrms_m_interview_stage_remark.update({
// //       where: { id: parseInt(id) },
// //       data: {
// //         ...serializeRemarkData(data),
// //         updatedby: data.updatedby || 1,
// //         updatedate: new Date(),
// //       },
// //       include: {
// //         interview_stage_candidate: {
// //           select: { id: true, full_name: true, candidate_code: true },
// //         },
// //         interview_stage_stage_id: {
// //           select: { id: true, stage_name: true, sort_order: true },
// //         },
// //         interview_stage_employee_id: {
// //           select: {
// //             id: true,
// //             full_name: true,
// //             employee_code: true,
// //             profile_pic: true,
// //           },
// //         },
// //       },
// //     });

// //     if (data.stage_id) {
// //       await prisma.hrms_d_candidate_master.update({
// //         where: { id: updatedRemark.candidate_id },
// //         data: {
// //           interview_stage: data.stage_id,
// //           updatedby: data.updatedby || 1,
// //           updatedate: new Date(),
// //         },
// //       });
// //     }

// //     return updatedRemark;
// //   } catch (error) {
// //     throw new CustomError(
// //       `Error updating interview stage remark: ${error.message}`,
// //       500
// //     );
// //   }
// // };

// // const deleteInterviewStageRemark = async (id) => {
// //   try {
// //     await prisma.hrms_m_interview_stage_remark.delete({
// //       where: { id: parseInt(id) },
// //     });
// //   } catch (error) {
// //     throw new CustomError(`Error deleting remark: ${error.message}`, 500);
// //   }
// // };

// // const getAllInterviewStageRemark = async (search, page, size, candidateId) => {
// //   try {
// //     page = page && page > 0 ? page : 1;
// //     size = size || 10;
// //     const skip = (page - 1) * size;

// //     const filters = { AND: [] };
// //     if (candidateId) filters.AND.push({ candidate_id: Number(candidateId) });

// //     if (search) {
// //       const s = search.toLowerCase();
// //       filters.AND.push({
// //         OR: [
// //           { stage_name: { contains: s } },
// //           { remark: { contains: s } },
// //           { interview_stage_candidate: { full_name: { contains: s } } },
// //           { interview_stage_stage_id: { stage_name: { contains: s } } },
// //         ],
// //       });
// //     }

// //     const data = await prisma.hrms_m_interview_stage_remark.findMany({
// //       where: filters,
// //       skip,
// //       take: size,
// //       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
// //       include: {
// //         interview_stage_candidate: {
// //           select: { id: true, full_name: true, candidate_code: true },
// //         },
// //         interview_stage_stage_id: {
// //           select: { id: true, stage_name: true },
// //         },
// //         interview_stage_employee_id: {
// //           select: {
// //             id: true,
// //             full_name: true,
// //             employee_code: true,
// //             profile_pic: true,
// //           },
// //         },
// //       },
// //     });

// //     const totalCount = await prisma.hrms_m_interview_stage_remark.count({
// //       where: filters,
// //     });

// //     return {
// //       data,
// //       currentPage: page,
// //       size,
// //       totalPages: Math.ceil(totalCount / size),
// //       totalCount,
// //     };
// //   } catch (error) {
// //     throw new CustomError(`Error fetching remarks: ${error.message}`, 503);
// //   }
// // };

// // // Approve / Reject
// // const updateInterviewStageRemarkStatus = async (remarkId, data) => {
// //   console.log(
// //     "[updateInterviewStageRemarkStatus] ID:",
// //     remarkId,
// //     "Input:",
// //     data
// //   );

// //   const id = Number(remarkId);
// //   const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
// //     where: { id },
// //     include: {
// //       interview_stage_stage_id: true,
// //       interview_stage_candidate: {
// //         select: { id: true, full_name: true, email: true },
// //       },
// //     },
// //   });
// //   if (!remark) throw new CustomError("Interview stage remark not found", 404);

// //   const sequence = seqFromSortOrder(remark.interview_stage_stage_id.sort_order);
// //   const approvers = await getWorkflowApprovers("interview_stage", sequence);
// //   const approverIds = new Set(
// //     approvers.map((a) => a.approval_work_approver.id)
// //   );

// //   if (!approverIds.has(Number(data.approver_id))) {
// //     console.warn(
// //       "Unauthorized approver. Allowed:",
// //       [...approverIds],
// //       "Got:",
// //       data.approver_id
// //     );
// //     throw new CustomError("You are not authorized to act on this stage", 403);
// //   }

// //   const updatedRemark = await prisma.hrms_m_interview_stage_remark.update({
// //     where: { id },
// //     data: {
// //       status: data.status,
// //       updatedby: data.updatedby || 1,
// //       updatedate: new Date(),
// //       is_completed: true,
// //       employee_id: Number(data.approver_id),
// //     },
// //   });
// //   console.log("Remark Updated:", updatedRemark);

// //   const candidate = await prisma.hrms_d_candidate_master.findUnique({
// //     where: { id: remark.candidate_id },
// //   });

// //   if (data.status === "Approved") {
// //     // next stage
// //     const nextStage = await prisma.hrms_m_interview_stage.findFirst({
// //       where: { sort_order: { gt: remark.interview_stage_stage_id.sort_order } },
// //       orderBy: { sort_order: "asc" },
// //     });

// //     if (nextStage) {
// //       await prisma.hrms_d_candidate_master.update({
// //         where: { id: candidate.id },
// //         data: { interview_stage: nextStage.id, updatedate: new Date() },
// //       });

// //       const nextSequence = seqFromSortOrder(nextStage.sort_order);
// //       const nextApprovers = await getWorkflowApprovers(
// //         "interview_stage",
// //         nextSequence
// //       );
// //       if (nextApprovers.length > 0) {
// //         for (const wf of nextApprovers) {
// //           const approver = wf.approval_work_approver;

// //           const emailContent = await generateEmailContent(
// //             "INTERVIEW_NEXT_STAGE_ASSIGNED",
// //             {
// //               approverName: approver.full_name,
// //               candidateName: candidate.full_name,
// //               stageName: nextStage.stage_name,
// //               previousStageName: remark.interview_stage_stage_id.stage_name,
// //             }
// //           );

// //           console.log(" EMAIL PREVIEW (next-stage):", {
// //             to: approver.email,
// //             subject:
// //               emailContent.subject ||
// //               `Next Interview Stage: ${candidate.full_name}`,
// //             html: emailContent.body,
// //           });

// //           await sendEmail({
// //             to: approver.email,
// //             subject:
// //               emailContent.subject ||
// //               `Next Interview Stage: ${candidate.full_name}`,
// //             html: emailContent.body,
// //             log_inst: data.log_inst,
// //           });
// //         }
// //       } else {
// //         console.warn(
// //           "No approvers configured for next sequence:",
// //           nextSequence
// //         );
// //       }
// //     } else {
// //       // final approval
// //       const emailContent = await generateEmailContent("INTERVIEW_COMPLETED", {
// //         candidateName: candidate.full_name,
// //       });

// //       console.log(" EMAIL PREVIEW (completed):", {
// //         to: candidate.email,
// //         subject: emailContent.subject || "Interview Process Completed",
// //         html: emailContent.body,
// //       });

// //       await sendEmail({
// //         to: candidate.email,
// //         subject: emailContent.subject || "Interview Process Completed",
// //         html: emailContent.body,
// //         log_inst: data.log_inst,
// //       });
// //     }
// //   } else if (data.status === "Rejected") {
// //     await prisma.hrms_d_candidate_master.update({
// //       where: { id: candidate.id },
// //       data: { interview_stage: null, updatedate: new Date() },
// //     });

// //     const emailContent = await generateEmailContent("INTERVIEW_REJECTED", {
// //       candidateName: candidate.full_name,
// //     });

// //     console.log("EMAIL PREVIEW (rejected):", {
// //       to: candidate.email,
// //       subject: emailContent.subject || "Interview Result",
// //       html: emailContent.body,
// //     });

// //     await sendEmail({
// //       to: candidate.email,
// //       subject: emailContent.subject || "Interview Result",
// //       html: emailContent.body,
// //       log_inst: data.log_inst,
// //     });
// //   }

// //   return updatedRemark;
// // };

// // module.exports = {
// //   createInterviewStageRemark,
// //   findInterviewStageRemarkById,
// //   updateInterviewStageRemark,
// //   deleteInterviewStageRemark,
// //   getAllInterviewStageRemark,
// //   updateInterviewStageRemarkStatus,
// // };

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const { createRequest } = require("./requestsModel.js");

// Serialize
const serializeRemarkData = (data) => ({
  candidate_id: data.candidate_id ? Number(data.candidate_id) : null,
  stage_id: Number(data.stage_id), // This is hiring_stage id
  stage_name: data.stage_name || null,
  interview_date: data.interview_date ? new Date(data.interview_date) : null,
  status: data.status || "Pending",
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  remark: data.remark || null,
  rating: data.rating ? Number(data.rating) : null,
  is_completed: data.is_completed ?? false,
});

// ✅ NEW: Check if previous stages are approved
const checkIfPreviousStagesApproved = async (currentStageId, candidateId) => {
  try {
    console.log(
      `🔍 Checking if previous hiring stages are approved for candidate ${candidateId}`
    );

    if (!candidateId) {
      return {
        allowed: false,
        message: "Candidate ID is required",
      };
    }

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
      return {
        allowed: false,
        message: "Candidate or job posting not found",
      };
    }

    // Get all hiring stage IDs for this job posting
    const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
    if (!stageIdsString) {
      return {
        allowed: true,
        message: "No hiring stages defined",
      };
    }

    const stageIds = stageIdsString
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (stageIds.length === 0) {
      return {
        allowed: true,
        message: "No valid hiring stage IDs",
      };
    }

    // Find the index of current stage
    const currentStageIndex = stageIds.indexOf(currentStageId);

    if (currentStageIndex === -1) {
      return {
        allowed: false,
        message:
          "Current stage is not part of this job posting's hiring stages",
      };
    }

    // If this is the first stage, allow it
    if (currentStageIndex === 0) {
      console.log("✅ This is the first stage - allowed");
      return {
        allowed: true,
        message: "First stage - allowed",
      };
    }

    const previousStageIds = stageIds.slice(0, currentStageIndex);
    console.log(`Previous stage IDs: ${previousStageIds.join(", ")}`);

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
              name: true,
            },
          },
        },
      }
    );

    console.log(`Previous stage remarks found: ${previousRemarks.length}`);
    previousRemarks.forEach((remark) => {
      console.log(
        `  - Stage ${remark.stage_id} (${remark.interview_stage_remark_hiring_stage.name}): ${remark.status}`
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
        message: `Cannot proceed. Previous stage "${rejectedRemark.interview_stage_remark_hiring_stage.name}" was rejected. Hiring process has been stopped.`,
      };
    }

    if (previousRemarks.length < previousStageIds.length) {
      return {
        allowed: false,
        message: `Cannot proceed. Previous stage(s) must be completed and approved first. Please wait for previous stages to be submitted and approved.`,
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
        .map((r) => r.interview_stage_remark_hiring_stage.name)
        .join(", ");

      return {
        allowed: false,
        message: `Cannot proceed. Previous stage(s) must be approved first: ${pendingStageNames}. Please wait for approval before submitting this stage.`,
      };
    }

    console.log("All previous stages are approved - allowed to proceed");
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

const createInterviewStageRemark = async (data) => {
  try {
    console.log(
      " Creating interview stage remark for hiring stage:",
      data.stage_id
    );

    const canProceed = await checkIfPreviousStagesApproved(
      Number(data.stage_id),
      Number(data.candidate_id)
    );

    if (!canProceed.allowed) {
      throw new CustomError(canProceed.message, 400);
    }

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
        interview_stage_remark_hiring_stage: {
          select: {
            id: true,
            name: true,
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

    console.log("Interview stage remark created, creating request...");

    await createRequest({
      requester_id: data.employee_id || data.createdby || 1,
      request_type: "interview_stage",
      reference_id: result.id,
      stage_name: result.interview_stage_remark_hiring_stage.name,
      request_data: JSON.stringify({
        candidate_id: data.candidate_id,
        hiring_stage_id: data.stage_id,
      }),
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });

    console.log("Request created for approval");

    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating interview stage remark: ${error.message}`,
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
            name: true,
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
            name: true,
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
            name: true,
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

const checkAndUpdateCandidateStatus = async (candidateId, hiringStageId) => {
  try {
    console.log(
      `Checking candidate ${candidateId} status for hiring stage ${hiringStageId}`
    );

    if (!candidateId) {
      console.log("No candidate ID provided");
      return;
    }

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
      console.log("Candidate or job posting not found");
      return;
    }

    const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
    if (!stageIdsString) {
      console.log("No hiring stages found");
      return;
    }

    const stageIds = stageIdsString
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (stageIds.length === 0) {
      console.log("No valid hiring stage IDs");
      return;
    }

    console.log(`Hiring stage IDs for candidate: ${stageIds.join(", ")}`);

    const allRemarks = await prisma.hrms_m_interview_stage_remark.findMany({
      where: {
        stage_id: { in: stageIds },
        candidate_id: parseInt(candidateId),
      },
      include: {
        interview_stage_remark_hiring_stage: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(`📊 Found ${allRemarks.length} remarks`);
    allRemarks.forEach((remark) => {
      console.log(
        `  - Stage ${remark.stage_id} (${remark.interview_stage_remark_hiring_stage.name}): ${remark.status}`
      );
    });

    const anyRejected = allRemarks.some(
      (remark) => remark.status === "Rejected" || remark.status === "R"
    );

    if (anyRejected) {
      console.log(
        "❌ At least one stage is rejected. Marking candidate as Rejected."
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

    const allApproved =
      allRemarks.length === stageIds.length &&
      allRemarks.every(
        (remark) => remark.status === "Approved" || remark.status === "A"
      );

    if (allApproved) {
      console.log("✅ All stages approved! Updating candidate status.");
      await prisma.hrms_d_candidate_master.update({
        where: { id: parseInt(candidateId) },
        data: {
          status: "All Stages Approved",
          status_remarks: "All hiring stages have been successfully approved",
          updatedate: new Date(),
        },
      });
      console.log(
        `✅ Candidate ${candidateId} status updated to "All Stages Approved"`
      );
    } else {
      console.log(
        "⏳ Some stages still pending. Marking candidate as In Progress."
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

const stopHiringProcess = async (
  candidateId,
  hiringStageId,
  rejectedStageName
) => {
  try {
    console.log(`Stopping hiring process for candidate ${candidateId}`);

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

    const stageIdsString = candidate.candidate_job_posting.hiring_stage_id;
    if (!stageIdsString) {
      return;
    }

    const stageIds = stageIdsString
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    const currentStageIndex = stageIds.indexOf(parseInt(hiringStageId));
    if (currentStageIndex === -1) {
      return;
    }

    const futureStageIds = stageIds.slice(currentStageIndex + 1);

    if (futureStageIds.length > 0) {
      // Mark future stage remarks as "Cancelled" if they exist
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
    }

    await prisma.hrms_d_candidate_master.update({
      where: { id: parseInt(candidateId) },
      data: {
        status: "Rejected",
        status_remarks: `Hiring process stopped. Stage "${rejectedStageName}" was rejected.`,
        updatedate: new Date(),
      },
    });

    console.log(`✅ Hiring process stopped for candidate ${candidateId}`);
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
              name: true,
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
      await checkAndUpdateCandidateStatus(
        existingRemark.candidate_id,
        existingRemark.stage_id
      );
    } else if (data.status === "Rejected" || data.status === "R") {
      await stopHiringProcess(
        existingRemark.candidate_id,
        existingRemark.stage_id,
        existingRemark.interview_stage_remark_hiring_stage.name
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
