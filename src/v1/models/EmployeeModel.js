const CustomError = require("../../utils/CustomError");
const { prisma } = require("../../utils/prismaProxy.js");
const moment = require("moment");
const { se } = require("date-fns/locale");

/**
 * Handles transaction notifications for employee operations
 * @param {string} tableName - The name of the table being modified
 * @param {string} transactionType - The type of transaction (C=Create, U=Update, D=Delete)
 * @param {number} recordId - The ID of the affected record
 */
const handleTransactionNotification = async (
  tableName,
  transactionType,
  recordId,
) => {
  try {
    await prisma.$queryRaw`
      EXEC sp_hrms_transaction_notification 
      @table_name = ${tableName},
      @transaction_type = ${transactionType},
      @id = ${recordId}
    `;
    console.log("Hurray! Transaction Executed.");
  } catch (error) {
    console.error("Error in transaction notification:", error);
  }
};

const safeFileUpload = async (uploadFunction, file, fieldName) => {
  if (!file) return null;

  try {
    const result = await uploadFunction(file);
    console.log(`Successfully uploaded ${fieldName}`);
    return result;
  } catch (error) {
    console.error(`Failed to upload ${fieldName}:`, error.message);
    return null;
  }
};

const handleFileUploads = async (files, uploadFunction) => {
  const uploadResults = {
    profile_pic: null,
    nssf_file: null,
    nida_file: null,
    uploadErrors: [],
  };

  if (!files) return uploadResults;

  if (files.profile_pic) {
    uploadResults.profile_pic = await safeFileUpload(
      uploadFunction,
      files.profile_pic,
      "profile_pic",
    );
    if (!uploadResults.profile_pic && files.profile_pic) {
      uploadResults.uploadErrors.push("profile_pic");
    }
  }

  if (files.nssf_file) {
    uploadResults.nssf_file = await safeFileUpload(
      uploadFunction,
      files.nssf_file,
      "nssf_file",
    );
    if (!uploadResults.nssf_file && files.nssf_file) {
      uploadResults.uploadErrors.push("nssf_file");
    }
  }

  if (files.nida_file) {
    uploadResults.nida_file = await safeFileUpload(
      uploadFunction,
      files.nida_file,
      "nida_file",
    );
    if (!uploadResults.nida_file && files.nida_file) {
      uploadResults.uploadErrors.push("nida_file");
    }
  }

  return uploadResults;
};

