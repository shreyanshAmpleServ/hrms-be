const payRollSettingsService = require("../services/payrollConfigService");
const CustomError = require("../../utils/CustomError");
const { generateFullUrl } = require("../../utils/helper");
const moment = require("moment");

// const sanitizePayRollConfigSettingData = (data) => {
//     return {
//         title: data.title ? String(data.title).trim() : null,
//         PayRollConfigSetting: data.PayRollConfigSetting ? String(data.PayRollConfigSetting).trim() : null,
//         attachment: data.attachment ? String(data.attachment).trim() : null,

//         // Metadata
//         createdBy: data.createdBy || 1,
//         log_inst: data.log_inst || 1,
//     };
// };

const createPayRollConfigSetting = async (req, res, next) => {
  try {
    console.log("daata : ", req.body);
    let PayRollConfigSettingData = { ...req.body };
    const PayRollConfigSetting =
      await payRollSettingsService.createPayRollConfigSetting(
        PayRollConfigSettingData
      );
    res
      .status(201)
      .success(
        "PayRoll Configuration Setting created successfully",
        PayRollConfigSetting
      );
  } catch (error) {
    next(error);
  }
};

const getPayRollConfigSettingById = async (req, res, next) => {
  try {
    const PayRollConfigSetting =
      await payRollSettingsService.findPayRollConfigSettingById(req.params.id);
    if (!PayRollConfigSetting)
      throw new CustomError("PayRoll Configuration Setting not found", 404);

    res.status(200).success(null, PayRollConfigSetting);
  } catch (error) {
    next(error);
  }
};

const updatePayRollConfigSetting = async (req, res, next) => {
  try {
    // const attachmentPath = req.file ? req.file.path : null;
    let PayRollConfigSettingData = { ...req.body };
    // if (attachmentPath) PayRollConfigSettingData.attachment = generateFullUrl(req, attachmentPath);

    // PayRollConfigSettingData = sanitizePayRollConfigSettingData(PayRollConfigSettingData);

    const PayRollConfigSetting =
      await payRollSettingsService.updatePayRollConfigSetting(
        req.params.id,
        PayRollConfigSettingData
      );
    res
      .status(200)
      .success(
        "PayRoll Configuration Setting updated successfully",
        PayRollConfigSetting
      );
  } catch (error) {
    next(error);
  }
};

const deletePayRollConfigSetting = async (req, res, next) => {
  try {
    await payRollSettingsService.deletePayRollConfigSetting(req.params.id);
    res
      .status(200)
      .success("PayRoll Configuration Setting deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllPayRollConfigSetting = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate, is_active } = req.query;
    const companies = await payRollSettingsService.getAllPayRollConfigSetting(
      Number(page),
      Number(size),
      search,
      startDate && moment(startDate),
      endDate && moment(endDate),
      is_active
    );
    res.status(200).success(null, companies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayRollConfigSetting,
  getPayRollConfigSettingById,
  updatePayRollConfigSetting,
  deletePayRollConfigSetting,
  getAllPayRollConfigSetting,
};
