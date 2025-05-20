const vendorService = require('../services/vendorService');
const CustomError = require('../../utils/CustomError');
const moment = require("moment");
const { generateFullUrl } = require('../../utils/helper');
const { uploadToBackblaze, deleteFromBackblaze } = require('../../utils/uploadBackblaze');
const vendorModel = require('../models/vendorModel');
// const sanitizeData = (data) => {
//     const { repeatPassword, role_id, ...sanitizedData } = data; // Exclude repeatPassword
//     return {
//         ...sanitizedData,
//         role_id: role_id ? parseInt(role_id, 10) : undefined, // Convert role_id to an integer
//     };
// };
const createVendor = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "vendor");
    } 
    let userData = { ...req.body,createdby:req.user.id, profile_img:imageUrl }; 
    // userData= sanitizeData(userData);
    const user = await vendorService.createVendor(userData);
    res.status(201).success('User created successfully', user);
  } catch (error) {
    next(error);
  }
};

const findVendorById = async (req, res, next) => {
  try {
    const user = await vendorService.findVendorById(req.params.id);
    if (!user) throw new CustomError('User not found', 404);
    res.status(200).success(null, user);
  } catch (error) {
    next(error);
  }
};

const getUserByEmail = async (req, res, next) => {
  try {
    const user = await vendorService.findUserByEmail(req.params.email);
    if (!user) throw new CustomError('User not found', 404);
    res.status(200).success(null, user);
  } catch (error) {
    next(error);
  }
};

const updateVendor = async (req, res, next) => {
  try {

    const existingData = await vendorModel.findVendorById(req.params.id);

    const vendorData = {...req.body,updatedby:req.user.id}
    // Update profile_img only if a new image is provided

    if (req.file) {
      vendorData.profile_img = await uploadToBackblaze(req.file.buffer, req.file.originalname, req.file.mimetype , "vendor") || null;
    } 
    const user = await vendorService.updateVendor(req.params.id, vendorData);
    res.status(200).success('User updated successfully', user);
    if (req.file) {
      if (existingData.profile_img) {
        await deleteFromBackblaze(existingData.profile_img); // Delete the old logo
      }}
  } catch (error) {
    next(error);
  }
};

const deleteVendor = async (req, res, next) => {
  try {
    
    // Prevent a user from deleting themselves
    if (parseInt(req.params.id) === req.user.id) {
      throw new CustomError("You cannot delete your own account.", 400);
    }
    const existingData = await vendorModel.findVendorById(req.params.id);
    await vendorService.deleteVendor(req.params.id);
    res.status(200).success('User deleted successfully', null);
    if (existingData.profile_img) {
      await deleteFromBackblaze(existingData.profile_img); // Delete the old logo
    }
  } catch (error) {
    next(error);
  }
};

const getAllVendors = async (req, res, next) => {
  try {
    const { page , size ,search ,startDate,endDate  } = req.query;
    const users = await vendorService.getAllVendors(search,Number(page), Number(size),startDate && moment(startDate),endDate && moment(endDate));
    res.status(200).success(null, users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVendor,
  findVendorById,
  getUserByEmail,
  updateVendor,
  deleteVendor,
  getAllVendors,
};