const serializeTags = (data) => {
  const serialized = {};

  if ("first_name" in data) serialized.first_name = data.first_name;
  if ("last_name" in data) serialized.last_name = data.last_name;
  if ("first_name" in data || "last_name" in data)
    serialized.full_name = `${data.first_name || ""} ${
      data.last_name || ""
    }`.trim();
  if ("shift_id" in data) {
    serialized.employee_shift_id = {
      connect: { id: Number(data.shift_id) },
    };
  }
  if ("gender" in data) serialized.gender = data.gender;
  if ("date_of_birth" in data)
    serialized.date_of_birth = data.date_of_birth
      ? moment(data.date_of_birth)
      : null;
  if ("national_id_number" in data)
    serialized.national_id_number = data.national_id_number;
  if ("currency_id" in data) {
    serialized.employee_currency = {
      connect: { id: Number(data.currency_id || 23) },
    };
  }

  if ("nationality" in data) serialized.nationality = data.nationality;
  if ("passport_issue_date" in data)
    serialized.passport_issue_date = data.passport_issue_date
      ? moment(data.passport_issue_date).toDate()
      : null;
  if ("passport_expiry_date" in data)
    serialized.passport_expiry_date = moment(
      data.passport_expiry_date,
    ).toDate();
  if ("passport_number" in data)
    serialized.passport_number = data.passport_number;
  if ("address" in data) serialized.address = data.address;
  if ("employment_type" in data)
    serialized.employment_type = data.employment_type;
  if ("employee_category" in data)
    serialized.employee_category = data.employee_category;
  if ("join_date" in data)
    serialized.join_date = data.join_date ? moment(data.join_date) : null;
  if ("confirm_date" in data)
    serialized.confirm_date = data.confirm_date
      ? moment(data.confirm_date)
      : null;
  if ("resign_date" in data)
    serialized.resign_date = data.resign_date ? moment(data.resign_date) : null;
  if ("ifsc" in data) serialized.ifsc = data.ifsc;
  if ("account_holder_name" in data)
    serialized.account_holder_name = data.account_holder_name;
  if ("account_number" in data) serialized.account_number = data.account_number;
  if ("work_location" in data) serialized.work_location = data.work_location;
  if ("email" in data) serialized.email = data.email;
  if ("phone_number" in data) serialized.phone_number = data.phone_number;
  if ("status" in data) serialized.status = data.status;

  if ("profile_pic" in data && data.profile_pic !== undefined) {
    serialized.profile_pic = data.profile_pic;
  }
  if ("column_one" in data && data.column_one !== undefined) {
    serialized.column_one = data.column_one;
  }
  if ("column_two" in data && data.column_two !== undefined) {
    serialized.column_two = data.column_two;
  }

  if ("spouse_name" in data) serialized.spouse_name = data.spouse_name;
  if ("marital_status" in data) serialized.marital_status = data.marital_status;
  if ("no_of_child" in data) serialized.no_of_child = Number(data.no_of_child);
  // if ("social_medias" in data) {
  //   serialized.social_medias = Array.isArray(data.social_medias)
  //     ? JSON.stringify(data.social_medias)
  //     : JSON.stringify([data.social_medias]);
  // }

  if ("social_medias" in data) {
    if (typeof data.social_medias === "string") {
      serialized.social_medias = data.social_medias;
    } else if (
      typeof data.social_medias === "object" &&
      data.social_medias !== null
    ) {
      serialized.social_medias = JSON.stringify(data.social_medias);
    }
  }

  if ("header_attendance_rule" in data)
    serialized.header_attendance_rule = data.header_attendance_rule;
  if ("column_three" in data) serialized.column_three = data.column_three;
  if ("column_four" in data) serialized.column_four = data.column_four;
  // if ("branch_id" in data) serialized.branch_id = data.branch_id;
  if ("father_name" in data) serialized.father_name = data.father_name;
  if ("mother_name" in data) serialized.mother_name = data.mother_name;
  if ("primary_contact_number" in data)
    serialized.primary_contact_number = data.primary_contact_number;
  if ("primary_contact_name" in data)
    serialized.primary_contact_name = data.primary_contact_name;
  if ("primary_contact_relation" in data)
    serialized.primary_contact_relation = data.primary_contact_relation;
  if ("secondary_contact_mumber" in data)
    serialized.secondary_contact_mumber = data.secondary_contact_mumber;
  if ("secondary_contact_name" in data)
    serialized.secondary_contact_name = data.secondary_contact_name;
  if ("secondary_contact_relation" in data)
    serialized.secondary_contact_relation = data.secondary_contact_relation;

  if ("designation_id" in data) {
    serialized.hrms_employee_designation = {
      connect: { id: Number(data.designation_id) },
    };
  }
  if ("department_id" in data) {
    serialized.hrms_employee_department = {
      connect: { id: Number(data.department_id) },
    };
  }
  if ("branch_id" in data) {
    serialized.employee_branch = {
      connect: { id: Number(data.branch_id) },
    };
  }
  // if ("bank_id" in data) {
  //   serialized.hrms_employee_bank = {
  //     connect: { id: Number(data.bank_id) },
  //   };
  // }

if ("bank_id" in data) {
  if (
      data.bank_id === null ||
      data.bank_id === "" ||
      data.bank_id === undefined
    ) {
      serialized.hrms_employee_bank = {
        disconnect: true,
      };
    } else {
      serialized.hrms_employee_bank = {
        connect: { id: Number(data.bank_id) },
      };
    }
  }
  if ("manager_id" in data) {
    serialized.hrms_manager = {
      connect: { id: Number(data.manager_id) },
    };
  }

  return serialized;
};

/**
 * Serializes address data before saving to the database.
 * @param {Object} data - The address data to serialize.
 * @returns {Object} The serialized address data.
 */
