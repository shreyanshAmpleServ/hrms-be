// const { PrismaClient } = require("@prisma/client");
// const CustomError = require("../../utils/CustomError");
// const prisma = new PrismaClient();

// // Serialize employee experience data
// const serializeEmployeeExperience = (data) => ({
//   employee_id: Number(data.employee_id),
//   company_name: data.company_name || "",
//   position: data.position || "",
//   start_from: data.start_from ? new Date(data.start_from) : null,
//   end_to: data.end_to ? new Date(data.end_to) : null,
// });

// // Create a new employee experience
// const createEmployeeExperience = async (data) => {
//   try {
//     const created = await prisma.hrms_employee_d_experiences.create({
//       data: {
//         ...serializeEmployeeExperience(data),
//         createdby: Number(data.createdby) || 1,
//         createdate: new Date(),
//         log_inst: data.log_inst || 1,
//       },
//     });
//     // Fetch with relation for employee name
//     let result = await prisma.hrms_employee_d_experiences.findUnique({
//       where: { id: created.id },
//       include: {
//         experiance_of_employee: true,
//       },
//     });

//     // Wrap experiance_of_employee in an array if it exists
//     result = {
//       ...result,
//       experiance_of_employee: result.experiance_of_employee
//         ? [result.experiance_of_employee]
//         : [],
//     };

//     return result;
//   } catch (error) {
//     throw new CustomError(
//       `Error creating employee experience: ${error.message}`,
//       500
//     );
//   }
// };
// // Find an employee experience by ID
// const findEmployeeExperienceById = async (id) => {
//   try {
//     const reqData = await prisma.hrms_employee_d_experiences.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         experiance_of_employee: true,
//       },
//     });
//     if (!reqData) {
//       throw new CustomError("Employee experience not found", 404);
//     }
//     return reqData;
//   } catch (error) {
//     throw new CustomError(
//       `Error finding employee experience by ID: ${error.message}`,
//       503
//     );
//   }
// };

// // Update an employee experience
// const updateEmployeeExperience = async (employeeId, data) => {
//   const empExpData = Array.isArray(data.empExpData) ? data.empExpData : [];

//   const existingExps = empExpData.filter((e) => e.id);
//   const newExps = empExpData.filter((e) => !e.id);

//   const newSerializedExps = newExps.map((exp) => ({
//     employee_id: Number(employeeId),
//     company_name: exp.company_name || "",
//     position: exp.position || "",
//     start_from: exp.start_from ? new Date(exp.start_from) : null,
//     end_to: exp.end_to ? new Date(exp.end_to) : null,
//     createdby: Number(data.updatedby) || 1,
//     createdate: new Date(),
//     log_inst: data.log_inst || 1,
//   }));

//   try {
//     const result = await prisma.$transaction(async (tx) => {
//       const dbRows = await tx.hrms_employee_d_experiences.findMany({
//         where: { employee_id: Number(employeeId) },
//         select: { id: true },
//       });
//       const dbExpIds = dbRows.map((r) => r.id);
//       const reqExpIds = existingExps.map((e) => e.id);

//       const toDeleteIds = dbExpIds.filter((id) => !reqExpIds.includes(id));
//       if (toDeleteIds.length > 0) {
//         await tx.hrms_employee_d_experiences.deleteMany({
//           where: { id: { in: toDeleteIds } },
//         });
//       }

//       for (const exp of existingExps) {
//         await tx.hrms_employee_d_experiences.update({
//           where: { id: exp.id },
//           data: {
//             company_name: exp.company_name || "",
//             position: exp.position || "",
//             start_from: exp.start_from ? new Date(exp.start_from) : null,
//             end_to: exp.end_to ? new Date(exp.end_to) : null,
//             updatedby: Number(data.updatedby) || 1,
//             updatedate: new Date(),
//           },
//         });
//       }

//       if (newSerializedExps.length > 0) {
//         await tx.hrms_employee_d_experiences.createMany({
//           data: newSerializedExps,
//         });
//       }

//       const updatedList = await tx.hrms_employee_d_experiences.findMany({
//         where: { employee_id: Number(employeeId) },
//         include: { experiance_of_employee: true },
//         orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//       });
//       return updatedList;
//     });

