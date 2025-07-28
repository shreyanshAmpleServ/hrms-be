const defaultConfigurationService = require("../services/defaultConfigurationService.js");
const CustomError = require("../../utils/CustomError");
const moment = require("moment");
const fs = require("fs");
const {
  uploadToBackblaze,
  deleteFromBackblaze,
} = require("../../utils/uploadBackblaze.js");

const createDefaultConfiguration = async (req, res, next) => {
  try {
    let companyLogo = null;
    let companySignature = null;

    console.log(
      "company_logo file buffer",
      req.files?.company_logo?.[0]?.buffer
    );
    if (req.files?.company_logo) {
      const file = req.files.company_logo[0];
      const buffer = file.buffer;
      companyLogo = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_logo"
      );
    }

    if (req.files?.company_signature) {
      const file = req.files.company_signature[0];
      const buffer = file.buffer;
      companySignature = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_signature"
      );
    }
    console.log("company url", companyLogo, companySignature);
    const data = {
      ...req.body,
      createdby: req.user.id,
      company_logo: companyLogo,
      company_signature: companySignature,
      log_inst: req.user.log_inst,
    };
    const reqData =
      await defaultConfigurationService.createDefaultConfiguration(data);
    res
      .status(201)
      .success("Default Configuration created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findDefaultConfiguration = async (req, res, next) => {
  try {
    const reqData = await defaultConfigurationService.findDefaultConfiguration(
      req.params.id
    );
    if (!reqData) throw new CustomError("Default Configuration not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateDefaultConfiguration = async (req, res, next) => {
  try {
    const existingData =
      await defaultConfigurationService.findDefaultConfiguration(req.params.id);

    let companyLogoUrl = existingData.company_logo;
    let companySignatureUrl = existingData.company_signature;
    if (req.files?.company_logo) {
      const file = req.files.company_logo[0];
      const buffer = file.buffer;
      companyLogoUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_logo"
      );
      if (existingData.company_logo) {
        await deleteFromBackblaze(existingData.company_logo);
      }
    }
    if (req.files?.company_signature) {
      const file = req.files.company_signature[0];
      const buffer = file.buffer;
      companySignatureUrl = await uploadToBackblaze(
        buffer,
        file.originalname,
        file.mimetype,
        "company_signature"
      );
      if (existingData.company_signature) {
        await deleteFromBackblaze(existingData.company_signature);
      }
    }
    const data = {
      ...req.body,
      employee_id: Number(req.body.employee_id),
      company_logo: companyLogoUrl,
      company_signature: companySignatureUrl,
      updatedby: Number(req.user.employee_id),
      log_inst: req.user.log_inst || Number(req.user.employee_id),
    };
    console.log("data ; ", req.params);
    const updated =
      await defaultConfigurationService.updateDefaultConfiguration(
        req.params.id,
        data
      );

    res
      .status(200)
      .success("Default Configuration updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

const deleteDefaultConfiguration = async (req, res, next) => {
  try {
    const reqData =
      await defaultConfigurationService.deleteDefaultConfiguration(
        req.params.id
      );
    res
      .status(200)
      .success("Default Configuration deleted successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const getAllDefaultConfiguration = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await defaultConfigurationService.getAllDefaultConfiguration(
      search,
      Number(page),
      Number(size),
      startDate && moment(startDate),
      endDate && moment(endDate)
    );
    res.status(200).success(null, data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDefaultConfiguration,
  getAllDefaultConfiguration,
  updateDefaultConfiguration,
  deleteDefaultConfiguration,
  findDefaultConfiguration,
};
