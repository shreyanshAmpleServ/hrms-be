const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("../src/routes/index");
// const { logActivity } = require("./utils/ActivityLogger.js");

// const responseHandler = require("../src/utils/responseMiddleware.js");
const responseHandler = require("../src/utils/responseMiddleware.js");

const cookieParser = require("cookie-parser");
// const { errorHandler } = require("../src/utils/errorMiddleware.js");
const errorHandler = require("../src/utils/errorMiddleware.js");

// const isProduction = process.env.NODE_ENV === 'production';

dotenv.config();

const app = express();

// app.use((req, res, next) => {
//   res.success = async (message = "Success", data = null) => {
//     try {
//       // Infer action_type from method
//       const action_type = req.method === "GET" ? "GET" : "POST";

//       // Infer module from route path
//       const module = (req.baseUrl || req.originalUrl || "")
//         .replace("/api", "")
//         .replace(/^\//, "")
//         .replace(/[-_]/g, " ")
//         .replace(/\b\w/g, (l) => l.toUpperCase());

//       // Infer reference_id (from returned data or req.body.id)
//       let reference_id = null;
//       if (data?.id) reference_id = data.id;
//       else if (Array.isArray(data) && data[0]?.id) reference_id = data[0].id;
//       else if (req.body?.id) reference_id = req.body.id;

//       // Log activity if user & module exists
//       if (req.user?.employee_id && module && message) {
//         await logActivity({
//           employee_id: req.user.employee_id,
//           module,
//           activity: message,
//           reference_id,
//           description: null,
//           action_type,
//         });
//       }
//     } catch (e) {
//       console.warn("Activity log skipped:", e.message);
//     }

//     return res.status(200).json({
//       success: true,
//       message,
//       data,
//     });
//   };

//   res.error = (message = "Something went wrong", status = 500) => {
//     return res.status(status).json({
//       success: false,
//       message,
//       data: null,
//       status,
//     });
//   };

//   next();
// });

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // Support URL-encoded bodies
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.29.90:3000",
      "http://192.168.29.74:3000",
      "http://10.160.5.101:3000",
      "http://10.160.5.101:3001",
    ], // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);

// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );
app.use(responseHandler);
app.use("/uploads", express.static("uploads"));
app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
