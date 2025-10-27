// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const prisma = new PrismaClient();
// const employeeModel = require("./EmployeeModel");

// // Serialize candidate master data
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
//   interview_stage: Number(data.interview_stage) || "",
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

// // const createCandidateMaster = async (data) => {
// //   try {
// //     const fullName = data.full_name?.trim();
// //     if (!fullName || fullName.split(" ").length < 2) {
// //       throw new CustomError(
// //         "Full name must include at least first and last name",
// //         400
// //       );
// //     }

// //     const [firstName, lastName] = fullName.split(" ");
// //     const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

// //     const lastCandidate = await prisma.hrms_d_candidate_master.findFirst({
// //       orderBy: {
// //         createdate: "desc",
// //       },
// //       select: {
// //         candidate_code: true,
// //       },
// //     });

// //     let nextNumber = 1;

// //     if (lastCandidate?.candidate_code) {
// //       const numPart = lastCandidate.candidate_code.slice(2);
// //       const parsedNum = parseInt(numPart);
// //       if (!isNaN(parsedNum)) {
// //         nextNumber = parsedNum + 1;
// //       }
// //     }

// //     const newCandidateCode = `${initials}${String(nextNumber).padStart(
// //       3,
// //       "0"
// //     )}`;

// //     const reqData = await prisma.hrms_d_candidate_master.create({
// //       data: {
// //         ...serializeCandidateMasterData(data),
// //         candidate_code: newCandidateCode,
// //         createdby: data.createdby || 1,
// //         createdate: new Date(),
// //         log_inst: data.log_inst || 1,
// //       },
// //       include: {
// //         candidate_job_posting: {
// //           select: {
// //             id: true,
// //             job_title: true,
// //           },
// //         },
// //         candidate_application_source: {
// //           select: {
// //             id: true,
// //             source_name: true,
// //           },
// //         },
// //         candidate_interview_stage: {
// //           select: {
// //             id: true,
// //             stage_name: true,
// //           },
// //         },
// //         candidate_master_applied_position: {
// //           select: {
// //             id: true,
// //             designation_name: true,
// //           },
// //         },
// //       },
// //     });

// //     return reqData;
// //   } catch (error) {
// //     throw new CustomError(
// //       `Error creating candidate master: ${error.message}`,
// //       500
// //     );
// //   }
// // };

// // Find candidate master by ID
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

//     return reqData;
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
//     });
//     if (!reqData) {
//       throw new CustomError("Candidate not found", 404);
//     }
//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error finding candidate by ID: ${error.message}`,
//       503
//     );
//   }
// };

// // Update candidate master
// const updateCandidateMaster = async (id, data) => {
//   try {
//     const updatedEntry = await prisma.hrms_d_candidate_master.update({
//       where: { id: parseInt(id) },
//       include: {
//         candidate_job_posting: {
//           select: {
//             id: true,
//             job_title: true,
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
//     return updatedEntry;
//   } catch (error) {
//     console.error("Error updating candidate master:", error);
//     throw new CustomError(
//       `Error updating candidate master: ${error.message}`,
//       500
//     );
//   }
// };

// // Delete candidate master
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
//       throw new CustomError(error.meta.constraint, 500);
//     }
//   }
// };

// const getAllCandidateMaster = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   try {
//     page = !page || page <= 0 ? 1 : parseInt(page);
//     size = !size || size <= 0 ? 10 : parseInt(size);
//     const skip = (page - 1) * size;

//     const filters = {};

//     if (search && search.trim()) {
//       const searchTerm = search.trim().toLowerCase();
//       filters.OR = [
//         { full_name: { contains: searchTerm, mode: "insensitive" } },
//         { email: { contains: searchTerm, mode: "insensitive" } },
//         { phone: { contains: searchTerm, mode: "insensitive" } },
//         { status: { contains: searchTerm, mode: "insensitive" } },
//         { candidate_code: { contains: searchTerm, mode: "insensitive" } },
//       ];
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
//         orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//         include: {
//           candidate_job_posting: {
//             select: {
//               id: true,
//               job_title: true,
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

//     return {
//       data: datas,
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
//     console.log("Candidate Id : ", candidateMasterId);

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
//     });

//     return updatedEntry;
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

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const employeeModel = require("./EmployeeModel");

// Serialize candidate master data
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
  interview_stage: Number(data.interview_stage) || "",
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

