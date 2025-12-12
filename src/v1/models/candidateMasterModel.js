const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");
const employeeModel = require("./EmployeeModel");

const serializeCandidateMasterData = (data) => {
  const serialized = {
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
  };

  if (data.profile_pic !== undefined && data.profile_pic !== null) {
    serialized.profile_pic = data.profile_pic;
  }
  if (data.resume_path !== undefined && data.resume_path !== null) {
    serialized.resume_path = data.resume_path;
  }

  return serialized;
};

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
    });

    console.log(` Candidate created with ID: ${reqData.id}`);

    if (reqData.job_posting) {
      await snapshotHiringStagesForCandidate(
        reqData.id,
        reqData.job_posting,
        data.createdby || 1,
        data.log_inst || 1
      );

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

//     const hiringStages = await getCandidateHiringStages(reqData.id);
//     const documentTypes = await getCandidateDocumentTypes(reqData.id);

//     return {
//       ...reqData,
//       hiring_stages: hiringStages,
//       document_types: documentTypes,
//     };
//   } catch (error) {
//     throw new CustomError(
//       `Error finding candidate by ID: ${error.message}`,
//       503
//     );
//   }
// };

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

    const isApprovedOrConverted =
      reqData.status === "A" ||
      reqData.status === "Approved" ||
      reqData.status === "Converted";

    let interviewStageDetails = null;
    if (!isApprovedOrConverted && reqData.interview_stage) {
      try {
        interviewStageDetails = await prisma.hrms_m_interview_stage.findUnique({
          where: { id: parseInt(reqData.interview_stage) },
          select: {
            id: true,
            stage_name: true,
            description: true,
            status: true,
          },
        });

        console.log(
          `Fetched interview stage for candidate ${id}:`,
          interviewStageDetails?.stage_name || "N/A"
        );
      } catch (error) {
        console.warn(
          `Could not fetch interview stage for candidate ${id}:`,
          error.message
        );
      }
    } else if (isApprovedOrConverted) {
      console.log(
        `Skipping interview_stage for candidate ${id} - Status: ${reqData.status}`
      );
    }

    const hiringStages = await getCandidateHiringStages(reqData.id);
    const documentTypes = await getCandidateDocumentTypes(reqData.id);

    return {
      ...reqData,
      candidate_interview_stage: interviewStageDetails,
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
const updateCandidateMaster = async (id, data) => {
  try {
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

    const jobPostingChanged =
      data.job_posting &&
      existingCandidate.job_posting !== Number(data.job_posting);

    if (jobPostingChanged) {
      console.log(
        `Job posting changed from ${existingCandidate.job_posting} to ${data.job_posting}`
      );

      await prisma.hrms_d_candidate_hiring_stage.deleteMany({
        where: {
          candidate_id: parseInt(id),
          job_posting_id: existingCandidate.job_posting,
        },
      });

      await prisma.hrms_d_candidate_documents.deleteMany({
        where: {
          candidate_id: parseInt(id),
        },
      });

      await snapshotHiringStagesForCandidate(
        parseInt(id),
        Number(data.job_posting),
        data.updatedby || 1,
        data.log_inst || 1
      );

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

// const getAllCandidateMaster = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate,
//   is_active = "false"
// ) => {
//   try {
//     if (is_active === "true") {
//       const filters = {};

//       if (search && search.trim()) {
//         const searchTerm = search.trim().toLowerCase();
//         filters.OR = [
//           { full_name: { contains: searchTerm } },
//           { candidate_code: { contains: searchTerm } },
//         ];
//       }

//       const datas = await prisma.hrms_d_candidate_master.findMany({
//         where: filters,
//         select: {
//           id: true,
//           full_name: true,
//           candidate_code: true,
//         },
//         orderBy: [{ id: "asc" }],
//       });
//       return {
//         data: datas,
//       };
//     } else {
//       page = !page || page <= 0 ? 1 : parseInt(page);
//       size = !size || size <= 0 ? 10 : parseInt(size);
//       const skip = (page - 1) * size;

//       const filters = {};

//       if (search && search.trim()) {
//         const searchTerm = search.trim().toLowerCase();
//         filters.OR = [
//           { full_name: { contains: searchTerm } },
//           { email: { contains: searchTerm } },
//           { phone: { contains: searchTerm } },
//           { status: { contains: searchTerm } },
//           { candidate_code: { contains: searchTerm } },
//         ];
//       }

//       if (startDate && endDate) {
//         const start = new Date(startDate);
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);

//         if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//           filters.createdate = {
//             gte: start,
//             lte: end,
//           };
//         }
//       }

//       const [datas, totalCount] = await Promise.all([
//         prisma.hrms_d_candidate_master.findMany({
//           where: filters,
//           skip,
//           take: size,
//           orderBy: [{ createdate: "desc" }],
//           include: {
//             candidate_job_posting: {
//               select: {
//                 id: true,
//                 job_title: true,
//                 hiring_stage_id: true,
//               },
//             },
//             candidate_application_source: {
//               select: {
//                 id: true,
//                 source_name: true,
//               },
//             },
//             candidate_interview_stage: {
//               select: {
//                 id: true,
//                 stage_name: true,
//               },
//             },
//             candidate_master_applied_position: {
//               select: {
//                 id: true,
//                 designation_name: true,
//               },
//             },
//             candidate_department: {
//               select: {
//                 id: true,
//                 department_name: true,
//               },
//             },
//             interview_stage_candidate: {
//               select: {
//                 id: true,
//                 status: true,
//               },
//             },
//           },
//         }),
//         prisma.hrms_d_candidate_master.count({
//           where: filters,
//         }),
//       ]);

//       const stageCount = await prisma.hrms_m_interview_stage.count();
//       const candidatesToUpdate = [];

//       for (const candidate of datas) {
//         if (candidate.status !== "A") continue;
//         const remarkCount = await prisma.hrms_m_interview_stage_remark?.count({
//           where: { candidate_id: candidate.id },
//         });

//         if (remarkCount === stageCount) {
//           const allRemarksAreA = candidate.interview_stage_candidate.every(
//             (remark) => remark.status === "A"
//           );

//           if (allRemarksAreA) {
//             candidatesToUpdate.push(candidate.id);
//           }
//         }
//       }

//       if (candidatesToUpdate.length > 0) {
//         await prisma.hrms_d_candidate_master.updateMany({
//           where: {
//             id: {
//               in: candidatesToUpdate.map((id) => parseInt(id)),
//             },
//           },
//           data: {
//             status: "A",
//             updatedate: new Date(),
//           },
//         });

//         datas.forEach((candidate) => {
//           if (candidatesToUpdate.includes(candidate.id)) {
//             candidate.status = "A";
//           }
//         });
//       }

//       const enrichedData = await Promise.all(
//         datas.map(async (candidate) => {
//           const hiringStages = await getCandidateHiringStages(candidate.id);
//           return {
//             ...candidate,
//             hiring_stages: hiringStages,
//           };
//         })
//       );

//       return {
//         data: enrichedData,
//         currentPage: page,
//         size,
//         totalPages: Math.ceil(totalCount / size),
//         totalCount,
//         message:
//           candidatesToUpdate.length > 0
//             ? `Updated ${candidatesToUpdate.length} candidate(s) status to 'A'`
//             : null,
//       };
//     }
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

          const isApprovedOrConverted =
            candidate.status === "A" ||
            candidate.status === "Approved" ||
            candidate.status === "Converted";

          let interviewStageDetails = null;
          if (!isApprovedOrConverted && candidate.interview_stage) {
            try {
              interviewStageDetails =
                await prisma.hrms_m_interview_stage.findUnique({
                  where: { id: parseInt(candidate.interview_stage) },
                  select: {
                    id: true,
                    stage_name: true,
                    description: true,
                  },
                });

              console.log(
                ` Fetched interview stage for candidate ${candidate.id}:`,
                interviewStageDetails?.stage_name || "N/A"
              );
            } catch (error) {
              console.warn(
                ` Could not fetch interview stage for candidate ${candidate.id}:`,
                error.message
              );
              interviewStageDetails = null;
            }
          } else if (isApprovedOrConverted) {
            console.log(
              `Skipping interview_stage for candidate ${candidate.id} - Status: ${candidate.status}`
            );
          }

          return {
            ...candidate,
            candidate_interview_stage: interviewStageDetails,
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
//         OR: [{ email: candidate.email }],
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

// II
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

//     if (candidate.status === "Converted") {
//       throw new CustomError(
//         "This candidate has already been converted to an employee",
//         400
//       );
//     }

//     const documentVerification = await verifyCandidateDocuments(
//       parseInt(candidateId)
//     );

//     if (!documentVerification.allRequiredDocumentsUploaded) {
//       console.warn(
//         ` Warning: Creating employee for candidate ${candidateId} with missing documents: ${documentVerification.missingDocuments
//           .map((d) => d.name)
//           .join(", ")}`
//       );
//     }

//     const existingEmployee = await prisma.hrms_d_employee.findFirst({
//       where: {
//         email: candidate.email,
//       },
//       select: {
//         id: true,
//         employee_code: true,
//         full_name: true,
//         email: true,
//       },
//     });

//     if (existingEmployee) {
//       throw new CustomError(
//         `Employee already exists with this email (${candidate.email}). Existing employee: ${existingEmployee.full_name} (${existingEmployee.employee_code})`,
//         400
//       );
//     }

//     const employee_code = await generateEmployeeCode(candidate.full_name);

//     const cleanAdditionalData = { ...additionalData };

//     const fieldsToRemove = [
//       "reporting_manager_id",
//       "branch_id",
//       "company_id",
//       "location_id",
//       "grade_id",
//       "category_id",
//       "cost_center_id",
//       "profit_center_id",
//       "pay_group_id",
//       "holiday_calendar_id",
//       "shift_id",
//       "attendance_rule_id",
//       "leave_policy_id",
//       "header_attendance_rule",
//     ];

//     fieldsToRemove.forEach((field) => {
//       delete cleanAdditionalData[field];
//     });

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
//       join_date: candidate.actual_joining_date || new Date(),
//       status: "Active",
//       createdby: createdBy,
//       log_inst: logInst,
//       ...cleanAdditionalData,
//     };

//     if (candidate.department_id) {
//       employeeData.department_id = candidate.department_id;
//     }

//     if (candidate.applied_position_id) {
//       employeeData.designation_id = candidate.applied_position_id;
//     }

//     console.log(
//       "Creating employee with data:",
//       JSON.stringify(employeeData, null, 2)
//     );

//     const newEmployee = await employeeModel.createEmployee(employeeData);

//     console.log(
//       ` Employee created with ID: ${newEmployee.id}, Code: ${newEmployee.employee_code}`
//     );

//     console.log(`\n Fetching candidate documents to transfer...`);

//     const candidateDocuments = await prisma.hrms_d_candidate_documents.findMany(
//       {
//         where: {
//           candidate_id: parseInt(candidateId),
//           path: { not: null },
//         },
//         include: {
//           candidate_documents_type: {
//             select: {
//               id: true,
//               name: true,
//               code: true,
//             },
//           },
//         },
//       }
//     );

//     console.log(
//       ` Found ${candidateDocuments.length} document(s) to transfer from candidate to employee`
//     );

//     let transferredDocuments = [];
//     let failedTransfers = [];
//     let nidaFilePath = null;
//     let nssfFilePath = null;
//     let wcfFilePath = null;
//     let nhifFilePath = null;

//     if (candidateDocuments.length > 0) {
//       for (const candidateDoc of candidateDocuments) {
//         try {
//           const docTypeName = (
//             candidateDoc.candidate_documents_type?.name || ""
//           ).toLowerCase();
//           const docTypeCode = (
//             candidateDoc.candidate_documents_type?.code || ""
//           ).toLowerCase();

//           console.log(`\n Processing: ${candidateDoc.name}`);
//           console.log(
//             `     Type: ${
//               candidateDoc.candidate_documents_type?.name || "Unknown"
//             }`
//           );
//           console.log(`     Path: ${candidateDoc.path}`);

//           const employeeDocument = await prisma.hrms_d_document_upload.create({
//             data: {
//               document_upload_employee: {
//                 connect: { id: newEmployee.id },
//               },
//               document_type:
//                 candidateDoc.candidate_documents_type?.name || "Other",
//               document_path: candidateDoc.path,
//               uploaded_on: new Date(),
//               createdate: new Date(),
//               createdby: createdBy,
//               log_inst: logInst || 1,
//             },
//           });

//           transferredDocuments.push({
//             candidateDocId: candidateDoc.id,
//             employeeDocId: employeeDocument.id,
//             documentName: candidateDoc.name,
//             documentType:
//               candidateDoc.candidate_documents_type?.name || "Unknown",
//             filePath: candidateDoc.path,
//           });

//           if (docTypeName.includes("nida") || docTypeCode.includes("nida")) {
//             nidaFilePath = candidateDoc.path;
//           } else if (
//             docTypeName.includes("nssf") ||
//             docTypeCode.includes("nssf")
//           ) {
//             nssfFilePath = candidateDoc.path;
//           } else if (
//             docTypeName.includes("wcf") ||
//             docTypeCode.includes("wcf")
//           ) {
//             wcfFilePath = candidateDoc.path;
//           } else if (
//             docTypeName.includes("nhif") ||
//             docTypeCode.includes("nhif")
//           ) {
//             nhifFilePath = candidateDoc.path;
//           }

//           console.log(
//             `     Transferred successfully (Employee Doc ID: ${employeeDocument.id})`
//           );
//         } catch (docError) {
//           console.error(`      Failed to transfer: ${docError.message}`);

//           failedTransfers.push({
//             candidateDocId: candidateDoc.id,
//             documentName: candidateDoc.name,
//             documentType:
//               candidateDoc.candidate_documents_type?.name || "Unknown",
//             error: docError.message,
//           });
//         }
//       }

//       console.log(`\n Document Transfer Summary:`);
//       console.log(
//         `   Successfully transferred: ${transferredDocuments.length} document(s)`
//       );
//       console.log(`   Failed transfers: ${failedTransfers.length} document(s)`);

//       if (nidaFilePath || nssfFilePath || wcfFilePath || nhifFilePath) {
//         console.log(`\n Updating employee record with document paths...`);

//         const updateData = {};
//         if (nidaFilePath) updateData.nida_file = nidaFilePath;
//         if (nssfFilePath) updateData.nssf_file = nssfFilePath;
//         if (wcfFilePath) updateData.wcf = wcfFilePath;
//         if (nhifFilePath) updateData.nhif = nhifFilePath;

//         await prisma.hrms_d_employee.update({
//           where: { id: newEmployee.id },
//           data: {
//             ...updateData,
//             updatedate: new Date(),
//             updatedby: createdBy,
//           },
//         });

//         newEmployee.nida_file = nidaFilePath;
//         newEmployee.nssf_file = nssfFilePath;
//         newEmployee.wcf = wcfFilePath;
//         newEmployee.nhif = nhifFilePath;
//       }
//     } else {
//       console.log(` No documents to transfer`);
//     }

//     await prisma.hrms_d_candidate_master.update({
//       where: { id: parseInt(candidateId) },
//       data: {
//         status: "Converted",
//         status_remarks: `Converted to employee ${newEmployee.employee_code} (ID: ${newEmployee.id}). ${transferredDocuments.length} document(s) transferred.`,
//         updatedate: new Date(),
//         updatedby: createdBy,
//       },
//     });

//     console.log(` Candidate ${candidate.candidate_code} marked as Converted\n`);

//     const documentsList = [
//       {
//         documentName: "Offer Letter",
//         status: documentVerification.documentStatus.offerLetter.uploaded
//           ? "Uploaded"
//           : "Not Uploaded",
//         isUploaded: documentVerification.documentStatus.offerLetter.uploaded,
//         filePath: documentVerification.documentStatus.offerLetter.documentPath,
//       },
//       {
//         documentName: "Appointment Letter",
//         status: documentVerification.documentStatus.appointmentLetter.uploaded
//           ? "Uploaded"
//           : "Not Uploaded",
//         isUploaded:
//           documentVerification.documentStatus.appointmentLetter.uploaded,
//         filePath:
//           documentVerification.documentStatus.appointmentLetter.documentPath,
//       },
//       {
//         documentName: "Employment Contract",
//         status: documentVerification.documentStatus.employmentContract.uploaded
//           ? "Uploaded"
//           : "Not Uploaded",
//         isUploaded:
//           documentVerification.documentStatus.employmentContract.uploaded,
//         filePath:
//           documentVerification.documentStatus.employmentContract.documentPath,
//       },
//     ];

//     const response = {
//       employee: newEmployee,
//       candidate: candidate,
//       message: "Employee created successfully from candidate",
//       documentStatus: {
//         allUploaded: documentVerification.allRequiredDocumentsUploaded,
//         totalRequired: 3,
//         totalUploaded: documentVerification.uploadedDocuments.length,
//         summary: documentVerification.summary,
//         documents: documentsList,
//       },
//       documentTransfer: {
//         totalCandidateDocuments: candidateDocuments.length,
//         successfullyTransferred: transferredDocuments.length,
//         failedTransfers: failedTransfers.length,
//         transferredDocuments: transferredDocuments,
//         failedDocuments: failedTransfers,
//         employeeTableFields: {
//           nida_file: newEmployee.nida_file || null,
//           nssf_file: newEmployee.nssf_file || null,
//           wcf: newEmployee.wcf || null,
//           nhif: newEmployee.nhif || null,
//         },
//       },
//     };

//     if (!documentVerification.allRequiredDocumentsUploaded) {
//       response.warning = {
//         type: "MISSING_DOCUMENTS",
//         message: `Employee created with ${documentVerification.missingDocuments.length} missing document(s)`,
//         missingDocuments: documentVerification.missingDocuments.map(
//           (d) => d.name
//         ),
//         uploadedDocuments: documentVerification.uploadedDocuments.map(
//           (d) => d.name
//         ),
//       };
//     }

//     if (failedTransfers.length > 0) {
//       response.documentTransferWarning = {
//         type: "PARTIAL_DOCUMENT_TRANSFER",
//         message: `${failedTransfers.length} document(s) failed to transfer`,
//         failedDocuments: failedTransfers,
//       };
//     }

//     return response;
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

    if (candidate.status === "Converted") {
      throw new CustomError(
        "This candidate has already been converted to an employee",
        400
      );
    }

    const documentVerification = await verifyCandidateDocuments(
      parseInt(candidateId)
    );

    if (!documentVerification.hasAnyDocument) {
      console.warn(
        ` Warning: Creating employee for candidate ${candidateId} with no documents uploaded`
      );
    }

    const existingEmployee = await prisma.hrms_d_employee.findFirst({
      where: {
        email: candidate.email,
      },
      select: {
        id: true,
        employee_code: true,
        full_name: true,
        email: true,
      },
    });

    if (existingEmployee) {
      throw new CustomError(
        `Employee already exists with this email (${candidate.email}). Existing employee: ${existingEmployee.full_name} (${existingEmployee.employee_code})`,
        400
      );
    }

    const employee_code = await generateEmployeeCode(candidate.full_name);

    const cleanAdditionalData = { ...additionalData };

    const fieldsToRemove = [
      "reporting_manager_id",
      "branch_id",
      "company_id",
      "location_id",
      "grade_id",
      "category_id",
      "cost_center_id",
      "profit_center_id",
      "pay_group_id",
      "holiday_calendar_id",
      "shift_id",
      "attendance_rule_id",
      "leave_policy_id",
      "header_attendance_rule",
    ];

    fieldsToRemove.forEach((field) => {
      delete cleanAdditionalData[field];
    });

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
      join_date: candidate.actual_joining_date || new Date(),
      status: "Active",
      createdby: createdBy,
      log_inst: logInst,
      ...cleanAdditionalData,
    };

    if (candidate.department_id) {
      employeeData.department_id = candidate.department_id;
    }

    if (candidate.applied_position_id) {
      employeeData.designation_id = candidate.applied_position_id;
    }

    console.log(
      "Creating employee with data:",
      JSON.stringify(employeeData, null, 2)
    );

    const newEmployee = await employeeModel.createEmployee(employeeData);

    console.log(
      ` Employee created with ID: ${newEmployee.id}, Code: ${newEmployee.employee_code}`
    );

    console.log(`\n Fetching candidate documents to transfer...`);

    const candidateDocuments = await prisma.hrms_d_candidate_documents.findMany(
      {
        where: {
          candidate_id: parseInt(candidateId),
          path: { not: null },
        },
        include: {
          candidate_documents_type: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }
    );

    console.log(
      ` Found ${candidateDocuments.length} document(s) to transfer from candidate to employee`
    );

    let transferredDocuments = [];
    let failedTransfers = [];
    let nidaFilePath = null;
    let nssfFilePath = null;
    let wcfFilePath = null;
    let nhifFilePath = null;

    if (candidateDocuments.length > 0) {
      for (const candidateDoc of candidateDocuments) {
        try {
          const docTypeName = (
            candidateDoc.candidate_documents_type?.name || ""
          ).toLowerCase();
          const docTypeCode = (
            candidateDoc.candidate_documents_type?.code || ""
          ).toLowerCase();

          console.log(`\n Processing: ${candidateDoc.name}`);
          console.log(
            `     Type: ${
              candidateDoc.candidate_documents_type?.name || "Unknown"
            }`
          );
          console.log(`     Path: ${candidateDoc.path}`);

          const employeeDocument = await prisma.hrms_d_document_upload.create({
            data: {
              document_upload_employee: {
                connect: { id: newEmployee.id },
              },
              document_type:
                candidateDoc.candidate_documents_type?.name || "Other",
              document_path: candidateDoc.path,
              uploaded_on: new Date(),
              createdate: new Date(),
              createdby: createdBy,
              log_inst: logInst || 1,
            },
          });

          transferredDocuments.push({
            candidateDocId: candidateDoc.id,
            employeeDocId: employeeDocument.id,
            documentName: candidateDoc.name,
            documentType:
              candidateDoc.candidate_documents_type?.name || "Unknown",
            filePath: candidateDoc.path,
          });

          if (docTypeName.includes("nida") || docTypeCode.includes("nida")) {
            nidaFilePath = candidateDoc.path;
          } else if (
            docTypeName.includes("nssf") ||
            docTypeCode.includes("nssf")
          ) {
            nssfFilePath = candidateDoc.path;
          } else if (
            docTypeName.includes("wcf") ||
            docTypeCode.includes("wcf")
          ) {
            wcfFilePath = candidateDoc.path;
          } else if (
            docTypeName.includes("nhif") ||
            docTypeCode.includes("nhif")
          ) {
            nhifFilePath = candidateDoc.path;
          }

          console.log(
            `     Transferred successfully (Employee Doc ID: ${employeeDocument.id})`
          );
        } catch (docError) {
          console.error(`      Failed to transfer: ${docError.message}`);

          failedTransfers.push({
            candidateDocId: candidateDoc.id,
            documentName: candidateDoc.name,
            documentType:
              candidateDoc.candidate_documents_type?.name || "Unknown",
            error: docError.message,
          });
        }
      }

      console.log(`\n Document Transfer Summary:`);
      console.log(
        `   Successfully transferred: ${transferredDocuments.length} document(s)`
      );
      console.log(`   Failed transfers: ${failedTransfers.length} document(s)`);

      if (nidaFilePath || nssfFilePath || wcfFilePath || nhifFilePath) {
        console.log(`\n Updating employee record with document paths...`);

        const updateData = {};
        if (nidaFilePath) updateData.nida_file = nidaFilePath;
        if (nssfFilePath) updateData.nssf_file = nssfFilePath;
        if (wcfFilePath) updateData.wcf = wcfFilePath;
        if (nhifFilePath) updateData.nhif = nhifFilePath;

        await prisma.hrms_d_employee.update({
          where: { id: newEmployee.id },
          data: {
            ...updateData,
            updatedate: new Date(),
            updatedby: createdBy,
          },
        });

        newEmployee.nida_file = nidaFilePath;
        newEmployee.nssf_file = nssfFilePath;
        newEmployee.wcf = wcfFilePath;
        newEmployee.nhif = nhifFilePath;
      }
    } else {
      console.log(` No documents to transfer`);
    }

    await prisma.hrms_d_candidate_master.update({
      where: { id: parseInt(candidateId) },
      data: {
        status: "Converted",
        status_remarks: `Converted to employee ${newEmployee.employee_code} (ID: ${newEmployee.id}). ${transferredDocuments.length} document(s) transferred.`,
        updatedate: new Date(),
        updatedby: createdBy,
      },
    });

    console.log(` Candidate ${candidate.candidate_code} marked as Converted\n`);

    const response = {
      employee: newEmployee,
      candidate: candidate,
      message: "Employee created successfully from candidate",
      documentStatus: {
        totalUploaded: documentVerification.documentCount || 0,
        hasDocuments: documentVerification.hasAnyDocument || false,
        summary: documentVerification.summary || "No documents",
        uploadedDocuments: documentVerification.uploadedDocuments || [],
      },
      documentTransfer: {
        totalCandidateDocuments: candidateDocuments.length,
        successfullyTransferred: transferredDocuments.length,
        failedTransfers: failedTransfers.length,
        transferredDocuments: transferredDocuments,
        failedDocuments: failedTransfers,
        employeeTableFields: {
          nida_file: newEmployee.nida_file || null,
          nssf_file: newEmployee.nssf_file || null,
          wcf: newEmployee.wcf || null,
          nhif: newEmployee.nhif || null,
        },
      },
    };

    if (!documentVerification.hasAnyDocument) {
      response.warning = {
        type: "NO_DOCUMENTS",
        message: "Employee created with no documents uploaded",
      };
    }

    if (failedTransfers.length > 0) {
      response.documentTransferWarning = {
        type: "PARTIAL_DOCUMENT_TRANSFER",
        message: `${failedTransfers.length} document(s) failed to transfer`,
        failedDocuments: failedTransfers,
      };
    }

    return response;
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
// const verifyCandidateDocuments = async (candidateId) => {
//   try {
//     const candidateDocuments = await prisma.hrms_d_candidate_documents.findMany(
//       {
//         where: {
//           candidate_id: candidateId,
//           path: { not: null },
//         },
//       }
//     );

//     console.log(" Found documents for candidate:", candidateId);
//     console.log("Total documents found:", candidateDocuments.length);

//     const typeIds = [
//       ...new Set(candidateDocuments.map((doc) => doc.type_id).filter(Boolean)),
//     ];
//     const documentTypes = await prisma.hrms_m_document_type.findMany({
//       where: { id: { in: typeIds } },
//     });

//     const typeMap = new Map(documentTypes.map((dt) => [dt.id, dt]));

//     candidateDocuments.forEach((doc) => {
//       const docType = typeMap.get(doc.type_id);
//       console.log(`\n Document in DB:`);
//       console.log(`  ID: ${doc.id}`);
//       console.log(`  Filename: ${doc.name}`);
//       console.log(`  Type ID: ${doc.type_id}`);
//       console.log(`  Type Name: ${docType?.name}`);
//       console.log(`  Type Code: ${docType?.code}`);
//       console.log(`  Path: ${doc.path}`);
//     });

//     const documentStatus = {
//       offerLetter: {
//         required: true,
//         uploaded: false,
//         documentName: "Offer Letter",
//         documentPath: null,
//       },
//       appointmentLetter: {
//         required: true,
//         uploaded: false,
//         documentName: "Appointment Letter",
//         documentPath: null,
//       },
//       employmentContract: {
//         required: true,
//         uploaded: false,
//         documentName: "Employment Contract",
//         documentPath: null,
//       },
//     };

//     for (const doc of candidateDocuments) {
//       const docType = typeMap.get(doc.type_id);
//       const docTypeName = (docType?.name || "").toLowerCase().trim();
//       const docTypeCode = (docType?.code || "").toUpperCase().trim();
//       const fileName = (doc.name || "").toLowerCase().trim();
//       const filePath = doc.path;

//       console.log(`\n Checking document: "${doc.name}"`);
//       console.log(`  Type name: "${docTypeName}"`);
//       console.log(`  Type code: "${docTypeCode}"`);
//       console.log(`  Filename: "${fileName}"`);

//       if (
//         docTypeCode === "OFFER_LETTER" ||
//         docTypeCode === "OFFERLETTER" ||
//         docTypeCode === "OFFER" ||
//         docTypeName.includes("offer letter") ||
//         docTypeName.includes("offer_letter") ||
//         docTypeName.includes("offerletter") ||
//         docTypeName === "offer letter" ||
//         docTypeName === "offer" ||
//         fileName.includes("offer") ||
//         fileName.includes("offer_letter") ||
//         fileName.includes("offerletter")
//       ) {
//         documentStatus.offerLetter.uploaded = true;
//         documentStatus.offerLetter.documentPath = filePath;
//       } else if (
//         docTypeCode === "APPOINTMENT_LETTER" ||
//         docTypeCode === "APPOINTMENTLETTER" ||
//         docTypeCode === "APPOINTMENT" ||
//         docTypeName.includes("appointment letter") ||
//         docTypeName.includes("appointment_letter") ||
//         docTypeName.includes("appointmentletter") ||
//         docTypeName === "appointment letter" ||
//         docTypeName === "appointment" ||
//         fileName.includes("appointment") ||
//         fileName.includes("appointment_letter") ||
//         fileName.includes("appointmentletter")
//       ) {
//         documentStatus.appointmentLetter.uploaded = true;
//         documentStatus.appointmentLetter.documentPath = filePath;
//       } else if (
//         docTypeCode === "EMPLOYMENT_CONTRACT" ||
//         docTypeCode === "EMPLOYMENTCONTRACT" ||
//         docTypeCode === "CONTRACT" ||
//         docTypeName.includes("employment contract") ||
//         docTypeName.includes("employment_contract") ||
//         docTypeName.includes("employmentcontract") ||
//         docTypeName === "employment contract" ||
//         docTypeName === "contract" ||
//         fileName.includes("contract") ||
//         fileName.includes("employment") ||
//         fileName.includes("employment_contract") ||
//         fileName.includes("employmentcontract")
//       ) {
//         documentStatus.employmentContract.uploaded = true;
//         documentStatus.employmentContract.documentPath = filePath;
//       } else {
//         console.log("Neither type nor filename matched");
//       }
//     }

//     const missingDocuments = [];
//     const uploadedDocuments = [];

//     Object.entries(documentStatus).forEach(([key, value]) => {
//       if (value.required && !value.uploaded) {
//         missingDocuments.push({ key, name: value.documentName });
//       } else if (value.uploaded) {
//         uploadedDocuments.push({
//           key,
//           name: value.documentName,
//           path: value.documentPath,
//         });
//       }
//     });

//     console.log("\nFinal Document Summary:");
//     console.log(
//       `Uploaded (${uploadedDocuments.length}):`,
//       uploadedDocuments.map((d) => d.name)
//     );
//     console.log(
//       `Missing (${missingDocuments.length}):`,
//       missingDocuments.map((d) => d.name)
//     );

//     return {
//       allRequiredDocumentsUploaded: missingDocuments.length === 0,
//       documentStatus,
//       missingDocuments,
//       uploadedDocuments,
//       totalRequired: 3,
//       totalUploaded: uploadedDocuments.length,
//       summary: `${uploadedDocuments.length}/3 required documents uploaded`,
//     };
//   } catch (error) {
//     console.error("Error verifying candidate documents:", error);
//     return {
//       allRequiredDocumentsUploaded: false,
//       documentStatus: {},
//       missingDocuments: [
//         { key: "unknown", name: "Unable to verify documents" },
//       ],
//       uploadedDocuments: [],
//       totalRequired: 3,
//       totalUploaded: 0,
//       summary: "Unable to verify documents",
//       error: error.message,
//     };
//   }
// };

const REQUIRED_DOCUMENTS = {
  OFFER_LETTER: {
    name: "Offer Letter",
    codes: ["OFFER_LETTER", "OFFERLETTER", "OFFERLETTER", "OFFERLETTER"],
    namePatterns: [
      "offer letter",
      "offer_letter",
      "offerletter",
      "offerletter",
    ],
    filePatterns: [
      "offer letter",
      "offer_letter",
      "offerletter",
      "offerletter",
    ],
    excludePatterns: [
      "contract",
      "employment",
      "employment_contract",
      "employmentcontract",
    ],
    required: true,
  },
  APPOINTMENT_LETTER: {
    name: "Appointment Letter",
    codes: [
      "APPOINTMENT_LETTER",
      "APPOINTMENTLETTER",
      "APPOINTMENTLETTER",
      "APPOINTMENTLETTER",
    ],
    namePatterns: [
      "appointment letter",
      "appointment_letter",
      "appointmentletter",
      "appointmentletter",
    ],
    filePatterns: [
      "appointment letter",
      "appointment_letter",
      "appointmentletter",
      "appointmentletter",
    ],
    excludePatterns: [
      "contract",
      "employment",
      "employment_contract",
      "employmentcontract",
    ],
    required: true,
  },
  EMPLOYMENT_CONTRACT: {
    name: "Employment Contract",
    codes: [
      "EMPLOYMENT_CONTRACT",
      "EMPLOYMENTCONTRACT",
      "CONTRACT",
      "CONTRACT",
    ],
    namePatterns: [
      "employment contract",
      "employment_contract",
      "employmentcontract",
      "employmentcontract",
    ],
    filePatterns: [
      "employment contract",
      "employment_contract",
      "employmentcontract",
      "employmentcontract",
    ],
    excludePatterns: [
      "offer letter",
      "appointment letter",
      "appointment letter",
      "appointment letter",
    ],
    required: true,
  },
};

const verifyCandidateDocuments = async (candidateId) => {
  try {
    console.log("Searching for candidate_id:", candidateId);
    console.log("Type of candidateId:", typeof candidateId);

    const documents = await prisma.hrms_d_candidate_documents.findMany({
      where: {
        candidate_id: candidateId,
        log_inst: 1,
      },
      include: {
        candidate_documents_type: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdate: "desc",
      },
    });

    console.log("All documents found:", documents?.length || 0);
    console.log("Documents:", JSON.stringify(documents, null, 2));

    const documentsWithPath =
      documents?.filter((doc) => doc.path !== null && doc.path !== "") || [];
    console.log("Documents with path:", documentsWithPath.length);

    const uploadedDocuments = documentsWithPath.map((doc) => ({
      id: doc.id,
      name: doc.name || "Unnamed Document",
      path: doc.path,
      status: doc.status || "Pending",
      typeName: doc.candidate_documents_type?.name || "Unknown Type",
      typeCode: doc.candidate_documents_type?.code || null,
      expiryDate: doc.expiry_date,
      remarks: doc.remarks,
    }));

    const documentCount = uploadedDocuments.length;
    const hasAnyDocument = documentCount > 0;

    let summary;
    if (documentCount === 0) {
      summary = "No documents have been uploaded";
    } else if (documentCount === 1) {
      summary = "1 document uploaded";
    } else {
      summary = `${documentCount} documents uploaded`;
    }

    const result = {
      uploadedDocuments,
      documentCount,
      hasAnyDocument,
      summary,
    };

    console.log("Verification result:", JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error("Error in verifyCandidateDocuments:", error);
    const fallbackResult = {
      uploadedDocuments: [],
      documentCount: 0,
      hasAnyDocument: false,
      summary: `Error loading documents: ${error.message}`,
    };

    console.log("Returning fallback result:", fallbackResult);
    return fallbackResult;
  }
};

const getCandidateDocumentVerificationStatus = async (candidateId) => {
  try {
    if (!candidateId || isNaN(parseInt(candidateId))) {
      throw new CustomError("Invalid candidate ID", 400);
    }

    const candidate = await prisma.hrms_d_candidate_master.findUnique({
      where: { id: parseInt(candidateId) },
      select: {
        id: true,
        candidate_code: true,
        full_name: true,
        email: true,
        status: true,
        job_posting: true,
      },
    });

    if (!candidate) {
      throw new CustomError("Candidate not found", 404);
    }

    if (candidate.status === "Converted") {
      return {
        success: true,
        candidateId: parseInt(candidateId),
        candidateCode: candidate.candidate_code,
        candidateName: candidate.full_name,
        status: candidate.status,
        canConvert: false,
        message: "This candidate has already been converted to an employee",
        documentStatus: null,
      };
    }

    const isEligibleForConversion = candidate.status === "A";

    let assignedDocumentTypes = [];
    if (candidate.job_posting) {
      const jobPosting = await prisma.hrms_d_job_posting.findUnique({
        where: { id: parseInt(candidate.job_posting) },
        select: { document_type_id: true },
      });

      if (jobPosting?.document_type_id) {
        const documentTypeIds = jobPosting.document_type_id
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));

        if (documentTypeIds.length > 0) {
          assignedDocumentTypes = await prisma.hrms_m_document_type.findMany({
            where: {
              id: { in: documentTypeIds },
              is_active: "Y",
            },
            select: {
              id: true,
              name: true,
              code: true,
            },
          });
        }
      }
    }

    const uploadedDocs = await prisma.hrms_d_candidate_documents.findMany({
      where: {
        candidate_id: parseInt(candidateId),
        path: { not: null, not: "" },
      },
      include: {
        candidate_documents_type: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const uploadedDocuments = uploadedDocs.map((doc) => ({
      id: doc.id,
      name: doc.name || "Unnamed Document",
      path: doc.path,
      status: doc.status || "Approved",
      typeName: doc.candidate_documents_type?.name || "Unknown Type",
      typeCode: doc.candidate_documents_type?.code || null,
      typeId: doc.type_id,
      expiryDate: doc.expiry_date,
      remarks: doc.remarks,
    }));

    const uploadedTypeIds = new Set(uploadedDocuments.map((doc) => doc.typeId));

    const documents = [];
    const missingDocuments = [];

    uploadedDocuments.forEach((doc, index) => {
      documents.push({
        id: index + 1,
        name: doc.name,
        typeName: doc.typeName,
        typeCode: doc.typeCode,
        isUploaded: true,
        status: "Uploaded",
        statusCode: "UPLOADED",
        filePath: doc.path,
        message: "Document has been uploaded",
      });
    });

    assignedDocumentTypes.forEach((docType) => {
      if (!uploadedTypeIds.has(docType.id)) {
        documents.push({
          id: null,
          name: null,
          typeName: docType.name,
          typeCode: docType.code,
          isUploaded: false,
          status: "Missing",
          statusCode: "MISSING",
          filePath: null,
          message: "Document not uploaded",
        });

        missingDocuments.push({
          typeName: docType.name,
          typeCode: docType.code,
          isRequired: true,
        });
      }
    });

    const totalAssigned = assignedDocumentTypes.length;
    const totalUploaded = uploadedDocuments.length;
    const totalMissing = missingDocuments.length;
    const hasMissingDocuments = totalMissing > 0;

    let summary;
    if (totalAssigned === 0) {
      summary = "No documents assigned";
    } else if (totalMissing === 0) {
      summary = `All ${totalUploaded} documents uploaded`;
    } else {
      summary = `${totalUploaded} of ${totalAssigned} documents uploaded, ${totalMissing} missing`;
    }

    let eligibilityMessage = null;
    if (!isEligibleForConversion) {
      eligibilityMessage = `Candidate status is "${candidate.status}". Status must be "A" (Approved/Hired) to convert to employee.`;
    }

    let warning = null;
    if (hasMissingDocuments) {
      warning = `${totalMissing} required document${
        totalMissing > 1 ? "s are" : " is"
      } missing`;
    }

    return {
      success: true,
      candidateId: parseInt(candidateId),
      candidateCode: candidate.candidate_code,
      candidateName: candidate.full_name,
      candidateEmail: candidate.email,
      candidateStatus: candidate.status,

      isEligibleForConversion,
      eligibilityMessage,
      canConvert: isEligibleForConversion,

      documentSummary: {
        totalAssigned,
        totalUploaded,
        totalMissing,
        hasDocuments: totalUploaded > 0,
        hasMissingDocuments,
        summary,
      },

      documents,

      uploadedDocuments: uploadedDocuments,

      missingDocuments:
        missingDocuments.length > 0 ? missingDocuments : undefined,

      warning,
      message: hasMissingDocuments
        ? `${totalUploaded} of ${totalAssigned} documents uploaded. Please upload missing documents.`
        : summary,
    };
  } catch (error) {
    console.error("Error getting document verification status:", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(
      `Error getting document verification status: ${error.message}`,
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
  getCandidateDocumentVerificationStatus,
  REQUIRED_DOCUMENTS,
  generateEmployeeCode,
};
