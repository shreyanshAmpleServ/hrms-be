const HolidayCalenderModel = require('../models/HolidayCalenderModel');

const createHoliday = async (data) => {
  return await HolidayCalenderModel.createHoliday(data);
};

const findHolidayById = async (id) => {
  return await HolidayCalenderModel.findHolidayById(id);
};

const updateHoliday = async (id, data) => {
  return await HolidayCalenderModel.updateHoliday(id, data);
};

const deleteHoliday = async (id) => {
  return await HolidayCalenderModel.deleteHoliday(id);
};

const getAllHoliday = async (page, size, search,  startDate,endDate) => {
  return await HolidayCalenderModel.getAllHoliday(page, size, search,  startDate,endDate);
};

module.exports = {
  createHoliday,
  findHolidayById,
  updateHoliday,
  deleteHoliday,
  getAllHoliday,
};