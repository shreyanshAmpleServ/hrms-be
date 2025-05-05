const permisssionService = require('../services/roleModulePermissionService');
const CustomError = require('../../utils/CustomError');
const { generateFullUrl } = require('../../utils/helper');

const formatContact = {

}

const createPermission = async (req, res, next) => {
  try {
    const Permission = await permisssionService.createPermission(req.body)
    res.status(201).success('Permission created successfully', Permission);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const contact = await permisssionService.findContactById(req.params.id);
    if (!contact) throw new CustomError('Contact not found', 404);
    res.status(200).success(null, contact);
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const ImagePath = req.file ? req.file.path : null; // Construct path
    let contactData = { ...req.body };
    delete contactData.id;
    if (ImagePath) contactData.image = generateFullUrl(req,ImagePath);
    const contact = await permisssionService.updateContact(req.params.id, {
      ...contactData ,
      company_id: Number(req.body.company_id),
      deal_id:Number(req.body.deal_id),
      owner: Number(req.body.owner),
      source:Number(req.body.source),
      industry:Number(req.body.industry),
      reviews:Number(req.body.reviews),
      emailOptOut: Boolean(req.body.emailOptOut)});
    res.status(200).success('Contact updated successfully', contact);
  } catch (error) {
    next(error);
  }
};

const deleteContact = async (req, res, next) => {
  try {
    await permisssionService.deleteContact(req.params.id);
    res.status(200).success('Contact deleted successfully', null);
  } catch (error) {
    next(error);
  }
};

const getAllPermission = async (req, res, next) => {
  try {
    const contacts = await permisssionService.getAllPermission(req.query.role_id);
    res.status(200).success(null, contacts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPermission,
  getContactById,
  updateContact,
  deleteContact,
  getAllPermission,
};
