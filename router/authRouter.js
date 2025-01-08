const express = require("express");
const {
  signup,
  signin,
  getUser,
  logout,
} = require("../controller/authController"); // Make sure the signup controller is correctly defined
const jwtAuth = require("../middleware/jwtAuth");

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/user", jwtAuth, getUser);
authRouter.get("/logout", jwtAuth, logout);

module.exports = authRouter;
