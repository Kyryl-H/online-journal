const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

const authRout = require("./routes/auth");
const teacherRout = require("./routes/teacher");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(authRout);
app.use(teacherRout);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "404.html"));
});
app.listen(3000);
