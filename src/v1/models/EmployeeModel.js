const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();
const moment = require("moment");

// Serialize  before saving it
const serializeTags = (data) => {
  const serialized = {};

  if ("employee_code" in data) serialized.employee_code = data.employee_code;
  if ("first_name" in data) serialized.first_name = data.first_name;
  if ("last_name" in data) serialized.last_name = data.last_name;
  if ("first_name" in data || "last_name" in data)
    serialized.full_name = `${data.first_name || ""} ${data.last_name || ""}`.trim();

  if ("gender" in data) serialized.gender = data.gender;
  if ("date_of_birth" in data) serialized.date_of_birth = data.date_of_birth ? moment(data.date_of_birth) : null;
  if ("national_id_number" in data) serialized.national_id_number = data.national_id_number;
  if ("nationality" in data) serialized.nationality = data.nationality;
  if ("passport_issue_date" in data) serialized.passport_issue_date = data.passport_issue_date;
  if ("passport_expiry_date" in data) serialized.passport_expiry_date = data.passport_expiry_date;
  if ("passport_number" in data) serialized.passport_number = data.passport_number;
  if ("address" in data) serialized.address = data.address;
  if ("employment_type" in data) serialized.employment_type = data.employment_type;
  if ("employee_category" in data) serialized.employee_category = data.employee_category;
  if ("join_date" in data) serialized.join_date = data.join_date ? moment(data.join_date) : null;
  if ("confirm_date" in data) serialized.confirm_date = data.confirm_date ? moment(data.confirm_date) : null;
  if ("resign_date" in data) serialized.resign_date = data.resign_date ? moment(data.resign_date) : null;
  if ("ifsc" in data) serialized.ifsc = data.ifsc;
  if ("account_holder_name" in data) serialized.account_holder_name = data.account_holder_name;
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
  if ("primary_contact_number" in data) serialized.primary_contact_number = data.primary_contact_number;
  if ("primary_contact_name" in data) serialized.primary_contact_name = data.primary_contact_name;
  if ("primary_contact_relation" in data) serialized.primary_contact_relation = data.primary_contact_relation;
  if ("secondary_contact_mumber" in data) serialized.secondary_contact_mumber = data.secondary_contact_mumber;
  if ("secondary_contact_name" in data) serialized.secondary_contact_name = data.secondary_contact_name;
  if ("secondary_contact_relation" in data) serialized.secondary_contact_relation = data.secondary_contact_relation;
  // if ("bank_id" in data) serialized.bank_id = Number(data.bank_id);

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

// Parse  after retrieving it
const parseTags = (deal) => {
  if (deal && deal.tags) {
    deal.tags = JSON.parse(deal.tags);
  }
  return deal;
};

// Check if contactIds are valid and exist
const validateContactsExist = async (contactIds) => {
  const contacts = await prisma.crms_m_contact.findMany({
    where: {
      id: {
        in: contactIds.map((contactId) => parseInt(contactId)), // Ensure all are valid integers
      },
    },
  });

  if (contacts?.length !== contactIds.length) {
    throw new CustomError(
      "One or more contact IDs are invalid or do not exist.",
      400
    );
  }
};

// Create a new employee
const createEmployee = async (data) => {
  const { empAddressData, ...employeeData } = data; // Separate `contactIds` from other deal data
  try {
console.log("Employee Data: ", employeeData);
    if (!data.bank_id ) {
      throw new CustomError(`Bank with ID ${data.bank_id} does not exist`, 400);
    }
    if (!data.designation_id ) {
      throw new CustomError(`Designation with ID ${data.designation_id} does not exist`, 400);
    }
    if (!data.department_id) {
      throw new CustomError(`Department with ID ${data.department_id} does not exist`, 400);
    }

    const serializedData = serializeTags(employeeData);
console.log("Serialized Data: ", serializedData);
    // Use transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Create the employee
      const employee = await prisma.hrms_d_employee.create({
        data: {
          ...serializedData,
          // is_active: data.is_active || "Y",
          createdate: new Date(),
          createdby: data.createdby || 1,
          log_inst: data.log_inst || 1,
        },
      });
      // const serializedAddres = serializeAddress(empAddressData);
      // // Map contacts to the employee
      // const addressDatas = {
      //   ...serializedAddres,
      //   employee_id: employee.id,
      // };
      const addressDatas = empAddressData.map((addr) => ({
        ...serializeAddress(addr),
        address_type: addr?.address_type || "Home",
        employee_id: employee.id,
      }));
      await prisma.hrms_d_employee_address.createMany({ data: addressDatas });

      return employee?.id;
      // return fullData;
    });
    const fullData = await prisma.hrms_d_employee.findFirst({
      where: { id: result },
      include: {
       hrms_employee_address: {
          include: {
            employee_state:{
              select:{
                id: true,
                name: true, 
              }
            },
            employee_country:{
              select:{
                id: true,
                name: true, 
              }
            },

          },
        },
        hrms_employee_designation: {
          select: { id: true, designation_name: true },
        },
        hrms_employee_department: {
          select: { id: true, department_name: true },
        },
        hrms_employee_bank: {
          select: { id: true, bank_name: true },
        },
        hrms_manager: {
          select: { id: true, full_name: true },
        },
      },
    });

    return fullData;
  } catch (error) {
    console.log("Error to Create employee : ", error);
    throw new CustomError(`Error creating employee: ${error.message}`, 500);
  }
};

