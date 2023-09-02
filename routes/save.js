const express = require("express");
const verifyToken = require("../middleware/auth");
const User = require("../model/User");
const Save = require("../model/Save");
const Chat = require("../model/Chat");
const router = express.Router();
const toId = require("mongoose").Types.ObjectId;

router.get("/", verifyToken, async (req, res) => {
  try {
    const saved = await Save.find({ userId: req.user_id })
      .populate("chat")
      .sort({ createdAt: -1 });
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

router.delete("/remove/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Missing id" });
    }

    const save = await Save.findById(id);

    if (!save) {
      return res
        .status(404)
        .json({ success: false, message: "Save not found" });
    }

    const chat = await Chat.findById(save.chat);

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

    await save.deleteOne();

    res.status(200).json({ success: true, message: "Removed", data: save });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error });
  }
});

router.delete("/remove/message/:messageId", verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    if (!messageId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing messageId" });
    }

    const chat = await Chat.findById(messageId);

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

    const save = await Save.findOne({ chat: messageId });

    await save.deleteOne();

    res.status(200).json({ success: true, message: "Removed", data: save });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error });
  }
});

module.exports = router;