const serializeAddress = (data) => {
  return {
    address_type: data?.address_type || "",
    street: data?.street || "",
    street_no: data?.street_no || "",
    building: data?.building || "",
    floor: data?.floor || "",
    city: data?.city || "",
    district: data?.district || "",
    state: Number(data?.state) || null,
    country: Number(data?.country) || null,
    zip_code: data?.zip_code || "",
  };
};

/**
 * Parses employee data after retrieving from the database.
 * @param {Object} data - The employee data to parse.
 * @returns {Object} The parsed employee data.
 */
const parseData = (data) => {
  if (!data) {
    return data;
  }

  if (data.social_medias) {
    try {
      if (typeof data.social_medias === "string") {
        data.social_medias = JSON.parse(data.social_medias);
      }
    } catch (error) {
      console.error("Error parsing social_medias:", error);
      data.social_medias = [];
    }
  }

  return data;
};

const serializeLifeEvent = (data) => {
  const serialized = {};

  if ("event_type_id" in data)
    serialized.event_type_id = data.event_type_id
      ? Number(data.event_type_id)
      : null;
  if ("from_date" in data)
    serialized.from_date = data.from_date
      ? moment(data.from_date).toDate()
      : null;
  if ("to_date" in data)
    serialized.to_date = data.to_date ? moment(data.to_date).toDate() : null;

  return serialized;
};

const createLifeEvents = async (employeeId, events, createdby) => {
  if (!Array.isArray(events) || events.length === 0) return;

  const lifeEvents = await Promise.all(
    events.map((event) => {
      const serializedEvent = serializeLifeEvent(event);

      return prisma.hrms_d_life_event.create({
        data: {
          ...serializedEvent,
          employee_id: employeeId,
          createdate: new Date(),
          createdby: event.createdby || createdby || 1,
          log_inst: event.log_inst || 1,
          is_active: "Y",
        },
      });
    }),
  );

  return lifeEvents;
};

