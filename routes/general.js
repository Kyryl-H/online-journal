const express = require("express");

const rout = express.Router();
const Controllers = require("../controllers/generalController");
const isAuth = require("../middelware/is-auth");

rout.get("/api/scheduleForDay", isAuth, Controllers.getScheduleForDay);
rout.get("/api/profil", isAuth, Controllers.getProfile);
rout.get("/api/groups", isAuth, Controllers.getGroups);
rout.get("/api/schedule/:groupId/:start/:end", isAuth, Controllers.getSchedule);
rout.patch("/api/teacher/change-password", isAuth, Controllers.changePassword);

module.exports = rout;
