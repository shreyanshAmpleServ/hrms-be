// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const { parse } = require("dotenv");
// const prisma = new PrismaClient();

// const serializeJobData = (data) => {
//   let hiringStageValue = null;
//   if (
//     data.hiring_stage_ids &&
//     Array.isArray(data.hiring_stage_ids) &&
//     data.hiring_stage_ids.length > 0
//   ) {
//     hiringStageValue = data.hiring_stage_ids.map((id) => Number(id)).join(",");
//   } else if (data.hiring_stage_id) {
//     hiringStageValue = String(data.hiring_stage_id);
//   }
//   return {
//     department_id: Number(data.department_id) || null,
//     designation_id: Number(data.designation_id) || null,
//     hiring_stage_id: hiringStageValue,
//     job_title: data.job_title || "",
//     reporting_manager_id: Number(data.reporting_manager_id) || null,
//     currency_id: Number(data.currency_id) || null,
//     annual_salary_from: Number(data.annual_salary_from) || null,
//     annual_salary_to: Number(data.annual_salary_to) || null,
//     due_date: data.due_date ? new Date(data.due_date) : null,
//     description: data.description || "",
//     required_experience: data.required_experience || "",
//     posting_date: data.posting_date ? new Date(data.posting_date) : null,
//     closing_date: data.closing_date ? new Date(data.closing_date) : null,

//     is_internal:
//       typeof data.is_internal === "boolean"
//         ? data.is_internal
//         : data.is_internal === "true" ||
//           data.is_internal === 1 ||
//           data.is_internal === "1",
//   };
// };

// const parseHiringStageIds = (hiringStageId) => {
//   if (!hiringStageId || hiringStageId.trim() === "") {
//     return [];
//   }

//   return hiringStageId
//     .split(",")
//     .map((id) => parseInt(id.trim()))
//     .filter((id) => !isNaN(id) && id > 0);
// };

// const enrichWithHiringStages = async (jobPosting) => {
//   if (!jobPosting) return null;

//   const stageIds = parseHiringStageIds(jobPosting.hiring_stage_id);

//   if (stageIds.length === 0) {
//     return {
//       ...jobPosting,
//       hiring_stages: [],
//       hiring_stage_ids: [],
//     };
//   }
//   const hiringStages = await prisma.hrms_d_hiring_stage.findMany({
//     where: {
//       id: { in: stageIds },
//     },
//     select: {
//       id: true,
//       stage_id: true,
//       description: true,
//       hiring_stage_hiring_value: {
//         select: {
//           id: true,
//           value: true,
//         },
//       },
//     },
//   });

//   const stageMap = new Map(hiringStages.map((stage) => [stage.id, stage]));

//   const orderedStages = stageIds.map((id) => stageMap.get(id)).filter(Boolean);

//   return {
//     ...jobPosting,
//     hiring_stages: orderedStages,
//     hiring_stage_ids: stageIds,
//   };
// };

// const enrichMultipleWithHiringStages = async (jobPostings) => {
//   if (!jobPostings || jobPostings.length === 0) return [];

//   const allStageIds = new Set();
//   jobPostings.forEach((job) => {
//     const ids = parseHiringStageIds(job.hiring_stage_id);
//     ids.forEach((id) => allStageIds.add(id));
//   });

//   if (allStageIds.size === 0) {
//     return jobPostings.map((job) => ({
//       ...job,
//       hiring_stages: [],
//       hiring_stage_ids: [],
//     }));
//   }

//   const allHiringStages = await prisma.hrms_d_hiring_stage.findMany({
//     where: {
//       id: { in: Array.from(allStageIds) },
//     },
//     select: {
//       id: true,
//       stage_id: true,
//       description: true,
//       description: true,
//       hiring_stage_hiring_value: {
//         select: {
//           id: true,
//           value: true,
//         },
//       },
//     },
//   });

//   const stageMap = new Map(allHiringStages.map((stage) => [stage.id, stage]));

//   return jobPostings.map((job) => {
//     const stageIds = parseHiringStageIds(job.hiring_stage_id);
//     const orderedStages = stageIds
//       .map((id) => stageMap.get(id))
//       .filter(Boolean);

//     return {
//       ...job,
//       hiring_stages: orderedStages,
//       hiring_stage_ids: stageIds,
//     };
//   });
// };

// // const createJobPosting = async (data) => {
// //   try {
// //     const department = await prisma.hrms_m_department_master.findUnique({
// //       where: { id: data.department_id },
// //     });

