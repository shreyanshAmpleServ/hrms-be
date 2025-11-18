// const jwt = require("jsonwebtoken");
// require("dotenv").config();
// const jwtSecret = process.env.JWT_SECRET;
// const userModel = require("../models/userModel"); // Import your user model to fetch user details from DB or cache

// const authenticateToken = async (req, res, next) => {
//   const token = req.cookies?.authToken; // Get the token from the cookie

//   if (!token) {
//     return res.error("Access denied. No token provided.", 403); // Using res.error for error response
//   }

//   try {
//     const decoded = jwt.verify(token, jwtSecret); // Decode the JWT token
//     const userId = decoded.userId; // Extract userId from the decoded token

//     // Ensure prisma client is available
//     if (!req.prisma) {
//       return res.error("Database connection not available", 503);
//     }

//     // Fetch the user from the database or cache using the userId
//     const user = await userModel.findUserById(req.prisma, userId); // This assumes a `findUserById` method in your user model

//     if (!user) {
//       return res.error("User not found", 403); // Using res.error for user not found
//     }

//     req.user = user; // Attach the full user object to the request object
//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     return res.error(
//       error.message || "Invalid or expired token",
//       error.status || 403
//     ); // Using res.error for invalid token
//   }
// };

// module.exports = { authenticateToken };

const jwt = require("jsonwebtoken");
const { withTenantContext } = require("../../utils/prismaProxy");
const { startScheduler } = require("../services/alertWorkflowService");
const logger = require("../../Comman/logger");

// const authenticateToken = (req, res, next) => {
//   const token =
//     req.cookies.authToken || req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Access denied. No token provided.",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const tenantDb = decoded.tenantDb;

//     if (!tenantDb) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token. No tenant database found.",
//       });
//     }

//     req.user = decoded;
//     req.tenantDb = tenantDb;

//     console.log(` Auth: User ${decoded.userId} | Tenant: ${tenantDb}`);

//     withTenantContext(tenantDb, () => {
//       next();
//     });
//   } catch (error) {
//     return res.status(403).json({
//       success: false,
//       message:
//         error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
//     });
//   }
// };

let schedulerInitialized = false;

const authenticateToken = async (req, res, next) => {
  const token =
    req.cookies.authToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tenantDb = decoded.tenantDb;

    if (!tenantDb) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. No tenant database found.",
      });
    }

    req.user = decoded;
    req.tenantDb = tenantDb;

    console.log(`Auth: User ${decoded.userId} | Tenant: ${tenantDb}`);

    // Use withTenantContext to wrap the entire request handling
    // The context will be maintained for all async operations in the request chain
    // asyncLocalStorage maintains context across async boundaries automatically
    return withTenantContext(tenantDb, async () => {
      if (!schedulerInitialized) {
        try {
          logger.info(
            " Starting alert workflow scheduler (first authenticated request)..."
          );
          await startScheduler();
          schedulerInitialized = true;
          logger.info(" Alert workflow scheduler started successfully");
        } catch (error) {
          logger.error(
            "Failed to start alert workflow scheduler:",
            error.message
          );
        }
      }
      // Call next() within the tenant context
      // The asyncLocalStorage context will be maintained for all subsequent operations
      // Ensure we properly await async route handlers to maintain context
      try {
        const result = next();
        if (result && typeof result.then === "function") {
          return await result;
        }
        return result;
      } catch (error) {
        // If next() throws synchronously, re-throw it
        throw error;
      }
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message:
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};
module.exports = { authenticateToken };
