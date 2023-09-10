const express = require("express");
const router = express.Router();
const mongooose = require("mongoose");

const toId = mongooose.Types.ObjectId;
const verifyToken = require("../middleware/auth");
const Room = require("../model/Room");
const Chat = require("../model/Chat");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = new toId(req.user_id);
    const rooms = await Room.find({ userId }).select("-userId").sort("-_id");

    res.status(200).json({
      success: true,
      message: rooms.length > 0 ? "OK" : "Không có phòng nào",
      data: rooms,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/create", verifyToken, async (req, res) => {
  try {
    const { shortDescription } = req.body;

    const userId = new toId(req.user_id);
    const newRoom = new Room({
      title: "Phòng mới",
      shortDescription,
      userId,
    });

    await newRoom.save();

    res.status(200).json({ success: true, message: "Created", data: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:roomId", verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing roomId" });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng" });
    }

    if (room.userId.toString() !== req.user_id)
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền chỉnh sửa phòng này",
      });

    const update = {
      ...room._doc,
      ...req.body,
    };

    const updatedRoom = await Room.findByIdAndUpdate(roomId, update, {
      new: true,
    });
    res
      .status(200)
      .json({ success: true, message: "Đã cập nhật", data: updatedRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:roomId", verifyToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId)
      return res
        .status(400)
        .json({ success: false, message: "Missing roomId" });

    const room = await Room.findById(roomId);

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy phòng" });
    }

    if (room.userId.toString() !== req.user_id)
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this room",
      });
    const _roomId = room._id;
    await room.deleteOne();
    await Chat.deleteMany({ roomId: _roomId });

    res.status(200).json({ success: true, message: "Deleted", data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
