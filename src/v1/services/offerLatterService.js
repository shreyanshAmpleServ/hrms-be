const offerLatterModel = require("../models/offerLatterModel");
const { getPrisma } = require("../../config/prismaContext.js");

const createOfferLetter = async (data) => {
  return await offerLatterModel.createOfferLetter(data);
};

const findOfferLetterById = async (id) => {
  return await offerLatterModel.findOfferLetterById(id);
};

const updateOfferLetter = async (id, data) => {
  return await offerLatterModel.updateOfferLetter(id, data);
};

const deleteOfferLetter = async (id) => {
  return await offerLatterModel.deleteOfferLetter(id);
};

const getAllOfferLetter = async (
  search,
  page,
  size,
  startDate,
  endDate,
  candidate_id
) => {
  return await offerLatterModel.getAllOfferLetter(
    search,
    page,
    size,
    startDate,
    endDate,
    candidate_id
  );
};

const updateOfferLetterStatus = async () => {
  return await offerLatterModel.updateOfferLetterStatus(id, data);
};

const getOfferLetterForPDF = async (id) => {
  return await offerLatterModel.getOfferLetterForPDF(id);
};

const getAllOfferLettersForBulkDownload = async (filters = {}) => {
  return await offerLatterModel.getAllOfferLettersForBulkDownload(filters);
};

module.exports = {
  createOfferLetter,
  findOfferLetterById,
  updateOfferLetter,
  deleteOfferLetter,
  getAllOfferLetter,
  updateOfferLetterStatus,
  getOfferLetterForPDF,
  getAllOfferLettersForBulkDownload,
};
