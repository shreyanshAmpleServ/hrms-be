const contactService = require('../services/contactService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { uploadToBackblaze } = require('../../utils/uploadBackblaze');
const { findContactById } = require('../models/contactModel');

const createContact = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "contacts");
    }
    
    // Trim extra quotes if necessary
    let dateString = req.body.dateOfBirth;
    if (dateString && typeof dateString === "string") {
      dateString = dateString.replace(/^"(.*)"$/, "$1"); // Removes outer quotes if present
    }

    // Convert date string to a Date object
    let formattedDOB = dateString ? new Date(dateString) : null;

    // Check if Date is valid
    if (formattedDOB && isNaN(formattedDOB.getTime())) {
      throw new Error("Invalid date format");
    }

   
    const contact = await contactService.createContact({
      ...req.body,
      company_id: Number(req.body.company_id),
      deal_id:Number(req.body.deal_id),
      owner: Number(req.body.owner),
      source:Number(req.body.source),
      industry:Number(req.body.industry),
      reviews:Number(req.body.reviews),
      emailOptOut: Boolean(req.body.emailOptOut),
      dateOfBirth: formattedDOB, 
      image: imageUrl,
    });
    res.status(201).success('Contact created successfully', contact);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await contactService.findContactById(req.params.id);
    if (!contact) throw new CustomError('Contact not found', 404);
    res.status(200).success(null, contact);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const existingData = await findContactById(req.params.id);
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "contacts");
    }
    let contactData = { ...req.body };
    delete contactData.id;
    contactData.image = imageUrl;
    const contact = await contactService.updateContact(req.params.id, {
      ...contactData ,
      company_id: Number(req.body.company_id),
      deal_id:Number(req.body.deal_id),
      owner: Number(req.body.owner),
      source:Number(req.body.source),
      industry:Number(req.body.industry),
      reviews:Number(req.body.reviews),
      emailOptOut: Boolean(req.body.emailOptOut)});
    res.status(200).success('Contact updated successfully', contact);
    if (req.file) {
      if (existingData.image) {
        await deleteFromBackblaze(existingData.image); // Delete the old logo
      }}
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    const existingData = await findContactById(req.params.id);
    await contactService.deleteContact(req.params.id);
    res.status(200).success('Contact deleted successfully', null);
    if (existingData.image) {
      await deleteFromBackblaze(existingData.image); // Delete the old logo
    }
  } catch (error) {
    next(error);
  }
};

const getAllContacts = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate  } = req.query;
    const contacts = await contactService.getAllContacts(search ,Number(page), Number(size) ,moment(startDate),moment(endDate));
    res.status(200).success(null, contacts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContact,
  getContactById,
  updateContact,
  deleteContact,
  getAllContacts,
};