const generateEmployeeCode = async () => {
  try {
    const lastEmployee = await prisma.hrms_d_employee.findFirst({
      where: {
        employee_code: {
          startsWith: "EMP",
        },
      },
      orderBy: {
        id: "desc",
      },
      select: {
        employee_code: true,
      },
    });

    let nextNumber = 1;

    if (lastEmployee && lastEmployee.employee_code) {
      const lastNumber = parseInt(
        lastEmployee.employee_code.replace("EMP", ""),
      );
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const newEmployeeCode = `EMP${nextNumber.toString().padStart(4, "0")}`;

    const existingCode = await prisma.hrms_d_employee.findFirst({
      where: { employee_code: newEmployeeCode },
      select: { employee_code: true },
    });

    if (existingCode) {
      return await generateEmployeeCode();
    }

    return newEmployeeCode;
  } catch (error) {
    console.error("Error generating employee code:", error);
    throw new CustomError("Failed to generate employee code", 500);
  }
};

const getEmployeeCodePreview = async () => {
  try {
    const nextEmployeeCode = await generateEmployeeCode();
    return {
      success: true,
      employee_code: nextEmployeeCode,
    };
  } catch (error) {
    console.error("Error generating employee code preview.:", error);
    throw new CustomError("Failed to generate employee code preview", 500);
  }
};

const createEmployee = async (data, files = null, uploadFunction = null) => {
  const { empAddressData, life_events: lifeEvents, ...employeeData } = data;
  const uploadWarnings = [];

  try {
    if (!data.phone_number) {
      throw new CustomError(`Phone Number is required`, 400);
    }
    if (!data.email) {
      throw new CustomError(`Email is required`, 400);
    }
    // if (!data.employment_type) {
    //   throw new CustomError(`Employment Type is required`, 400);
    // }
    employeeData.employee_code = await generateEmployeeCode();
    if (!data.gender) {
      throw new CustomError(`Gender is required`, 400);
    }
    // if (!data.employment_type) {
    //   throw new CustomError(`Employment Type is required`, 400);
    // }
    if (!data.designation_id) {
      throw new CustomError(`Designation is required`, 400);
    }
    if (!data.department_id) {
      throw new CustomError(`Department is required`, 400);
    }

    const existingEmployee = await prisma.hrms_d_employee.findFirst({
      where: {
        OR: [{ email: data.email }, { phone_number: data.phone_number }],
      },
      select: {
        email: true,
        employee_code: true,
        phone_number: true,
      },
    });

    if (existingEmployee) {
      if (existingEmployee.email === data.email) {
        throw new CustomError(
          `Employee with email ${data.email} already exists`,
          400,
        );
      }
      if (existingEmployee.phone_number === data.phone_number) {
        throw new CustomError(
          `Employee with phone number ${data.phone_number} already exists`,
          400,
        );
      }
    }

    let uploadedFiles = {};
    if (files && uploadFunction) {
      const uploadResults = await handleFileUploads(files, uploadFunction);

      if (uploadResults.profile_pic) {
        employeeData.profile_pic = uploadResults.profile_pic;
      }
      if (uploadResults.nssf_file) {
        employeeData.nssf_file = uploadResults.nssf_file;
      }
      if (uploadResults.nida_file) {
        employeeData.nida_file = uploadResults.nida_file;
      }

      if (uploadResults.uploadErrors.length > 0) {
        uploadResults.uploadErrors.forEach((field) => {
          uploadWarnings.push(
            `Failed to upload ${field}. Employee created without this file.`,
          );
        });
      }

      uploadedFiles = uploadResults;
    }

    const serializedData = serializeTags(employeeData);

    console.log("header_attendance_rule value:", data.header_attendance_rule);

    const employee = await prisma.hrms_d_employee.create({
      data: {
        ...serializedData,
        employee_code: employeeData.employee_code,
        createdate: new Date(),
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });

    if (Array.isArray(empAddressData) && empAddressData.length > 0) {
      const addressDatas = empAddressData.map((addr) => ({
        ...serializeAddress(addr),
        address_type: addr?.address_type || "Home",
        employee_id: employee.id,
      }));

      const batchSize = 10;
      for (let i = 0; i < addressDatas.length; i += batchSize) {
        const batch = addressDatas.slice(i, i + batchSize);
        await prisma.hrms_d_employee_address.createMany({
          data: batch,
        });
      }
    }

    if (Array.isArray(lifeEvents) && lifeEvents.length > 0) {
      await createLifeEvents(employee.id, lifeEvents, data.createdby || 1);
    }

    await handleTransactionNotification("m_employee", "A", employee.id);

    const fullData = await prisma.hrms_d_employee.findFirst({
      where: { id: employee.id },
      include: {
        employee_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
          },
        },
        hrms_employee_address: {
          select: {
            id: true,
            employee_id: true,
            address_name: true,
            address_type: true,
            street: true,
            street_no: true,
            building: true,
            floor: true,
            city: true,
            district: true,
            state: true,
            country: true,
            zip_code: true,
            employee_state: {
              select: {
                id: true,
                name: true,
              },
            },
            employee_country: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        hrms_employee_designation: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        employee_branch: {
          select: {
            id: true,
            branch_name: true,
            location: true,
          },
        },
        hrms_employee_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
        hrms_employee_bank: {
          select: {
            id: true,
            bank_name: true,
          },
        },
        employee_shift_id: {
          select: {
            id: true,
            shift_name: true,
          },
        },
        hrms_manager: {
          select: {
            id: true,
            full_name: true,
          },
        },
        life_event_employee: {
          include: {
            life_event_type: {
              select: {
                id: true,
                event_type_name: true,
              },
            },
          },
        },
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
    });

    const result = parseData(fullData);

    if (uploadWarnings.length > 0) {
      result._uploadWarnings = uploadWarnings;
    }

    return result;
  } catch (error) {
    console.log("Error to Create employee : ", error);
    if (error instanceof CustomError) {
      throw error;
    }

    if (error.code === "P2002") {
      throw new CustomError(
        `A unique constraint would be violated. An employee with the same unique fields already exists.`,
        400,
      );
    }

    throw new CustomError(
      `Error creating employee: ${error.message}`,
      error.status || 500,
    );
  }
};

/**
 * Updates an existing employee and associated addresses.
 * Handles file uploads gracefully - continues even if uploads fail.
 * @param {number} id - The employee ID.
 * @param {Object} data - The updated employee data, including empAddressData.
 * @param {Object} files - Optional file uploads (profile_pic, nssf_file, nida_file)
 * @param {Function} uploadFunction - Optional upload function for handling file uploads
 * @returns {Promise<Object>} The updated employee data with upload warnings if any.
 * @throws {CustomError} If update fails.
 */
const updateEmployee = async (
  id,
  data,
  files = null,
  uploadFunction = null,
) => {
  const { empAddressData, life_events: lifeEvents, ...employeeData } = data;
  const uploadWarnings = [];

  try {
    const currentEmployee = await prisma.hrms_d_employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_employee_address: true,
      },
    });

    if (!currentEmployee) {
      throw new CustomError("Employee not found", 404);
    }

    if (files && uploadFunction) {
      const uploadResults = await handleFileUploads(files, uploadFunction);

      if (uploadResults.profile_pic) {
        employeeData.profile_pic = uploadResults.profile_pic;
      } else if (files.profile_pic) {
        uploadWarnings.push(
          `Failed to upload profile_pic. Keeping existing file.`,
        );
      }

      if (uploadResults.nssf_file) {
        employeeData.nssf_file = uploadResults.nssf_file;
      } else if (files.nssf_file) {
        uploadWarnings.push(
          `Failed to upload nssf_file. Keeping existing file.`,
        );
      }

      if (uploadResults.nida_file) {
        employeeData.nida_file = uploadResults.nida_file;
      } else if (files.nida_file) {
        uploadWarnings.push(
          `Failed to upload nida_file. Keeping existing file.`,
        );
      }
    }

    const updatedData = {
      ...employeeData,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };

    const serializedData = serializeTags(updatedData);

    const employee = await prisma.hrms_d_employee.update({
      where: { id: parseInt(id) },
      data: serializedData,
    });

    if (Array.isArray(empAddressData) && empAddressData.length > 0) {
      const newAddresses = empAddressData.filter((addr) => !addr.id);
      const existingAddresses = empAddressData.filter((addr) => addr.id);

      const currentAddressIds = currentEmployee.hrms_employee_address.map(
        (a) => a.id,
      );

      const keepAddressIds = existingAddresses.map((a) => a.id);

      const deleteAddressIds = currentAddressIds.filter(
        (id) => !keepAddressIds.includes(id),
      );

      if (deleteAddressIds.length > 0) {
        await prisma.hrms_d_employee_address.deleteMany({
          where: { id: { in: deleteAddressIds } },
        });
      }

      for (const addr of existingAddresses) {
        await prisma.hrms_d_employee_address.update({
          where: { id: addr.id },
          data: serializeAddress(addr),
        });
      }

      if (newAddresses.length > 0) {
        await prisma.hrms_d_employee_address.createMany({
          data: newAddresses.map((addr) => ({
            ...serializeAddress(addr),
            employee_id: parseInt(id),
          })),
        });
      }
    }

    if (Array.isArray(lifeEvents) && lifeEvents.length > 0) {
      await updateLifeEvents(parseInt(id), lifeEvents, data.updatedby || 1);
    }

    await handleTransactionNotification("m_employee", "U", parseInt(id));

    const updatedEmp = await prisma.hrms_d_employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        employee_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
          },
        },
        hrms_employee_address: {
          select: {
            id: true,
            employee_id: true,
            address_name: true,
            address_type: true,
            street: true,
            street_no: true,
            building: true,
            floor: true,
            city: true,
            district: true,
            state: true,
            country: true,
            zip_code: true,
            employee_state: {
              select: {
                id: true,
                name: true,
              },
            },
            employee_country: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        hrms_employee_designation: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        hrms_employee_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
        hrms_employee_bank: {
          select: {
            id: true,
            bank_name: true,
          },
        },
        employee_branch: {
          select: {
            id: true,
            branch_name: true,
            location: true,
          },
        },
        employee_shift_id: {
          select: {
            id: true,
            shift_name: true,
          },
        },
        hrms_manager: {
          select: {
            id: true,
            full_name: true,
          },
        },
        life_event_employee: {
          include: {
            life_event_type: {
              select: {
                id: true,
                event_type_name: true,
              },
            },
          },
        },
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
    });

    const result = parseData(updatedEmp);

    if (uploadWarnings.length > 0) {
      result._uploadWarnings = uploadWarnings;
    }

    return result;
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);

    if (error instanceof CustomError) {
      throw error;
    }

    if (error.message && error.message.includes("No tenant database context")) {
      throw new CustomError(
        "Database context error. Please ensure you are authenticated.",
        500,
      );
    }

    if (error.code === "P2001") {
      throw new CustomError(`Employee with ID ${id} not found`, 404);
    }

    if (error.code === "P2002") {
      throw new CustomError(
        `A unique constraint would be violated. An employee with the same unique fields already exists.`,
        400,
      );
    }

    throw new CustomError(
      `Error updating employee: ${error.message || "Unknown error"}`,
      error.status || 500,
    );
  }
};

