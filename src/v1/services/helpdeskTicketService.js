const helpdeskTicketModel = require("../models/helpdeskTicketModel.js");
const { getPrisma } = require("../../config/prismaContext.js");

const createHelpdeskTicket = async (data) => {
  return await helpdeskTicketModel.createHelpdeskTicket(data);
};

const findHelpdeskTicketById = async (id) => {
  return await helpdeskTicketModel.findHelpdeskTicketById(id);
};

const updateHelpdeskTicket = async (id, data) => {
  return await helpdeskTicketModel.updateHelpdeskTicket(id, data);
};

const deleteHelpdeskTicket = async (id) => {
  return await helpdeskTicketModel.deleteHelpdeskTicket(id);
};

const getAllHelpdeskTickets = async (
  search,
  page,
  size,
  startDate,
  endDate
) => {
  return await helpdeskTicketModel.getAllHelpdeskTickets(
    search,
    page,
    size,
    startDate,
    endDate
  );
};

module.exports = {
  createHelpdeskTicket,
  findHelpdeskTicketById,
  updateHelpdeskTicket,
  deleteHelpdeskTicket,
  getAllHelpdeskTickets,
};
