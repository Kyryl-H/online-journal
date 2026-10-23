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
      attributes: ["id", "fullName", "groupId"],
    });

    if (!student) {
      const err = new Error("Студента не знайдено");
      err.statusCode = 404;
      throw err;
    }

    const schedules = await Schedule.findAll({
      // Видалено where: { groupId: student.groupId } звідси
      include: [
        {
          model: Subject,
          where: { groupId: student.groupId }, // Переміщено сюди: фільтруємо предмети групи
          attributes: ["name", "gradingSystem"],
          include: {
            model: Teacher,
            attributes: ["fullName"],
          },
        },
        {
          model: Grades,
          attributes: ["id", "value"],
          where: { studentId: student.id },
          required: false, // LEFT JOIN
        },
      ],
    });

    if (!schedules) {
      const err = new Error("Помилка під час пошуку занять");
      err.statusCode = 404;
      throw err;
    }

    const formattedGrades = schedules
      .map((schedule) => {
        const grade =
          (schedule.grades && schedule.grades[0]) ||
          (schedule.Grades && schedule.Grades[0]) ||
          schedule.grade ||
          null;

        const subject = schedule.subject || schedule.Subject;

        return {
          id: grade ? grade.id : null,
          value: grade ? grade.value : null,
          gradingSystem: subject?.gradingSystem || null,
          date: schedule.date || null,
          lessonNumber: schedule.lessonNumber || null,
          room: schedule.room || null,
          subjectName: subject?.name || null,
          teacherFullName:
            subject?.teacher?.fullName || subject?.Teacher?.fullName || null,
          topic: schedule.topic || null,
          homework: schedule.homework || null,
        };
      })
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
