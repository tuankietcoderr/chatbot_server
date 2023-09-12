const express = require("express");

const router = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../model/User");
const verifyToken = require("../middleware/auth");
const Credential = require("../model/Credential");
const { Types } = require("mongoose");
const Room = require("../model/Room");
const Chat = require("../model/Chat");
const toId = Types.ObjectId;

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(new toId(req.user_id)).select("-password");
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(new toId(req.user_id));
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }
    const update = {
      ...user._doc,
      ...req.body,
    };
    const updatedUser = await User.findByIdAndUpdate(user._id, update, {
      new: true,
    });
    if (!updatedUser) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }
    res.json({ success: true, message: "User updated", data: updatedUser });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, password, fullName } = req.body;

  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Please enter all fields" });
  try {
    const user = await User.findOne({ username });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });

    const newUser = new User({
      username,
      fullName,
    });
    await newUser.save();

    const newCredential = new Credential({
      userId: newUser._id,
      password,
    });
    await newCredential.save();

    const accessToken = jwt.sign(
      { user_id: newUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1y" }
    );
    res.json({
      success: true,
      message: "User created",
      accessToken,
      data: newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, message: "Missing username/password" });
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });

    const credential = await Credential.findOne({
      userId: user._id,
    });

    if (!credential) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    if (credential.password !== password) {
      return res.status(400).json({ success: false, message: "Sai mật khẩu" });
    }

    const accessToken = jwt.sign(
      { user_id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1y" }
    );
    res.json({
      success: true,
      message: "User logged in",
      accessToken,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

router.delete("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(new toId(req.user_id));
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }
    if (user._id.toString() !== req.user_id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this user",
      });
    }
    const rooms = await Room.find({ userId: user._id });
    console.log(rooms);
    for (const room of rooms) {
      await Chat.deleteMany({
        roomId: room._id,
      });
    }
    await Room.deleteMany({ userId: user._id });
    await Credential.deleteOne({ user_id: user._id });
    await user.deleteOne();

    res.json({ success: true, message: "User deleted", data: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
