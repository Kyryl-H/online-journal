const path = require("path");
const fs = require("fs");
const { json } = require("body-parser");

exports.getLogin = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "views", "login.html"));
};

exports.getRootLogin = (req, res, next) => {
  res.sendFile(path.join(__dirname, "../", "views", "login.html"));
};
exports.postLogin = (req, res, next) => {
  const { fgmail, fpassword } = req.body;
  const p = path.join(__dirname, "../", "data", "users.json");
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return res.status(500).json({ err: "Не вдалося отримати дані" });
    }
    const user = JSON.parse(fileContent);
    const CurrentUser = user.find((e) => e.login === fgmail);
    if (CurrentUser) {
      if (CurrentUser.password === fpassword) {
        if (CurrentUser.role === "teacher") {
          res.sendFile(
            path.join(
              __dirname,
              "../",
              "views",
              "teacher",
              "teacher-main.html",
            ),
          );
        } else if (CurrentUser.role === "student") {
          res.sendFile(
            path.join(__dirname, "../", "views", "student", "main.html"),
          );
        }
      } else {
        return res.status(500).json({ err: "Користувача не знайдено" });
      }
    } else {
      return res.status(500).json({ err: "Користувача не знайдено" });
    }
  });
};
exports.getUsers = (req, res, next) => {};
