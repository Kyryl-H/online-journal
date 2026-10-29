const sequelize = require("../config/database.js");

const User = require("./user.js");
const Student = require("./student.js");
const Teacher = require("./teacher");
const Group = require("./group");
const Grades = require("./grades");
const Schedule = require("./schedule");
const Subject = require("./subject");

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
Schedule.hasMany(Grades, { onDelete: "CASCADE" });
Grades.belongsTo(Schedule);
Subject.hasMany(Schedule);
Schedule.belongsTo(Subject);
Teacher.hasMany(Schedule);
Schedule.belongsTo(Teacher);

const db = {
  sequelize,
  User,
  Student,
  Teacher,
  Group,
  Grades,
  Schedule,
  Subject,
};

module.exports = db;
