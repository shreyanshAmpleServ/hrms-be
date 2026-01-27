// // const EmployeeService = require("../services/EmployeeService");
// // const CustomError = require("../../utils/CustomError");
// // const moment = require("moment");
// // const {
// //   deleteFromBackblaze,
// //   uploadToBackblaze,
// // } = require("../../utils/uploadBackblaze");

// // const createEmployee = async (req, res, next) => {
// //   try {
// //     let profilePicUrl = null;

// //     if (req.files?.profile_pic?.[0]) {
// //       const file = req.files.profile_pic[0];
// //       profilePicUrl = await uploadToBackblaze(
// //         file.buffer,
// //         file.originalname,
// //         file.mimetype,
// //         "profile_pics"
// //       );
// //     }

// //     const employeeData = {
// //       ...req.body,
// //       profile_pic: profilePicUrl,
// //       createdby: req.user.employee_id,
// //       log_inst: req.user.log_inst || req.user.employee_id,
// //     };

// //     const employee = await EmployeeService.createEmployee(employeeData);

// //     res.status(201).json({
// //       success: true,
// //       message: "Employee created successfully",
// //       data: employee,
// //       status: 201,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };
// // const findEmployeeById = async (req, res, next) => {
// //   try {
// //     const deal = await EmployeeService.findEmployeeById(req.params.id);
// //     if (!deal) throw new CustomError("Employee not found", 404);
// //     res.status(200).success(null, deal);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const updateEmployee = async (req, res, next) => {
// //   try {
// //     const existingData = await EmployeeService.findEmployeeById(req.params.id);
// //     if (!existingData) throw new CustomError("Employee not found", 404);

// //     let data = {
// //       ...req.body,
// //       updatedby: req.user.id,
// //       empAddressData: req.body?.empAddressData
// //         ? JSON.parse(req.body?.empAddressData)
// //         : null,
// //     };

// //     if (req.files?.profile_pic) {
// //       const profilePic = req.files.profile_pic[0];
// //       const fileUrl = await uploadToBackblaze(
// //         profilePic.buffer,
// //         profilePic.originalname,
// //         profilePic.mimetype,
// //         "profile_pics"
// //       );
// //       data.profile_pic = fileUrl;

// //       if (existingData.profile_pic) {
// //         await deleteFromBackblaze(existingData.profile_pic);
// //       }
// //     }

