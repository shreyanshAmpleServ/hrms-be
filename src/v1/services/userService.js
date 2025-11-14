const userModel = require("../models/userModel");
const BCRYPT_COST = 8;
const bcrypt = require("bcryptjs");

const createUser = async (prisma, data) => {
  const hashedPasswordPromise = bcrypt.hash(data?.password, BCRYPT_COST);
  const [hashedPassword] = await Promise.all([hashedPasswordPromise]);
  const uddateData = {
    ...data,
    password: hashedPassword,
  };
  return await userModel.createUser(prisma, uddateData);
};

const findUserByEmail = async (prisma, email) => {
  return await userModel.findUserByEmail(prisma, email);
};

const findUserById = async (prisma, id) => {
  return await userModel.findUserById(prisma, id);
};

const updateUser = async (prisma, id, data) => {
  if (data?.password) {
    if (data?.currentPassword) {
      user = await userModel.findUserByEmail(prisma, data?.email);

      if (!user) {
        throw new Error("User not found");
      }
      console.log("Is Matched : ", typeof data?.currentPassword, user);

      const isMatch = await bcrypt.compare(
        data?.currentPassword,
        user.password
      );

      if (!isMatch) {
        throw new Error("Current password is incorrect");
      }
      const { currentPassword, ...datas } = data;
      data = { ...datas };
    }
    const hashedPasswordPromise = bcrypt.hash(data?.password, BCRYPT_COST);
    const [hashedPassword] = await Promise.all([hashedPasswordPromise]);
    const updateData = {
      ...data,
      password: hashedPassword,
    };
    data = updateData;
  }
  return await userModel.updateUser(prisma, id, data);
};

const deleteUser = async (prisma, id) => {
  return await userModel.deleteUser(prisma, id);
};

const getAllUsers = async (
  prisma,
  search,
  page,
  size,
  startDate,
  endDate,
  is_active
) => {
  return await userModel.getAllUsers(
    prisma,
    search,
    page,
    size,
    startDate,
    endDate,
    is_active
  );
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsers,
};
