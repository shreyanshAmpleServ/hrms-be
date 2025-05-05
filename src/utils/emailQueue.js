const Bull = require("bull");

const emailQueue = new Bull("emailQueue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

module.exports = emailQueue;