// Update an existing employee
const updateEmployee = async (id, data) => {
  const { empAddressData, ...employeeData } = data; // Separate `contactIds` from other employee data
  try {

    const updatedData = {
      ...employeeData,
      updatedby: data.updatedby || 1,
      updatedate: new Date(),
    };
    const serializedData = serializeTags(updatedData);

    // Filter address by existence of ID
    const newAddresses = empAddressData?.filter((addr) => !addr.id) || [];
    const existingAddresses = empAddressData?.filter((addr) => addr.id) || [];

    // Prepare address data
    const newSerialized = newAddresses?.map((addr) => ({
      ...serializeAddress(addr),
      employee_id: parseInt(id),
    })) || [];

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (prisma) => {
      // Update the employee
      const employee = await prisma.hrms_d_employee.update({
        where: { id: parseInt(id) },
        data: {
          ...serializedData,
        },
        select: {
          hrms_employee_address: {
            select: {
              id: true,
            },
          },
        },
      });

      // 2. Fetch current DB address IDs
      // const dbAddresses = await prisma.hrms_d_employee_address.findMany({
      //   where: { employee_id: parseInt(id) },
      //   select: { id: true },
      // });
        if (Array.isArray(empAddressData) && empAddressData.length > 0) {
      const dbIds = employee?.hrms_employee_address?.map((a) => a.id);
      const requestIds = existingAddresses?.map((a) => a.id);

      // 3. Delete removed addresses (if any)
      const toDeleteIds = empAddressData ? dbIds.filter((id) => !requestIds.includes(id)) : [];
      if (toDeleteIds.length > 0) {
        await prisma.hrms_d_employee_address.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      // 4. Update existing addresses
     for (const addr of existingAddresses) {
        await prisma.hrms_d_employee_address.update({
          where: { id: addr.id },
          data: serializeAddress(addr),
        });
      }

      // 5. Create new addresses in bulk
      if (newSerialized.length > 0) {
        await prisma.hrms_d_employee_address.createMany({
          data: newSerialized,
        });
      }
    }
      //  const serializedAddres = serializeAddress(empAddressData);
      // // Map contacts to the employee
      // const addressDatas = {
      //   ...serializedAddres,
      //   employee_id: employee.id,
      // };
      // await prisma.hrms_d_employee_address.update({ data: addressDatas });
      // Retrieve the updated employee with hrms_d_employee_address and employeeHistory included
      const updatedEmp = await prisma.hrms_d_employee.findUnique({
        where: { id: parseInt(id) },
        include: {
          hrms_employee_address: {
          include: {
            employee_state:{
              select:{
                id: true,
                name: true, 
              }
            },
            employee_country:{
              select:{
                id: true,
                name: true, 
              }
            },

          },
        },
          hrms_employee_designation: {
            select: { id: true, designation_name: true },
          },
          hrms_employee_department: {
            select: { id: true, department_name: true },
          },
          hrms_employee_bank: {
            select: { id: true, bank_name: true },
          },
          hrms_manager: {
            select: { id: true, full_name: true },
          },
        },
      });

      return updatedEmp;
    });

    return result;
  } catch (error) {
    console.log("Updating error in employee", error);
    throw new CustomError(`Error updating employee: ${error.message}`, 500);
  }
};