const updateLifeEvents = async (employeeId, events, updatedby) => {
  if (!Array.isArray(events) || events.length === 0) return;

  const newEvents = events.filter((event) => !event.id);
  const existingEvents = events.filter((event) => event.id);

  const currentEvents = await prisma.hrms_d_life_event.findMany({
    where: { employee_id: employeeId },
    select: { id: true },
  });

  const currentEventIds = currentEvents.map((e) => e.id);
  const keepEventIds = existingEvents.map((e) => e.id);
  const deleteEventIds = currentEventIds.filter(
    (id) => !keepEventIds.includes(id),
  );

  if (deleteEventIds.length > 0) {
    await prisma.hrms_d_life_event.deleteMany({
      where: { id: { in: deleteEventIds } },
    });
  }

  await Promise.all(
    existingEvents.map((event) => {
      const serializedEvent = serializeLifeEvent(event);

      return prisma.hrms_d_life_event.update({
        where: { id: event.id },
        data: {
          ...serializedEvent,
          updatedate: new Date(),
          updatedby: event.updatedby || updatedby || 1,
        },
      });
    }),
  );

  if (newEvents.length > 0) {
    await createLifeEvents(employeeId, newEvents, updatedby);
  }
};

const findEmployeeById = async (id) => {
  try {
    if (!id) {
      throw new CustomError("Employee ID is required", 400);
    }

    const employeeId = parseInt(id);
    if (isNaN(employeeId)) {
      throw new CustomError(`Invalid employee ID: ${id}`, 400);
    }

    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: employeeId },
      include: {
        employee_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
          },
        },
        hrms_employee_address: {
          select: {
            id: true,
            employee_id: true,
            address_name: true,
            address_type: true,
            street: true,
            street_no: true,
            building: true,
            floor: true,
            city: true,
            district: true,
            state: true,
            country: true,
            zip_code: true,
            employee_state: {
              select: {
                id: true,
                name: true,
              },
            },
            employee_country: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        hrms_employee_designation: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        hrms_employee_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
        hrms_employee_bank: {
          select: {
            id: true,
            bank_name: true,
          },
        },
        hrms_manager: {
          select: {
            id: true,
            full_name: true,
          },
        },
        life_event_employee: {
          include: {
            life_event_type: {
              select: {
                id: true,
                event_type_name: true,
              },
            },
          },
        },
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
    });

    if (!employee) {
      throw new CustomError(`Employee with ID ${employeeId} not found`, 404);
    }

    return parseData(employee);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }

    if (error.code === "P2001") {
      throw new CustomError(`Employee with ID ${id} not found`, 404);
    }

    if (error.message && error.message.includes("No tenant database context")) {
      throw new CustomError(
        "Database context error. Please ensure you are authenticated.",
        500,
      );
    }

    throw new CustomError(
      `Error finding employee by ID: ${error.message || "Unknown error"}`,
      error.status || 500,
    );
  }
};

