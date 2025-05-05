const leadsModel = require('../models/leadModel');

const createLead = async (data) => {
  return await leadsModel.createLead(data);
};

const findLeadById = async (id) => {
  return await leadsModel.findLeadById(id);
};

const updateLead = async (id, data) => {
  return await leadsModel.updateLead(id, data);
};

const deleteLead = async (id) => {
  return await leadsModel.deleteLead(id);
};

const getAllLeads = async (page , size , search ,startDate,endDate ,status ) => {
  return await leadsModel.getAllLeads(page , size , search ,startDate,endDate ,status );
};
const getAllLeadsGroupedByLostReasons = async () => {
  return await leadsModel.getAllLeadsGroupedByLostReasons();
};


module.exports = {
  createLead,
  findLeadById,
  updateLead,
  deleteLead,
  getAllLeads,
  getAllLeadsGroupedByLostReasons
};