//     return result;
//   } catch (error) {
//     console.error("Error in updateEmployeeExperience:", error);
//     throw new CustomError(
//       `Error updating employee experience: ${error.message}`,
//       500
//     );
//   }
// };
// // Delete an employee experience
// const deleteEmployeeExperience = async (id) => {
//   try {
//     await prisma.hrms_employee_d_experiences.delete({
//       where: { id: parseInt(id) },
//     });
//   } catch (error) {
//     throw new CustomError(
//       `Error deleting employee experience: ${error.message}`,
//       500
//     );
//   }
// };

// // Get all employee experiences with pagination and search
// const getAllEmployeeExperience = async (
//   search,
//   page,
//   size,
//   startDate,
//   endDate
// ) => {
//   try {
//     page = !page || page == 0 ? 1 : page;
//     size = size || 10;
//     const skip = (page - 1) * size || 0;

//     const filterConditions = [];

//     // Search OR condition on company_name and position
//     if (search) {
//       filterConditions.push({
//         OR: [
//           {
//             experiance_of_employee: {
//               OR: [
//                 { first_name: { contains: search.toLowerCase() } },
//                 { last_name: { contains: search.toLowerCase() } },
//               ],
//             },
//           },
//           {
//             company_name: {
//               contains: search.toLowerCase(),
//             },
//           },
//           {
//             position: {
//               contains: search.toLowerCase(),
//             },
//           },
//         ],
//       });
//     }

//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
//         filterConditions.push({
//           createdate: {
//             gte: start,
//             lte: end,
//           },
//         });
//       }
//     }

//     // Combine all conditions with AND
//     const filters =
//       filterConditions.length > 0 ? { AND: filterConditions } : {};

//     const datas = await prisma.hrms_employee_d_experiences.findMany({
//       where: filters,
//       skip,
//       take: size,
//       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
//       include: {
//         experiance_of_employee: true,
//       },
//     });

//     const totalCount = await prisma.hrms_employee_d_experiences.count({
//       where: filters,
//     });

//     return {
//       data: datas,
//       currentPage: page,
//       size,
//       totalPages: Math.ceil(totalCount / size),
//       totalCount,
//     };
//   } catch (error) {
//     console.error("Prisma error in getAllEmployeeExperience:", error);
//     throw new CustomError(
//       `Error retrieving employee experiences: ${error.message}`,
//       400
//     );
//   }
// };

// module.exports = {
//   createEmployeeExperience,
//   findEmployeeExperienceById,
//   updateEmployeeExperience,
//   deleteEmployeeExperience,
//   getAllEmployeeExperience,
// };

// // const { PrismaClient } = require("@prisma/client");
// // const CustomError = require("../../utils/CustomError");
// // const prisma = new PrismaClient();

// // // Helper: turn incoming data into a plain object for the Prisma model
// // const serializeEmployeeExperience = (data) => ({
// //   employee_id: Number(data.employee_id),
// //   company_name: data.company_name || "",
// //   position: data.position || "",
// //   start_from: data.start_from ? new Date(data.start_from) : null,
// //   end_to: data.end_to ? new Date(data.end_to) : null,
// // });

// // // Create a single Employee Experience
// // const createEmployeeExperience = async (data) => {
// //   try {
// //     const created = await prisma.hrms_employee_d_experiences.create({
// //       data: {
// //         ...serializeEmployeeExperience(data),
// //         createdby: Number(data.createdby) || 1,
// //         createdate: new Date(),
// //         log_inst: data.log_inst || 1,
// //       },
// //     });

// //     return await prisma.hrms_employee_d_experiences.findUnique({
// //       where: { id: created.id },
// //       include: {
// //         experiance_of_employee: true,
// //       },
// //     });
// //   } catch (error) {
// //     throw new CustomError(
// //       `Error creating employee experience: ${error.message}`,
// //       500
// //     );
// //   }
// // };

// // // Find one Employee Experience by its ID
// // const findEmployeeExperienceById = async (id) => {
// //   try {
// //     const record = await prisma.hrms_employee_d_experiences.findUnique({
// //       where: { id: parseInt(id) },
// //       include: {
// //         experiance_of_employee: true,
// //       },
// //     });

// //     if (!record) {
// //       throw new CustomError("Employee experience not found", 404);
// //     }
// //     return record;
// //   } catch (error) {
// //     throw new CustomError(
// //       `Error finding employee experience by ID: ${error.message}`,
// //       503
// //     );
// //   }
// // };

