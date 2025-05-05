const leadService = require('../services/leadService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');
const moment = require("moment");
const { findLeadById } = require('../models/leadModel');
const { deleteFromBackblaze, uploadToBackblaze } = require('../../utils/uploadBackblaze');

// Sanitize lead data to ensure it's clean and properly formatted
const sanitizeLeadData = (req, data, imageUrl) => {
  return {
    // Lead details
    company_id: data.company_id ? Number(data.company_id) : null,
    first_name: data.first_name ? String(data.first_name).trim() : null,
    last_name: data.last_name ? String(data.last_name).trim() : null,
    title: data.title ? String(data.title).trim() : null,
    email: data.email ? String(data.email).toLowerCase().trim() : null,
    phone: data.phone ? String(data.phone).trim() : null,
    fax: data.fax ? String(data.fax).trim() : null,
    mobile: data.mobile ? String(data.mobile).trim() : null,
    website: data.website ? String(data.website).trim() : null,
    lead_source: data.lead_source ? parseInt(data.lead_source, 10) : null,
    lead_status: data.lead_status ? parseInt(data.lead_status, 10) : null,
    industry: data.industry ? parseInt(data.industry, 10) : null,
    no_of_employees: data.no_of_employees ? parseInt(data.no_of_employees, 10) : null,
    annual_revenue: data.annual_revenue ? parseFloat(data.annual_revenue) : null,
    revenue_currency: data.revenue_currency ? String(data.revenue_currency).trim() : null,
    rating: data.rating ? String(data.rating).trim() : null,
    tags: data.tags ? String(data.tags).trim() : null,
    email_opt_out: data.email_opt_out ? String(data.email_opt_out).trim() : 'N',
    secondary_email: data.secondary_email ? String(data.secondary_email).trim() : null,
    facebook_ac: data.facebook_ac ? String(data.facebook_ac).trim() : null,
    skype_id: data.skype_id ? String(data.skype_id).trim() : null,
    twitter_ac: data.twitter_ac ? String(data.twitter_ac).trim() : null,
    linked_in_ac: data.linked_in_ac ? String(data.linked_in_ac).trim() : null,
    whatsapp_ac: data.whatsapp_ac ? String(data.whatsapp_ac).trim() : null,
    instagram_ac: data.instagram_ac ? String(data.instagram_ac).trim() : null,
    street: data.street ? String(data.street).trim() : null,
    city: data.city ? String(data.city).trim() : null,
    state: data.state ? String(data.state).trim() : null,
    zipcode: data.zipcode ? String(data.zipcode).trim() : null,
    country: data.country ? String(data.country).trim() : null,
    description: data.description ? String(data.description).trim() : null,

    // Lead owner
    lead_owner: data.lead_owner ? parseInt(data.lead_owner, 10) : null,

    // Company icon
    company_icon: imageUrl,

    // Meta data
    is_active: data.is_active ? String(data.is_active).trim() : 'Y',
  };
};


const createLead = async (req, res, next) => {
  try {
    // Handle company icon upload if provided
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "lead");
    } 

    let leadData = { ...req.body };
    leadData = sanitizeLeadData(req, leadData, imageUrl); // Sanitize the lead data and handle company icon

    const lead = await leadService.createLead(leadData);
    res.status(201).success('Lead created successfully', lead);
  } catch (error) {
    next(error);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.findLeadById(req.params.id);
    if (!lead) throw new CustomError('Lead not found', 404);
    res.status(200).success(null, lead);
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    // Handle company icon upload if provided
    const existingData = await findLeadById(req.params.id);
    let imageUrl = req.body.company_icon;
    if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "lead");
    } 
    let leadData = { ...req.body };

    if (leadData?.update_partial) {
      leadData = { lead_status: leadData.lead_status ? parseInt(leadData.lead_status, 10) : null }

    } else {
      leadData = sanitizeLeadData(req, leadData, imageUrl);
    }

    console.log("Lead Data:", leadData);
    // Sanitize the lead data and handle company icon
    
    const lead = await leadService.updateLead(req.params.id, leadData);
    res.status(200).success('Lead updated successfully', lead);
    if (req.file) {
      if (existingData.company_icon) {
        await deleteFromBackblaze(existingData.company_icon); // Delete the old logo
      }}
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const existingData = await findLeadById(req.params.id);
    await leadService.deleteLead(req.params.id);
    res.status(200).success('Lead deleted successfully', null);
      if (existingData.company_icon) {
        await deleteFromBackblaze(existingData.company_icon); // Delete the old logo
      }
  } catch (error) {
    next(error);
  }
};

const getAllLeads = async (req, res, next) => {
  try {
    const { page , size , search ,startDate,endDate ,status   } = req.query;
    const leads = await leadService.getAllLeads(Number(page), Number(size) ,search ,moment(startDate),moment(endDate), status);
    res.status(200).success(null, leads);
  } catch (error) {
    next(error);
  }
};

const getAllLeadsGroupedByLostReasons = async (req, res, next) => {
  try {
    const leads = await leadService.getAllLeadsGroupedByLostReasons();
    res.status(200).success(null, leads);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLead,
  getLeadById,
  getAllLeadsGroupedByLostReasons,
  updateLead,
  deleteLead,
  getAllLeads,
};
