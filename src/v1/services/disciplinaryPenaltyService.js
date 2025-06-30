const disciplinaryPenaltyModel = require("../models/disciplinaryPenaltyModel");

const createDisciplinaryPenalty = async (data) => {
  return await disciplinaryPenaltyModel.createDisciplinaryPenalty(data);
};

const findDisciplinaryPenaltyById = async (id) => {
  return await disciplinaryPenaltyModel.findDisciplinaryPenaltyById(id);
};

const updateDisciplinaryPenalty = async (id, data) => {
  return await disciplinaryPenaltyModel.updateDisciplinaryPenalty(id, data);
};

const deleteDisciplinaryPenalty = async (id) => {
  return await disciplinaryPenaltyModel.deleteDisciplinaryPenalty(id);
};

const getAllDisciplinaryPenalty = async (
  page,
  size,
  search,
  startDate,
  endDate,
  is_active
) => {
  return await disciplinaryPenaltyModel.getAllDisciplinaryPenalty(
    page,
    size,
    search,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createDisciplinaryPenalty,
  findDisciplinaryPenaltyById,
  updateDisciplinaryPenalty,
  deleteDisciplinaryPenalty,
  getAllDisciplinaryPenalty,
};