// // // Update (Upsert) all Experience rows for a given employee
// // const updateEmployeeExperience = async (employeeId, data) => {
// //   const empExpData = Array.isArray(data.empExpData) ? data.empExpData : [];

// //   const existingExps = empExpData.filter((e) => e.id);
// //   const newExps = empExpData.filter((e) => !e.id);

// //   const newSerializedExps = newExps.map((exp) => ({
// //     employee_id: Number(employeeId),
// //     company_name: exp.company_name || "",
// //     position: exp.position || "",
// //     start_from: exp.start_from ? new Date(exp.start_from) : null,
// //     end_to: exp.end_to ? new Date(exp.end_to) : null,
// //     createdby: Number(data.updatedby) || 1,
// //     createdate: new Date(),
// //     log_inst: data.log_inst || 1,
// //   }));

// //   try {
// //     const result = await prisma.$transaction(async (prismaTx) => {
// //       const dbRows = await prismaTx.hrms_employee_d_experiences.findMany({
// //         where: { employee_id: Number(employeeId) },
// //         select: { id: true },
// //       });
// //       const dbExpIds = dbRows.map((r) => r.id);
// //       const reqExpIds = existingExps.map((e) => e.id);

// //       const toDeleteIds = dbExpIds.filter((id) => !reqExpIds.includes(id));
// //       if (toDeleteIds.length > 0) {
// //         await prismaTx.hrms_employee_d_experiences.deleteMany({
// //           where: { id: { in: toDeleteIds } },
// //         });
// //       }

// //       for (const exp of existingExps) {
// //         await prismaTx.hrms_employee_d_experiences.update({
// //           where: { id: exp.id },
// //           data: {
// //             company_name: exp.company_name || "",
// //             position: exp.position || "",
// //             start_from: exp.start_from ? new Date(exp.start_from) : null,
// //             end_to: exp.end_to ? new Date(exp.end_to) : null,
// //             updatedby: Number(data.updatedby) || 1,
// //             updatedate: new Date(),
// //           },
// //         });
// //       }

// //       if (newSerializedExps.length > 0) {
// //         await prismaTx.hrms_employee_d_experiences.createMany({
// //           data: newSerializedExps,
// //         });
// //       }

// //       const updatedList = await prismaTx.hrms_employee_d_experiences.findMany({
// //         where: { employee_id: Number(employeeId) },
// //         include: {
// //           experiance_of_employee: true,
// //         },
// //         orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
// //       });
// //       return updatedList;
// //     });

// //     return result;
// //   } catch (error) {
// //     console.error("Error in updateEmployeeExperience:", error);
// //     throw new CustomError(
// //       `Error updating employee experience: ${error.message}`,
// //       500
// //     );
// //   }
// // };

// // // Delete one Employee Experience by its ID
// // const deleteEmployeeExperience = async (id) => {
// //   try {
// //     await prisma.hrms_employee_d_experiences.delete({
// //       where: { id: parseInt(id) },
// //     });
// //     return { success: true };
// //   } catch (error) {
// //     throw new CustomError(
// //       `Error deleting employee experience: ${error.message}`,
// //       500
// //     );
// //   }
// // };

// // // List all Employee Experiences (with optional search + pagination)
// // const getAllEmployeeExperience = async (
// //   search,
// //   page,
// //   size,
// //   startDate,
// //   endDate
// // ) => {
// //   try {
// //     page = !page || page === 0 ? 1 : Number(page);
// //     size = size ? Number(size) : 10;
// //     const skip = (page - 1) * size;

// //     const filterConditions = [];

// //     if (search) {
// //       filterConditions.push({
// //         OR: [
// //           {
// //             experiance_of_employee: {
// //               OR: [
// //                 { first_name: { contains: search.toLowerCase() } },
// //                 { last_name: { contains: search.toLowerCase() } },
// //               ],
// //             },
// //           },
// //           { company_name: { contains: search.toLowerCase() } },
// //           { position: { contains: search.toLowerCase() } },
// //         ],
// //       });
// //     }

