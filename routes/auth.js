const express = require("express");

const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../model/User");
const verifyToken = require("../middleware/auth");
const Credential = require("../model/Credential");
const { Types } = require("mongoose");
const Room = require("../model/Room");
const Chat = require("../model/Chat");
const { sendMail } = require("../service/mailer");
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

router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Missing old password or new password",
      });

    const user = await User.findById(new toId(req.user_id));
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    const credential = await Credential.findOne({ userId: user._id });
    if (!credential) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    const isMatch = await bcrypt.compare(oldPassword, credential.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu cũ không chính xác" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    credential.password = hashedPassword;

    await credential.save();

    res.json({ success: true, message: "Đã thay đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  const { username, password, fullName, email } = req.body;

  if (!username || !password || !email)
    return res
      .status(400)
      .json({ success: false, message: "Please enter all fields" });
  try {
    const user = await User.findOne({ username });
    if (user)
      return res
        .status(400)
        .json({ success: false, message: "Tên người dùng đã tồn tại" });

    const newUser = new User({
      username,
      fullName,
      email,
    });
    await newUser.save();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCredential = new Credential({
      userId: newUser._id,
      password: hashedPassword,
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

    const isMatch = await bcrypt.compare(password, credential.password);
    if (!isMatch) {
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
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/send-email", async (req, res) => {
  try {
    const { email } = req.query;
    console.log({ email });
    const hashedEmail = await bcrypt.hash(email, 10);
    sendMail({
      to: email,
      subject: "Xác thực email của bạn tại Hỏi đáp Dịch vụ công",
      text: `Chào bạn,\n\nBạn vui lòng xác thực email của mình bằng cách nhấn vào đường dẫn sau: \n\n${process.env.URL}/verify-email?email=${email}&token=${hashedEmail}\n\nTrân trọng,\nHỏi đáp Dịch vụ công`,
    });
    res.status(200).json({ success: true, message: "Đã gửi email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { email, token } = req.query;
    const isMatch = await bcrypt.compare(email, token);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Không thể xác thực email, có lỗi xảy ra",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    user.is_email_verified = true;
    await user.save();

    res.render("email-verified", { email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/forgot-password", async (req, res) => {
  try {
    const { email } = req.query;

    const randomPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    if (!user.is_email_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Email chưa được xác thực" });
    }

    const credential = await Credential.findOne({ userId: user._id });
    if (!credential) {
      return res
        .status(400)
        .json({ success: false, message: "Người dùng không tồn tại" });
    }

    credential.password = hashedPassword;

    await credential.save();

    sendMail({
      to: email,
      subject: "Đặt lại mật khẩu của bạn tại Hỏi đáp Dịch vụ công",
      text: `Chào bạn,\n\nĐây là mật khẩu được đặt lại của bạn: ${randomPassword}. Hãy sử dụng mật khẩu nãy để đăng nhập bạn nhé!\nBạn cũng có thể thay đổi lại mật khẩu sau trong phần cài đặt người dùng.\n\nTrân trọng,\nHỏi đáp Dịch vụ công`,
    });
    res.status(200).json({ success: true, message: "Đã gửi email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
