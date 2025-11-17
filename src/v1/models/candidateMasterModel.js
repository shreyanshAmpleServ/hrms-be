// const { prisma } = require("../../utils/prismaProxy");
// const CustomError = require("../../utils/CustomError");
//
// const employeeModel = require("./EmployeeModel");

// const serializeCandidateMasterData = (data) => ({
//   candidate_code: data.candidate_code ?? undefined,
//   full_name: data.full_name || "",
//   email: data.email || "",
//   phone: data.phone || "",
//   date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
//   gender: data.gender || "",
//   date_of_application: data.date_of_application
//     ? new Date(data.date_of_application)
//     : null,
//   nationality: data.nationality || "",
//   profile_pic: data.profile_pic || "",
//   resume_path: data.resume_path || "",
//   applied_position_id: data.applied_position_id
//     ? Number(data.applied_position_id)
//     : null,
//   status: data.status || "Pending",
//   application_source: Number(data.application_source),
//   interview1_remarks: data.interview1_remarks || "",
//   interview2_remarks: data.interview2_remarks || "",
//   interview3_remarks: data.interview3_remarks || "",
//   interview_stage: Number(data.interview_stage) || null,
//   expected_joining_date: data.expected_joining_date
//     ? new Date(data.expected_joining_date)
//     : null,
//   job_posting: data.job_posting ? Number(data.job_posting) : null,
//   actual_joining_date: data.actual_joining_date
//     ? new Date(data.actual_joining_date)
//     : null,
//   offer_accepted_date: data.offer_accepted_date
//     ? new Date(data.offer_accepted_date)
//     : null,
//   no_show_flag: data.no_show_flag || "N",
//   no_show_remarks: data.no_show_remarks || "",
//   no_show_marked_date: data.no_show_marked_date
//     ? new Date(data.no_show_marked_date)
//     : null,
//   department_id: Number(data.department_id),

// });

// const getHiringStagesForJobPosting = async (jobPostingId) => {
//   if (!jobPostingId) {
//     console.log(" No job posting ID provided");
//     return [];
//   }

//   try {
//     console.log(" Fetching job posting:", jobPostingId);

//     const jobPosting = await prisma.hrms_d_job_posting.findUnique({
//       where: { id: parseInt(jobPostingId) },
//       select: {
//         id: true,
//         job_title: true,
//         hiring_stage_id: true,
//       },
//     });

//     console.log(" Job Posting:", JSON.stringify(jobPosting, null, 2));

//     if (!jobPosting || !jobPosting.hiring_stage_id) {
//       console.log(" No hiring_stage_id found in job posting");
//       return [];
//     }

//     const stageIds = jobPosting.hiring_stage_id
//       .split(",")
//       .map((id) => parseInt(id.trim()))
//       .filter((id) => !isNaN(id));

//     console.log(" Parsed Stage IDs:", stageIds);

//     if (stageIds.length === 0) {
//       console.log(" No valid stage IDs found");
//       return [];
//     }

//     console.log(" Querying database for stages:", stageIds);

//     const stages = await prisma.hrms_d_hiring_stage.findMany({
//       where: { id: { in: stageIds } },
//     });

//     console.log(" Stages found in database:", stages.length);
//     console.log(
//       " Found stage IDs:",
//       stages.map((s) => s.id)
//     );

//     if (stages.length === 0) {
//       console.log(" No stages found for IDs:", stageIds);
//       return [];
//     }

//     const stageWithValues = await Promise.all(
//       stages.map(async (stage) => {
//         let stageValue = null;

//         if (stage.stage_id) {
//           try {
//             stageValue = await prisma.hrms_d_hiring_stage_value.findUnique({
//               where: { id: stage.stage_id },
//               select: {
//                 id: true,
//                 value: true,
//               },
//             });
//           } catch (error) {
//             console.warn(
//               `Could not fetch value for stage_id ${stage.stage_id}:`,
//               error.message
//             );
//           }
//         }

//         return {
//           id: stage.id,
//           stage_name: stageValue.value,
//           sort_order: stage.sequence,
//           code: stage.code,
//           description: stage.description,
//           status: stage.status,
//           competency_level: stage.competency_level,
//           // hiring_stage_hiring_value: stageValue,
//         };
//       })
//     );

//     console.log(" Stages with values:", stageWithValues.length);

//     const stageMap = new Map(stageWithValues.map((s) => [s.id, s]));

//     const orderedStages = stageIds
//       .map((id, index) => {
//         const stage = stageMap.get(id);
//         if (stage) {
//           return {
//             ...stage,
//             sequence_number: index + 1,
//           };
//         } else {
//           console.warn(` Stage ID ${id} not found in results`);
//           return null;
//         }
//       })
//       .filter(Boolean);

//     console.log(" Returning", orderedStages.length, "ordered stages");

//     return orderedStages;
//   } catch (error) {
//     console.error(" Error fetching hiring stages:", error);
//     console.error("Error details:", error.message);
//     console.error("Stack trace:", error.stack);
//     return [];
//   }
// };
// const createCandidateMaster = async (data) => {
//   try {
//     const fullName = data.full_name?.trim();

//     if (!fullName) {
//       throw new CustomError("Full name is required", 400);
//     }

//     const nameParts = fullName.split(" ");
//     const firstName = nameParts[0];
//     const lastName = nameParts.length > 1 ? nameParts[1] : "";

//     const initials = `${firstName[0]}${lastName[0] || ""}`.toUpperCase();

//     const allCodes = await prisma.hrms_d_candidate_master.findMany({
//       select: { candidate_code: true },
//     });

//     let maxNumber = 0;

//     for (const entry of allCodes) {
//       const code = entry.candidate_code;
//       const numberPart = code.replace(/^[A-Za-z]+/, "");
//       const parsed = parseInt(numberPart);
//       if (!isNaN(parsed) && parsed > maxNumber) {
//         maxNumber = parsed;
//       }
//     }

//     const nextNumber = maxNumber + 1;
//     const newCandidateCode = `${initials}${String(nextNumber).padStart(
//       3,
//       "0"
//     )}`;