// //     if (startDate && endDate) {
// //       const s = new Date(startDate);
// //       const e = new Date(endDate);
// //       if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
// //         filterConditions.push({
// //           createdate: {
// //             gte: s,
// //             lte: e,
// //           },
// //         });
// //       }
// //     }

// //     const filters = filterConditions.length ? { AND: filterConditions } : {};

// //     const data = await prisma.hrms_employee_d_experiences.findMany({
// //       where: filters,
// //       skip,
// //       take: size,
// //       orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
// //       include: {
// //         experiance_of_employee: true,
// //       },
// //     });

// //     const totalCount = await prisma.hrms_employee_d_experiences.count({
// //       where: filters,
// //     });

// //     return {
// //       data,
// //       currentPage: page,
// //       size,
// //       totalPages: Math.ceil(totalCount / size),
// //       totalCount,
// //     };
// //   } catch (error) {
// //     throw new CustomError(
// //       `Error retrieving employee experiences: ${error.message}`,
// //       400
// //     );
// //   }
// // };

// // module.exports = {
// //   createEmployeeExperience,
// //   findEmployeeExperienceById,
// //   updateEmployeeExperience,
// //   deleteEmployeeExperience,
// //   getAllEmployeeExperience,
// // };

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../../utils/CustomError");
const prisma = new PrismaClient();

// Serialize employee experience data
const serializeEmployeeExperience = (data) => ({
  employee_id: Number(data.employee_id),
  company_name: data.company_name || "",
  position: data.position || "",
  start_from: data.start_from ? new Date(data.start_from) : null,
  end_to: data.end_to ? new Date(data.end_to) : null,
});

// Create a new employee experience
const createEmployeeExperience = async (data) => {
  try {
    const created = await prisma.hrms_employee_d_experiences.create({
      data: {
        ...serializeEmployeeExperience(data),
        createdby: Number(data.createdby) || 1,
        createdate: new Date(),
        log_inst: data.log_inst || 1,
      },
    });

    let result = await prisma.hrms_employee_d_experiences.findUnique({
      where: { id: created.id },
      include: {
        experiance_of_employee: true,
      },
    });

    // Wrap experiance_of_employee in an array if exists
    result = {
      ...result,
      experiance_of_employee: result.experiance_of_employee
        ? [result.experiance_of_employee]
        : [],
    };

    return result;
  } catch (error) {
    throw new CustomError(
      `Error creating employee experience: ${error.message}`,
      500
    );
  }
};

// Find an employee experience by ID
const findEmployeeExperienceById = async (id) => {
  try {
    const reqData = await prisma.hrms_employee_d_experiences.findUnique({
      where: { id: parseInt(id) },
      include: {
        experiance_of_employee: true,
      },
    });
    if (!reqData) {
      throw new CustomError("Employee experience not found", 404);
    }

    // Wrap experiance_of_employee in array if exists
    return {
      ...reqData,
      experiance_of_employee: reqData.experiance_of_employee
        ? [reqData.experiance_of_employee]
        : [],
    };
  } catch (error) {
    throw new CustomError(
      `Error finding employee experience by ID: ${error.message}`,
      503
    );
  }
};

