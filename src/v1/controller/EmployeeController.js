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

//     if (req.files?.profile_pic?.[0]) {
//       const file = req.files.profile_pic[0];
//       profilePicUrl = await uploadToBackblaze(
//         file.buffer,
//         file.originalname,
//         file.mimetype,
//         "profile_pics"
//       );
//     }

//     const employeeData = {
//       ...req.body,
//       profile_pic: profilePicUrl,
//       createdby: req.user.employee_id,
//       log_inst: req.user.log_inst || req.user.employee_id,
//     };

//     const employee = await EmployeeService.createEmployee(employeeData);

//     res.status(201).json({
//       success: true,
//       message: "Employee created successfully",
//       data: employee,
//       status: 201,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// const findEmployeeById = async (req, res, next) => {
//   try {
//     const deal = await EmployeeService.findEmployeeById(req.params.id);
//     if (!deal) throw new CustomError("Employee not found", 404);
//     res.status(200).success(null, deal);
//   } catch (error) {
//     next(error);
//   }
// };

// const updateEmployee = async (req, res, next) => {
//   try {
//     const existingData = await EmployeeService.findEmployeeById(req.params.id);
//     if (!existingData) throw new CustomError("Employee not found", 404);

//     let data = {
//       ...req.body,
//       updatedby: req.user.id,
//       empAddressData: req.body?.empAddressData
//         ? JSON.parse(req.body?.empAddressData)
//         : null,
//     };

//     if (req.files?.profile_pic) {
//       const profilePic = req.files.profile_pic[0];
//       const fileUrl = await uploadToBackblaze(
//         profilePic.buffer,
//         profilePic.originalname,
//         profilePic.mimetype,
//         "profile_pics"
//       );
//       data.profile_pic = fileUrl;

//       if (existingData.profile_pic) {
//         await deleteFromBackblaze(existingData.profile_pic);
//       }
//     }

//     const updatedEmployee = await EmployeeService.updateEmployee(
//       req.params.id,
//       data
//     );
//     res.status(200).success("Employee updated successfully", updatedEmployee);
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteEmployee = async (req, res, next) => {
//   try {
//     const existingData = await EmployeeService.findEmployeeById(req.params.id);
//     if (!existingData) throw new CustomError("Employee not found", 404);
//     await EmployeeService.deleteEmployee(req.params.id);
//     res.status(200).success("Employee deleted successfully", null);
//     if (existingData.profile_pic) {
//       await deleteFromBackblaze(existingData.profile_pic);
//     }
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
//     res.status(200).success(null, deals);
//   } catch (error) {
//     next(error);
//   }
// };

// const employeeOptions = async (req, res, next) => {
//   try {
//     const employees = await EmployeeService.employeeOptions();
//     res.status(200).success(null, employees);
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

const createEmployee = async (req, res, next) => {
  try {
    let profilePicUrl = null;

    if (req.files && req.files.length > 0) {
      const profilePicFile = req.files.find(
        (f) => f.fieldname === "profile_pic"
      );

      if (profilePicFile) {
        profilePicUrl = await uploadToBackblaze(
          profilePicFile.buffer,
          profilePicFile.originalname,
          profilePicFile.mimetype,
          "profile_pics"
        );
      }
    }

    let lifeEvents = null;
    let workLifeEvents = null;
    let empAddressData = null;

    if (req.body?.life_events) {
      try {
        lifeEvents =
          typeof req.body.life_events === "string"
            ? JSON.parse(req.body.life_events)
            : req.body.life_events;
      } catch (e) {
        console.error("Error parsing life_events:", e);
        lifeEvents = null;
      }
    }

    if (req.body?.work_life_events) {
      try {
        workLifeEvents =
          typeof req.body.work_life_events === "string"
            ? JSON.parse(req.body.work_life_events)
            : req.body.work_life_events;
      } catch (e) {
        console.error("Error parsing work_life_events:", e);
        workLifeEvents = null;
      }
    }

    if (req.body?.empAddressData) {
      try {
        empAddressData =
          typeof req.body.empAddressData === "string"
            ? JSON.parse(req.body.empAddressData)
            : req.body.empAddressData;
      } catch (e) {
        console.error("Error parsing empAddressData:", e);
        empAddressData = null;
      }
    }

    const employeeData = {
      ...req.body,
      profile_pic: profilePicUrl,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst || req.user.employee_id,
      life_events: lifeEvents,
      work_life_events: workLifeEvents,
      empAddressData: empAddressData,
    };

    const employee = await EmployeeService.createEmployee(employeeData);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
      status: 201,
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    next(error);
  }
};

const findEmployeeById = async (req, res, next) => {
  try {
    const deal = await EmployeeService.findEmployeeById(req.params.id);

    if (!deal) throw new CustomError("Employee not found", 404);

    res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: deal,
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
      EmployeeService.findEmployeeById(req.params.id)
    );

    if (!existingData) throw new CustomError("Employee not found", 404);

    let lifeEvents = null;
    let workLifeEvents = null;
    let empAddressData = null;

    if (req.body?.life_events) {
      try {
        lifeEvents =
          typeof req.body.life_events === "string"
            ? JSON.parse(req.body.life_events)
            : req.body.life_events;
      } catch (e) {
        console.error("Error parsing life_events:", e);
        lifeEvents = null;
      }
    }

    if (req.body?.work_life_events) {
      try {
        workLifeEvents =
          typeof req.body.work_life_events === "string"
            ? JSON.parse(req.body.work_life_events)
            : req.body.work_life_events;
      } catch (e) {
        console.error("Error parsing work_life_events:", e);
        workLifeEvents = null;
      }
    }

    if (req.body?.empAddressData) {
      try {
        empAddressData =
          typeof req.body.empAddressData === "string"
            ? JSON.parse(req.body.empAddressData)
            : req.body.empAddressData;
      } catch (e) {
        console.error("Error parsing empAddressData:", e);
        empAddressData = null;
      }
    }

    let data = {
      ...req.body,
      updatedby: req.user.id,
      empAddressData: empAddressData,
      life_events: lifeEvents,
      work_life_events: workLifeEvents,
    };

    if (req.files && req.files.length > 0) {
      const profilePicFile = req.files.find(
        (f) => f.fieldname === "profile_pic"
      );

      if (profilePicFile) {
        const fileUrl = await uploadToBackblaze(
          profilePicFile.buffer,
          profilePicFile.originalname,
          profilePicFile.mimetype,
          "profile_pics",
          true,
          512
        );

        data.profile_pic = fileUrl;

        if (existingData.profile_pic) {
          await deleteFromBackblaze(existingData.profile_pic);
        }
      }
    }

    const updatedEmployee = await ensureTenantContext(tenantDb, () =>
      EmployeeService.updateEmployee(req.params.id, data)
    );

    res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee,
      status: 200,
    });
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
      await deleteFromBackblaze(existingData.profile_pic);
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

const getAllEmployee = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, status } = req.query;

    const deals = await EmployeeService.getAllEmployee(
      Number(page),
      Number(size),
      search,
      startDate && moment(startDate),
      endDate && moment(endDate),
      status
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

module.exports = {
  createEmployee,
  findEmployeeById,
  updateEmployee,
  deleteEmployee,
  getAllEmployee,
  employeeOptions,
};