//     const reqData = await prisma.hrms_d_candidate_master.create({
//       data: {
//         ...serializeCandidateMasterData(data),
//         candidate_code: newCandidateCode,
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         candidate_job_posting: {
//           select: {
//             id: true,
//             job_title: true,
//             hiring_stage_id: true,
//           },
//         },
//         candidate_application_source: {
//           select: {
//             id: true,
//             source_name: true,
//           },
//         },
//         candidate_interview_stage: {
//           select: {
//             id: true,
//             stage_name: true,
//           },
//         },
//         candidate_master_applied_position: {
//           select: {
//             id: true,
//             designation_name: true,
//           },
//         },
//         candidate_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//     });

//     const hiringStages = await getHiringStagesForJobPosting(
//       reqData.job_posting
//     );

//     return {
//       ...reqData,
//       hiring_stages: hiringStages,
//     };
//   } catch (error) {
//     throw new CustomError(
//       `Error creating candidate master: ${error.message}`,
//       500
//     );
//   }
// };

// const findCandidateMasterById = async (id) => {
//   try {
//     const reqData = await prisma.hrms_d_candidate_master.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         candidate_job_posting: {
//           select: {
//             id: true,
//             job_title: true,
//             hiring_stage_id: true,
//           },
//         },
//         candidate_application_source: {
//           select: {
//             id: true,
//             source_name: true,
//           },
//         },
//         candidate_interview_stage: {
//           select: {
//             id: true,
//             stage_name: true,
//           },
//         },
//         candidate_master_applied_position: {
//           select: {
//             id: true,
//             designation_name: true,
//           },
//         },
//         candidate_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//     });

//     if (!reqData) {
//       throw new CustomError("Candidate not found", 404);
//     }

//     const hiringStages = await getHiringStagesForJobPosting(
//       reqData.job_posting
//     );

//     return {
//       ...reqData,
//       hiring_stages: hiringStages,
//     };
//   } catch (error) {
//     throw new CustomError(
//       `Error finding candidate by ID: ${error.message}`,
//       503
//     );
//   }
// };

// const updateCandidateMaster = async (id, data) => {
//   try {
//     const updatedEntry = await prisma.hrms_d_candidate_master.update({
//       where: { id: parseInt(id) },
//       include: {
//         candidate_job_posting: {
//           select: {
//             id: true,
//             job_title: true,
//             hiring_stage_id: true,
//           },
//         },
//         candidate_application_source: {
//           select: {
//             id: true,
//             source_name: true,
//           },
//         },
//         candidate_interview_stage: {
//           select: {
//             id: true,
//             stage_name: true,
//           },
//         },
//         candidate_master_applied_position: {
//           select: {
//             id: true,
//             designation_name: true,
//           },
//         },
//         candidate_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//       data: {
//         ...serializeCandidateMasterData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//     });

//     const hiringStages = await getHiringStagesForJobPosting(
//       updatedEntry.job_posting
//     );

//     return {
//       ...updatedEntry,
//       hiring_stages: hiringStages,
//     };
//   } catch (error) {
//     console.error("Error updating candidate master:", error);
//     throw new CustomError(
//       `Error updating candidate master: ${error.message}`,
//       500
//     );
//   }
// };

// const deleteCandidateMaster = async (id) => {
//   try {
//     await prisma.hrms_d_candidate_master.delete({
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

// const getAllCandidateMaster = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   status
// ) => {
//   try {
//     page = !page || page <= 0 ? 1 : parseInt(page);
//     size = !size || size <= 0 ? 10 : parseInt(size);
//     const skip = (page - 1) * size;

//     const filters = {};

//     if (search && search.trim()) {
//       const searchTerm = search.trim().toLowerCase();
//       filters.OR = [
//         { full_name: { contains: searchTerm } },
//         { email: { contains: searchTerm } },
//         { phone: { contains: searchTerm } },
//         { status: { contains: searchTerm } },
//         { candidate_code: { contains: searchTerm } },
//       ];
//     }
//     if (status && status.trim()) {
//       filters.status = {
//         in: status || [],
//       };
//     }
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       end.setHours(23, 59, 59, 999);

//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = {
//           gte: start,
//           lte: end,
//         };
//       }
//     }

//     const [datas, totalCount] = await Promise.all([
//       prisma.hrms_d_candidate_master.findMany({
//         where: filters,
//         skip,
//         take: size,
//         orderBy: [{ createdate: "desc" }],
//         include: {
//           candidate_job_posting: {
//             select: {
//               id: true,
//               job_title: true,
//               hiring_stage_id: true,
//             },
//           },
//           candidate_application_source: {
//             select: {
//               id: true,
//               source_name: true,
//             },
//           },
//           candidate_interview_stage: {
//             select: {
//               id: true,
//               stage_name: true,
//             },
//           },
//           candidate_master_applied_position: {
//             select: {
//               id: true,
//               designation_name: true,
//             },
//           },
//           candidate_department: {
//             select: {
//               id: true,
//               department_name: true,
//             },
//           },
//           interview_stage_candidate: {
//             select: {
//               id: true,
//               status: true,
//             },
//           },
//         },
//       }),
//       prisma.hrms_d_candidate_master.count({
//         where: filters,
//       }),
//     ]);

//     const stageCount = await prisma.hrms_m_interview_stage.count();
//     const candidatesToUpdate = [];

//     for (const candidate of datas) {
//       if (candidate.status !== "A") continue;
//       const remarkCount = await prisma.hrms_m_interview_stage_remark?.count({
//         where: { candidate_id: candidate.id },
//       });

//       if (remarkCount === stageCount) {
//         const allRemarksAreA = candidate.interview_stage_candidate.every(
//           (remark) => remark.status === "A"
//         );

//         if (allRemarksAreA) {
//           candidatesToUpdate.push(candidate.id);
//         }
//       }
//     }

//     if (candidatesToUpdate.length > 0) {
//       await prisma.hrms_d_candidate_master.updateMany({
//         where: {
//           id: {
//             in: candidatesToUpdate.map((id) => parseInt(id)),
//           },
//         },
//         data: {
//           status: "A",
//           updatedate: new Date(),
//         },
//       });

//       datas.forEach((candidate) => {
//         if (candidatesToUpdate.includes(candidate.id)) {
//           candidate.status = "A";
//         }
//       });
//     }

//     // Add hiring stages to each candidate
//     const enrichedData = await Promise.all(
//       datas.map(async (candidate) => {
//         const hiringStages = await getHiringStagesForJobPosting(
//           candidate.job_posting
//         );
//         return {
//           ...candidate,
//           hiring_stages: hiringStages,
//         };
//       })
//     );

//     return {
//       data: enrichedData,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//       message:
//         candidatesToUpdate.length > 0
//           ? `Updated ${candidatesToUpdate.length} candidate(s) status to 'A'`
//           : null,
//     };
//   } catch (error) {
//     console.log("Candidate error", error);

//     if (error.code === "P2002") {
//       throw new CustomError("Duplicate entry found", 409);
//     } else if (error.code === "P2025") {
//       throw new CustomError("Record not found", 404);
//     } else {
//       throw new CustomError("Error retrieving candidates", 503);
//     }
//   }
// };

// const updateCandidateMasterStatus = async (id, data) => {
//   try {
//     const candidateMasterId = parseInt(id);

//     if (isNaN(candidateMasterId)) {
//       throw new CustomError("Invalid candidate master ID", 400);
//     }

//     const existingCandidateMaster =
//       await prisma.hrms_d_candidate_master.findUnique({
//         where: { id: candidateMasterId },
//       });

//     if (!existingCandidateMaster) {
//       throw new CustomError(
//         `Candidate Master with ID ${candidateMasterId} not found`,
//         404
//       );
//     }

//     const updateData = {
//       status: data.status,
//       updatedby: data.updatedby || 1,
//       updatedate: new Date(),
//     };

//     if (data.status === "A") {
//       updateData.status_remarks = data.status_remarks || "";
//     } else if (data.status === "R") {
//       updateData.status_remarks = data.status_remarks || "";
//     } else {
//       updateData.status_remarks = "";
//     }

//     const updatedEntry = await prisma.hrms_d_candidate_master.update({
//       where: { id: candidateMasterId },
//       data: updateData,
//       include: {
//         candidate_job_posting: {
//           select: {
//             id: true,
//             job_title: true,
//             hiring_stage_id: true,
//           },
//         },
//       },
//     });

//     // Add hiring stages
//     const hiringStages = await getHiringStagesForJobPosting(
//       updatedEntry.job_posting
//     );

//     return {
//       ...updatedEntry,
//       hiring_stages: hiringStages,
//     };
//   } catch (error) {
//     throw new CustomError(
//       `Error updating candidate master status: ${error.message}`,
//       500
//     );
//   }
// };

// const createEmployeeFromCandidate = async (
//   candidateId,
//   additionalData,
//   createdBy,
//   logInst
// ) => {
//   try {
//     const candidate = await prisma.hrms_d_candidate_master.findUnique({
//       where: { id: parseInt(candidateId) },
//       include: {
//         candidate_master_applied_position: true,
//         candidate_application_source: true,
//         candidate_interview_stage: true,
//       },
//     });

//     if (!candidate) {
//       throw new CustomError("Candidate not found", 404);
//     }

//     if (candidate.status !== "A") {
//       throw new CustomError(
//         "Candidate must be hired or selected to create employee",
//         400
//       );
//     }

//     const existingEmployee = await prisma.hrms_d_employee.findFirst({
//       where: {
//         OR: [{ email: candidate.email }, { phone_number: candidate.phone }],
//       },
//     });

//     if (existingEmployee) {
//       throw new CustomError("Employee already exists for this candidate", 400);
//     }

//     const employee_code = await generateEmployeeCode(candidate.full_name);

//     const employeeData = {
//       employee_code: employee_code,
//       first_name: candidate.full_name.split(" ")[0] || "",
//       last_name: candidate.full_name.split(" ").slice(1).join(" ") || "",
//       full_name: candidate.full_name,
//       email: candidate.email,
//       phone_number: candidate.phone,
//       date_of_birth: candidate.date_of_birth,
//       gender: candidate.gender,
//       nationality: candidate.nationality,
//       profile_pic: candidate.profile_pic,
//       department_id: candidate.department_id,
//       designation_id: candidate.applied_position_id,
//       join_date: candidate.actual_joining_date || new Date(),
//       employment_type: additionalData.employment_type || "Full-time",
//       employee_category: additionalData.employee_category || "Regular",
//       status: "Active",
//       ...additionalData,
//       createdby: createdBy,
//       log_inst: logInst,
//     };

//     if (!employeeData.department_id) {
//       throw new CustomError(
//         "Department ID is required to create employee",
//         400
//       );
//     }

//     const newEmployee = await employeeModel.createEmployee(employeeData);

//     await prisma.hrms_d_candidate_master.update({
//       where: { id: parseInt(candidateId) },
//       data: {
//         status: "A",
//         status_remarks: `Converted to employee with ID: ${newEmployee.id}`,
//         updatedate: new Date(),
//         updatedby: createdBy,
//       },
//     });

//     return {
//       employee: newEmployee,
//       candidate: candidate,
//       message: "Employee created successfully from candidate",
//     };
//   } catch (error) {
//     console.error("Error creating employee from candidate:", error);
//     if (error instanceof CustomError) {
//       throw error;
//     }
//     throw new CustomError(
//       `Error creating employee from candidate: ${error.message}`,
//       500
//     );
//   }
// };

// const generateEmployeeCode = async (fullName) => {
//   const nameParts = fullName.split(" ");
//   const firstName = nameParts[0] || "";
//   const lastName = nameParts[1] || "";

//   const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

//   const allCodes = await prisma.hrms_d_employee.findMany({
//     select: { employee_code: true },
//   });

//   let maxNumber = 0;
//   for (const entry of allCodes) {
//     const code = entry.employee_code;
//     const numberPart = code.replace(/^[A-Za-z]+/, "");
//     const parsed = parseInt(numberPart);
//     if (!isNaN(parsed) && parsed > maxNumber) {
//       maxNumber = parsed;
//     }
//   }

//   const nextNumber = maxNumber + 1;
//   return `EMP${initials}${String(nextNumber).padStart(3, "0")}`;
// };

// module.exports = {
//   createCandidateMaster,
//   findCandidateMasterById,
//   updateCandidateMaster,
//   deleteCandidateMaster,
//   getAllCandidateMaster,
//   updateCandidateMasterStatus,
//   createEmployeeFromCandidate,
// };

const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

const employeeModel = require("./EmployeeModel");

const serializeCandidateMasterData = (data) => ({
  candidate_code: data.candidate_code ?? undefined,
  full_name: data.full_name || "",
  email: data.email || "",
  phone: data.phone || "",
  date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
  gender: data.gender || "",
  date_of_application: data.date_of_application
    ? new Date(data.date_of_application)
    : null,
  nationality: data.nationality || "",
  profile_pic: data.profile_pic || "",
  resume_path: data.resume_path || "",
  applied_position_id: data.applied_position_id
    ? Number(data.applied_position_id)
    : null,
  status: data.status || "Pending",
  application_source: Number(data.application_source),
  interview1_remarks: data.interview1_remarks || "",
  interview2_remarks: data.interview2_remarks || "",
  interview3_remarks: data.interview3_remarks || "",
  interview_stage: Number(data.interview_stage) || null,
  expected_joining_date: data.expected_joining_date
    ? new Date(data.expected_joining_date)
    : null,
  job_posting: data.job_posting ? Number(data.job_posting) : null,
  actual_joining_date: data.actual_joining_date
    ? new Date(data.actual_joining_date)
    : null,
  offer_accepted_date: data.offer_accepted_date
    ? new Date(data.offer_accepted_date)
    : null,
  no_show_flag: data.no_show_flag || "N",
  no_show_remarks: data.no_show_remarks || "",
  no_show_marked_date: data.no_show_marked_date
    ? new Date(data.no_show_marked_date)
    : null,
  department_id: Number(data.department_id),
});

const snapshotHiringStagesForCandidate = async (
  candidateId,
  jobPostingId,
  createdBy,
  logInst
) => {
  try {
    console.log(
      ` Snapshotting stages for candidate ${candidateId} from job ${jobPostingId}`
    );

    const jobPosting = await prisma.hrms_d_job_posting.findUnique({
      where: { id: parseInt(jobPostingId) },
      select: { hiring_stage_id: true },
    });

    if (!jobPosting || !jobPosting.hiring_stage_id) {
      console.log(" No hiring stages defined for this job posting");
      return [];
    }

    const stageIds = jobPosting.hiring_stage_id
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);

    if (stageIds.length === 0) {
      console.log(" No valid stage IDs found");
      return [];
    }

    console.log(` Found ${stageIds.length} stages:`, stageIds);
    const hiringStages = await prisma.hrms_d_hiring_stage.findMany({
      where: { id: { in: stageIds } },
      include: {
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    console.log(` Retrieved ${hiringStages.length} stage details`);

    const snapshotPromises = stageIds.map(async (stageId, index) => {
      const stage = hiringStages.find((s) => s.id === stageId);

      if (!stage) {
        console.warn(` Stage ID ${stageId} not found in database`);
        return null;
      }

      const stageData = {
        candidate_id: candidateId,
        job_posting_id: parseInt(jobPostingId),
        stage_id: stageId,
        stage_name:
          stage.hiring_stage_hiring_value?.value || `Stage ${index + 1}`,
        sequence_order: index + 1,
        stage_status: index === 0 ? "in_progress" : "pending",
        description: stage.description || null,
        started_date: index === 0 ? new Date() : null,
        createdby: createdBy,
        log_inst: logInst,
      };

      console.log(
        `  Creating stage ${index + 1}: ${stageData.stage_name} (${
          stageData.stage_status
        })`
      );

      return prisma.hrms_d_candidate_hiring_stage.create({
        data: stageData,
      });
    });

    const results = await Promise.all(snapshotPromises);
    const successfulSnapshots = results.filter(Boolean);

    console.log(
      ` Successfully created ${successfulSnapshots.length} stage snapshots`
    );

    return successfulSnapshots;
  } catch (error) {
    console.error(" Error snapshotting hiring stages:", error);
    throw new CustomError(
      `Error snapshotting hiring stages: ${error.message}`,
      500
    );
  }
};

const getCandidateHiringStages = async (candidateId) => {
  try {
    const stages = await prisma.hrms_d_candidate_hiring_stage.findMany({
      where: { candidate_id: parseInt(candidateId) },
      include: {
        candidate_hiring_stage_hiring_stage: {
          include: {
            hiring_stage_hiring_value: {
              select: {
                id: true,
                value: true,
              },
            },
          },
        },
      },
      orderBy: {
        sequence_order: "asc",
      },
    });

    return stages.map((stage, index) => ({
      id: stage.id,
      stage_id: stage.stage_id,
      stage_name: stage.stage_name,
      sequence_order: stage.sequence_order,
      stage_status: stage.stage_status,
      description: stage.description,
      feedback: stage.feedback,
      started_date: stage.started_date,
      completed_date: stage.completed_date,
      code: stage.candidate_hiring_stage_hiring_stage?.code,
      sort_order: stage.sequence_order,
      sequence_number: index + 1,
    }));
  } catch (error) {
    console.error("Error fetching candidate hiring stages:", error);
    return [];
  }
};

const getCandidateDocumentTypes = async (candidateId) => {
  try {
    const candidate = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(candidateId) },
      select: {
        job_posting: true,
        candidate_job_posting: {
          select: {
            document_type_id: true,
          },
        },
      },
    });

    if (!candidate?.candidate_job_posting?.document_type_id) {
      console.log("No document types defined for this job posting");
      return [];
    }

    const documentTypeIds = candidate.candidate_job_posting.document_type_id
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (documentTypeIds.length === 0) {
      return [];
    }

    const documentTypes = await prisma.hrms_m_document_type.findMany({
      where: {
        id: { in: documentTypeIds },
        is_active: "Y",
      },
    });

    const candidateDocuments = await prisma.hrms_d_candidate_documents.findMany(
      {
        where: { candidate_id: parseInt(candidateId) },
      }
    );

    const documentTypeMap = new Map(documentTypes.map((dt) => [dt.id, dt]));

    return documentTypeIds
      .map((id) => {
        const docType = documentTypeMap.get(id);
        if (!docType) return null;

        const uploadedDoc = candidateDocuments.find(
          (doc) => doc.document_type_id === docType.id
        );

        return {
          id: docType.id,
          document_type_name: docType.name,
          document_type_code: docType.code,
          doc_type: docType.doc_type,
          is_uploaded: !!uploadedDoc,
          uploaded_file_path: uploadedDoc?.file_path || null,
          uploaded_date: uploadedDoc?.createdate || null,
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching candidate document types:", error);
    return [];
  }
};

const getHiringStagesForJobPosting = async (jobPostingId) => {
  if (!jobPostingId) {
    console.log(" No job posting ID provided");
    return [];
  }

  try {
    console.log(" Fetching job posting:", jobPostingId);

    const jobPosting = await prisma.hrms_d_job_posting.findUnique({
      where: { id: parseInt(jobPostingId) },
      select: {
        id: true,
        job_title: true,
        hiring_stage_id: true,
      },
    });

    if (!jobPosting || !jobPosting.hiring_stage_id) {
      console.log(" No hiring_stage_id found in job posting");
      return [];
    }

    const stageIds = jobPosting.hiring_stage_id
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (stageIds.length === 0) {
      return [];
    }

    const stages = await prisma.hrms_d_hiring_stage.findMany({
      where: { id: { in: stageIds } },
    });

    if (stages.length === 0) {
      return [];
    }

    const stageWithValues = await Promise.all(
      stages.map(async (stage) => {
        let stageValue = null;

        if (stage.stage_id) {
          try {
            stageValue = await prisma.hrms_d_hiring_stage_value.findUnique({
              where: { id: stage.stage_id },
              select: {
                id: true,
                value: true,
              },
            });
          } catch (error) {
            console.warn(
              `Could not fetch value for stage_id ${stage.stage_id}`
            );
          }
        }

        return {
          id: stage.id,
          stage_name: stageValue?.value || "Unknown Stage",
          sort_order: stage.sequence,
          code: stage.code,
          description: stage.description,
          status: stage.status,
          competency_level: stage.competency_level,
        };
      })
    );

    const stageMap = new Map(stageWithValues.map((s) => [s.id, s]));

    const orderedStages = stageIds
      .map((id, index) => {
        const stage = stageMap.get(id);
        if (stage) {
          return {
            ...stage,
            sequence_number: index + 1,
          };
        }
        return null;
      })
      .filter(Boolean);

    return orderedStages;
  } catch (error) {
    console.error("Error fetching hiring stages:", error);
    return [];
  }
};

const createRequiredDocumentsForCandidate = async (
  candidateId,
  jobPostingId,
  createdBy,
  logInst
) => {
  try {
    if (!jobPostingId) {
      console.log("No job posting ID provided, skipping document creation");
      return [];
    }

    const jobPosting = await prisma.hrms_d_job_posting.findUnique({
      where: { id: parseInt(jobPostingId) },
      select: { document_type_id: true },
    });

    if (!jobPosting || !jobPosting.document_type_id) {
      console.log("No document types defined for this job posting");
      return [];
    }

    const documentTypeIds = jobPosting.document_type_id
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (documentTypeIds.length === 0) {
      console.log("No valid document type IDs found");
      return [];
    }

    const documentTypes = await prisma.hrms_m_document_type.findMany({
      where: {
        id: { in: documentTypeIds },
        is_active: "Y",
      },
    });

    const documentPromises = documentTypes.map((docType) => {
      return prisma.hrms_d_candidate_documents.create({
        data: {
          candidate_id: candidateId,
          type_id: docType.id,
          name: docType.name,
          path: null,
          expiry_date: null,
          status: "Pending",
          remarks: null,
          createdate: new Date(),
          createdby: createdBy,
          log_inst: logInst,
          updatedate: null,
          updatedby: null,
        },
      });
    });

    const createdDocuments = await Promise.all(documentPromises);

    console.log(
      `Created ${createdDocuments.length} required document records for candidate ${candidateId}`
    );

    return createdDocuments;
  } catch (error) {
    console.error("Error creating required documents:", error);
    throw new CustomError(
      `Error creating required documents: ${error.message}`,
      500
    );
  }
};

// const createCandidateMaster = async (data) => {
//   try {
//     const fullName = data.full_name?.trim();

//     if (!fullName) {
//       throw new CustomError("Full name is required", 400);
//     }

//     const nameParts = fullName.split(" ");
//     const firstName = nameParts[0];
//     const lastName = nameParts.length > 1 ? nameParts[1] : "";

//     const initials = `${firstName[0]}${lastName[0] || ""}`.toUpperCase();

//     const allCodes = await prisma.hrms_d_candidate_master.findMany({
//       select: { candidate_code: true },
//     });

//     let maxNumber = 0;

//     for (const entry of allCodes) {
//       const code = entry.candidate_code;
//       const numberPart = code.replace(/^[A-Za-z]+/, "");
//       const parsed = parseInt(numberPart);
//       if (!isNaN(parsed) && parsed > maxNumber) {
//         maxNumber = parsed;
//       }
//     }

//     const nextNumber = maxNumber + 1;
//     const newCandidateCode = `${initials}${String(nextNumber).padStart(
//       3,
//       "0"
//     )}`;

//     console.log(` Creating candidate: ${fullName} (${newCandidateCode})`);

//     const reqData = await prisma.hrms_d_candidate_master.create({
//       data: {
//         ...serializeCandidateMasterData(data),
//         candidate_code: newCandidateCode,
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         candidate_job_posting: {
//           select: {
//             id: true,
//             job_title: true,
//             hiring_stage_id: true,
//           },
//         },
//         candidate_application_source: {
//           select: {
//             id: true,
//             source_name: true,
//           },
//         },
//         candidate_interview_stage: {
//           select: {
//             id: true,
//             stage_name: true,
//           },
//         },
//         candidate_master_applied_position: {
//           select: {
//             id: true,
//             designation_name: true,
//           },
//         },
//         candidate_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//     });

//     console.log(` Candidate created with ID: ${reqData.id}`);

//     if (reqData.job_posting) {
//       await snapshotHiringStagesForCandidate(
//         reqData.id,
//         reqData.job_posting,
//         data.createdby || 1,
//         data.log_inst || 1
//       );
//     }

//     const hiringStages = await getCandidateHiringStages(reqData.id);
//     const documentTypes = await getCandidateDocumentTypes(reqData.id);

//     return {
//       ...reqData,
//       hiring_stages: hiringStages,
//       document_types: documentTypes,
//     };
//   } catch (error) {
//     console.error(" Error creating candidate master:", error);
//     throw new CustomError(
//       `Error creating candidate master: ${error.message}`,
//       500
//     );
//   }
// };

const createCandidateMaster = async (data) => {
  try {
    const fullName = data.full_name?.trim();

    if (!fullName) {
      throw new CustomError("Full name is required", 400);
    }

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[1] : "";

    const initials = `${firstName[0]}${lastName[0] || ""}`.toUpperCase();

    const allCodes = await prisma.hrms_d_candidate_master.findMany({
      select: { candidate_code: true },
    });

    let maxNumber = 0;

    for (const entry of allCodes) {
      const code = entry.candidate_code;
      const numberPart = code.replace(/^[A-Za-z]+/, "");
      const parsed = parseInt(numberPart);
      if (!isNaN(parsed) && parsed > maxNumber) {
        maxNumber = parsed;
      }
    }

    const nextNumber = maxNumber + 1;
    const newCandidateCode = `${initials}${String(nextNumber).padStart(
      3,
      "0"
    )}`;

    console.log(` Creating candidate: ${fullName} (${newCandidateCode})`);

    const reqData = await prisma.hrms_d_candidate_master.create({
      data: {
        ...serializeCandidateMasterData(data),
        candidate_code: newCandidateCode,
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        candidate_job_posting: {
          select: {
            id: true,
            job_title: true,
            hiring_stage_id: true,
            document_type_id: true, // Added this
          },
        },
        candidate_application_source: {
          select: {
            id: true,
            source_name: true,
          },
        },
        candidate_interview_stage: {
          select: {
            id: true,
            stage_name: true,
          },
        },
        candidate_master_applied_position: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        candidate_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });

    console.log(` Candidate created with ID: ${reqData.id}`);

    // Create hiring stage snapshots
    if (reqData.job_posting) {
      await snapshotHiringStagesForCandidate(
        reqData.id,
        reqData.job_posting,
        data.createdby || 1,
        data.log_inst || 1
      );

      // Create required document records
      await createRequiredDocumentsForCandidate(
        reqData.id,
        reqData.job_posting,
        data.createdby || 1,
        data.log_inst || 1
      );
    }

    const hiringStages = await getCandidateHiringStages(reqData.id);
    const documentTypes = await getCandidateDocumentTypes(reqData.id);

    return {
      ...reqData,
      hiring_stages: hiringStages,
      document_types: documentTypes,
    };
  } catch (error) {
    console.error(" Error creating candidate master:", error);
    throw new CustomError(
      `Error creating candidate master: ${error.message}`,
      500
    );
  }
};

const findCandidateMasterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(id) },
      include: {
        candidate_job_posting: {
          select: {
            id: true,
            job_title: true,
            hiring_stage_id: true,
          },
        },
        candidate_application_source: {
          select: {
            id: true,
            source_name: true,
          },
        },
        candidate_interview_stage: {
          select: {
            id: true,
            stage_name: true,
          },
        },
        candidate_master_applied_position: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        candidate_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
    });

    if (!reqData) {
      throw new CustomError("Candidate not found", 404);
    }

    const hiringStages = await getCandidateHiringStages(reqData.id);
    const documentTypes = await getCandidateDocumentTypes(reqData.id);

    return {
      ...reqData,
      hiring_stages: hiringStages,
      document_types: documentTypes,
    };
  } catch (error) {
    throw new CustomError(
      `Error finding candidate by ID: ${error.message}`,
      503
    );
  }
};

// const updateCandidateMaster = async (id, data) => {
//   try {
//     const updatedEntry = await prisma.hrms_d_candidate_master.update({
//       where: { id: parseInt(id) },
//       include: {
//         candidate_job_posting: {
//           select: {
//             id: true,
//             job_title: true,
//             hiring_stage_id: true,
//           },
//         },
//         candidate_application_source: {
//           select: {
//             id: true,
//             source_name: true,
//           },
//         },
//         candidate_interview_stage: {
//           select: {
//             id: true,
//             stage_name: true,
//           },
//         },
//         candidate_master_applied_position: {
//           select: {
//             id: true,
//             designation_name: true,
//           },
//         },
//         candidate_department: {
//           select: {
//             id: true,
//             department_name: true,
//           },
//         },
//       },
//       data: {
//         ...serializeCandidateMasterData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//     });

//     const hiringStages = await getCandidateHiringStages(updatedEntry.id);
//     const documentTypes = await getCandidateDocumentTypes(updatedEntry.id);

//     return {
//       ...updatedEntry,
//       hiring_stages: hiringStages,
//       document_types: documentTypes,
//     };
//   } catch (error) {
//     console.error("Error updating candidate master:", error);
//     throw new CustomError(
//       `Error updating candidate master: ${error.message}`,
//       500
//     );
//   }
// };

const updateCandidateMaster = async (id, data) => {
  try {
    // Fetch the current candidate data to check if job_posting has changed
    const existingCandidate = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        job_posting: true,
      },
    });

    if (!existingCandidate) {
      throw new CustomError("Candidate not found", 404);
    }

    const updatedEntry = await prisma.hrms_d_candidate_master.update({
      where: { id: parseInt(id) },
      include: {
        candidate_job_posting: {
          select: {
            id: true,
            job_title: true,
            hiring_stage_id: true,
            document_type_id: true,
          },
        },
        candidate_application_source: {
          select: {
            id: true,
            source_name: true,
          },
        },
        candidate_interview_stage: {
          select: {
            id: true,
            stage_name: true,
          },
        },
        candidate_master_applied_position: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        candidate_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
      },
      data: {
        ...serializeCandidateMasterData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    // Check if job_posting has changed
    const jobPostingChanged =
      data.job_posting &&
      existingCandidate.job_posting !== Number(data.job_posting);

    if (jobPostingChanged) {
      console.log(
        `Job posting changed from ${existingCandidate.job_posting} to ${data.job_posting}`
      );

      // Delete existing hiring stages for old job posting
      await prisma.hrms_d_candidate_hiring_stage.deleteMany({
        where: {
          candidate_id: parseInt(id),
          job_posting_id: existingCandidate.job_posting,
        },
      });

      // Delete existing document records for old job posting
      await prisma.hrms_d_candidate_documents.deleteMany({
        where: {
          candidate_id: parseInt(id),
        },
      });

      // Create new hiring stage snapshots
      await snapshotHiringStagesForCandidate(
        parseInt(id),
        Number(data.job_posting),
        data.updatedby || 1,
        data.log_inst || 1
      );

      // Create new required documents
      await createRequiredDocumentsForCandidate(
        parseInt(id),
        Number(data.job_posting),
        data.updatedby || 1,
        data.log_inst || 1
      );

      console.log(`Updated hiring stages and documents for new job posting`);
    }

    const hiringStages = await getCandidateHiringStages(updatedEntry.id);
    const documentTypes = await getCandidateDocumentTypes(updatedEntry.id);

    return {
      ...updatedEntry,
      hiring_stages: hiringStages,
      document_types: documentTypes,
    };
  } catch (error) {
    console.error("Error updating candidate master:", error);
    throw new CustomError(
      `Error updating candidate master: ${error.message}`,
      500
    );
  }
};

const deleteCandidateMaster = async (id) => {
  try {
    await prisma.hrms_d_candidate_master.delete({
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

const getAllCandidateMaster = async (
  search,
  page,
  size,
  startDate,
  endDate,
  is_active = "false"
) => {
  try {
    if (is_active === "true") {
      const filters = {};

      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        filters.OR = [
          { full_name: { contains: searchTerm } },
          { candidate_code: { contains: searchTerm } },
        ];
      }

      const datas = await prisma.hrms_d_candidate_master.findMany({
        where: filters,
        select: {
          id: true,
          full_name: true,
          candidate_code: true,
        },
        orderBy: [{ id: "asc" }],
      });
      return {
        data: datas,
      };
    } else {
      page = !page || page <= 0 ? 1 : parseInt(page);
      size = !size || size <= 0 ? 10 : parseInt(size);
      const skip = (page - 1) * size;

      const filters = {};

      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        filters.OR = [
          { full_name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phone: { contains: searchTerm } },
          { status: { contains: searchTerm } },
          { candidate_code: { contains: searchTerm } },
        ];
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          filters.createdate = {
            gte: start,
            lte: end,
          };
        }
      }

      const [datas, totalCount] = await Promise.all([
        prisma.hrms_d_candidate_master.findMany({
          where: filters,
          skip,
          take: size,
          orderBy: [{ createdate: "desc" }],
          include: {
            candidate_job_posting: {
              select: {
                id: true,
                job_title: true,
                hiring_stage_id: true,
              },
            },
            candidate_application_source: {
              select: {
                id: true,
                source_name: true,
              },
            },
            candidate_interview_stage: {
              select: {
                id: true,
                stage_name: true,
              },
            },
            candidate_master_applied_position: {
              select: {
                id: true,
                designation_name: true,
              },
            },
            candidate_department: {
              select: {
                id: true,
                department_name: true,
              },
            },
            interview_stage_candidate: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        }),
        prisma.hrms_d_candidate_master.count({
          where: filters,
        }),
      ]);

      const stageCount = await prisma.hrms_m_interview_stage.count();
      const candidatesToUpdate = [];

      for (const candidate of datas) {
        if (candidate.status !== "A") continue;
        const remarkCount = await prisma.hrms_m_interview_stage_remark?.count({
          where: { candidate_id: candidate.id },
        });

        if (remarkCount === stageCount) {
          const allRemarksAreA = candidate.interview_stage_candidate.every(
            (remark) => remark.status === "A"
          );

          if (allRemarksAreA) {
            candidatesToUpdate.push(candidate.id);
          }
        }
      }

      if (candidatesToUpdate.length > 0) {
        await prisma.hrms_d_candidate_master.updateMany({
          where: {
            id: {
              in: candidatesToUpdate.map((id) => parseInt(id)),
            },
          },
          data: {
            status: "A",
            updatedate: new Date(),
          },
        });

        datas.forEach((candidate) => {
          if (candidatesToUpdate.includes(candidate.id)) {
            candidate.status = "A";
          }
        });
      }

      const enrichedData = await Promise.all(
        datas.map(async (candidate) => {
          const hiringStages = await getCandidateHiringStages(candidate.id);
          return {
            ...candidate,
            hiring_stages: hiringStages,
          };
        })
      );

      return {
        data: enrichedData,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount,
        message:
          candidatesToUpdate.length > 0
            ? `Updated ${candidatesToUpdate.length} candidate(s) status to 'A'`
            : null,
      };
    }
  } catch (error) {
    console.log("Candidate error", error);

    if (error.code === "P2002") {
      throw new CustomError("Duplicate entry found", 409);
    } else if (error.code === "P2025") {
      throw new CustomError("Record not found", 404);
    } else {
      throw new CustomError("Error retrieving candidates", 503);
    }
  }
};

const updateCandidateMasterStatus = async (id, data) => {
  try {
    const candidateMasterId = parseInt(id);

    if (isNaN(candidateMasterId)) {
      throw new CustomError("Invalid candidate master ID", 400);
    }

    const existingCandidateMaster =
      await prisma.hrms_d_candidate_master.findUnique({
        where: { id: candidateMasterId },
      });

    if (!existingCandidateMaster) {
      throw new CustomError(
        `Candidate Master with ID ${candidateMasterId} not found`,
        404
      );
    }

    const updateData = {
      status: data.status,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    if (data.status === "A") {
      updateData.status_remarks = data.status_remarks || "";
    } else if (data.status === "R") {
      updateData.status_remarks = data.status_remarks || "";
    } else {
      updateData.status_remarks = "";
    }

    const updatedEntry = await prisma.hrms_d_candidate_master.update({
      where: { id: candidateMasterId },
      data: updateData,
      include: {
        candidate_job_posting: {
          select: {
            id: true,
            job_title: true,
            hiring_stage_id: true,
          },
        },
      },
    });

    const hiringStages = await getCandidateHiringStages(updatedEntry.id);
    const documentTypes = await getCandidateDocumentTypes(updatedEntry.id);

    return {
      ...updatedEntry,
      hiring_stages: hiringStages,
      document_types: documentTypes,
    };
  } catch (error) {
    throw new CustomError(
      `Error updating candidate master status: ${error.message}`,
      500
    );
  }
};

const updateCandidateStageStatus = async (
  candidateId,
  stageId,
  status,
  feedback,
  updatedBy
) => {
  try {
    console.log(
      ` Updating stage ${stageId} for candidate ${candidateId} to ${status}`
    );

    const updatedStage = await prisma.hrms_d_candidate_hiring_stage.updateMany({
      where: {
        candidate_id: parseInt(candidateId),
        id: parseInt(stageId),
      },
      data: {
        stage_status: status,
        feedback: feedback || null,
        completed_date:
          status === "completed" || status === "rejected" ? new Date() : null,
        updatedby: updatedBy,
        updatedate: new Date(),
      },
    });

    if (status === "completed") {
      const currentStage = await prisma.hrms_d_candidate_hiring_stage.findFirst(
        {
          where: {
            candidate_id: parseInt(candidateId),
            id: parseInt(stageId),
          },
        }
      );

      if (currentStage) {
        console.log(
          `   Moving to next stage (sequence ${
            currentStage.sequence_order + 1
          })`
        );

        const nextStageUpdate =
          await prisma.hrms_d_candidate_hiring_stage.updateMany({
            where: {
              candidate_id: parseInt(candidateId),
              job_posting_id: currentStage.job_posting_id,
              sequence_order: currentStage.sequence_order + 1,
            },
            data: {
              stage_status: "in_progress",
              started_date: new Date(),
              updatedby: updatedBy,
              updatedate: new Date(),
            },
          });

        console.log(
          `   Next stage activated: ${nextStageUpdate.count} record(s) updated`
        );
      }
    }

    return updatedStage;
  } catch (error) {
    console.error(" Error updating candidate stage:", error);
    throw new CustomError(
      `Error updating candidate stage: ${error.message}`,
      500
    );
  }
};

const createEmployeeFromCandidate = async (
  candidateId,
  additionalData,
  createdBy,
  logInst
) => {
  try {
    const candidate = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(candidateId) },
      include: {
        candidate_master_applied_position: true,
        candidate_application_source: true,
        candidate_interview_stage: true,
      },
    });

    if (!candidate) {
      throw new CustomError("Candidate not found", 404);
    }

    if (candidate.status !== "A") {
      throw new CustomError(
        "Candidate must be hired or selected to create employee",
        400
      );
    }

    const existingEmployee = await prisma.hrms_d_employee.findFirst({
      where: {
        OR: [{ email: candidate.email }],
      },
    });

    if (existingEmployee) {
      throw new CustomError("Employee already exists for this candidate", 400);
    }

    const employee_code = await generateEmployeeCode(candidate.full_name);

    const employeeData = {
      employee_code: employee_code,
      first_name: candidate.full_name.split(" ")[0] || "",
      last_name: candidate.full_name.split(" ").slice(1).join(" ") || "",
      full_name: candidate.full_name,
      email: candidate.email,
      phone_number: candidate.phone,
      date_of_birth: candidate.date_of_birth,
      gender: candidate.gender,
      nationality: candidate.nationality,
      profile_pic: candidate.profile_pic,
      department_id: candidate.department_id,
      designation_id: candidate.applied_position_id,
      join_date: candidate.actual_joining_date || new Date(),
      employment_type: additionalData.employment_type || "Full-time",
      employee_category: additionalData.employee_category || "Regular",
      status: "Active",
      ...additionalData,
      createdby: createdBy,
      log_inst: logInst,
    };

    if (!employeeData.department_id) {
      throw new CustomError(
        "Department ID is required to create employee",
        400
      );
    }

    const newEmployee = await employeeModel.createEmployee(employeeData);

    await prisma.hrms_d_candidate_master.update({
      where: { id: parseInt(candidateId) },
      data: {
        status: "A",
        status_remarks: `Converted to employee with ID: ${newEmployee.id}`,
        updatedate: new Date(),
        updatedby: createdBy,
      },
    });

    return {
      employee: newEmployee,
      candidate: candidate,
      message: "Employee created successfully from candidate",
    };
  } catch (error) {
    console.error("Error creating employee from candidate:", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(
      `Error creating employee from candidate: ${error.message}`,
      500
    );
  }
};

const generateEmployeeCode = async (fullName) => {
  const nameParts = fullName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts[1] || "";

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  const allCodes = await prisma.hrms_d_employee.findMany({
    select: { employee_code: true },
  });

  let maxNumber = 0;
  for (const entry of allCodes) {
    const code = entry.employee_code;
    const numberPart = code.replace(/^[A-Za-z]+/, "");
    const parsed = parseInt(numberPart);
    if (!isNaN(parsed) && parsed > maxNumber) {
      maxNumber = parsed;
    }
  }

  const nextNumber = maxNumber + 1;
  return `EMP${initials}${String(nextNumber).padStart(3, "0")}`;
};

module.exports = {
  createCandidateMaster,
  findCandidateMasterById,
  updateCandidateMaster,
  deleteCandidateMaster,
  getAllCandidateMaster,
  updateCandidateMasterStatus,
  updateCandidateStageStatus,
  createEmployeeFromCandidate,
  getCandidateHiringStages,
  snapshotHiringStagesForCandidate,
  getCandidateDocumentTypes,
  createRequiredDocumentsForCandidate,
};
