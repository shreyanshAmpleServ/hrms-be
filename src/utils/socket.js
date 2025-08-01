const socketIO = require("socket.io");

let io;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(`user-${userId}`); // 👈 Join a room named after user ID
      console.log(`User ${userId} connected to room user-${userId}`);
    }
    socket.on("join", (userId) => {
      console.log(` User ${userId} joined room: user_${userId}`);
      socket.join(`user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initializeSocket;
