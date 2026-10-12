const express = require("express");

const rout = express.Router();
const Controllers = require("../controllers/teacherControlles");
const isAuth = require("../middelware/is-auth");
const isTeacher = require("../middelware/is-teacher");

rout.get(
  "/api/teacher/scheduleForDay",
  isAuth,
  isTeacher,
  Controllers.getScheduleForDay,
);
rout.get("/api/teacher/message", isAuth, isTeacher, Controllers.getMessage);
rout.get("/api/teacher/profil", isAuth, isTeacher, Controllers.getProfile);
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
  Controllers.postGrades,
);
rout.get("/api/groups", isAuth, isTeacher, Controllers.getGroups);
rout.get(
  "/api/schedule/:groupId/:start/:end",
  isAuth,
  isTeacher,
  Controllers.getSchedule,
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
  Controllers.updateLesson,
);
rout.post(
  "/api/teacher/createLessons",
  isAuth,
  isTeacher,
  Controllers.createLesson,
);
rout.delete(
  "/api/teacher/lessons/:id",
  isAuth,
  isTeacher,
  Controllers.deleteLesson,
);
module.exports = rout;
