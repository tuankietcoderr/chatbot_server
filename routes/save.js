const express = require("express");
const verifyToken = require("../middleware/auth");
const User = require("../model/User");
const Save = require("../model/Save");
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

router.post("/", verifyToken, async (req, res) => {
  try {
    const { roomId, content } = req.body;
    if (!roomId || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Missing roomId or content" });
    }

    const userId = new toId(req.user_id);
    const _roomId = new toId(roomId);

    const newSave = new Save({
      userId,
      roomId: _roomId,
      content,
    });

    await newSave.save();

    res.status(200).json({ success: true, message: "Saved", data: newSave });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