// //     const designation = await prisma.hrms_m_designation_master.findUnique({
// //       where: { id: data.designation_id },
// //     });

// //     const jobTitle = data.job_title || "";

// //     if (!department || !designation || !jobTitle) {
// //       throw new CustomError(
// //         "Invalid department, designation, or job title",
// //         400
// //       );
// //     }

// //     const prefix =
// //       `${department.department_name[0]}${designation.designation_name[0]}${jobTitle[0]}`.toUpperCase();

// //     // Get latest job code regardless of prefix
// //     const lastJob = await prisma.hrms_d_job_posting.findFirst({
// //       orderBy: { createdate: "desc" },
// //       select: { job_code: true },
// //     });

// //     let nextNumber = 1;
// //     if (lastJob?.job_code) {
// //       const numberPart = lastJob.job_code.slice(-3);
// //       const parsed = parseInt(numberPart);
// //       if (!isNaN(parsed)) {
// //         nextNumber = parsed + 1;
// //       }
// //     }

// //     const newJobCode = `${prefix}${String(nextNumber).padStart(3, "0")}`;

// //     const reqData = await prisma.hrms_d_job_posting.create({
// //       data: {
// //         ...serializeJobData(data),
// //         job_code: newJobCode,
// //         createdby: data.createdby || 1,
// //         createdate: new Date(),
// //         log_inst: data.log_inst || 1,
// //       },
// //       include: {
// //         hrms_job_department: {
// //           select: {
// //             department_name: true,
// //             id: true,
// //           },
// //         },
// //         hrms_job_designation: {
// //           select: {
// //             designation_name: true,
// //             id: true,
// //           },
// //         },
// //         job_posting_currency: {
// //           select: {
// //             currency_name: true,
// //             id: true,
// //           },
// //         },
// //         job_posting_reporting_manager: {
// //           select: {
// //             full_name: true,
// //             id: true,
// //           },
// //         },
// //       },
// //     });

// //     return reqData;
// //   } catch (error) {
// //     throw new CustomError(`Error creating job posting: ${error.message}`, 500);
// //   }
// // };

// // Find a job posting by ID

// const createJobPosting = async (data) => {
//   try {
//     const department = await prisma.hrms_m_department_master.findUnique({
//       where: { id: data.department_id },
//     });

//     const designation = await prisma.hrms_m_designation_master.findUnique({
//       where: { id: data.designation_id },
//     });

//     const jobTitle = data.job_title || "";

//     if (!department || !designation || !jobTitle) {
//       throw new CustomError(
//         "Invalid department, designation, or job title",
//         400
//       );
//     }

//     if (
//       data.hiring_stage_ids &&
//       Array.isArray(data.hiring_stage_ids) &&
//       data.hiring_stage_ids.length > 0
//     ) {
//       const stageIds = data.hiring_stage_ids.map((id) => Number(id));

//       const validStages = await prisma.hrms_d_hiring_stage.findMany({
//         where: {
//           id: { in: stageIds },
//         },
//       });

//       if (validStages.length !== stageIds.length) {
//         const foundIds = validStages.map((s) => s.id);
//         const invalidIds = stageIds.filter((id) => !foundIds.includes(id));
//         throw new CustomError(
//           `Invalid hiring stage IDs: ${invalidIds.join(", ")}`,
//           400
//         );
//       }
//     }

//     const prefix =
//       `${department.department_name[0]}${designation.designation_name[0]}${jobTitle[0]}`.toUpperCase();

//     const lastJob = await prisma.hrms_d_job_posting.findFirst({
//       orderBy: { createdate: "desc" },
//       select: { job_code: true },
//     });

//     let nextNumber = 1;
//     if (lastJob?.job_code) {
//       const numberPart = lastJob.job_code.slice(-3);
//       const parsed = parseInt(numberPart);
//       if (!isNaN(parsed)) {
//         nextNumber = parsed + 1;
//       }
//     }

//     const newJobCode = `${prefix}${String(nextNumber).padStart(3, "0")}`;

