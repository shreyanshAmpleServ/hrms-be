const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize candidate master data
const serializeCandidateMasterData = (data) => ({
  candidate_code: data.candidate_code || "",
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
});

// Create a new candidate master
// const createCandidateMaster = async (data) => {
//   try {
//     const reqData = await prisma.hrms_d_candidate_master.create({
//       data: {
//         ...serializeCandidateMasterData(data),
//         createdby: data.createdby || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//       include: {
//         // candidate_applied_position_id: {
//         //   select: {
//         //     id: true,
//         //     designation_name: true,
//         //   },
//         // },
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

const createCandidateMaster = async (data) => {
  try {
    console.log("Result: ", data);

    const fullName = data.full_name?.trim();
    if (!fullName || fullName.split(" ").length < 2) {
      throw new CustomError(
        "Full name must include at least first and last name",
        400
      );
    }

    const [firstName, lastName] = fullName.split(" ");
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

    const lastCandidate = await prisma.hrms_d_candidate_master.findFirst({
      orderBy: {
        createdate: "desc",
      },
      select: {
        candidate_code: true,
      },
    });

    let nextNumber = 1;

    if (lastCandidate?.candidate_code) {
      const numPart = lastCandidate.candidate_code.slice(2);
      const parsedNum = parseInt(numPart);
      if (!isNaN(parsedNum)) {
        nextNumber = parsedNum + 1;
      }
    }

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
      },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating candidate master: ${error.message}`,
      500
    );
  }
};

// Find candidate master by ID
const findCandidateMasterById = async (id) => {
  try {
    const reqData = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(id) },
    });
    if (!reqData) {
      throw new CustomError("Candidate not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding candidate by ID: ${error.message}`,
      503
    );
  }
};

// Update candidate master
const updateCandidateMaster = async (id, data) => {
  try {
    const updatedEntry = await prisma.hrms_d_candidate_master.update({
      where: { id: parseInt(id) },
      include: {
        candidate_applied_position_id: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        candidate_job_posting: {
          select: {
            id: true,
            job_title: true,
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
      },

      data: {
        ...serializeCandidateMasterData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
    });
    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating candidate master: ${error.message}`,
      500
    );
  }
};

// Delete candidate master
const deleteCandidateMaster = async (id) => {
  try {
    await prisma.hrms_d_candidate_master.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting candidate master: ${error.message}`,
      500
    );
  }
};

// Get all candidate masters with pagination and search
const getAllCandidateMaster = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    if (search) {
      filters.OR = [
        { full_name: { contains: search.toLowerCase() } },
        { email: { contains: search.toLowerCase() } },
        { phone: { contains: search.toLowerCase() } },
        { status: { contains: search.toLowerCase() } },
        { candidate_code: { contains: search.toLowerCase() } },
      ];
    }
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    const datas = await prisma.hrms_d_candidate_master.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        candidate_job_posting: {
          select: {
            id: true,
            job_title: true,
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
      },
    });
    const totalCount = await prisma.hrms_d_candidate_master.count({
      where: filters,
    });

    return {
      data: datas,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error("getAllCandidateMaster ERROR:", error); // <- This is crucial

    throw new CustomError("Error retrieving candidates", 503);
  }
};

const updateCandidateMasterStatus = async (id, data) => {
  try {
    const candidateMasterId = parseInt(id);
    console.log("Candidate Id : ", candidateMasterId);

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
    if (data.status === "Approved") {
      updateData.status_remarks = data.status_remarks || "";
    } else if (data.status === "Rejected") {
      updateData.status_remarks = data.status_remarks || "";
    } else {
      updateData.status_remarks = "";
    }
    const updatedEntry = await prisma.hrms_d_candidate_master.update({
      where: { id: candidateMasterId },
      data: updateData,
    });

    return updatedEntry;
  } catch (error) {
    throw new CustomError(
      `Error updating candidate master status: ${error.message}`,
      500
    );
  }
};

module.exports = {
  createCandidateMaster,
  findCandidateMasterById,
  updateCandidateMaster,
  deleteCandidateMaster,
  getAllCandidateMaster,
  updateCandidateMasterStatus,
};
