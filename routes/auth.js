const express = require("express");
const path = require("path");
const rout = express.Router();
const Controlles = require("../controllers/auth");

rout.get("/login", Controlles.getLogin);

rout.get("/", Controlles.getRootLogin);

rout.post("/login", Controlles.postLogin);

rout.get("/api/users", Controlles.getUsers);

module.exports = rout;
