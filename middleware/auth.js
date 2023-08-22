const jwt = require("jsonwebtoken");
const User = require("../model/User");

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user_id = decoded.user_id;

    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });
    }
    next();
  } catch {
    return res.status(403).json({ success: false, message: "Invalid token." });
  }
};

module.exports = verifyToken;
