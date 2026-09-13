const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const sequelize = require("./util/database");

const app = express();

const authRout = require("./routes/auth");
const teacherRout = require("./routes/teacher");
const studentRout = require("./routes/student");
// models
const User = require("./models/user");
const Student = require("./models/student");
const Teacher = require("./models/teacher");
const Group = require("./models/group");
const Grades = require("./models/grades");
const Schedule = require("./models/schedule");
const Subject = require("./models/subject");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(authRout);
app.use(teacherRout);
app.use(studentRout);

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "404.html"));
});
// asisting(звязки)
User.hasOne(Student);
Student.belongsTo(User);
User.hasOne(Teacher);
Teacher.belongsTo(User);
Group.hasMany(Student);
Student.belongsTo(Group);
Student.hasMany(Grades);
Grades.belongsTo(Student);
Teacher.hasMany(Group);
Group.belongsTo(Teacher);
Group.hasMany(Subject);
Subject.belongsTo(Group);
Teacher.hasMany(Subject);
Subject.belongsTo(Teacher);
Schedule.hasMany(Grades);
Grades.belongsTo(Schedule);
Subject.hasMany(Schedule);
Schedule.belongsTo(Subject);

sequelize
  .sync({ force: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
