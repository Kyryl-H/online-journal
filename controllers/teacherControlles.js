const express = require("express");
const { Op, Model, where } = require("sequelize");
const Teacher = require("../models/teacher");
const Schedule = require("../models/schedule");
const Subject = require("../models/subject");
const Group = require("../models/group");
const User = require("../models/user");
const Student = require("../models/student");
const Grades = require("../models/grades");

// Дані для головної сторіник
exports.getScheduleForDay = async (req, res, next) => {
  const currentUserId = req.headers["user-id"];
  const currentRole = req.headers["user-role"];
  try {
    const teacher = await Teacher.findOne({ where: { userId: currentUserId } });

    if (!teacher) {
      const error = new Error("Викладача не знайдено");
      error.statusCode = 404;
      throw error;
    }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const rawSchedule = await Schedule.findAll({
      where: { date: { [Op.between]: [startOfDay, endOfDay] } },
      include: [
        {
          model: Subject,
          where: { teacherId: teacher.id },
          include: {
            model: Group,
            attributes: ["name"],
          },
        },
      ],
      order: [["date", "ASC"]],
    });

    if (rawSchedule.length === 0) {
      return res.status(200).json({
        role: currentRole,
        isCurator: teacher.isCurator,
        fullName: teacher.fullName,
        schedule: [],
        message: "На сьогодні пар немає",
      });
    }

    const timeMap = {
      1: "8:00-9:20",
      2: "9:30-10:50",
      3: "11:20-12:40",
      4: "12:50-14:10",
      5: "14:20-15:40",
      6: "15:50-17:40",
      7: "17:20-18:40",
    };

    const formattedSchedule = rawSchedule.map((sch) => {
      return {
        time: timeMap[sch.lessonNumber],
        subject: sch.subject.name,
        room: sch.room,
        groupName: sch.subject.group.name,
      };
    });
    res.status(200).json({
      role: currentRole,
      isCurator: teacher.isCurator,
      fullName: teacher.fullName,
      schedule: formattedSchedule,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
// Дані для профілю
exports.getProfile = async (req, res, next) => {
  try {
    const currentUserId = req.headers["user-id"];
    const currentRole = req.headers["user-role"];

    const teacher = await Teacher.findOne({
      where: { userId: currentUserId },
      include: {
        model: User,
        where: { id: currentUserId },
        attributes: ["login"],
      },
    });

    if (!teacher) {
      const error = new Error("Викладача не знайдено");
      error.statusCode = 404;
      throw error;
    }
    //Групи в яких куратор
    const group = await Group.findAll({
      where: { teacherId: teacher.id },
      attributes: ["name"],
    });

    let gropArr = group.map((g) => g.name);
    // Предмети які викладє та в яких групах
    const subject = await Subject.findAll({
      where: { teacherId: teacher.id },
      include: {
        model: Group,
        attributes: ["name"],
      },
    });

    let subjectArr = subject.map((sub) => ({
      name: sub.name,
      group: sub.group.name,
    }));
    // Відправка даних
    res.status(200).json({
      role: currentRole,
      isCurator: teacher.isCurator,
      fullName: teacher.fullName,
      group: gropArr,
      email: teacher.user.login,
      subject: subjectArr,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
// Дані для головної(першої) сторнки журналу
exports.getJournalMain = async (req, res, next) => {
  try {
    const currentUserId = req.headers["user-id"];
    const currentRole = req.headers["user-role"];
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
    attributes: ["id", "date", "topic"],
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

exports.getGroups = async (req, res, next) => {
  try {
    const group = await Group.findAll({ attributes: ["id", "name"] });
    res.status(200).json({ group: group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};

exports.getSchedule = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const start = req.params.start;
    const end = req.params.end;
    const sub = await Subject.findAll({
      where: { groupId: groupId },
    });
    const subjectId = sub.map((s) => s.id);

    const schedule = await Schedule.findAll({
      attributes: ["id", "date", "lessonNumber", "room"],
      where: {
        [Op.and]: [
          { subjectId: { [Op.in]: subjectId } },
          { date: { [Op.between]: [start, end] } },
        ],
      },
      include: {
        model: Subject,
        attributes: ["name"],
        include: {
          model: Teacher,
          attributes: ["fullName"],
        },
      },
    });

    if (subjectId.length === 0) {
      return res.status(200).json({ schedule: [] });
    }

    const scheduleFormat = schedule.map((s) => ({
      id: s.id,
      date: s.date,
      lessonNumber: s.lessonNumber,
      room: s.room,
      subjectName: s.subject?.name,
      teacherFullName: s.subject?.teacher?.fullName,
    }));
    res.status(200).json(scheduleFormat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка збереження" });
  }
};
