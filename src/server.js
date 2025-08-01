const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// const app = require("./app");
// const initializeSocket = require("./utils/socket");
// const http = require("http");

// const httpServer = http.createServer(app);
// const io = initializeSocket(httpServer);

// // Optional: store io in global
// global.io = io;

// // Optional: also store in app if needed
// app.set("io", io);

// // Start only one server
// const PORT = process.env.PORT || 5000;
// httpServer.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
