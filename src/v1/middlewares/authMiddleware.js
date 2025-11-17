const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtSecret = process.env.JWT_SECRET;
const userModel = require("../models/userModel");
const { getPrisma } = require("../../config/prismaContext.js");

const authenticateToken = async (req, res, next) => {
  const token = req.cookies?.authToken; // Get the token from the cookie

  if (!token) {
    return res.error("Access denied. No token provided.", 403); // Using res.error for error response
  }

  try {
    const decoded = jwt.verify(token, jwtSecret); // Decode the JWT token
    const userId = decoded.userId; // Extract userId from the decoded token

    // Fetch the user from the database or cache using the userId
    const user = await userModel.findUserById(userId); // This assumes a `findUserById` method in your user model

    if (!user) {
      return res.error("User not found", 403); // Using res.error for user not found
    }

    req.user = user; // Attach the full user object to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.error(
      error.message || "Invalid or expired token",
      error.status || 403
    ); // Using res.error for invalid token
  }
};

module.exports = { authenticateToken };
