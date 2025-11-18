const { prisma } = require("../../utils/prismaProxy.js");
const CustomError = require("../../utils/CustomError");

const TABLE_CONFIGS = {
  employees: {
    tableName: "hrms_d_employee",
    displayName: "Employees",
    requiredFields: ["employee_code", "full_name", "email"],
    fields: {
      employee_code: { type: "string", required: true },
      full_name: { type: "string", required: true },
      first_name: { type: "string" },
      last_name: { type: "string" },
      middle_name: { type: "string" },
      email: { type: "email", required: true },
      phone_number: { type: "string" },
      date_of_birth: { type: "date" },
      gender: { type: "string", enum: ["Male", "Female", "Other"] },
      join_date: { type: "date" },
      department_id: { type: "number" },
      designation_id: { type: "number" },
      status: { type: "string", default: "Active" },
      national_id_number: { type: "string" },
      passport_number: { type: "string" },
      employment_type: { type: "string" },
      employee_category: { type: "string" },
      confirm_date: { type: "date" },
      resign_date: { type: "date" },
      account_number: { type: "string" },
      work_location: { type: "string" },
      father_name: { type: "string" },
      marital_status: { type: "string" },
      mother_name: { type: "string" },
      spouse_name: { type: "string" },
      address: { type: "string" },
      nationality: { type: "string" },
      blood_group: { type: "string" },
      official_email: { type: "email" },
      office_phone: { type: "string" },
    },
  },
  departments: {
    tableName: "hrms_m_department_master",
    displayName: "Departments",
    requiredFields: ["department_name"],
    fields: {
      department_name: { type: "string", required: true },
      department_code: { type: "string" },
      description: { type: "string" },
      head_id: { type: "number" },
      is_active: { type: "string", default: "Y" },
    },
  },
};

const getTableConfig = (tableName) => {
  const config = TABLE_CONFIGS[tableName];
  if (!config)
    throw new CustomError(`Table configuration not found: ${tableName}`, 400);
  return config;
};

const getAvailableTables = () => {
  return Object.keys(TABLE_CONFIGS).map((key) => ({
    key,
    displayName: TABLE_CONFIGS[key].displayName,
    tableName: TABLE_CONFIGS[key].tableName,
    requiredFields: TABLE_CONFIGS[key].requiredFields,
  }));
};

const validateData = (data, tableName) => {
  const config = getTableConfig(tableName);
  const errors = [];

  data.forEach((row, index) => {
    config.requiredFields.forEach((field) => {
      if (!row[field] || row[field] === "") {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });

    Object.keys(config.fields).forEach((field) => {
      if (row[field] !== undefined && row[field] !== "") {
        const fieldConfig = config.fields[field];
        const value = row[field];

        switch (fieldConfig.type) {
          case "number":
            if (isNaN(Number(value))) {
              errors.push(`Row ${index + 1}: '${field}' must be a number`);
            }
            break;
          case "decimal":
            if (isNaN(parseFloat(value))) {
              errors.push(`Row ${index + 1}: '${field}' must be a decimal`);
            }
            break;
          case "date":
            if (isNaN(Date.parse(value))) {
              errors.push(`Row ${index + 1}: '${field}' must be a valid date`);
            }
            break;
          case "email":
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors.push(`Row ${index + 1}: '${field}' must be a valid email`);
            }
            break;
        }
      }
    });
  });

  return errors;
};

const transformDataForInsert = (data, tableName, createdBy = 1) => {
  const config = getTableConfig(tableName);

  return data.map((row, rowIndex) => {
    const transformedRow = {
      createdby: createdBy,
      createdate: new Date(),
      log_inst: 1,
    };

    Object.keys(config.fields).forEach((fieldName) => {
      const fieldConfig = config.fields[fieldName];

      if (
        row[fieldName] !== undefined &&
        row[fieldName] !== "" &&
        row[fieldName] !== null
      ) {
        let value = row[fieldName];

        try {
          switch (fieldConfig.type) {
            case "number":
              transformedRow[fieldName] = parseInt(value);
              break;
            case "decimal":
              transformedRow[fieldName] = parseFloat(value);
              break;
            case "date":
              transformedRow[fieldName] = new Date(value);
              break;
            case "email":
            case "string":
            default:
              transformedRow[fieldName] = String(value).trim();
          }
        } catch (error) {
          console.error(
            `❌ Error transforming field '${fieldName}' in row ${
              rowIndex + 1
            }:`,
            error
          );
          // Keep original value if transformation fails
          transformedRow[fieldName] = String(value).trim();
        }
      } else if (fieldConfig.default !== undefined) {
        // Handle default values
        if (typeof fieldConfig.default === "function") {
          transformedRow[fieldName] = fieldConfig.default();
        } else {
          transformedRow[fieldName] = fieldConfig.default;
        }
      }
    });

    return transformedRow;
  });
};

const bulkInsertData = async (data, tableName, createdBy = 1) => {
  try {
    const config = getTableConfig(tableName);

    console.log(`Processing ${data.length} records for ${config.tableName}`);

    // Transform data
    const transformedData = transformDataForInsert(data, tableName, createdBy);

    console.log(
      `📋 Sample transformed record:`,
      JSON.stringify(transformedData[0], null, 2)
    );

    // Insert data
    const result = await prisma[config.tableName].createMany({
      data: transformedData,
    });

    return {
      success: true,
      inserted: result.count,
      total: transformedData.length,
      skipped: transformedData.length - result.count,
      message: `Successfully inserted ${result.count} out of ${transformedData.length} records`,
    };
  } catch (error) {
    console.error("❌ Bulk insert error:", error);

    // Enhanced error handling
    if (error.code === "P2002") {
      throw new CustomError(
        `Duplicate entry found. Please check for existing records with unique constraints.`,
        400
      );
    } else if (error.code === "P2003") {
      throw new CustomError(
        `Foreign key constraint failed. Please ensure referenced IDs exist.`,
        400
      );
    } else if (error.message.includes("Unknown argument")) {
      const field = error.message.match(/Unknown argument `(\w+)`/)?.[1];
      throw new CustomError(
        `Field '${field}' does not exist in the database table. Please check the column names.`,
        400
      );
    }

    throw new CustomError(`Error inserting data: ${error.message}`, 500);
  }
};

const getDataForExport = async (tableName, filters = {}) => {
  try {
    const config = getTableConfig(tableName);

    const whereClause = {};
    if (filters.startDate && filters.endDate) {
      whereClause.createdate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }
    if (filters.status) whereClause.status = filters.status;

    const data = await prisma[config.tableName].findMany({
      where: whereClause,
      orderBy: { createdate: "desc" },
      ...(filters.limit && { take: parseInt(filters.limit) }),
    });

    return { success: true, data, count: data.length };
  } catch (error) {
    throw new CustomError(`Error fetching data: ${error.message}`, 500);
  }
};

module.exports = {
  getTableConfig,
  getAvailableTables,
  validateData,
  bulkInsertData,
  getDataForExport,
  TABLE_CONFIGS,
};
