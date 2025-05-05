const userModel = require('../models/userModel');
const BCRYPT_COST = 8;
const bcrypt = require('bcryptjs');

const createUser = async (data) => {
  const hashedPasswordPromise = bcrypt.hash(data?.password, BCRYPT_COST);
  const [hashedPassword] = await Promise.all([hashedPasswordPromise]);
  const uddateData= {
    ...data,
    password:hashedPassword
  }
  return await userModel.createUser(uddateData);
};

const findUserByEmail = async (email) => {
  return await userModel.findUserByEmail(email);
};

const findUserById = async (id) => {
  return await userModel.findUserById(id);
};

const updateUser = async (id, data) => {
  if(data?.password){
    if(data?.currentPassword){
      user = await userModel.findUserByEmail(data?.email);

      if (!user) {
        throw new Error("User not found");
      }
      console.log("Is Matched : ", typeof data?.currentPassword , user)

      const isMatch = await bcrypt.compare(data?.currentPassword, user.password); // ✅


      if (!isMatch) {
        throw new Error("Current password is incorrect"); // ❌ Reject if wrong
      }
      const {currentPassword,...datas} = data
      data = {...datas}
    }
  const hashedPasswordPromise = bcrypt.hash(data?.password, BCRYPT_COST);
  const [hashedPassword] = await Promise.all([hashedPasswordPromise]);
  const updateData= {
    ...data,
    password:hashedPassword
  }
  data = updateData
}
  return await userModel.updateUser(id, data);
};

const deleteUser = async (id) => {
  return await userModel.deleteUser(id);
};

const getAllUsers = async (search,page , size ,startDate, endDate) => {
  return await userModel.getAllUsers(search,page , size ,startDate, endDate);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsers,
};
