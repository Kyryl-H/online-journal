const express = require("express");
const path = require("path");

const createRout = function (res, rout) {
  const p = path.join(__dirname, "../", "views", "student", `${rout}`);
  res.sendFile(p, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("File not found.");
    }
  });
};

exports.getStudentMain = (req, res, next) => {
  createRout(res, "student-main.html");
};
exports.getStudentProfil = (req, res, next) => {
  createRout(res, "student-profil.html");
};
exports.getStudentSchedule = (req, res, next) => {
  createRout(res, "student-schedule.html");
};