// const getAllEmployee = async (
//   page,
//   size,
//   search,
//   startDate,
//   endDate,
//   status
// ) => {
//   try {
//     if (!page || page === 0) {
//       page = 1;
//     }
//     size = size || 10;
//     const skip = (page - 1) * size;

//     const filters = {};

//     if (search) {
//       const lowerSearch = search.toLowerCase();
//       filters.OR = [
//         {
//           hrms_employee_designation: {
//             designation_name: { contains: lowerSearch },
//           },
//         },
//         {
//           hrms_employee_department: {
//             department_name: { contains: lowerSearch },
//           },
//         },
//         { first_name: { contains: lowerSearch } },
//         { full_name: { contains: lowerSearch } },
//         { employee_code: { contains: lowerSearch } },
//       ];
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filters.createdate = { gte: start, lte: end };
//       }
//     }

//     if (status !== undefined && status !== "") {
//       filters.status = status;
//     }

//     const employees = await prisma.hrms_d_employee.findMany({
//       where: filters,
//       skip,
//       take: size,
//       include: {
//         employee_currency: {
//           select: {
//             id: true,
//             currency_name: true,
//             currency_code: true,
//           },
//         },
//         hrms_employee_address: {
//           include: {
//             employee_state: { select: { id: true, name: true } },
//             employee_country: { select: { id: true, name: true } },
//           },
//         },
//         hrms_employee_designation: {
//           select: { id: true, designation_name: true },
//         },
//         hrms_employee_department: {
//           select: { id: true, department_name: true },
//         },
//         employee_shift_id: {
//           select: {
//             id: true,
//             shift_name: true,
//           },
//         },
//         hrms_employee_bank: {
//           select: { id: true, bank_name: true },
//         },
//         life_event_employee: {
//           include: {
//             life_event_type: {
//               select: {
//                 id: true,
//                 event_type_name: true,
//               },
//             },
//           },
//         },
//         experiance_of_employee: true,
//         eduction_of_employee: true,
//       },
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//     });

