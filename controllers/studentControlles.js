const express = require("express");
const path = require("path");
const { Op } = require("sequelize");

const Student = require("../models/student");
const Group = require("../models/group");
const Subject = require("../models/subject");
const Schedule = require("../models/schedule");
const Grades = require("../models/grades");
const Teacher = require("../models/teacher");
const { getLessons } = require("../services/scheduleService");

const DEFAULT_START = new Date(0).toISOString();
const DEFAULT_END = new Date(4102444799000).toISOString();

// Розклад власної групи студента
exports.getStudentGroupSchedule = async (req, res, next) => {
  try {
    const start = req.query.start || DEFAULT_START;
    const end = req.query.end || DEFAULT_END;

    const student = await Student.findOne({
      where: { userId: req.userId },
      include: { model: Group, attributes: ["id", "name"] },
    });

    if (!student) {
      return res.status(404).json({ message: "Студента не знайдено" });
    }

    const schedule = await getLessons({
      subjectWhere: { groupId: student.groupId },
      start,
      end,
    });

    return res.status(200).json({
      role: "STUDENT",
      group: student.group?.name || null,
      schedule,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStudentGrades = async (req, res, next) => {
  try {
    const currentUserId = req.userId;

    const student = await Student.findOne({
      where: { userId: currentUserId },
      attributes: ["id", "fullName"],
    });

    if (!student) {
      return res.status(404).json({ message: "Студента не знайдено" });
    }

    const grades = await Grades.findAll({
      where: { studentId: student.id },
      include: [
        {
          model: Schedule,
          attributes: ["id", "date", "lessonNumber", "room"],
          include: [
            {
              model: Subject,
              attributes: ["name"],
              include: {
                model: Teacher,
                attributes: ["fullName"],
              },
            },
          ],
        },
      ],
    });

    const formattedGrades = grades
      .map((grade) => ({
        id: grade.id,
        value: grade.value,
        date: grade.schedule?.date || null,
        lessonNumber: grade.schedule?.lessonNumber || null,
        room: grade.schedule?.room || null,
        subjectName: grade.schedule?.subject?.name || null,
        teacherFullName: grade.schedule?.subject?.teacher?.fullName || null,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.status(200).json({
      role: "STUDENT",
      student: student.fullName,
      grades: formattedGrades,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
