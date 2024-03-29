const express = require("express");
const router = express.Router();
const mongooose = require("mongoose");

const toId = mongooose.Types.ObjectId;
const verifyToken = require("../middleware/auth");
const Room = require("../model/Room");
const Chat = require("../model/Chat");

const INIT_PAGE = 1;
const INIT_PAGE_SIZE = 10;

router.get("/", verifyToken, async (req, res) => {
  try {
    const roomId = new toId(req.query.roomId);
    const chats = await Chat.find({ roomId });

    res.status(200).json({
      success: true,
      message: chats.length > 0 ? "OK" : "No chat",
      data: chats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/send", verifyToken, async (req, res) => {
  try {
    const { question, roomId, reference, answer } = req.body;
    if (!roomId)
      return res
        .status(400)
        .json({ success: false, message: "Missing or roomId" });

    const userId = new toId(req.user_id);
    const _roomId = new toId(roomId);
    const room = await Room.findOne({
      _id: _roomId,
      userId,
    });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }
    const newMessage = new Chat({
      roomId: _roomId,
      question,
      answer,
      reference,
    });

    await newMessage.save();

    res.status(200).json({ success: true, message: "Sent", data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
