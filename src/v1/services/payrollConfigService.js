const payRollSettingsModal = require("../models/payrollConfigSettingModal");

const createPayRollConfigSetting = async (data) => {
  return await payRollSettingsModal.createPayRollConfigSetting(data);
};

const findPayRollConfigSettingById = async (id) => {
  return await payRollSettingsModal.findPayRollConfigSettingById(id);
};

const updatePayRollConfigSetting = async (id, data) => {
  return await payRollSettingsModal.updatePayRollConfigSetting(id, data);
};

const deletePayRollConfigSetting = async (id) => {
  return await payRollSettingsModal.deletePayRollConfigSetting(id);
};

const getAllPayRollConfigSetting = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await payRollSettingsModal.getAllPayRollConfigSetting(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createPayRollConfigSetting,
  findPayRollConfigSettingById,
  updatePayRollConfigSetting,
  deletePayRollConfigSetting,
  getAllPayRollConfigSetting,
};
