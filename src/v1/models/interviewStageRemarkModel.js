const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const { createRequest } = require("./requestsModel.js");
// Serialize
const serializeRemarkData = (data) => ({
  candidate_id: data.candidate_id ? Number(data.candidate_id) : null,
  stage_id: Number(data.stage_id),
  stage_name: data.stage_name || null,
  // description: data.description,
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
    if (data.stage_id) {
      await prisma.hrms_d_candidate_master.update({
        where: { id: result.candidate_id },
        data: {
          interview_stage: data.stage_id,
          updatedby: data.updatedby || 1,
          updatedate: new Date(),
        },
      });
    }

    await createRequest({
      requester_id: data.employee_id,
      request_type: "interview_stage",
      reference_id: result.id,
      stage_name: data.stage_name,
      // request_data:
      //   reqData.reason ||
      //   `Leave from ${reqData.start_date} to ${reqData.end_date}`,
      createdby: data.createdby || 1,
      log_inst: data.log_inst || 1,
    });

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
// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const { generateEmailContent } = require("../../utils/emailTemplates");
// const sendEmail = require("../../utils/mailer");
// const prisma = new PrismaClient();

// const serializeRemarkData = (data) => ({
//   candidate_id: Number(data.candidate_id),
//   stage_id: Number(data.stage_id),
//   stage_name: data.stage_name || null,
//   interview_date: data.interview_date ? new Date(data.interview_date) : null,
//   status: data.status || "Pending",
//   employee_id: data.employee_id ? Number(data.employee_id) : null,
//   remark: data.remark || null,
//   rating: data.rating ? Number(data.rating) : null,
//   is_completed: data.is_completed ?? false,
// });

// const seqFromSortOrder = (sortOrder) => Number(sortOrder) + 1;

// async function getWorkflowApprovers(request_type, sequence) {
//   const rows = await prisma.hrms_d_approval_work_flow.findMany({
//     where: {
//       request_type,
//       sequence,
//       is_active: "Y",
//     },
//     include: { approval_work_approver: true },
//     orderBy: { id: "asc" },
//   });
//   return rows.filter((r) => r.approval_work_approver);
// }

// const createInterviewStageRemark = async (data) => {
//   console.log(" [createInterviewStageRemark] Input Data:", data);

//   // 1) Create remark
//   const result = await prisma.hrms_m_interview_stage_remark.create({
//     data: {
//       ...serializeRemarkData(data),
//       createdby: data.createdby || 1,
//       createdate: new Date(),
//       log_inst: data.log_inst || 1,
//     },
//     include: {
//       interview_stage_candidate: {
//         select: { id: true, full_name: true, email: true },
//       },
//       interview_stage_stage_id: {
//         select: { id: true, stage_name: true, sort_order: true },
//       },
//     },
//   });
//   console.log(" Remark Created:", result);

//   // 2) Update candidate current stage pointer
//   await prisma.hrms_d_candidate_master.update({
//     where: { id: result.candidate_id },
//     data: {
//       interview_stage: result.stage_id,
//       updatedby: data.updatedby || 1,
//       updatedate: new Date(),
//     },
//   });
//   console.log("Candidate Updated to stage:", result.stage_id);

//   // 3) Notify ALL approvers for this stage (sequence = sort_order + 1)
//   const sequence = seqFromSortOrder(result.interview_stage_stage_id.sort_order);
//   console.log("🔍 Fetching approvers for sequence:", sequence);

//   const approvers = await getWorkflowApprovers("interview_stage", sequence);
//   console.log(
//     "👉 Approvers Found:",
//     approvers.map((a) => ({
//       id: a.approval_work_approver.id,
//       name: a.approval_work_approver.full_name,
//       email: a.approval_work_approver.email,
//     }))
//   );

//   if (approvers.length > 0) {
//     await prisma.hrms_m_interview_stage_remark.update({
//       where: { id: result.id },
//       data: { employee_id: approvers[0].approval_work_approver.id },
//     });

//     for (const wf of approvers) {
//       const approver = wf.approval_work_approver;

//       const emailContent = await generateEmailContent(
//         "INTERVIEW_ASSIGNED", // <-- make sure this template exists (see section 3 below)
//         {
//           approverName: approver.full_name,
//           candidateName: result.interview_stage_candidate.full_name,
//           stageName: result.interview_stage_stage_id.stage_name,
//         }
//       );

//       console.log("📧 EMAIL PREVIEW (assigned):", {
//         to: approver.email,
//         subject:
//           emailContent.subject ||
//           `Interview Assigned: ${result.interview_stage_candidate.full_name}`,
//         html: emailContent.body,
//       });

//       await sendEmail({
//         to: approver.email,
//         subject:
//           emailContent.subject ||
//           `Interview Assigned: ${result.interview_stage_candidate.full_name}`,
//         html: emailContent.body,
//         log_inst: data.log_inst,
//       });
//     }
//   } else {
//     console.warn(" No approvers configured for sequence:", sequence);
//   }

//   return result;
// };

// const findInterviewStageRemarkById = async (id) => {
//   try {
//     const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         interview_stage_candidate: {
//           select: {
//             id: true,
//             full_name: true,
//             candidate_code: true,
//             email: true,
//           },
//         },
//         interview_stage_stage_id: {
//           select: { id: true, stage_name: true, sort_order: true },
//         },
//       },
//     });
//     if (!remark) throw new CustomError("Interview stage remark not found", 404);
//     return remark;
//   } catch (error) {
//     throw new CustomError(`Error fetching remark: ${error.message}`, 500);
//   }
// };

// // Update
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
//           select: { id: true, stage_name: true, sort_order: true },
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

// const deleteInterviewStageRemark = async (id) => {
//   try {
//     await prisma.hrms_m_interview_stage_remark.delete({
//       where: { id: parseInt(id) },
//     });
//   } catch (error) {
//     throw new CustomError(`Error deleting remark: ${error.message}`, 500);
//   }
// };

// const getAllInterviewStageRemark = async (search, page, size, candidateId) => {
//   try {
//     page = page && page > 0 ? page : 1;
//     size = size || 10;
//     const skip = (page - 1) * size;

//     const filters = { AND: [] };
//     if (candidateId) filters.AND.push({ candidate_id: Number(candidateId) });

//     if (search) {
//       const s = search.toLowerCase();
//       filters.AND.push({
//         OR: [
//           { stage_name: { contains: s } },
//           { remark: { contains: s } },
//           { interview_stage_candidate: { full_name: { contains: s } } },
//           { interview_stage_stage_id: { stage_name: { contains: s } } },
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

// // Approve / Reject
// const updateInterviewStageRemarkStatus = async (remarkId, data) => {
//   console.log(
//     "[updateInterviewStageRemarkStatus] ID:",
//     remarkId,
//     "Input:",
//     data
//   );

//   const id = Number(remarkId);
//   const remark = await prisma.hrms_m_interview_stage_remark.findUnique({
//     where: { id },
//     include: {
//       interview_stage_stage_id: true,
//       interview_stage_candidate: {
//         select: { id: true, full_name: true, email: true },
//       },
//     },
//   });
//   if (!remark) throw new CustomError("Interview stage remark not found", 404);

//   const sequence = seqFromSortOrder(remark.interview_stage_stage_id.sort_order);
//   const approvers = await getWorkflowApprovers("interview_stage", sequence);
//   const approverIds = new Set(
//     approvers.map((a) => a.approval_work_approver.id)
//   );

//   if (!approverIds.has(Number(data.approver_id))) {
//     console.warn(
//       "Unauthorized approver. Allowed:",
//       [...approverIds],
//       "Got:",
//       data.approver_id
//     );
//     throw new CustomError("You are not authorized to act on this stage", 403);
//   }

//   const updatedRemark = await prisma.hrms_m_interview_stage_remark.update({
//     where: { id },
//     data: {
//       status: data.status,
//       updatedby: data.updatedby || 1,
//       updatedate: new Date(),
//       is_completed: true,
//       employee_id: Number(data.approver_id),
//     },
//   });
//   console.log("Remark Updated:", updatedRemark);

//   const candidate = await prisma.hrms_d_candidate_master.findUnique({
//     where: { id: remark.candidate_id },
//   });

//   if (data.status === "Approved") {
//     // next stage
//     const nextStage = await prisma.hrms_m_interview_stage.findFirst({
//       where: { sort_order: { gt: remark.interview_stage_stage_id.sort_order } },
//       orderBy: { sort_order: "asc" },
//     });

//     if (nextStage) {
//       await prisma.hrms_d_candidate_master.update({
//         where: { id: candidate.id },
//         data: { interview_stage: nextStage.id, updatedate: new Date() },
//       });

//       const nextSequence = seqFromSortOrder(nextStage.sort_order);
//       const nextApprovers = await getWorkflowApprovers(
//         "interview_stage",
//         nextSequence
//       );
//       if (nextApprovers.length > 0) {
//         for (const wf of nextApprovers) {
//           const approver = wf.approval_work_approver;

//           const emailContent = await generateEmailContent(
//             "INTERVIEW_NEXT_STAGE_ASSIGNED",
//             {
//               approverName: approver.full_name,
//               candidateName: candidate.full_name,
//               stageName: nextStage.stage_name,
//               previousStageName: remark.interview_stage_stage_id.stage_name,
//             }
//           );

//           console.log(" EMAIL PREVIEW (next-stage):", {
//             to: approver.email,
//             subject:
//               emailContent.subject ||
//               `Next Interview Stage: ${candidate.full_name}`,
//             html: emailContent.body,
//           });

//           await sendEmail({
//             to: approver.email,
//             subject:
//               emailContent.subject ||
//               `Next Interview Stage: ${candidate.full_name}`,
//             html: emailContent.body,
//             log_inst: data.log_inst,
//           });
//         }
//       } else {
//         console.warn(
//           "No approvers configured for next sequence:",
//           nextSequence
//         );
//       }
//     } else {
//       // final approval
//       const emailContent = await generateEmailContent("INTERVIEW_COMPLETED", {
//         candidateName: candidate.full_name,
//       });

//       console.log(" EMAIL PREVIEW (completed):", {
//         to: candidate.email,
//         subject: emailContent.subject || "Interview Process Completed",
//         html: emailContent.body,
//       });

//       await sendEmail({
//         to: candidate.email,
//         subject: emailContent.subject || "Interview Process Completed",
//         html: emailContent.body,
//         log_inst: data.log_inst,
//       });
//     }
//   } else if (data.status === "Rejected") {
//     await prisma.hrms_d_candidate_master.update({
//       where: { id: candidate.id },
//       data: { interview_stage: null, updatedate: new Date() },
//     });

//     const emailContent = await generateEmailContent("INTERVIEW_REJECTED", {
//       candidateName: candidate.full_name,
//     });

//     console.log("EMAIL PREVIEW (rejected):", {
//       to: candidate.email,
//       subject: emailContent.subject || "Interview Result",
//       html: emailContent.body,
//     });

//     await sendEmail({
//       to: candidate.email,
//       subject: emailContent.subject || "Interview Result",
//       html: emailContent.body,
//       log_inst: data.log_inst,
//     });
//   }

//   return updatedRemark;
// };

// module.exports = {
//   createInterviewStageRemark,
//   findInterviewStageRemarkById,
//   updateInterviewStageRemark,
//   deleteInterviewStageRemark,
//   getAllInterviewStageRemark,
//   updateInterviewStageRemarkStatus,
// };
