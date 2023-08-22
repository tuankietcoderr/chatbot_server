function getRoutes(app) {
  const authRouter = require("../routes/auth");
  const chatRouter = require("../routes/chat");
  const roomRouter = require("../routes/room");
  app.use("/api/user", authRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/room", roomRouter);
}

module.exports = getRoutes;
