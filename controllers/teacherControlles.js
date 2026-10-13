const express = require("express");
const { Op, Model, where } = require("sequelize");
const Teacher = require("../models/teacher");
const Schedule = require("../models/schedule");
const Subject = require("../models/subject");
const Group = require("../models/group");
const User = require("../models/user");
const Student = require("../models/student");
const Grades = require("../models/grades");
const bcrypt = require("bcrypt");
const { getLessons } = require("../services/scheduleService");

// Дані для головної сторіник
exports.getMessage = async (req, res, next) => {
  const currentUserId = req.userId;

  const teacher = await Teacher.findOne({ where: { userId: currentUserId } });

  if (!teacher) return;

  const subject = await Subject.findAll({ where: { teacherId: teacher.id } });

  const subjectId = subject.map((s) => s.id);
  const message = await Schedule.findAll({
    where: { [Op.and]: [{ subjectId: { [Op.in]: subjectId } }, { topic: "" }] },
    attributes: ["id", "date"],
    include: {
      model: Subject,
      attributes: ["name"],
      include: {
        model: Group,
        attributes: ["id", "name"],
      },
    },
  });

  res.status(200).json({ message: message });
};
// Дані для головної(першої) сторнки журналу
exports.getJournalMain = async (req, res, next) => {
  try {
    const currentUserId = req.userId;
    const currentRole = req.userRole;
    const teacher = await Teacher.findOne({ where: { userId: currentUserId } });

    if (!teacher) {
      const error = new Error("Викладача не знайдено");
      error.statusCode = 404;
      throw error;
    }

    const subject = await Subject.findAll({
      where: { teacherId: teacher.id },
      include: {
        model: Group,
        attributes: ["name"],
      },
    });
    const subjects = subject.map((sub) => ({
      subjectName: sub.name,
      group: sub.group.name,
      groupID: sub.groupId,
    }));

    res.status(200).json({ subjects });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
// Дані для самого журналу
exports.getJournal = async (req, res, next) => {
  const groupId = req.params.groupId;
  const lessonName = req.params.lessonName;
  const month = req.params.month;
  const isPartial = req.query.partial === "true";

  const subject = await Subject.findOne({
    where: { [Op.and]: [{ groupId: groupId }, { name: lessonName }] },
    attributes: ["id", "name", "gradingSystem"],
    include: {
      model: Group,
      attributes: ["name"],
    },
  });
  if (!subject) {
    return res.status(404).json({ message: "Предмет не знайдено" });
  }
  // пошук за потрібним місяцем
  const nowDate = new Date();
  const year = nowDate.getFullYear();
  const lastDay = new Date(year, Number(month) + 1, 0).getDate();
  const formattedMonth = String(Number(month) + 1).padStart(2, "0");

  const startMonth = `${year}-${formattedMonth}-1 00:00:00`;
  const endMonth = `${year}-${formattedMonth}-${lastDay} 23:59:59`;

  const schedule = await Schedule.findAll({
    where: {
      [Op.and]: [
        { subjectId: subject.id },
        { date: { [Op.between]: [startMonth, endMonth] } },
      ],
    },
    attributes: [
      "id",
      "date",
      "topic",
      "lessonType",
      "lessonNumber",
      "room",
      "homework",
    ],
  });

  const scheduleId = schedule.map((s) => s.id);

  const grades = await Grades.findAll({
    attributes: ["id", "value", "studentId", "scheduleId"],
    where: { scheduleId: { [Op.in]: scheduleId } },
  });

  if (isPartial) {
    return res.status(200).json({
      schedule: schedule,
      grades: grades,
    });
  }

  const student = await Student.findAll({
    where: { groupId: groupId },
    attributes: ["id", "fullName"],
  });

  res.status(200).json({
    student: student,
    subject: subject,
    schedule: schedule,
    grades: grades,
  });
};
exports.postGrades = async (req, res, next) => {
  try {
    // Валідація оцінок на сервері
    await Grades.bulkCreate(req.body, {
      updateOnDuplicate: ["value"],
    });

    res.status(200).json({ message: "Дані успішно збережені!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const { id, lessonType, date, lessonNumber, room, topic, homework } =
      req.body;

    const lesson = await Schedule.findByPk(id);

    if (!lesson) {
      return res.status(404).json({ message: "Урок не знайдено" });
    }

    await lesson.update({
      lessonType: lessonType,
      date: date,
      lessonNumber: lessonNumber,
      room: room,
      topic: topic,
      homework: homework,
    });

    const lessonData = lesson.toJSON();

    const { createdAt, updatedAt, subjectId, ...cleanedLesson } = lessonData;

    res.status(200).json({
      message: "Дані успішно оновлено!",
      lesson: cleanedLesson,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const { lessonType, date, lessonNumber, room, topic, homework, subjectId } =
      req.body;

    const newLesson = await Schedule.create({
      lessonType: lessonType,
      date: date,
      lessonNumber: lessonNumber,
      room: room,
      topic: topic,
      homework: homework,
      subjectId: subjectId,
    });

    res.status(200).json({
      message: "Заняття успішно створено!",
      lesson: newLesson,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    console.log(`ID: ${lessonId}`);
    await Schedule.destroy({ where: { id: lessonId } });

    res.status(200).json({ message: "Заняття успішно видалено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};

exports.getTeacherSchedule = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ where: { userId: req.userId } });
    if (!teacher) {
      return res.status(404).json({ message: "Викладача не знайдено" });
    }

    const { start, end } = req.params;
    const lessons = await getLessons({
      subjectWhere: { teacherId: teacher.id },
      start,
      end,
    });

    res.status(200).json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка завантаження розкладу" });
  }
};

exports.getCuratorGroup = async (req, res, next) => {
  const currentUserId = req.userId;
  try {
    const teacher = await Teacher.findOne({ where: { userId: currentUserId } });
    if (!teacher) {
      return res.status(404).json({ message: "Викладача не знайдено" });
    }
    const group = await Group.findAll({
      where: { teacherId: teacher.id },
      attributes: ["id", "name"],
    });

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};

exports.getCuratorStudent = async (req, res, next) => {
  const currentUserId = req.userId;
  const groupId = req.params.groupId;
  const year = Number(req.params.year);
  const month = Number(req.params.month);

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  try {
    const student = await Student.findAll({
      where: { groupId: groupId },
      attributes: ["id", "fullName"],
      order: [["fullName", "ASC"]],
    });

    const studentId = student.map((s) => s.id);

    const grades = await Grades.findAll({
      where: { studentId: { [Op.in]: studentId } },
      attributes: ["value"],
      include: {
        model: Schedule,
        attributes: ["id"],
        where: {
          date: {
            [Op.between]: [startOfMonth, endOfMonth],
          },
        },
        include: {
          model: Subject,
          attributes: ["gradingSystem"],
        },
      },
    });

    let passes = 0;
    let gradesSum = 0;
    let dataGradeDiagram = [0, 0, 0, 0];

    // Рахуємо пропуски, середній бал та дані для графіка
    grades.forEach((g) => {
      if (g.value.toLowerCase() === "н") {
        passes++;
      } else {
        const val = Number(g.value);
        gradesSum += val;

        if (g.schedule.subject.gradingSystem === 5) {
          if (val === 5) dataGradeDiagram[0]++;
          else if (val === 4) dataGradeDiagram[1]++;
          else if (val === 3) dataGradeDiagram[2]++;
          else if (val === 2) dataGradeDiagram[3]++;
        } else if (g.schedule.subject.gradingSystem === 12) {
          if (val >= 10) dataGradeDiagram[0]++;
          else if (val >= 7) dataGradeDiagram[1]++;
          else if (val >= 4) dataGradeDiagram[2]++;
          else if (val >= 1) dataGradeDiagram[3]++;
        }
      }
    });
    res.status(200).json({
      students: student,
      statistics: {
        averageGrade:
          ((dataGradeDiagram[0] + dataGradeDiagram[1]) / student.length) * 100,
        totalPasses: passes,
        diagramData: dataGradeDiagram,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};