// Find a employee by its ID
const findEmployeeById = async (id) => {
  try {
    const employee = await prisma.hrms_d_employee.findUnique({
      where: { id: parseInt(id) },
      include: {
       hrms_employee_address: {
          include: {
            employee_state:{
              select:{
                id: true,
                name: true, 
              }
            },
            employee_country:{
              select:{
                id: true,
                name: true, 
              }
            },

          },
        },
        hrms_employee_designation: {
          select: { id: true, designation_name: true },
        },
        hrms_employee_department: {
          select: { id: true, department_name: true },
        },
        hrms_manager: {
          select: { id: true, full_name: true },
        },
        hrms_employee_bank: {
          select: { id: true, bank_name: true },
        },
      },
    });
    return parseTags(employee);
  } catch (error) {
    throw new CustomError("Error finding employee by ID", 503);
  }
};

// Get all employees
const getAllEmployee = async (
  page,
  size,
  search,
  startDate,
  endDate,
  status
) => {
  try {
    page = page || page == 0 ? 1 : page;
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filters = {};
    // Handle search
    if (search) {
      filters.OR = [
        {
          hrms_employee_designation: {
            designation_name: { contains: search.toLowerCase() },
          }, // Include contact details
        },
        {
          hrms_employee_department: {
            department_name: { contains: search.toLowerCase() },
          }, // Include contact details
        },
        {
          first_name: { contains: search.toLowerCase() },
        },
        {
          full_name: { contains: search.toLowerCase() },
        },
        {
          employee_code: { contains: search.toLowerCase() },
        },
      ];
    }
    // if (status) {
    //   filters.is_active = { equals: status };
    // }

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
    const employee = await prisma.hrms_d_employee.findMany({
      where: filters,
      skip: skip,
      take: size,
      include: {
        hrms_employee_address: {
          include: {
            employee_state:{
              select:{
                id: true,
                name: true, 
              }
            },
            employee_country:{
              select:{
                id: true,
                name: true, 
              }
            },

          },
        },
        hrms_employee_designation: {
          select: { id: true, designation_name: true },
        },
        hrms_employee_department: {
          select: { id: true, department_name: true },
        },
        hrms_employee_bank: {
          select: { id: true, bank_name: true },
        },
      },
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
    });
    // const formattedDeals = employee.map((deal) => {
    //   const { employee_contact, ...rest } = parseTags(deal); // Remove "deals" key
    //   const finalContact = employee_contact.map((item) => item.camp_contact);
    //   return { ...rest, employee_contact: finalContact }; // Rename "stages" to "deals"
    // });
    const totalCount = await prisma.hrms_d_employee.count({
      where: filters,
    });
    return {
      data: employee,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount: totalCount,
    };
  } catch (error) {
    console.log("Error employee get : ", error);
    throw new CustomError("Error retrieving employees", 503);
  }
};

const deleteEmployee = async (id) => {
  try {
    const result = await prisma.$transaction(async (prisma) => {
      // Step 1: Delete related data from DealContacts
      await prisma.hrms_d_employee_address.deleteMany({
        where: { employee_id: parseInt(id) },
      });

      // Step 2: Delete the deal
      await prisma.hrms_d_employee.delete({
        where: { id: parseInt(id) },
      });
    });
  } catch (error) {
    console.log("Error to delete employee : ", error);
    throw new CustomError(`Error deleting employee: ${error.message}`, 500);
  }
};
module.exports = {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  getAllEmployee,
  deleteEmployee,
};
