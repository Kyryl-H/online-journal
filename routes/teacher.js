const express = require("express");

const rout = express.Router();
const Controllers = require("../controllers/teacherControlles");

rout.get("/api/teacher/scheduleForDay", Controllers.getScheduleForDay);
rout.get("/api/teacher/message", Controllers.getMessage);
rout.get("/api/teacher/profil", Controllers.getProfile);
rout.get(`/api/teacher/journalMain`, Controllers.getJournalMain);
rout.get(
  "/api/teacher/journal/:groupId/:lessonName/:month",
  Controllers.getJournal,
);
rout.post("/api/teacher/post/grades", Controllers.postGrades);
rout.get("/api/groups", Controllers.getGroups);
rout.get("/api/schedule/:groupId/:start/:end", Controllers.getSchedule);
rout.get("/api/teacher-schedule/:start/:end", Controllers.getTeacherSchedule);
rout.get("/api/curator/groups", Controllers.getCuratorGroup);
rout.get("/api/curator/:groupId/:year/:month", Controllers.getCuratorStudent);
rout.patch("/api/teacher/journal/updateLesson", Controllers.updateLesson);
rout.post("/api/teacher/createLessons", Controllers.createLesson);
rout.delete("/api/teacher/lessons/:id", Controllers.deleteLesson);
module.exports = rout;
