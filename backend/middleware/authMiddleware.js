const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        res.status(401);
        throw new Error("User no longer exists");
      }

      req.user = user;
      next();

    } catch (error) {
      // ✅ FIX #2: return before every error response to prevent double-send
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired, please login again" });
      } else {
        return res.status(401).json({ message: "Not authorized" });
      }
    }
  } else {
    // ✅ FIX #2: return here too
    return res.status(401).json({ message: "No token provided" });
  }
});

module.exports = { protect };