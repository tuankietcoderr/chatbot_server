function getRoutes(app) {
  const authRouter = require("../routes/auth");
  const chatRouter = require("../routes/chat");
  const roomRouter = require("../routes/room");
  const saveRouter = require("../routes/save");
  app.use("/api/user", authRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/room", roomRouter);
  app.use("/api/save", saveRouter);
}

module.exports = getRoutes;
