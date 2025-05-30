const helpdeskTicketService = require("../services/helpDeskTicketService.js");
const CustomError = require("../../utils/CustomError.js");
const moment = require("moment");

const createHelpdeskTicket = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await helpdeskTicketService.createHelpdeskTicket(data);
    res.status(201).success("Helpdesk ticket created successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const findHelpdeskTicket = async (req, res, next) => {
  try {
    const reqData = await helpdeskTicketService.findHelpdeskTicketById(
      req.params.id
    );
    if (!reqData) throw new CustomError("Helpdesk ticket not found", 404);
    res.status(200).success(null, reqData);
  } catch (error) {
    next(error);
  }
};

const updateHelpdeskTicket = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      updatedby: req.user.id,
      log_inst: req.user.log_inst,
    };
    const reqData = await helpdeskTicketService.updateHelpdeskTicket(
      req.params.id,
      data
    );
    res.status(200).success("Helpdesk ticket updated successfully", reqData);
  } catch (error) {
    next(error);
  }
};

const deleteHelpdeskTicket = async (req, res, next) => {
  try {
    await helpdeskTicketService.deleteHelpdeskTicket(req.params.id);
    res.status(200).success("Helpdesk ticket deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllHelpdeskTickets = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const data = await helpdeskTicketService.getAllHelpdeskTickets(
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
  createHelpdeskTicket,
  findHelpdeskTicket,
  updateHelpdeskTicket,
  deleteHelpdeskTicket,
  getAllHelpdeskTickets,
};