//     const totalCount = await prisma.hrms_d_employee.count({
//       where: filters,
//     });

//     return {
//       data: employees,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     console.error("Error employee get : ", error);
//     throw new CustomError("Error retrieving employees", 503);
//   }
// };

const getAllEmployee = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status,
  managerId,
  userRole,
) => {
  try {
    if (!page || page === 0) {
      page = 1;
    }
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

    const adminRoles = [
      "admin",
      "Admin",
      "ADMIN",
      "Super Admin",
      "super admin",
      "superadmin",
      "SuperAdmin",
    ];

    let actualRoleName = userRole;

    if (typeof userRole === "number" || !isNaN(Number(userRole))) {
      const roleData = await prisma.hrms_m_role.findUnique({
        where: { id: Number(userRole) },
        select: { role_name: true },
      });
      actualRoleName = roleData?.role_name || null;
      console.log("Fetched role name from DB:", actualRoleName);
    }

    const isAdmin = adminRoles.some(
      (role) => role.toLowerCase() === actualRoleName?.toLowerCase()?.trim(),
    );

    console.log("User Role ID:", userRole);
    console.log("Actual Role Name:", actualRoleName);
    console.log("Is Admin:", isAdmin);
    if (managerId && !isAdmin) {
      filters.manager_id = parseInt(managerId);
      console.log("Applying manager filter for employee_id:", managerId);
    } else {
      console.log("Admin user - showing all employees");
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      filters.OR = [
        {
          hrms_employee_designation: {
            designation_name: { contains: lowerSearch },
          },
        },
        {
          hrms_employee_department: {
            department_name: { contains: lowerSearch },
          },
        },
        { first_name: { contains: lowerSearch } },
        { full_name: { contains: lowerSearch } },
        { employee_code: { contains: lowerSearch } },
      ];
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filters.createdate = { gte: start, lte: end };
      }
    }

    if (status !== undefined && status !== "" && status !== null) {
      filters.status = status;
    }

    console.log("Final filters:", JSON.stringify(filters, null, 2));

    const employees = await prisma.hrms_d_employee.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        employee_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
          },
        },
        hrms_employee_address: {
          select: {
            id: true,
            employee_id: true,
            address_name: true,
            address_type: true,
            street: true,
            street_no: true,
            building: true,
            floor: true,
            city: true,
            district: true,
            state: true,
            country: true,
            zip_code: true,
            employee_state: { select: { id: true, name: true } },
            employee_country: { select: { id: true, name: true } },
          },
        },
        hrms_employee_designation: {
          select: { id: true, designation_name: true },
        },
        hrms_employee_department: {
          select: { id: true, department_name: true },
        },
        employee_shift_id: {
          select: {
            id: true,
            shift_name: true,
          },
        },
        employee_branch: {
          select: {
            id: true,
            branch_name: true,
            location: true,
          },
        },
        hrms_employee_bank: {
          select: { id: true, bank_name: true },
        },
        hrms_manager: {
          select: {
            id: true,
            full_name: true,
            employee_code: true,
          },
        },
        life_event_employee: {
          include: {
            life_event_type: {
              select: {
                id: true,
                event_type_name: true,
              },
            },
          },
        },
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_employee.count({
      where: filters,
    });

    console.log("Employees found:", employees.length);
    console.log("Total count:", totalCount);

    return {
      data: employees,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
      filterApplied: isAdmin ? "all" : "manager",
      userRole: actualRoleName,
    };
  } catch (error) {
    console.error("Error employee get:", error);
    throw new CustomError(`Error retrieving employees: ${error.message}`, 503);
  }
};

