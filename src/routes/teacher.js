const express = require("express");

const rout = express.Router();
const Controllers = require("../controllers/teacherControlles");
const isAuth = require("../middleware/is-auth");
const isTeacher = require("../middleware/is-teacher");
const Validators = require("../validators/teacherValid");

rout.get("/api/teacher/message", isAuth, isTeacher, Controllers.getMessage);
rout.get(
  `/api/teacher/journalMain`,
  isAuth,
  isTeacher,
  Controllers.getJournalMain,
);
rout.get(
  "/api/teacher/journal/:groupId/:lessonName/:month",
  isAuth,
  isTeacher,
  Controllers.getJournal,
);
rout.post(
  "/api/teacher/post/grades",
  isAuth,
  isTeacher,
  Validators.pushGrades,
  Controllers.postGrades,
);
rout.get(
  "/api/teacher-schedule/:start/:end",
  isAuth,
  isTeacher,
  Controllers.getTeacherSchedule,
);
rout.get("/api/curator/groups", isAuth, isTeacher, Controllers.getCuratorGroup);
rout.get(
  "/api/curator/:groupId/:year/:month",
  isAuth,
  isTeacher,
  Controllers.getCuratorStudent,
);
rout.patch(
  "/api/teacher/journal/updateLesson",
  isAuth,
  isTeacher,
  Validators.EditLesson,
  Controllers.updateLesson,
);
rout.post(
  "/api/teacher/createLessons",
  isAuth,
  isTeacher,
  Validators.CreateLesson,
  Controllers.createLesson,
);
rout.delete(
  "/api/teacher/lessons/:id",
  isAuth,
  isTeacher,
  Validators.deleteLesson,
  Controllers.deleteLesson,
);

module.exports = rout;