// //     const updatedEmployee = await EmployeeService.updateEmployee(
// //       req.params.id,
// //       data
// //     );
// //     res.status(200).success("Employee updated successfully", updatedEmployee);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const deleteEmployee = async (req, res, next) => {
// //   try {
// //     const existingData = await EmployeeService.findEmployeeById(req.params.id);
// //     if (!existingData) throw new CustomError("Employee not found", 404);
// //     await EmployeeService.deleteEmployee(req.params.id);
// //     res.status(200).success("Employee deleted successfully", null);
// //     if (existingData.profile_pic) {
// //       await deleteFromBackblaze(existingData.profile_pic);
// //     }
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const getAllEmployee = async (req, res, next) => {
// //   try {
// //     const { page, size, search, startDate, endDate, status } = req.query;
// //     const deals = await EmployeeService.getAllEmployee(
// //       Number(page),
// //       Number(size),
// //       search,
// //       startDate && moment(startDate),
// //       endDate && moment(endDate),
// //       status
// //     );
// //     res.status(200).success(null, deals);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // const employeeOptions = async (req, res, next) => {
// //   try {
// //     const employees = await EmployeeService.employeeOptions();
// //     res.status(200).success(null, employees);
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// // module.exports = {
// //   createEmployee,
// //   findEmployeeById,
// //   updateEmployee,
// //   deleteEmployee,
// //   getAllEmployee,
// //   employeeOptions,
// // };
// const EmployeeService = require("../services/EmployeeService");
// const CustomError = require("../../utils/CustomError");
// const moment = require("moment");
// const {
//   deleteFromBackblaze,
//   uploadToBackblaze,
// } = require("../../utils/uploadBackblaze");

// const createEmployee = async (req, res, next) => {
//   try {
//     let profilePicUrl = null;

//     if (req.files && req.files.length > 0) {
//       const profilePicFile = req.files.find(
//         (f) => f.fieldname === "profile_pic"
//       );

//       if (profilePicFile) {
//         profilePicUrl = await uploadToBackblaze(
//           profilePicFile.buffer,
//           profilePicFile.originalname,
//           profilePicFile.mimetype,
//           "profile_pics"
//         );
//       }
//     }

//     let lifeEvents = null;
//     let workLifeEvents = null;
//     let empAddressData = null;

//     if (req.body?.life_events) {
//       try {
//         lifeEvents =
//           typeof req.body.life_events === "string"
//             ? JSON.parse(req.body.life_events)
//             : req.body.life_events;
//       } catch (e) {
//         console.error("Error parsing life_events:", e);
//         lifeEvents = null;
//       }
//     }

//     if (req.body?.work_life_events) {
//       try {
//         workLifeEvents =
//           typeof req.body.work_life_events === "string"
//             ? JSON.parse(req.body.work_life_events)
//             : req.body.work_life_events;
//       } catch (e) {
//         console.error("Error parsing work_life_events:", e);
//         workLifeEvents = null;
//       }
//     }

//     if (req.body?.empAddressData) {
//       try {
//         empAddressData =
//           typeof req.body.empAddressData === "string"
//             ? JSON.parse(req.body.empAddressData)
//             : req.body.empAddressData;
//       } catch (e) {
//         console.error("Error parsing empAddressData:", e);
//         empAddressData = null;
//       }
//     }

//     const employeeData = {
//       ...req.body,
//       profile_pic: profilePicUrl,
//       createdby: req.user.employee_id,
//       log_inst: req.user.log_inst || req.user.employee_id,
//       life_events: lifeEvents,
//       work_life_events: workLifeEvents,
//       empAddressData: empAddressData,
//     };

//     const employee = await EmployeeService.createEmployee(employeeData);

//     res.status(201).json({
//       success: true,
//       message: "Employee created successfully",
//       data: employee,
//       status: 201,
//     });
//   } catch (error) {
//     console.error("Create Employee Error:", error);
//     next(error);
//   }
// };

// const findEmployeeById = async (req, res, next) => {
//   try {
//     const deal = await EmployeeService.findEmployeeById(req.params.id);

//     if (!deal) throw new CustomError("Employee not found", 404);

//     res.status(200).json({
//       success: true,
//       message: "Employee fetched successfully",
//       data: deal,
//       status: 200,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const updateEmployee = async (req, res, next) => {
//   try {
//     const { ensureTenantContext } = require("../../utils/prismaProxy");
//     const tenantDb = req.tenantDb;

//     if (!tenantDb) {
//       return res.status(401).json({
//         success: false,
//         message: "Tenant database not found in request",
//         status: 401,
//       });
//     }

//     const existingData = await ensureTenantContext(tenantDb, () =>
//       EmployeeService.findEmployeeById(req.params.id)
//     );

//     if (!existingData) throw new CustomError("Employee not found", 404);

//     let lifeEvents = null;
//     let workLifeEvents = null;
//     let empAddressData = null;

//     if (req.body?.life_events) {
//       try {
//         lifeEvents =
//           typeof req.body.life_events === "string"
//             ? JSON.parse(req.body.life_events)
//             : req.body.life_events;
//       } catch (e) {
//         console.error("Error parsing life_events:", e);
//         lifeEvents = null;
//       }
//     }

//     if (req.body?.work_life_events) {
//       try {
//         workLifeEvents =
//           typeof req.body.work_life_events === "string"
//             ? JSON.parse(req.body.work_life_events)
//             : req.body.work_life_events;
//       } catch (e) {
//         console.error("Error parsing work_life_events:", e);
//         workLifeEvents = null;
//       }
//     }

//     if (req.body?.empAddressData) {
//       try {
//         empAddressData =
//           typeof req.body.empAddressData === "string"
//             ? JSON.parse(req.body.empAddressData)
//             : req.body.empAddressData;
//       } catch (e) {
//         console.error("Error parsing empAddressData:", e);
//         empAddressData = null;
//       }
//     }

//     let data = {
//       ...req.body,
//       updatedby: req.user.id,
//       empAddressData: empAddressData,
//       life_events: lifeEvents,
//       work_life_events: workLifeEvents,
//     };

//     if (req.files && req.files.length > 0) {
//       const profilePicFile = req.files.find(
//         (f) => f.fieldname === "profile_pic"
//       );

//       if (profilePicFile) {
//         const fileUrl = await uploadToBackblaze(
//           profilePicFile.buffer,
//           profilePicFile.originalname,
//           profilePicFile.mimetype,
//           "profile_pics",
//           true,
//           512
//         );

//         data.profile_pic = fileUrl;

//         if (existingData.profile_pic) {
//           await deleteFromBackblaze(existingData.profile_pic);
//         }
//       }
//     }

//     const updatedEmployee = await ensureTenantContext(tenantDb, () =>
//       EmployeeService.updateEmployee(req.params.id, data)
//     );

//     res.status(200).json({
//       success: true,
//       message: "Employee updated successfully",
//       data: updatedEmployee,
//       status: 200,
//     });
//   } catch (error) {
//     console.error("Update Employee Error:", error);
//     next(error);
//   }
// };

// const deleteEmployee = async (req, res, next) => {
//   try {
//     const existingData = await EmployeeService.findEmployeeById(req.params.id);

//     if (!existingData) throw new CustomError("Employee not found", 404);

//     await EmployeeService.deleteEmployee(req.params.id);

//     if (existingData.profile_pic) {
//       await deleteFromBackblaze(existingData.profile_pic);
//     }

//     res.status(200).json({
//       success: true,
//       message: "Employee deleted successfully",
//       data: null,
//       status: 200,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const getAllEmployee = async (req, res, next) => {
//   try {
//     const { page, size, search, startDate, endDate, status } = req.query;

//     const deals = await EmployeeService.getAllEmployee(
//       Number(page),
//       Number(size),
//       search,
//       startDate && moment(startDate),
//       endDate && moment(endDate),
//       status
//     );

//     res.status(200).json({
//       success: true,
//       message: "Employees fetched successfully",
//       data: deals,
//       status: 200,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// const employeeOptions = async (req, res, next) => {
//   try {
//     const employees = await EmployeeService.employeeOptions();

//     res.status(200).json({
//       success: true,
//       message: "Employee options fetched successfully",
//       data: employees,
//       status: 200,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createEmployee,
//   findEmployeeById,
//   updateEmployee,
//   deleteEmployee,
//   getAllEmployee,
//   employeeOptions,
// };

const EmployeeService = require("../services/EmployeeService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const {
  deleteFromBackblaze,
  uploadToBackblaze,
} = require("../../utils/uploadBackblaze");

const safeUploadToBackblaze = async (
  file,
  folder,
  resize = false,
  size = 1024,
) => {
  if (!file) return null;

  try {
    const fileUrl = await uploadToBackblaze(
      file.buffer,
      file.originalname,
      file.mimetype,
      folder,
      resize,
      size,
    );
    console.log(`Successfully uploaded ${file.fieldname} to ${folder}`);
    return fileUrl;
  } catch (error) {
    console.error(`Failed to upload ${file.fieldname}:`, error.message);
    return null; // Return null to skip this upload and continue
  }
};

const safeDeleteFromBackblaze = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    await deleteFromBackblaze(fileUrl);
    console.log(`Successfully deleted file: ${fileUrl}`);
  } catch (error) {
    console.error(`Failed to delete file ${fileUrl}:`, error.message);
  }
};

