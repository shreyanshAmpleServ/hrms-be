const vendorModel = require('../models/vendorModel');
const BCRYPT_COST = 8;
const bcrypt = require('bcryptjs');

const createVendor = async (data) => {
  // const hashedPasswordPromise = bcrypt.hash(data?.password, BCRYPT_COST);
  // const [hashedPassword] = await Promise.all([hashedPasswordPromise]);
  // const uddateData= {
  //   ...data,
  //   password:hashedPassword
  // }

  return await vendorModel.createVendor(data);
};

const findUserByEmail = async (email) => {
  return await vendorModel.findUserByEmail(email);
};

const findVendorById = async (id) => {
  return await vendorModel.findVendorById(id);
};

const updateVendor = async (id, data) => {
  return await vendorModel.updateVendor(id, data);
};

const deleteVendor = async (id) => {
  return await vendorModel.deleteVendor(id);
};

const getAllVendors = async (search,page,size ,startDate,endDate) => {
  return await vendorModel.getAllVendors(search,page,size ,startDate,endDate);
};

module.exports = {
  createVendor,
  findUserByEmail,
  findVendorById,
  updateVendor,
  deleteVendor,
  getAllVendors,
};
