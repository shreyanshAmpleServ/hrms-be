const { prisma } = require("../../utils/prismaProxy");
const CustomError = require("../../utils/CustomError");

const serializeCandidateDocument = (data) => ({
  candidate_id: Number(data.candidate_id),
  path: data.path || null,
  name: data.name || null,
  type_id: data.type_id ? Number(data.type_id) : null,
  expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
  status: data.status || "Active",
  remarks: data.remarks || null,
  log_inst: data.log_inst || 1,
});

const createCandidateDocument = async (data) => {
  try {
    const payload = {
      ...serializeCandidateDocument(data),
      createdby: Number(data.createdby) || 1,
      createdate: new Date(),
    };

    const reqData = await prisma.hrms_d_candidate_documents.create({
      data: payload,
      include: {
        candidate_documents_candidate: {
          select: { id: true, full_name: true },
        },
        candidate_documents_type: {
          select: { id: true, name: true },
        },
      },
    });
    return reqData;
  } catch (error) {
    console.log("Error creating candidate document", error);
    throw new CustomError(
      `Error creating candidate document: ${error.message}`,
      500
    );
  }
};

// Create multiple candidate documents (for bulk upload)
const createMultipleCandidateDocuments = async (dataArray) => {
  try {
    const createdRecords = [];

    // Create documents one by one instead of createMany
    for (const data of dataArray) {
      const payload = {
        ...serializeCandidateDocument(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
      };

      const record = await prisma.hrms_d_candidate_documents.create({
        data: payload,
        include: {
          candidate_documents_candidate: {
            select: { id: true, full_name: true },
          },
          candidate_documents_type: {
            select: { id: true, name: true },
          },
        },
      });

      createdRecords.push(record);
    }

    return { count: createdRecords.length, data: createdRecords };
  } catch (error) {
    console.log("Error creating multiple candidate documents", error);
    throw new CustomError(
      `Error creating multiple documents: ${error.message}`,
      500
    );
  }
};

const findCandidateDocument = async (id) => {
  try {
    const reqData = await prisma.hrms_d_candidate_documents.findUnique({
      where: { id: parseInt(id) },
      include: {
        candidate_documents_candidate: {
          select: { id: true, full_name: true },
        },
        candidate_documents_type: {
          select: { id: true, name: true },
        },
      },
    });

    if (!reqData) {
      throw new CustomError("Candidate document not found", 404);
    }
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding candidate document: ${error.message}`,
      503
    );
  }
};

const findCandidateDocumentsByCandidate = async (candidateId) => {
  try {
    const reqData = await prisma.hrms_d_candidate_documents.findMany({
      where: { candidate_id: parseInt(candidateId) },
      include: {
        candidate_documents_candidate: {
          select: { id: true, full_name: true },
        },
        candidate_documents_type: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdate: "desc" },
    });

    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error finding documents for candidate: ${error.message}`,
      503
    );
  }
};

const updateCandidateDocument = async (id, data) => {
  try {
    const payload = {
      ...serializeCandidateDocument(data),
      updatedby: Number(data.updatedby) || 1,
      updatedate: new Date(),
    };

    const updatedDoc = await prisma.hrms_d_candidate_documents.update({
      where: { id: parseInt(id) },
      data: payload,
      include: {
        candidate_documents_candidate: {
          select: { id: true, full_name: true },
        },
        candidate_documents_type: {
          select: { id: true, name: true },
        },
      },
    });

    return updatedDoc;
  } catch (error) {
    throw new CustomError(
      `Error updating candidate document: ${error.message}`,
      500
    );
  }
};

const deleteCandidateDocument = async (id) => {
  try {
    const deletedDoc = await prisma.hrms_d_candidate_documents.delete({
      where: { id: parseInt(id) },
    });

    return deletedDoc;
  } catch (error) {
    if (error.code === "P2025") {
      throw new CustomError("Candidate document not found", 404);
    } else {
      throw new CustomError(
        `Error deleting candidate document: ${error.message}`,
        500
      );
    }
  }
};

const deleteMultipleCandidateDocuments = async (documentIds) => {
  try {
    const result = await prisma.hrms_d_candidate_documents.deleteMany({
      where: {
        id: { in: documentIds.map((id) => parseInt(id)) },
      },
    });

    return result;
  } catch (error) {
    throw new CustomError(`Error deleting documents: ${error.message}`, 500);
  }
};

const getAllCandidateDocument = async (
  search,
  page = 1,
  size = 10,
  startDate,
  endDate,
  candidateId,
  typeId,
  status
) => {
  try {
    const skip = (page - 1) * size;
    const whereClause = {};

    if (candidateId) whereClause.candidate_id = parseInt(candidateId);
    if (typeId) whereClause.type_id = parseInt(typeId);
    if (status) whereClause.status = status;

    if (startDate || endDate) {
      whereClause.createdate = {};
      if (startDate) whereClause.createdate.gte = startDate.toDate();
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.createdate.lte = endOfDay;
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search.toLowerCase() } },
        { remarks: { contains: search.toLowerCase() } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.hrms_d_candidate_documents.findMany({
        where: whereClause,
        include: {
          candidate_documents_candidate: {
            select: { id: true, full_name: true },
          },
          candidate_documents_type: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: size,
        orderBy: { createdate: "desc" },
      }),
      prisma.hrms_d_candidate_documents.count({ where: whereClause }),
    ]);

    return {
      data,
      pagination: {
        page,
        size,
        total,
        pages: Math.ceil(total / size),
      },
    };
  } catch (error) {
    console.log("Error retrieving candidate documents", error);
    throw new CustomError("Error retrieving candidate documents", 400);
  }
};

module.exports = {
  createCandidateDocument,
  createMultipleCandidateDocuments,
  findCandidateDocument,
  findCandidateDocumentsByCandidate,
  updateCandidateDocument,
  deleteCandidateDocument,
  deleteMultipleCandidateDocuments,
  getAllCandidateDocument,
};
