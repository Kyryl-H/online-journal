const express = require("express");
const path = require("path");
const rout = express.Router();
const Controlles = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");
const loginValid = require("../validators/loginValid");

rout.post("/login", loginValid, Controlles.login);
rout.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "..", "public", "login.html"));
});
module.exports = rout;
