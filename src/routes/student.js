const express = require("express");

const rout = express.Router();
const Controllers = require("../controllers/studentControlles");
const isAuth = require("../middleware/is-auth");
const isStudent = require("../middleware/is-student");

rout.get(
  "/api/student/schedule",
  isAuth,
  isStudent,
  Controllers.getStudentGroupSchedule,
);
rout.get(
  "/api/student/grades",
  isAuth,
  isStudent,
  Controllers.getStudentGrades,
);

module.exports = rout;
