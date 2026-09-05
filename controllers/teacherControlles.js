const express = require("express");
const path = require("path");

const createRout = function (res, rout) {
  const p = path.join(__dirname, "../", "views", "teacher", `${rout}`);
  res.sendFile(p, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("File not found.");
    }
  });
};

exports.getTeacherMain = (req, res, next) => {
  createRout(res, "teacher-main.html");
};
exports.getTeacherProfil = (req, res, next) => {
  createRout(res, "teacher-profil.html");
};
exports.getTeacherJournalMain = (req, res, next) => {
  createRout(res, "journal-main.html");
};
exports.getTeacherSchedule = (req, res, next) => {
  createRout(res, "teacher-schedule.html");
};
exports.getTeacherProfilCurator = (req, res, next) => {
  createRout(res, "teacher-profil-curator.html");
};