const employeeOptions = async () => {
  try {
    const employees = await prisma.hrms_d_employee.findMany({
      where: { status: "Active" },
      select: {
        id: true,
        full_name: true,
        employee_code: true,
        department_id: true,
        designation_id: true,
        currency_id: true,
        email: true,
        profile_pic: true,
        hrms_employee_department: {
          select: {
            id: true,
            department_name: true,
          },
        },
        hrms_employee_designation: {
          select: {
            id: true,
            designation_name: true,
          },
        },
        employee_branch: {
          select: {
            id: true,
            branch_name: true,
            location: true,
          },
        },
      },
    });
    return employees.map(
      ({
        id,
        full_name,
        employee_code,
        department_id,
        designation_id,
        currency_id,
        email,
        profile_pic,
        hrms_employee_department,
        hrms_employee_designation,
        employee_branch,
      }) => ({
        value: id,
        label: `${full_name} (${employee_code})`,
        employee_code,
        meta: {
          department_id,
          designation_id,
          currency_id: currency_id || null,
          email,
          profile_pic,
          department: hrms_employee_department?.department_name,
          designation: hrms_employee_designation?.designation_name,
          branch: employee_branch,
        },
      }),
    );
  } catch (error) {
    console.error("Error retrieving employee options: ", error);
    throw new CustomError("Error retrieving employees", 503);
  }
};

const deleteEmployee = async (id) => {
  try {
    const employeeId = parseInt(id);

    await prisma.$transaction(async (tx) => {
      await tx.hrms_employee_d_experiences.deleteMany({
        where: { employee_id: employeeId },
      });
      await tx.hrms_employee_d_educations.deleteMany({
        where: { employee_id: employeeId },
      });
      await tx.hrms_d_employee_address.deleteMany({
        where: { employee_id: employeeId },
      });

      await tx.hrms_d_loan_request.deleteMany({
        where: { employee_id: employeeId },
      });
      await tx.hrms_d_leave_application.deleteMany({
        where: { employee_id: employeeId },
      });
      await tx.hrms_d_training_feedback.deleteMany({
        where: { employee_id: employeeId },
      });

      const balances = await tx.hrms_d_leave_balance.findMany({
        where: { employee_id: employeeId },
        select: { id: true },
      });
      const balanceIds = balances.map((b) => b.id);

      if (balanceIds.length > 0) {
        await tx.hrms_d_leave_balance_details.deleteMany({
          where: { parent_id: { in: balanceIds } },
        });
        await tx.hrms_d_leave_balance.deleteMany({
          where: { employee_id: employeeId },
        });
      }

      await tx.hrms_d_requests_approval.deleteMany({
        where: { approver_id: employeeId },
      });
      await tx.hrms_d_requests.deleteMany({
        where: { requester_id: employeeId },
      });

      await tx.hrms_d_employee.delete({ where: { id: employeeId } });
    });
  } catch (error) {
    if (error.code === "P2003") {
      throw new CustomError(
        "This record is connected to other data. Please remove that first.",
        400,
      );
    } else {
      console.log("Error in deleting:", error);
      throw new CustomError(error.meta?.constraint || "Delete failed", 500);
    }
  }
};

module.exports = {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  getAllEmployee,
  deleteEmployee,
  employeeOptions,
  handleFileUploads,
  safeFileUpload,
  generateEmployeeCode,
  getEmployeeCodePreview,
};
