// // authService.js
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const userModel = require("../models/userModel"); // Import the user model
// const redis = require("redis");
// const CustomError = require("../../utils/CustomError");
// const { use } = require("../routes/contactRoutes");
// const redisClient = redis.createClient({ url: process.env.REDIS_URL });
// redisClient.connect();
// require("dotenv").config();
// const jwtSecret = process.env.JWT_SECRET;
// const BCRYPT_COST = 8;
// const registerUser = async (email, password, fullName = null, role_id) => {
//   try {
//     // Hash the password
//     const hashedPasswordPromise = bcrypt.hash(password, BCRYPT_COST);
//     const [hashedPassword] = await Promise.all([hashedPasswordPromise]);

//     // Check if the user is already registered by using Redis to cache lookup
//     const cachedUser = await redisClient.get(email);
//     if (cachedUser) {
//       throw new Error("User already registered");
//     }

//     // Create the user in the database
//     const user = await userModel.createUser({
//       username: email,
//       email,
//       password: hashedPassword,
//       full_name: fullName,
//       role_id,
//     });

//     // Cache the user data in Redis (expire after 1 hour)
//     await redisClient.setEx(email, 3600, JSON.stringify(user));

//     // Return the created user object
//     return user;
//   } catch (error) {
//     throw new CustomError(
//       error.message || "Failed to login user",
//       error.status || 500
//     );
//   }
// };

// const loginUser = async (email, password) => {
//   try {
//     // Check Redis cache first
//     const cachedUser = await redisClient.get(email);
//     let user;
//     // if (!cachedUser) {
//     //   console.log("Catched Data ;")         // Fetch cached user
//     //   user = JSON.parse(cachedUser);
//     // } else {
//     //   console.log("DB Data ;")
//     user = await userModel.findUserByEmail(email); // Fetch from DB
//     //   if (user) {
//     //     await redisClient.setEx(email, 3600, JSON.stringify(user)); // Set user in cache for 1 hour
//     //   }
//     // }
//     if (!user) throw new CustomError("User not found", 401);

//     const [isValidPassword, token] = await Promise.all([
//       bcrypt.compare(password, user.password),
//       jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "10h" }),
//     ]);

//     if (!isValidPassword) throw new CustomError("Invalid password", 401);
//     delete user.password;

//     return { user, token };
//   } catch (error) {
//     console.error("Error stack:", error.stack);
//     throw new CustomError(
//       error.message || "Failed to login user",
//       error.status || 500
//     );
//   }
// };
// module.exports = { registerUser, loginUser };

// authService.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel"); // Import the user model
const CustomError = require("../../utils/CustomError");
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;
const BCRYPT_COST = 8;

const registerUser = async (email, password, fullName = null, role_id) => {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    // Check if the user already exists in the database
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      throw new CustomError("User already registered", 400);
    }

    // Create the user in the database
    const user = await userModel.createUser({
      username: email,
      email,
      password: hashedPassword,
      full_name: fullName,
      role_id,
    });

    // Return the created user object
    return user;
  } catch (error) {
    throw new CustomError(
      error.message || "Failed to register user",
      error.status || 500
    );
  }
};

const loginUser = async (email, password) => {
  try {
    // Fetch the user from the database
    const user = await userModel.findUserByEmail(email);
    if (!user) throw new CustomError("User not found", 401);

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new CustomError("Invalid password", 401);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, jwtSecret, {
      expiresIn: "10h",
    });

    delete user.password;

    return { user, token };
  } catch (error) {
    console.error("Error stack:", error.stack);
    throw new CustomError(
      error.message || "Failed to login user",
      error.status || 500
    );
  }
};

module.exports = { registerUser, loginUser };