const processFileUploads = async (files) => {
  const result = {
    profile_pic: null,
    nssf_file: null,
    nida_file: null,
    warnings: [],
  };

  if (!files || files.length === 0) return result;

  const profilePicFile = files.find((f) => f.fieldname === "profile_pic");
  const nssfFile = files.find((f) => f.fieldname === "nssf_file");
  const nidaFile = files.find((f) => f.fieldname === "nida_file");

  if (profilePicFile) {
    result.profile_pic = await safeUploadToBackblaze(
      profilePicFile,
      "profile_pics",
      true,
      1024,
    );
    if (!result.profile_pic) {
      result.warnings.push(
        "Failed to upload profile picture. Employee saved without profile picture.",
      );
    }
  }

  if (nssfFile) {
    result.nssf_file = await safeUploadToBackblaze(
      nssfFile,
      "nssf_files",
      false,
    );
    if (!result.nssf_file) {
      result.warnings.push(
        "Failed to upload NSSF file. Employee saved without NSSF file.",
      );
    }
  }

  if (nidaFile) {
    result.nida_file = await safeUploadToBackblaze(
      nidaFile,
      "nida_files",
      false,
    );
    if (!result.nida_file) {
      result.warnings.push(
        "Failed to upload NIDA file. Employee saved without NIDA file.",
      );
    }
  }

  return result;
};

