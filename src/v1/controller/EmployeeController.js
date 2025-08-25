const EmployeeService = require("../services/EmployeeService");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const { generateFullUrl } = require("../../utils/helper");
const {
  deleteFromBackblaze,
  uploadToBackblaze,
} = require("../../utils/uploadBackblaze");

const createEmployee = async (req, res, next) => {
  try {
    let profilePicUrl = null;
    let nidaFileUrl = null;
    let nssfFileUrl = null;

    if (req.files?.profile_pic?.[0]) {
      const file = req.files.profile_pic[0];
      profilePicUrl = await uploadToBackblaze(
        file.buffer,
        file.originalname,
        file.mimetype,
        "profile_pics"
      );
    }

    if (req.files?.nida_file?.[0]) {
      const file = req.files.nida_file[0];
      nidaFileUrl = await uploadToBackblaze(
        file.buffer,
        file.originalname,
        file.mimetype,
        "nida_files"
      );
    }

    if (req.files?.nssf_file?.[0]) {
      const file = req.files.nssf_file[0];
      nssfFileUrl = await uploadToBackblaze(
        file.buffer,
        file.originalname,
        file.mimetype,
        "nssf_files"
      );
    }

    const employeeData = {
      ...req.body,
      profile_pic: profilePicUrl,
      nida_file: nidaFileUrl,
      nssf_file: nssfFileUrl,
      createdby: req.user.employee_id,
      log_inst: req.user.log_inst || req.user.employee_id,
    };

    const employee = await EmployeeService.createEmployee(employeeData);

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
      status: 201,
    });
  } catch (error) {
    next(error);
  }
};
const findEmployeeById = async (req, res, next) => {
  try {
    const deal = await EmployeeService.findEmployeeById(req.params.id);
    if (!deal) throw new CustomError("Employee not found", 404);
    res.status(200).success(null, deal);
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const existingData = await EmployeeService.findEmployeeById(req.params.id);
    if (!existingData) throw new CustomError("Employee not found", 404);

    let data = {
      ...req.body,
      updatedby: req.user.id,
      empAddressData: req.body?.empAddressData
        ? JSON.parse(req.body?.empAddressData)
        : null,
    };

    const replaceFile = async (existingFileUrl, file, folder) => {
      if (existingFileUrl) {
        try {
          await deleteFromBackblaze(existingFileUrl);
          console.log(`Old file deleted: ${existingFileUrl}`);
        } catch (err) {
          console.warn(
            `Failed to delete old file: ${existingFileUrl}`,
            err.message
          );
        }
      }

      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      const uploadRes = await uploadToBackblaze(
        file.buffer,
        fileName,
        file.mimetype
      );
      return uploadRes.downloadUrl;
    };

    if (req.files?.profile_pic) {
      const profilePic = req.files.profile_pic[0];
      const fileUrl = await uploadToBackblaze(
        profilePic.buffer,
        profilePic.originalname,
        profilePic.mimetype,
        "profile_pics"
      );
      data.profile_pic = fileUrl;

      if (existingData.profile_pic) {
        await deleteFromBackblaze(existingData.profile_pic);
      }
    }

    if (req.files?.nssf_file) {
      const nssfFile = req.files.nssf_file[0];
      const fileUrl = await uploadToBackblaze(
        nssfFile.buffer,
        nssfFile.originalname,
        nssfFile.mimetype,
        "nssf_files"
      );
      data.nssf_file = fileUrl;

      if (existingData.nssf_file) {
        await deleteFromBackblaze(existingData.nssf_file);
      }
    }

    if (req.files?.nida_file) {
      const nidaFile = req.files.nida_file[0];
      const fileUrl = await uploadToBackblaze(
        nidaFile.buffer,
        nidaFile.originalname,
        nidaFile.mimetype,
        "nida_files"
      );
      data.nida_file = fileUrl;

      if (existingData.nida_file) {
        await deleteFromBackblaze(existingData.nida_file);
      }
    }

    const updatedEmployee = await EmployeeService.updateEmployee(
      req.params.id,
      data
    );
    res.status(200).success("Employee updated successfully", updatedEmployee);
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const existingData = await EmployeeService.findEmployeeById(req.params.id);
    if (!existingData) throw new CustomError("Employee not found", 404);
    await EmployeeService.deleteEmployee(req.params.id);
    res.status(200).success("Employee deleted successfully", null);
    if (existingData.profile_pic) {
      await deleteFromBackblaze(existingData.profile_pic);
    }
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
    res.status(200).success(null, deals);
  } catch (error) {
    next(error);
  }
};

const employeeOptions = async (req, res, next) => {
  try {
    const employees = await EmployeeService.employeeOptions();
    res.status(200).success(null, employees);
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