/**
 * Helper: Get hiring stages from job posting
 */
/**
 * Helper: Get hiring stages from job posting WITH DEBUG LOGGING
 */
const getHiringStagesForJobPosting = async (jobPostingId) => {
  if (!jobPostingId) {
    console.log("❌ No job posting ID provided");
    return [];
  }

  try {
    console.log("🔍 Fetching job posting:", jobPostingId);

    // Get job posting
    const jobPosting = await prisma.hrms_d_job_posting.findUnique({
      where: { id: parseInt(jobPostingId) },
      select: {
        id: true,
        job_title: true,
        hiring_stage_id: true,
      },
    });

    console.log("📋 Job Posting:", JSON.stringify(jobPosting, null, 2));

    if (!jobPosting || !jobPosting.hiring_stage_id) {
      console.log("❌ No hiring_stage_id found in job posting");
      return [];
    }

    // Parse stage IDs
    const stageIds = jobPosting.hiring_stage_id
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    console.log("🎯 Parsed Stage IDs:", stageIds);

    if (stageIds.length === 0) {
      console.log("❌ No valid stage IDs found");
      return [];
    }

    // Fetch stages
    console.log("🔎 Querying database for stages:", stageIds);

    const stages = await prisma.hrms_d_hiring_stage.findMany({
      where: { id: { in: stageIds } },
      select: {
        id: true,
        name: true,
        sequence: true,
        code: true,
        description: true,
        status: true,
        hiring_stage_hiring_value: {
          select: {
            id: true,
            value: true,
          },
        },
      },
    });

    console.log("Stages found in database:", stages.length);
    console.log("Stage Details:", JSON.stringify(stages, null, 2));

    const foundIds = stages.map((s) => s.id);
    const missingIds = stageIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      console.warn("Missing hiring stages with IDs:", missingIds);

      const checkMissing = await prisma.hrms_d_hiring_stage.findMany({
        where: { id: { in: missingIds } },
      });

      console.log("🔍 Direct check for missing IDs:", checkMissing);
    }

    // Map to maintain order
    const stageMap = new Map(stages.map((s) => [s.id, s]));

    // Return in order
    const orderedStages = stageIds
      .map((id, index) => {
        const stage = stageMap.get(id);
        if (stage) {
          return {
            ...stage,
            sequence_number: index + 1,
          };
        } else {
          console.warn(`Stage ID ${id} not found in results`);
          return null;
        }
      })
      .filter(Boolean);

    console.log("Returning", orderedStages.length, "ordered stages");

    return orderedStages;
  } catch (error) {
    console.error("Error fetching hiring stages:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    return [];
  }
};

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

    // Add hiring stages
    const hiringStages = await getHiringStagesForJobPosting(
      reqData.job_posting
    );

    return {
      ...reqData,
      hiring_stages: hiringStages,
    };
  } catch (error) {
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

    // Add hiring stages
    const hiringStages = await getHiringStagesForJobPosting(
      reqData.job_posting
    );

    return {
      ...reqData,
      hiring_stages: hiringStages,
    };
  } catch (error) {
    throw new CustomError(
      `Error finding candidate by ID: ${error.message}`,
      503
    );
  }
};

const updateCandidateMaster = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_candidate_master.update({
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
      data: {
        ...serializeCandidateMasterData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });

    // Add hiring stages
    const hiringStages = await getHiringStagesForJobPosting(
      updatedEntry.job_posting
    );

    return {
      ...updatedEntry,
      hiring_stages: hiringStages,
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
  endDate
) => {
  try {
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
    if (status && status.trim()) {
      filters.status = {
        in: status || [],
      };
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
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
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

    // Add hiring stages to each candidate
    const enrichedData = await Promise.all(
      datas.map(async (candidate) => {
        const hiringStages = await getHiringStagesForJobPosting(
          candidate.job_posting
        );
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
  } catch (error) {
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

    // Add hiring stages
    const hiringStages = await getHiringStagesForJobPosting(
      updatedEntry.job_posting
    );

    return {
      ...updatedEntry,
      hiring_stages: hiringStages,
    };
  } catch (error) {
    throw new CustomError(
      `Error updating candidate master status: ${error.message}`,
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
        OR: [{ email: candidate.email }, { phone_number: candidate.phone }],
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
  createEmployeeFromCandidate,
};