//     const jobPosting = await prisma.hrms_d_job_posting.create({
//       data: {
//         ...serializeJobData(data),
//         job_code: newJobCode,
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         hrms_job_department: {
//           select: {
//             department_name: true,
//             id: true,
//           },
//         },
//         hrms_job_designation: {
//           select: {
//             designation_name: true,
//             id: true,
//           },
//         },
//         job_posting_currency: {
//           select: {
//             currency_name: true,
//             id: true,
//           },
//         },
//         job_posting_reporting_manager: {
//           select: {
//             full_name: true,
//             id: true,
//           },
//         },
//       },
//     });

//     return await enrichWithHiringStages(jobPosting);
//   } catch (error) {
//     throw new CustomError(`Error creating job posting: ${error.message}`, 500);
//   }
// };

// // const findJobPostingById = async (id) => {
// //   try {
// //     const reqData = await prisma.hrms_d_job_posting.findUnique({
// //       where: { id: parseInt(id) },
// //     });
// //     if (!JobPosting) {
// //       throw new CustomError("job posting not found", 404);
// //     }
// //     return reqData;
// //   } catch (error) {
// //     throw new CustomError(
// //       `Error finding job posting by ID: ${error.message}`,
// //       503
// //     );
// //   }
// // };

// // Update a job posting

// const findJobPostingById = async (id) => {
//   try {
//     const jobPosting = await prisma.hrms_d_job_posting.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         hrms_job_department: {
//           select: {
//             department_name: true,
//             id: true,
//           },
//         },
//         hrms_job_designation: {
//           select: {
//             designation_name: true,
//             id: true,
//           },
//         },
//         job_posting_currency: {
//           select: {
//             currency_name: true,
//             id: true,
//           },
//         },
//         job_posting_reporting_manager: {
//           select: {
//             full_name: true,
//             id: true,
//           },
//         },
//       },
//     });

//     if (!jobPosting) {
//       throw new CustomError("Job posting not found", 404);
//     }

//     return await enrichWithHiringStages(jobPosting);
//   } catch (error) {
//     throw new CustomError(
//       `Error finding job posting by ID: ${error.message}`,
//       503
//     );
//   }
// };

// // const updateJobPosting = async (id, data) => {
// //   try {
// //     const updatedJobPosting = await prisma.hrms_d_job_posting.update({
// //       where: { id: parseInt(id) },
// //       data: {
// //         ...serializeJobData(data),
// //         updatedby: data.updatedby || 1,
// //         updatedate: new Date(),
// //       },
// //       include: {
// //         hrms_job_department: {
// //           select: {
// //             department_name: true,
// //             id: true,
// //           },
// //         },
// //         hrms_job_designation: {
// //           select: {
// //             designation_name: true,
// //             id: true,
// //           },
// //         },
// //         job_posting_currency: {
// //           select: {
// //             currency_name: true,
// //             id: true,
// //           },
// //         },
// //         job_posting_reporting_manager: {
// //           select: {
// //             full_name: true,
// //             id: true,
// //           },
// //         },
// //       },
// //     });

// //     return updatedJobPosting;
// //   } catch (error) {
// //     throw new CustomError(`Error updating job posting: ${error.message}`, 500);
// //   }
// // };

// // Delete a job posting

// const updateJobPosting = async (id, data) => {
//   try {
//     if (
//       data.hiring_stage_ids &&
//       Array.isArray(data.hiring_stage_ids) &&
//       data.hiring_stage_ids.length > 0
//     ) {
//       const stageIds = data.hiring_stage_ids.map((id) => Number(id));

//       const validStages = await prisma.hrms_d_hiring_stage.findMany({
//         where: {
//           id: { in: stageIds },
//         },
//       });

//       if (validStages.length !== stageIds.length) {
//         const foundIds = validStages.map((s) => s.id);
//         const invalidIds = stageIds.filter((id) => !foundIds.includes(id));
//         throw new CustomError(
//           `Invalid hiring stage IDs: ${invalidIds.join(", ")}`,
//           400
//         );
//       }
//     }

//     const jobPosting = await prisma.hrms_d_job_posting.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...serializeJobData(data),
//         updatedby: data.updatedby || 1,
//         updatedate: new Date(),
//       },
//       include: {
//         hrms_job_department: {
//           select: {
//             department_name: true,
//             id: true,
//           },
//         },
//         hrms_job_designation: {
//           select: {
//             designation_name: true,
//             id: true,
//           },
//         },
//         job_posting_currency: {
//           select: {
//             currency_name: true,
//             id: true,
//           },
//         },
//         job_posting_reporting_manager: {
//           select: {
//             full_name: true,
//             id: true,
//           },
//         },
//       },
//     });

//     return await enrichWithHiringStages(jobPosting);
//   } catch (error) {
//     throw new CustomError(`Error updating job posting: ${error.message}`, 500);
//   }
// };

// const deleteJobPosting = async (id) => {
//   try {
//     await prisma.hrms_d_job_posting.delete({
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

// // Get all job postings
// // const getAllJobPosting = async (search, page, size, startDate, endDate) => {
// //   try {
// //     page = !page || page == 0 ? 1 : page;
// //     size = size || 10;
// //     const skip = (page - 1) * size || 0;

// //     const filters = {};
// //     // Handle search
// //     if (search) {
// //       filters.OR = [
// //         {
// //           hrms_job_department: {
// //             department_name: { contains: search.toLowerCase() },
// //           },
// //         },
// //         {
// //           hrms_job_designation: {
// //             designation_name: { contains: search.toLowerCase() },
// //           },
// //         },
// //         {
// //           job_title: { contains: search.toLowerCase() },
// //         },
// //       ];
// //     }

// //     if (startDate && endDate) {
// //       const start = new Date(startDate);
// //       const end = new Date(endDate);

// //       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
// //         filters.createdate = {
// //           gte: start,
// //           lte: end,
// //         };
// //       }
// //     }
// //     const datas = await prisma.hrms_d_job_posting.findMany({
// //       where: filters,
// //       skip: skip,
// //       take: size,
// //       include: {
// //         hrms_job_department: {
// //           select: {
// //             department_name: true,
// //             id: true,
// //           },
// //         },
// //         hrms_job_designation: {
// //           select: {
// //             designation_name: true,
// //             id: true,
// //           },
// //         },
// //         job_posting_currency: {
// //           select: {
// //             currency_name: true,
// //             id: true,
// //           },
// //         },
// //         job_posting_reporting_manager: {
// //           select: {
// //             full_name: true,
// //             id: true,
// //           },
// //         },
// //       },
// //       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
// //     });
// //     const totalCount = await prisma.hrms_d_job_posting.count({
// //       where: filters,
// //     });

// //     return {
// //       data: datas,
// //       currentPage: page,
// //       size,
// //       totalPages: Math.ceil(totalCount / size),
// //       totalCount: totalCount,
// //     };
// //   } catch (error) {
// //     throw new CustomError("Error retrieving job postings", 503);
// //   }
// // };

// const getAllJobPosting = async (search, page, size, startDate, endDate) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filters = {};

//     if (search) {
//       filters.OR = [
//         {
//           hrms_job_department: {
//             department_name: { contains: search.toLowerCase() },
//           },
//         },
//         {
//           hrms_job_designation: {
//             designation_name: { contains: search.toLowerCase() },
//           },
//         },
//         {
//           job_title: { contains: search.toLowerCase() },
//         },
//       ];
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = {
//           gte: start,
//           lte: end,
//         };
//       }
//     }

//     const jobPostings = await prisma.hrms_d_job_posting.findMany({
//       where: filters,
//       skip: skip,
//       take: size,
//       include: {
//         hrms_job_department: {
//           select: {
//             department_name: true,
//             id: true,
//           },
//         },
//         hrms_job_designation: {
//           select: {
//             designation_name: true,
//             id: true,
//           },
//         },
//         job_posting_currency: {
//           select: {
//             currency_name: true,
//             id: true,
//           },
//         },
//         job_posting_reporting_manager: {
//           select: {
//             full_name: true,
//             id: true,
//           },
//         },
//       },
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//     });

//     const totalCount = await prisma.hrms_d_job_posting.count({
//       where: filters,
//     });

//     const enrichedData = await enrichMultipleWithHiringStages(jobPostings);

//     return {
//       data: enrichedData,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount: totalCount,
//     };
//   } catch (error) {
//     throw new CustomError("Error retrieving job postings", 503);
//   }
// };
// module.exports = {
//   createJobPosting,
//   findJobPostingById,
//   updateJobPosting,
//   deleteJobPosting,
//   getAllJobPosting,
// };

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

const serializeJobData = (data) => {
  let hiringStageValue = null;

  if (
    data.hiring_stage_ids &&
    Array.isArray(data.hiring_stage_ids) &&
    data.hiring_stage_ids.length > 0
  ) {
    hiringStageValue = data.hiring_stage_ids.map((id) => Number(id)).join(",");
  } else if (data.hiring_stage_id) {
    hiringStageValue = String(data.hiring_stage_id);
  }

  return {
    department_id: Number(data.department_id) || null,
    designation_id: Number(data.designation_id) || null,
    hiring_stage_id: hiringStageValue,
    job_title: data.job_title || "",
    reporting_manager_id: Number(data.reporting_manager_id) || null,
    currency_id: Number(data.currency_id) || null,
    annual_salary_from: Number(data.annual_salary_from) || null,
    annual_salary_to: Number(data.annual_salary_to) || null,
    due_date: data.due_date ? new Date(data.due_date) : null,
    description: data.description || "",
    required_experience: data.required_experience || "",
    posting_date: data.posting_date ? new Date(data.posting_date) : null,
    closing_date: data.closing_date ? new Date(data.closing_date) : null,
    is_internal:
      typeof data.is_internal === "boolean"
        ? data.is_internal
        : data.is_internal === "true" ||
          data.is_internal === 1 ||
          data.is_internal === "1",
  };
};

/**
 * Parse hiring stage IDs from comma-separated string
 */
const parseHiringStageIds = (hiringStageId) => {
  if (!hiringStageId || hiringStageId.trim() === "") {
    return [];
  }

  return hiringStageId
    .split(",")
    .map((id) => parseInt(id.trim()))
    .filter((id) => !isNaN(id) && id > 0);
};

const enrichWithHiringStages = async (jobPosting) => {
  if (!jobPosting) return null;

  const stageIds = parseHiringStageIds(jobPosting.hiring_stage_id);

  if (stageIds.length === 0) {
    return {
      ...jobPosting,
      hiring_stages: [],
      hiring_stage_ids: [],
    };
  }

  const hiringStages = await prisma.hrms_d_hiring_stage.findMany({
    where: {
      id: { in: stageIds },
    },
    select: {
      id: true,
      code: true,
      stage_id: true,
      description: true,
      hiring_stage_hiring_value: {
        select: {
          id: true,
          value: true,
        },
      },
    },
  });

  const stageMap = new Map(hiringStages.map((stage) => [stage.id, stage]));

  const orderedStages = stageIds
    .map((id, index) => {
      const stage = stageMap.get(id);
      return stage ? { ...stage, custom_sequence: index + 1 } : null;
    })
    .filter(Boolean);

  return {
    ...jobPosting,
    hiring_stages: orderedStages,
    hiring_stage_ids: stageIds,
  };
};

const enrichMultipleWithHiringStages = async (jobPostings) => {
  if (!jobPostings || jobPostings.length === 0) return [];

  const allStageIds = new Set();
  jobPostings.forEach((job) => {
    const ids = parseHiringStageIds(job.hiring_stage_id);
    ids.forEach((id) => allStageIds.add(id));
  });

  if (allStageIds.size === 0) {
    return jobPostings.map((job) => ({
      ...job,
      hiring_stages: [],
      hiring_stage_ids: [],
    }));
  }

  const allHiringStages = await prisma.hrms_d_hiring_stage.findMany({
    where: {
      id: { in: Array.from(allStageIds) },
    },
    select: {
      id: true,
      // sequence: true,
      code: true,
      stage_id: true,
      description: true,
      hiring_stage_hiring_value: {
        select: {
          id: true,
          value: true,
        },
      },
    },
  });

  const stageMap = new Map(allHiringStages.map((stage) => [stage.id, stage]));

  return jobPostings.map((job) => {
    const stageIds = parseHiringStageIds(job.hiring_stage_id);
    const orderedStages = stageIds
      .map((id, index) => {
        const stage = stageMap.get(id);
        return stage ? { ...stage, custom_sequence: index + 1 } : null;
      })
      .filter(Boolean);

    return {
      ...job,
      hiring_stages: orderedStages,
      hiring_stage_ids: stageIds,
    };
  });
};

const createJobPosting = async (data) => {
  try {
    const department = await prisma.hrms_m_department_master.findUnique({
      where: { id: data.department_id },
    });

    const designation = await prisma.hrms_m_designation_master.findUnique({
      where: { id: data.designation_id },
    });

    const jobTitle = data.job_title || "";

    if (!department || !designation || !jobTitle) {
      throw new CustomError(
        "Invalid department, designation, or job title",
        400
      );
    }

    if (
      data.hiring_stage_ids &&
      Array.isArray(data.hiring_stage_ids) &&
      data.hiring_stage_ids.length > 0
    ) {
      const stageIds = data.hiring_stage_ids.map((id) => Number(id));

      const validStages = await prisma.hrms_d_hiring_stage.findMany({
        where: {
          id: { in: stageIds },
        },
      });

      if (validStages.length !== stageIds.length) {
        const foundIds = validStages.map((s) => s.id);
        const invalidIds = stageIds.filter((id) => !foundIds.includes(id));
        throw new CustomError(
          `Invalid hiring stage IDs: ${invalidIds.join(", ")}`,
          400
        );
      }
    }

    const prefix =
      `${department.department_name[0]}${designation.designation_name[0]}${jobTitle[0]}`.toUpperCase();

    const lastJob = await prisma.hrms_d_job_posting.findFirst({
      orderBy: { createdate: "desc" },
      select: { job_code: true },
    });

    let nextNumber = 1;
    if (lastJob?.job_code) {
      const numberPart = lastJob.job_code.slice(-3);
      const parsed = parseInt(numberPart);
      if (!isNaN(parsed)) {
        nextNumber = parsed + 1;
      }
    }

    const newJobCode = `${prefix}${String(nextNumber).padStart(3, "0")}`;

    const jobPosting = await prisma.hrms_d_job_posting.create({
      data: {
        ...serializeJobData(data),
        job_code: newJobCode,
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        hrms_job_department: {
          select: {
            department_name: true,
            id: true,
          },
        },
        hrms_job_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
        job_posting_currency: {
          select: {
            currency_name: true,
            id: true,
          },
        },
        job_posting_reporting_manager: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });

    return await enrichWithHiringStages(jobPosting);
  } catch (error) {
    throw new CustomError(`Error creating job posting: ${error.message}`, 500);
  }
};

const findJobPostingById = async (id) => {
  try {
    const jobPosting = await prisma.hrms_d_job_posting.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_job_department: {
          select: {
            department_name: true,
            id: true,
          },
        },
        hrms_job_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
        job_posting_currency: {
          select: {
            currency_name: true,
            id: true,
          },
        },
        job_posting_reporting_manager: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });

    if (!jobPosting) {
      throw new CustomError("Job posting not found", 404);
    }

    return await enrichWithHiringStages(jobPosting);
  } catch (error) {
    throw new CustomError(
      `Error finding job posting by ID: ${error.message}`,
      503
    );
  }
};

const updateJobPosting = async (id, data) => {
  try {
    if (
      data.hiring_stage_ids &&
      Array.isArray(data.hiring_stage_ids) &&
      data.hiring_stage_ids.length > 0
    ) {
      const stageIds = data.hiring_stage_ids.map((id) => Number(id));

      const validStages = await prisma.hrms_d_hiring_stage.findMany({
        where: {
          id: { in: stageIds },
        },
      });

      if (validStages.length !== stageIds.length) {
        const foundIds = validStages.map((s) => s.id);
        const invalidIds = stageIds.filter((id) => !foundIds.includes(id));
        throw new CustomError(
          `Invalid hiring stage IDs: ${invalidIds.join(", ")}`,
          400
        );
      }
    }

    const jobPosting = await prisma.hrms_d_job_posting.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeJobData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        hrms_job_department: {
          select: {
            department_name: true,
            id: true,
          },
        },
        hrms_job_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
        job_posting_currency: {
          select: {
            currency_name: true,
            id: true,
          },
        },
        job_posting_reporting_manager: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
    });

    return await enrichWithHiringStages(jobPosting);
  } catch (error) {
    throw new CustomError(`Error updating job posting: ${error.message}`, 500);
  }
};