// Update employee experiences for an employee (handle add, update, delete)
const updateEmployeeExperience = async (employeeId, data) => {
  const empExpData = Array.isArray(data.empExpData) ? data.empExpData : [];

  const existingExps = empExpData.filter((e) => e.id);
  const newExps = empExpData.filter((e) => !e.id);

  const newSerializedExps = newExps.map((exp) => ({
    employee_id: Number(employeeId),
    company_name: exp.company_name || "",
    position: exp.position || "",
    start_from: exp.start_from ? new Date(exp.start_from) : null,
    end_to: exp.end_to ? new Date(exp.end_to) : null,
    createdby: Number(data.updatedby) || 1,
    createdate: new Date(),
    log_inst: data.log_inst || 1,
  }));

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch existing IDs from DB
      const dbRows = await tx.hrms_employee_d_experiences.findMany({
        where: { employee_id: Number(employeeId) },
        select: { id: true },
      });
      const dbExpIds = dbRows.map((r) => r.id);
      const reqExpIds = existingExps.map((e) => e.id);

      // Delete removed records
      const toDeleteIds = dbExpIds.filter((id) => !reqExpIds.includes(id));
      if (toDeleteIds.length > 0) {
        await tx.hrms_employee_d_experiences.deleteMany({
          where: { id: { in: toDeleteIds } },
        });
      }

      // Update existing records
      for (const exp of existingExps) {
        await tx.hrms_employee_d_experiences.update({
          where: { id: Number(exp.id) },
          data: {
            company_name: exp.company_name || "",
            position: exp.position || "",
            start_from: exp.start_from ? new Date(exp.start_from) : null,
            end_to: exp.end_to ? new Date(exp.end_to) : null,
            updatedby: Number(data.updatedby) || 1,
            updatedate: new Date(),
          },
        });
      }

      // Insert new records
      if (newSerializedExps.length > 0) {
        await tx.hrms_employee_d_experiences.createMany({
          data: newSerializedExps,
        });
      }

      // Fetch updated list with nested data
      const updatedList = await tx.hrms_employee_d_experiences.findMany({
        where: { employee_id: Number(employeeId) },
        include: {
          experiance_of_employee: {
            // this is the employee
            include: {
              eduction_of_employee: true, // this includes education records of the employee
            },
          },
        },

        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      // Fetch education records for the employee
      const educations = await tx.hrms_employee_d_educations.findMany({
        where: { employee_id: Number(employeeId) },
        orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      });

      // Return only the first record, wrap experiance_of_employee in array
      const item = updatedList[0] || null;

      if (!item) {
        return null;
      }

      return {
        ...item,
        experiance_of_employee: item.experiance_of_employee
          ? [item.experiance_of_employee]
          : [],
        educations: item.experiance_of_employee?.eduction_of_employee || [],
      };
    });

    return result;
  } catch (error) {
    console.error("Error in updateEmployeeExperience:", error);
    throw new CustomError(
      `Error updating employee experience: ${error.message}`,
      500
    );
  }
};

// Delete an employee experience by ID
const deleteEmployeeExperience = async (id) => {
  try {
    await prisma.hrms_employee_d_experiences.delete({
      where: { id: parseInt(id) },
    });
    return { success: true };
  } catch (error) {
    throw new CustomError(
      `Error deleting employee experience: ${error.message}`,
      500
    );
  }
};

// Get all employee experiences with search, pagination, and date filter
const getAllEmployeeExperience = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  try {
    page = !page || page == 0 ? 1 : Number(page);
    size = size || 10;
    const skip = (page - 1) * size || 0;

    const filterConditions = [];

    if (search) {
      filterConditions.push({
        OR: [
          {
            experiance_of_employee: {
              OR: [
                { first_name: { contains: search.toLowerCase() } },
                { last_name: { contains: search.toLowerCase() } },
              ],
            },
          },
          {
            company_name: {
              contains: search.toLowerCase(),
            },
          },
          {
            position: {
              contains: search.toLowerCase(),
            },
          },
        ],
      });
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        filterConditions.push({
          createdate: {
            gte: start,
            lte: end,
          },
        });
      }
    }

    const filters =
      filterConditions.length > 0 ? { AND: filterConditions } : {};

    const datas = await prisma.hrms_employee_d_experiences.findMany({
      where: filters,
      skip,
      take: size,
      orderBy: [{ updatedate: "desc" }, { createdate: "desc" }],
      include: {
        experiance_of_employee: true,
      },
    });

    const totalCount = await prisma.hrms_employee_d_experiences.count({
      where: filters,
    });

    if (!datas.length) {
      return {
        data: null,
        currentPage: page,
        size,
        totalPages: Math.ceil(totalCount / size),
        totalCount,
      };
    }

    // Return only the first record as an object, with nested wrapped in arrays
    const item = datas[0];

    const transformed = {
      ...item,
      experiance_of_employee: item.experiance_of_employee
        ? [item.experiance_of_employee]
        : [],
    };

    return {
      ...transformed,
      currentPage: page,
      size,
      totalPages: Math.ceil(totalCount / size),
      totalCount,
    };
  } catch (error) {
    console.error("Prisma error in getAllEmployeeExperience:", error);
    throw new CustomError(
      `Error retrieving employee experiences: ${error.message}`,
      400
    );
  }
};

module.exports = {
  createEmployeeExperience,
  findEmployeeExperienceById,
  updateEmployeeExperience,
  deleteEmployeeExperience,
  getAllEmployeeExperience,
};
