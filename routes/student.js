const express = require("express");
const path = require("path");

const rout = express.Router();
const Controllers = require("../controllers/studentControlles");

rout.get("/student/main", Controllers.getStudentMain);
rout.get("/student/profil", Controllers.getStudentProfil);
rout.get("/student/schedule", Controllers.getStudentSchedule);

module.exports = rout;
