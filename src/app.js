const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const authRout = require("./routes/auth");
const generalRout = require("./routes/general");
const teacherRout = require("./routes/teacher");
const studentRout = require("./routes/student");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(authRout);
app.use(generalRout);
app.use(teacherRout);
app.use(studentRout);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "public", "404.html"));
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

module.exports = app;
