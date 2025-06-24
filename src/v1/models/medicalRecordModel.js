const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize medical record data
const serializeMedicalRecordData = (data) => ({
  employee_id: data.employee_id ? Number(data.employee_id) : null,
  record_type: data.record_type || null,
  description: data.description || null,
  record_date: data.record_date ? new Date(data.record_date) : null,
  document_path: data.document_path || null,
  doctor_name: data.doctor_name || null,
  hospital_name: data.hospital_name || null,
  diagnosis: data.diagnosis || null,
  treatment: data.treatment || null,
  next_review_date: data.next_review_date
    ? new Date(data.next_review_date)
    : null,
  prescription_path: data.prescription_path || null,
});

// Create medical records
const createMedicalRecord = async (data) => {
  try {
    const reqData = await prisma.hrms_d_medical_record.create({
      data: {
        ...serializeMedicalRecordData(data),
        createdby: data.createdby || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
      include: {
        medical_employee_id: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return reqData;
  } catch (error) {
    throw new CustomError(
      `Error creating medical record: ${error.message}`,
      500
    );
  }
};

// Find medical record by ID
const findMedicalRecord = async (id) => {
  try {
    const record = await prisma.hrms_d_medical_record.findUnique({
      where: { id: parseInt(id) },
    });
    if (!record) {
      throw new CustomError("Medical record not found", 404);
    }
    return record;
  } catch (error) {
    throw new CustomError(
      `Error finding medical record by ID: ${error.message}`,
      503
    );
  }
};

// Update medical record
const updateMedicalRecord = async (id, data) => {
  try {
    const updated = await prisma.hrms_d_medical_record.update({
      where: { id: parseInt(id) },
      data: {
        ...serializeMedicalRecordData(data),
        updatedby: data.updatedby || 1,
        updatedate: new Date(),
      },
      include: {
        medical_employee_id: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });
    return updated;
  } catch (error) {
    throw new CustomError(
      `Error updating medical record: ${error.message}`,
      500
    );
  }
};

// Delete medical record
const deleteMedicalRecord = async (id) => {
  try {
    await prisma.hrms_d_medical_record.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    throw new CustomError(
      `Error deleting medical record: ${error.message}`,
      500
    );
  }
};

// Get all medical records with pagination and search
const getAllMedicalRecord = async (search, page, size, startDate, endDate) => {
  try {
    page = !page || page <= 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

    if (search) {
      filters.OR = [
        {
          medical_employee_id: {
            full_name: { contains: search.toLowerCase() },
          },
        },
        { record_type: { contains: search.toLowerCase() } },
        { doctor_name: { contains: search.toLowerCase() } },
        { hospital_name: { contains: search.toLowerCase() } },
        { diagnosis: { contains: search.toLowerCase() } },
        { treatment: { contains: search.toLowerCase() } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end)) {
        filters.record_date = {
          gte: start,
          lte: end,
        };
      }
    }

    const data = await prisma.hrms_d_medical_record.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        medical_employee_id: {
          select: {
            id: true,
            employee_code: true,
            full_name: true,
          },
        },
      },
    });

    const totalCount = await prisma.hrms_d_medical_record.count({
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
    throw new CustomError(
      `Error retrieving medical records: ${error.message}`,
      503
    );
  }
};

module.exports = {
  createMedicalRecord,
  findMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getAllMedicalRecord,
};
