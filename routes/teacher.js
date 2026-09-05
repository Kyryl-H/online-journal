const express = require("express");
const path = require("path");

const rout = express.Router();
const Controllers = require("../controllers/teacherControlles");

rout.get("/teacher/main", Controllers.getTeacherMain);
rout.get("/teacher/profil", Controllers.getTeacherProfil);
rout.get("/teacher/journal/main", Controllers.getTeacherJournalMain);
rout.get("/teacher/schedule", Controllers.getTeacherSchedule);
rout.get("/teacher/profil-curator", Controllers.getTeacherProfilCurator);

module.exports = rout;
