// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const routes = require("../src/routes/index");

// const responseHandler = require("../src/utils/responseMiddleware.js");
// const cookieParser = require("cookie-parser");
// const errorHandler = require("../src/utils/errorMiddleware.js");
// const tenantMiddleware = require("./v1/middlewares/tenantMiddleware.js");

// dotenv.config();

// const app = express();

// app.use(
//   express.json({
//     limit: "10mb",
//     verify: (req, res, buf) => {
//       console.log(` Request size: ${buf.length} bytes`);
//     },
//   })
// );

// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "10mb",
//   })
// );
// app.use(cookieParser());
// app.use(
//   cors({
//     origin: [
//       "https://hrms.dcctz.com",
//       "http://localhost:3000",
//       "http://localhost:3001",
//       "http://192.168.29.90:3000",
//       "http://192.168.29.74:3000",
//       "http://192.168.29.228:3001",
//       "http://192.168.29.228:3000",
//       "http://10.160.5.101:3000",
//       "http://10.160.5.101:3001",
//     ],
//     credentials: true,
//   })
// );

// app.use(responseHandler);
// app.use("/uploads", express.static("uploads"));
// app.use("/api", tenantMiddleware);
// app.use("/api", routes);

// app.use(errorHandler);

// module.exports = app;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const routes = require("../src/routes/index");

const responseHandler = require("../src/utils/responseMiddleware.js");
const cookieParser = require("cookie-parser");
const errorHandler = require("../src/utils/errorMiddleware.js");
const tenantMiddleware = require("./v1/middlewares/tenantMiddleware.js");

dotenv.config();

const app = express();

app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      console.log(` Request size: ${buf.length} bytes`);
    },
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://hrms.dcctz.com",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.29.90:3000",
      "http://192.168.29.74:3000",
      "http://192.168.29.228:3001",
      "http://192.168.29.228:3000",
      "http://10.160.5.101:3000",
      "http://10.160.5.101:3001",
    ],
    credentials: true,
  })
);

app.use(responseHandler);
app.use("/uploads", express.static("uploads"));
app.use("/api", routes);

app.use(errorHandler);

module.exports = app;
