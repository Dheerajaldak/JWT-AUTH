const JWT = require("jsonwebtoken");

const jwtAuth = async (req, res, next) => {
  // Skip JWT verification for logout route
  if (req.originalUrl === "/api/auth/logout") {
    return next(); // Skip token verification for logout request
  }

  const token = req.cookies.token || null;

  console.log("Token:", token);

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Not authorized, token does not exist",
    });
  }

  try {
    const payload = JWT.verify(token, process.env.SECRET);
    req.user = { id: payload.id, email: payload.email }; // Attach user data to request object
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: e.message,
    });
  }

  next(); // Proceed to the next middleware or route handler
};

module.exports = jwtAuth;
