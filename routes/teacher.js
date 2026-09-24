const express = require("express");
const path = require("path");

const rout = express.Router();
const Controllers = require("../controllers/teacherControlles");

rout.get("/api/teacher/scheduleForDay", Controllers.getScheduleForDay);
rout.get("/api/teacher/profil", Controllers.getProfile);
module.exports = rout;
