const express = require("express");
const authRouter = require("./router/authRouter");  // Correctly import the authRouter
const databaseconnect = require("./config/databaseConfig");
const app = express();
const cookieParser=require('cookie-parser')
const cors=require('cors'); //for frontend connection


databaseconnect();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [process.env.CLIENT_URL],
  credentials:true
}))

app.use('/api/auth/', authRouter);  // Mount the authRouter at /api/auth/

app.use("/", (req, res) => {
  res.status(200).json({ data: "JWTauth server" });
});

module.exports = app;
