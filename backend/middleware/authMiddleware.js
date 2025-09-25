const { User } = require("../model/User");
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1]; //Authorization
    }
    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("error while verifying token: ", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        message: "Access denied: you do not have permission",
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
