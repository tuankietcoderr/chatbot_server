const express = require("express");
const verifyToken = require("../middleware/auth");
const User = require("../model/User");
const Save = require("../model/Save");
const Chat = require("../model/Chat");
const router = express.Router();
const toId = require("mongoose").Types.ObjectId;

router.get("/", verifyToken, async (req, res) => {
  try {
    const saved = await Save.find({ userId: req.user_id });
    res.json({
      success: true,
      data: saved,
      message: saved.length > 0 ? "OK" : "No saved found",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/add", verifyToken, async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing chatId" });
    }

    const userId = new toId(req.user_id);
    const _chatId = new toId(chatId);

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    if (chat.isSaved) {
      return res
        .status(400)
        .json({ success: false, message: "Chat already saved" });
    }

    await chat.updateOne({ isSaved: true });

    const newSave = new Save({
      userId,
      chat: _chatId,
    });

    const dataWithPopulate = await newSave.populate("chat");

    await newSave.save();

    res
      .status(200)
      .json({ success: true, message: "Saved", data: dataWithPopulate });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error });
  }
});

router.post("/remove", verifyToken, async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing chatId" });
    }

    const userId = new toId(req.user_id);
    const _chatId = new toId(chatId);

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    if (!chat.isSaved) {
      return res
        .status(400)
        .json({ success: false, message: "Chat is not saved" });
    }

    await chat.updateOne({ isSaved: false });

    const deletedSave = await Save.findOneAndDelete({
      userId,
      chat: _chatId,
    });

    if (!deletedSave) {
      return res
        .status(404)
        .json({ success: false, message: "Save not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Removed", data: deletedSave });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error });
  }
});

module.exports = router;
