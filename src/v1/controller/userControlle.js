const userService = require("../services/userService");
const CustomError = require("../../utils/CustomError");
const { generateFullUrl } = require("../../utils/helper");
const moment = require("moment");
const {
  deleteFromBackblaze,
  uploadToBackblaze,
} = require("../../utils/uploadBackblaze");
const { findUserById } = require("../models/userModel");

const sanitizeData = (data) => {
  const { repeatPassword, role_id, ...sanitizedData } = data; // Exclude repeatPassword
  return {
    ...sanitizedData,
    role_id: role_id ? parseInt(role_id, 10) : undefined, // Convert role_id to an integer
  };
};
const createUser = async (req, res, next) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToBackblaze(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        "users"
      );
    }
    let userData = { ...req.body, profile_img: imageUrl };
    userData = sanitizeData(userData);
    const user = await userService.createUser(userData);

    // If userService.createUser returns an error object, handle it here
    if (user && user.success === false) {
      return res.status(user.status || 400).json({
        success: false,
        message: user.message,
        status: user.status || 400,
      });
    }

    res.status(201).success("User created successfully", user);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.params.id);
    if (!user) throw new CustomError("User not found", 404);
    res.status(200).success(null, user);
  } catch (error) {
    next(error);
  }
};
const getUserByToken = async (req, res, next) => {
  try {
    const user = await userService.findUserById(req.user.id);
    if (!user) throw new CustomError("User not found", 404);
    res.status(200).success(null, user);
  } catch (error) {
    next(error);
  }
};

const getUserByEmail = async (req, res, next) => {
  try {
    const user = await userService.findUserByEmail(req.params.email);
    if (!user) throw new CustomError("User not found", 404);
    res.status(200).success(null, user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    // Initialize user data with sanitized request body
    let userData = sanitizeData(req.body);
    const existingData = await findUserById(req.params.id);

    // Update profile_img only if a new image is provided
    if (req.file) {
      userData.profile_img =
        (await uploadToBackblaze(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          "users"
        )) || null;
    }

    const user = await userService.updateUser(req.params.id, userData);
    res.status(200).success("User updated successfully", user);
    if (req.file) {
      if (existingData.profile_img) {
        await deleteFromBackblaze(existingData.profile_img); // Delete the old logo
      }
    }
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    // Prevent a user from deleting themselves
    if (parseInt(req.params.id) === req.user.id) {
      throw new CustomError("You cannot delete your own account.", 400);
    }
    const existingData = await findUserById(req.params.id);
    if (existingData.profile_img) {
      await deleteFromBackblaze(existingData.profile_img); // Delete the old logo
    }
    await userService.deleteUser(req.params.id);
    res.status(200).success("User deleted successfully", null);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page, size, search, startDate, endDate } = req.query;
    const users = await userService.getAllUsers(
      search,
      Number(page),
      Number(size),
      moment(startDate),
      moment(endDate)
    );
    res.status(200).success(null, users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserByToken,
};
