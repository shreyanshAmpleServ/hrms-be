const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
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
  recordId
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
    // We don't throw here to prevent disrupting the main operation
  }
};

/**
 * Serializes employee data before saving to the database.
 * @param {Object} data - The employee data to serialize.
 * @returns {Object} The serialized employee data.
 */
const serializeTags = (data) => {
  const serialized = {};

  if ("employee_code" in data) serialized.employee_code = data.employee_code;
  if ("first_name" in data) serialized.first_name = data.first_name;
  if ("last_name" in data) serialized.last_name = data.last_name;
  if ("first_name" in data || "last_name" in data)
    serialized.full_name = `${data.first_name || ""} ${
      data.last_name || ""
    }`.trim();
  if ("shift_id" in data) serialized.shift_id = Number(data.shift_id) || null;

  if ("gender" in data) serialized.gender = data.gender;
  if ("date_of_birth" in data)
    serialized.date_of_birth = data.date_of_birth
      ? moment(data.date_of_birth)
      : null;
  if ("national_id_number" in data)
    serialized.national_id_number = data.national_id_number;
  if ("nationality" in data) serialized.nationality = data.nationality;
  if ("passport_issue_date" in data)
    serialized.passport_issue_date = data.passport_issue_date;
  if ("passport_expiry_date" in data)
    serialized.passport_expiry_date = data.passport_expiry_date;
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
  if ("profile_pic" in data) serialized.profile_pic = data.profile_pic;
  if ("spouse_name" in data) serialized.spouse_name = data.spouse_name;
  if ("marital_status" in data) serialized.marital_status = data.marital_status;
  if ("no_of_child" in data) serialized.no_of_child = Number(data.no_of_child);
  if ("social_medias" in data) serialized.social_medias = data.social_medias;

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

  // Relations (only connect if provided)
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
  if ("bank_id" in data) {
    serialized.hrms_employee_bank = {
      connect: { id: Number(data.bank_id) },
    };
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
  if (data && data.social_medias) {
    data.social_medias = JSON.parse(data.social_medias);
  }
  return data;
};

/**
 * Creates a new employee and associated addresses.
 * @param {Object} data - The employee data, including empAddressData.
 * @returns {Promise<Object>} The created employee data.
 * @throws {CustomError} If required fields are missing or creation fails.
 */
const createEmployee = async (data) => {
  const { empAddressData, ...employeeData } = data;
  try {
    // Validate required fields
    if (!data.phone_number) {
      throw new CustomError(`Phone Number is required`, 400);
    }
    if (!data.email) {
      throw new CustomError(`Email is required`, 400);
    }
    if (!data.employment_type) {
      throw new CustomError(`Employment Type is required`, 400);
    }
    if (!data.employee_code) {
      throw new CustomError(`Employee Code is required`, 400);
    }
    if (!data.gender) {
      throw new CustomError(`Gender is required`, 400);
    }
    if (!data.designation_id) {
      throw new CustomError(`Designation is required`, 400);
    }
    if (!data.department_id) {
      throw new CustomError(`Department is required`, 400);
    }

    // Check for existing employee
    const existingEmployee = await prisma.hrms_d_employee.findFirst({
      where: {
        OR: [
          { email: data.email },
          { employee_code: data.employee_code },
          { phone_number: data.phone_number },
        ],
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
          400
        );
      }
      if (existingEmployee.employee_code === data.employee_code) {
        throw new CustomError(
          `Employee with code ${data.employee_code} already exists`,
          400
        );
      }
      if (existingEmployee.phone_number === data.phone_number) {
        throw new CustomError(
          `Employee with phone number ${data.phone_number} already exists`,
          400
        );
      }
    }

    const serializedData = serializeTags(employeeData);

    // Split the transaction into smaller operations
    // 1. Create employee first
    const employee = await prisma.hrms_d_employee.create({
      data: {
        ...serializedData,
        createdate: new Date(),
        createdby: data.createdby || 1,
        log_inst: data.log_inst || 1,
      },
    });

    // 3. Create addresses in batches if needed
    if (Array.isArray(empAddressData) && empAddressData.length > 0) {
      const addressDatas = empAddressData.map((addr) => ({
        ...serializeAddress(addr),
        address_type: addr?.address_type || "Home",
        employee_id: employee.id,
      }));

      // Create addresses in smaller batches if there are many
      const batchSize = 10;
      for (let i = 0; i < addressDatas.length; i += batchSize) {
        const batch = addressDatas.slice(i, i + batchSize);
        await prisma.hrms_d_employee_address.createMany({
          data: batch,
        });
      }
    }

    // 4. Handle transaction notification separately
    await handleTransactionNotification("m_employee", "A", employee.id);

    // 5. Fetch and return the complete employee data
    const fullData = await prisma.hrms_d_employee.findFirst({
      where: { id: employee.id },
      include: {
        hrms_employee_address: {
          include: {
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
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
    });

    return parseData(fullData);
  } catch (error) {
    console.log("Error to Create employee : ", error);
    if (error instanceof CustomError) {
      throw error;
    }
    if (error.code === "P2002") {
      throw new CustomError(
        `A unique constraint would be violated. An employee with the same unique fields already exists.`,
        400
      );
    }
    throw new CustomError(
      `Error creating employee: ${error.message}`,
      error.status || 500
    );
  }
};

/**
 * Updates an existing employee and associated addresses.
 * @param {number} id - The employee ID.
 * @param {Object} data - The updated employee data, including empAddressData.
 * @returns {Promise<Object>} The updated employee data.
 * @throws {CustomError} If update fails.
 */
const updateEmployee = async (id, data) => {
  const { empAddressData, ...employeeData } = data;
  try {
    const updatedData = {
      ...employeeData,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };
    const serializedData = serializeTags(updatedData);

    // Get current employee data first
    const currentEmployee = await prisma.hrms_d_employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_employee_address: true,
      },
    });

    if (!currentEmployee) {
      throw new CustomError("Employee not found", 404);
    }

    // Split the operations into smaller transactions
    // 1. Update employee data
    const employee = await prisma.hrms_d_employee.update({
      where: { id: parseInt(id) },
      data: serializedData,
    });

    // 2. Handle address updates in a separate operation
    if (Array.isArray(empAddressData) && empAddressData.length > 0) {
      const newAddresses = empAddressData.filter((addr) => !addr.id);
      const existingAddresses = empAddressData.filter((addr) => addr.id);

      // Delete addresses that are no longer present
      const currentAddressIds = currentEmployee.hrms_employee_address.map(
        (a) => a.id
      );
      const keepAddressIds = existingAddresses.map((a) => a.id);
      const deleteAddressIds = currentAddressIds.filter(
        (id) => !keepAddressIds.includes(id)
      );

      if (deleteAddressIds.length > 0) {
        await prisma.hrms_d_employee_address.deleteMany({
          where: { id: { in: deleteAddressIds } },
        });
      }

      // Update existing addresses
      for (const addr of existingAddresses) {
        await prisma.hrms_d_employee_address.update({
          where: { id: addr.id },
          data: serializeAddress(addr),
        });
      }

      // Create new addresses
      if (newAddresses.length > 0) {
        await prisma.hrms_d_employee_address.createMany({
          data: newAddresses.map((addr) => ({
            ...serializeAddress(addr),
            employee_id: parseInt(id),
          })),
        });
      }
    }

    // 3. Send transaction notification
    await handleTransactionNotification("m_employee", "U", parseInt(id));

    // 4. Fetch updated data
    const updatedEmp = await prisma.hrms_d_employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_employee_address: {
          include: {
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
        employee_shift_id: {
          select: {
            id: true,
            shift_name: true,
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
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
    });

    return parseData(updatedEmp);
  } catch (error) {
    console.log("Updating error in employee", error);
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(
      `Error updating employee: ${error.message}`,
      error.status || 500
    );
  }
};

/**
 * Finds an employee by its ID.
 * @param {number} id - The employee ID.
 * @returns {Promise<Object>} The employee data.
 * @throws {CustomError} If retrieval fails.
 */
const findEmployeeById = async (id) => {
  try {
    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        hrms_employee_address: {
          include: {
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
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
    });
    return parseData(employee);
  } catch (error) {
    throw new CustomError("Error finding employee by ID", error.status || 503);
  }
};

/**
 * Retrieves all employees with pagination, search, and date filtering.
 * @param {number} page - The page number.
 * @param {number} size - The number of records per page.
 * @param {string} search - The search query.
 * @param {string} startDate - The start date for filtering.
 * @param {string} endDate - The end date for filtering.
 * @param {string} status - The status filter (unused).
 * @returns {Promise<Object>} The paginated employee data.
 * @throws {CustomError} If retrieval fails.
 */

const getAllEmployee = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status
) => {
  try {
    if (!page || page === 0) {
      page = 1;
    }
    size = size || 10;
    const skip = (page - 1) * size;

    const filters = {};

    // Search filter
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

    if (status !== undefined && status !== "") {
      filters.status = status;
    }

    const employees = await prisma.hrms_d_employee.findMany({
      where: filters,
      skip,
      take: size,
      include: {
        hrms_employee_address: {
          include: {
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
        hrms_employee_bank: {
          select: { id: true, bank_name: true },
        },
        experiance_of_employee: true,
        eduction_of_employee: true,
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });

    const totalCount = await prisma.hrms_d_employee.count({
      where: filters,
    });

    return {
      data: employees,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error("Error employee get : ", error);
    throw new CustomError("Error retrieving employees", 503);
  }
};

/**
 * Retrieves a list of active employees formatted for select options.
 * Each option contains value (employee id), label (full name and code), and meta (department and designation ids).
 * Optimized for minimal data transfer and mapping.
 * @returns {Promise<Array<{value: number, label: string, meta: {department_id: number, designation_id: number}}>>}
 * @throws {CustomError} If retrieval fails.
 */
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
        email: true,
      },
    });
    return employees.map(
      ({
        id,
        full_name,
        employee_code,
        department_id,
        designation_id,
        email,
      }) => ({
        value: id,
        label: `${full_name} (${employee_code})`,
        meta: { department_id, designation_id, email },
      })
    );
  } catch (error) {
    console.error("Error retrieving employee options: ", error);
    throw new CustomError("Error retrieving employees", 503);
  }
};

/**
 * Deletes an employee and associated addresses.
 * @param {number} id - The employee ID.
 * @throws {CustomError} If deletion fails.
 */
const deleteEmployee = async (id) => {
  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.hrms_d_employee_address.deleteMany({
        where: { employee_id: parseInt(id) },
      });

      await prisma.hrms_d_employee.delete({
        where: { id: parseInt(id) },
      });

      // Handle transaction notification after successful deletion
      await handleTransactionNotification("m_employee", "D", parseInt(id));
    });
  } catch (error) {
    console.log("Error to delete employee : ", error);
    throw new CustomError(
      `Error deleting employee: ${error.message}`,
      error.status || 500
    );
  }
};

module.exports = {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  getAllEmployee,
  deleteEmployee,
  employeeOptions,
};
