const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log("AUTH HEADERS:", {
    authHeader: req.headers["authorization"],
    tokenExists: !!token,
  });

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "bloodhaven_secret_key"
    );

    console.log("DECODED TOKEN:", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT VERIFICATION ERROR:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

const isAdmin = (req, res, next) => {
  console.log("USER IN isAdmin CHECK:", req.user);

  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

const isHospital = (req, res, next) => {
  console.log("USER IN isHospital CHECK:", req.user);

  if (
    !req.user ||
    (req.user.role !== "hospital" && req.user.role !== "recipient")
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Hospital privileges required.",
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  isHospital,
};
