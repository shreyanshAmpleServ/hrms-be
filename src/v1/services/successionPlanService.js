const successionPlanModel = require("../models/successionPlanModel.js");

const createSuccessionPlan = async (data) => {
  return await successionPlanModel.createSuccessionPlan(data);
};

const findSuccessionPlanById = async (id) => {
  return await successionPlanModel.findSuccessionPlanById(id);
};

const updateSuccessionPlan = async (id, data) => {
  return await successionPlanModel.updateSuccessionPlan(id, data);
};

const deleteSuccessionPlan = async (id) => {
  return await successionPlanModel.deleteSuccessionPlan(id);
};

const getAllSuccessionPlan = async (search, page, size, startDate, endDate) => {
  return await successionPlanModel.getAllSuccessionPlans(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createSuccessionPlan,
  findSuccessionPlanById,
  updateSuccessionPlan,
  deleteSuccessionPlan,
  getAllSuccessionPlan,
};
