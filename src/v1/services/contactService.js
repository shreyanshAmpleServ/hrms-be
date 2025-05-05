const contactModel = require('../models/contactModel');

const createContact = async (data) => {
  return await contactModel.createContact(data);
};

const findContactById = async (id) => {
  return await contactModel.findContactById(id);
};

const findContactByEmail = async (email) => {
  return await contactModel.findContactByEmail(email);
};

const updateContact = async (id, data) => {
  return await contactModel.updateContact(id, data);
};

const deleteContact = async (id) => {
  return await contactModel.deleteContact(id);
};

const getAllContacts = async (search ,page , size ,startDate,endDate) => {
  return await contactModel.getAllContacts(search ,page , size ,startDate,endDate);
};

module.exports = {
  createContact,
  findContactById,
  findContactByEmail,
  updateContact,
  deleteContact,
  getAllContacts,
};