const deleteJobPosting = async (id) => {
  try {
    await prisma.hrms_d_job_posting.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400
      );
    } else {
      throw new CustomError(error.message, 500);
    }
  }
};

const getAllJobPosting = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};

    if (search) {
      filters.OR = [
        {
          hrms_job_department: {
            department_name: { contains: search.toLowerCase() },
          },
        },
        {
          hrms_job_designation: {
            designation_name: { contains: search.toLowerCase() },
          },
        },
        {
          job_title: { contains: search.toLowerCase() },
        },
      ];
    }

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

    const jobPostings = await prisma.hrms_d_job_posting.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        hrms_job_department: {
          select: {
            department_name: true,
            id: true,
          },
        },
        hrms_job_designation: {
          select: {
            designation_name: true,
            id: true,
          },
        },
        job_posting_currency: {
          select: {
            currency_name: true,
            id: true,
          },
        },
        job_posting_reporting_manager: {
          select: {
            full_name: true,
            id: true,
          },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_job_posting.count({
      where: filters,
    });

    const enrichedData = await enrichMultipleWithHiringStages(jobPostings);

    return {
      data: enrichedData,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error retrieving job postings", error);

    throw new CustomError("Error retrieving job postings", 500);
  }
};

module.exports = {
  createJobPosting,
  findJobPostingById,
  updateJobPosting,
  deleteJobPosting,
  getAllJobPosting,
};