const safeParseJSON = (value, fieldName) => {
  if (!value) return null;

  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch (e) {
    console.error(`Error parsing ${fieldName}:`, e);
    return null;
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const uploadResults = await processFileUploads(req.files);

    const lifeEvents = safeParseJSON(req.body?.life_events, "life_events");
    const workLifeEvents = safeParseJSON(
      req.body?.work_life_events,
      "work_life_events",
    );
    const empAddressData = safeParseJSON(
      req.body?.empAddressData,
      "empAddressData",
    );

    const employeeData = {
      ...req.body,
      profile_pic: uploadResults.profile_pic,
      nssf_file: uploadResults.nssf_file,
      nida_file: uploadResults.nida_file,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst || req.user.employee_id,
      life_events: lifeEvents,
      work_life_events: workLifeEvents,
      empAddressData: empAddressData,
    };

    const employee = await EmployeeService.createEmployee(employeeData);

    const response = {
      success: true,
      message: "Employee created successfully",
      data: employee,
      status: 201,
    };

    if (uploadResults.warnings.length > 0) {
      response.warnings = uploadResults.warnings;
      response.message =
        "Employee created successfully with some upload warnings";
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Create Employee Error:", error);
    next(error);
  }
};

const findEmployeeById = async (req, res, next) => {
  try {
    const employee = await EmployeeService.findEmployeeById(req.params.id);

    if (!employee) throw new CustomError("Employee not found", 404);

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: employee,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { ensureTenantContext } = require("../../utils/prismaProxy");
    const tenantDb = req.tenantDb;

    if (!tenantDb) {
      return res.status(401).json({
        success: false,
        message: "Tenant database not found in request",
        status: 401,
      });
    }

    const existingData = await ensureTenantContext(tenantDb, () =>
      EmployeeService.findEmployeeById(req.params.id),
    );

    if (!existingData) throw new CustomError("Employee not found", 404);

    const lifeEvents = safeParseJSON(req.body?.life_events, "life_events");
    const workLifeEvents = safeParseJSON(
      req.body?.work_life_events,
      "work_life_events",
    );
    const empAddressData = safeParseJSON(
      req.body?.empAddressData,
      "empAddressData",
    );

    let data = {
      ...req.body,
      updatedby: req.user.id,
      empAddressData: empAddressData,
      life_events: lifeEvents,
      work_life_events: workLifeEvents,
    };

    const uploadWarnings = [];
    const oldFilesToDelete = [];

    if (req.files && req.files.length > 0) {
      const profilePicFile = req.files.find(
        (f) => f.fieldname === "profile_pic",
      );
      if (profilePicFile) {
        const newProfilePic = await safeUploadToBackblaze(
          profilePicFile,
          "profile_pics",
          true,
          512,
        );

        if (newProfilePic) {
          data.profile_pic = newProfilePic;
          if (existingData.profile_pic) {
            oldFilesToDelete.push(existingData.profile_pic);
          }
        } else {
          uploadWarnings.push(
            "Failed to upload new profile picture. Keeping existing file.",
          );
        }
      }

      const nssfFile = req.files.find((f) => f.fieldname === "nssf_file");
      if (nssfFile) {
        const newNssfFile = await safeUploadToBackblaze(
          nssfFile,
          "nssf_files",
          false,
        );

        if (newNssfFile) {
          data.nssf_file = newNssfFile;
          if (existingData.nssf_file) {
            oldFilesToDelete.push(existingData.nssf_file);
          }
        } else {
          uploadWarnings.push(
            "Failed to upload new NSSF file. Keeping existing file.",
          );
        }
      }

      const nidaFile = req.files.find((f) => f.fieldname === "nida_file");
      if (nidaFile) {
        const newNidaFile = await safeUploadToBackblaze(
          nidaFile,
          "nida_files",
          false,
        );

        if (newNidaFile) {
          data.nida_file = newNidaFile;
          if (existingData.nida_file) {
            oldFilesToDelete.push(existingData.nida_file);
          }
        } else {
          uploadWarnings.push(
            "Failed to upload new NIDA file. Keeping existing file.",
          );
        }
      }
    }

    const updatedEmployee = await ensureTenantContext(tenantDb, () =>
      EmployeeService.updateEmployee(req.params.id, data),
    );

    for (const fileUrl of oldFilesToDelete) {
      await safeDeleteFromBackblaze(fileUrl);
    }

    const response = {
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
      status: 200,
    };

    if (uploadWarnings.length > 0) {
      response.warnings = uploadWarnings;
      response.message =
        "Employee updated successfully with some upload warnings";
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Update Employee Error:", error);
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const existingData = await EmployeeService.findEmployeeById(req.params.id);

    if (!existingData) throw new CustomError("Employee not found", 404);

    await EmployeeService.deleteEmployee(req.params.id);

    if (existingData.profile_pic) {
      await safeDeleteFromBackblaze(existingData.profile_pic);
    }
    if (existingData.nssf_file) {
      await safeDeleteFromBackblaze(existingData.nssf_file);
    }
    if (existingData.nida_file) {
      await safeDeleteFromBackblaze(existingData.nida_file);
    }

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: null,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

// const getAllEmployee = async (req, res, next) => {
//   try {
//     const { page, size, search, startDate, endDate, status } = req.query;

//     const employees = await EmployeeService.getAllEmployee(
//       Number(page),
//       Number(size),
//       search,
//       startDate && moment(startDate),
//       endDate && moment(endDate),
//       status
//     );

//     res.status(200).json({
//       success: true,
//       message: "Employees fetched successfully",
//       data: employees,
//       status: 200,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const getAllEmployee = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, status } = req.query;

    const managerId = req.user?.employee_id;
    const userRole = req.user?.role_id;

    console.log("Manager ID:", managerId);
    console.log("User Role:", userRole);

    const deals = await EmployeeService.getAllEmployee(
      Number(page),
      Number(size),
      search,
      startDate && moment(startDate),
      endDate && moment(endDate),
      status,
      managerId,
      userRole,
    );

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: deals,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

const employeeOptions = async (req, res, next) => {
  try {
    const employees = await EmployeeService.employeeOptions();

    res.status(200).json({
      success: true,
      message: "Employee options fetched successfully",
      data: employees,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeCodePreview = async (req, res, next) => {
  try {
    const result = await EmployeeService.getEmployeeCodePreview();

    res.status(200).json({
      success: true,
      message: "Employee code preview generated successfully",
      data: result,
      status: 200,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  deleteEmployee,
  getAllEmployee,
  employeeOptions,
  getEmployeeCodePreview,
};
