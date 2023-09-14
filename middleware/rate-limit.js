const rateLimit = require("express-rate-limit");

const MAX_REQUEST_PER_HOUR = 10;

const rateLimiterUsingThirdParty = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, // 1 hrs in milliseconds
  max: MAX_REQUEST_PER_HOUR,
  message:
    "Bạn đã vượt quá số lần yêu cầu tối đa trong 1 giờ. Vui lòng thử lại sau 1 giờ.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: function (req, res /*, next*/) {
    res.status(this.statusCode).json({
      success: false,
      message: this.message,
    });
  },
});

module.exports = rateLimiterUsingThirdParty;
