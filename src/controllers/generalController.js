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
const { validationResult } = require("express-validator");

const resolveCurrentRole = (req) => {
  const rawRole = req.role || req.userRole || (req.user && req.user.role);
  return typeof rawRole === "string" ? rawRole.toUpperCase() : rawRole;
};

const getStudentWithDetails = (userId) =>
  Student.findOne({
    where: { userId },
    include: [
      {
        model: User,
        attributes: ["login"],
      },
      {
        model: Group,
        attributes: ["id", "name"],
        include: [
          {
            model: Teacher,
            attributes: ["id", "fullName", "isCurator"],
          },
        ],
      },
    ],
  });

exports.getScheduleForDay = async (req, res, next) => {
  const currentUserId = req.userId;
  const currentRole = resolveCurrentRole(req);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const timeMap = {
    1: "8:00-9:20",
    2: "9:30-10:50",
    3: "11:20-12:40",
    4: "12:50-14:10",
    5: "14:20-15:40",
    6: "15:50-17:40",
    7: "17:20-18:40",
  };

  try {
    if (currentRole === "STUDENT") {
      const student = await getStudentWithDetails(currentUserId);

      if (!student) {
        const error = new Error("Студента не знайдено");
        error.statusCode = 404;
        throw error;
      }

      const curatorFullName = student.group?.teacher?.fullName ?? null;

      const rawSchedule = await Schedule.findAll({
        where: { date: { [Op.between]: [startOfDay, endOfDay] } },
        include: [
          {
            model: Subject,
            where: { groupId: student.groupId },
            include: [
              {
                model: Teacher,
                attributes: ["fullName"],
              },
              {
                model: Group,
                attributes: ["name"],
              },
            ],
          },
        ],
        order: [["lessonNumber", "ASC"]],
      });

      if (rawSchedule.length === 0) {
        return res.status(200).json({
          role: currentRole,
          fullName: student.fullName,
          group: student.group?.name || null,
          curator: curatorFullName,
          schedule: [],
          message: "На сьогодні пар немає",
        });
      }

      const formattedSchedule = rawSchedule.map((sch) => ({
        time: timeMap[sch.lessonNumber],
        subject: sch.subject.name,
        room: sch.room,
        teacherFullName: sch.subject.teacher?.fullName,
        groupName: sch.subject.group?.name,
      }));

      return res.status(200).json({
        role: currentRole,
        fullName: student.fullName,
        group: student.group?.name || null,
        curator: curatorFullName,
        schedule: formattedSchedule,
      });
    }

    const teacher = await Teacher.findOne({ where: { userId: currentUserId } });

    if (!teacher) {
      const error = new Error("Викладача не знайдено");
      error.statusCode = 404;
      throw error;
    }

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

    const formattedSchedule = rawSchedule.map((sch) => {
      return {
        time: timeMap[sch.lessonNumber],
        subject: sch.subject.name,
        room: sch.room,
        groupName: sch.subject.group.name,
      };
    });

    return res.status(200).json({
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
    const currentUserId = req.userId;
    const currentRole = resolveCurrentRole(req);

    if (currentRole === "STUDENT") {
      const student = await getStudentWithDetails(currentUserId);

      if (!student) {
        const error = new Error("Студента не знайдено");
        error.statusCode = 404;
        throw error;
      }
      const grades = await Grades.findAll({
        where: { studentId: student.id },
        attributes: ["value"],
        include: {
          model: Schedule,
          attributes: ["date"],
          include: {
            model: Subject,
            attributes: ["gradingSystem"],
          },
        },
      });
      if (!grades) {
        const error = new Error("Оцінок не знайдено");
        error.statusCode = 404;
        throw error;
      }

      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const startStudingYear = new Date(
        `${month >= 9 ? year : year - 1}-09-01`,
      );
      const endStudingYear = new Date(`${month <= 6 ? year : year + 1}-06-30`);
      const startMonth = new Date(Date.UTC(year, month, 1));
      const endMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
      console.log(startMonth);
      console.log(now);
      console.log(endMonth);
      // некоректне створення дат місяців
      // Обрахунок кількості пропусків
      const numberOfPasses = function (start, end) {
        return grades.filter((grade) => {
          if (
            grade.schedule.date >= start &&
            grade.schedule.date <= end &&
            grade.value.toLowerCase() === "н"
          ) {
            return true;
          }
        }).length;
      };
      // Пропуски за рік
      const totalNumberOfPasses = numberOfPasses(
        startStudingYear,
        endStudingYear,
      );
      // Пропуски за місяць
      const monthNumberOfPasses = numberOfPasses(startMonth, endMonth);
      // Обрахунок середнього балу
      // Допоміжні інструменти
      const normalizeNumber = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : null;
      };
      const convertGrades = (item) => {
        if (item >= 10 && item <= 12) {
          return 5;
        }
        if (item >= 7 && item <= 9) {
          return 4;
        }
        if (item >= 4 && item <= 6) {
          return 3;
        }
        if (item >= 1 && item <= 3) {
          return 2;
        }
      };

      const averageGrades = function (start, end, passes) {
        const validValues = grades
          .map((grade) => {
            const normalNumber = normalizeNumber(grade.value);
            if (grade.schedule.subject.gradingSystem === 5) {
              return normalNumber;
            } else if (grade.schedule.subject.gradingSystem === 12) {
              return convertGrades(normalNumber);
            }
          })
          .filter((value) => value !== null && value > 0);

        return (average = validValues.length
          ? (
              validValues.reduce((sum, item) => sum + item, 0) /
                validValues.length -
              passes * 0.02
            ).toFixed(2)
          : "0.00");
      };
      // Загальна успішність
      const overallAcademicPerformance = averageGrades(
        startStudingYear,
        endStudingYear,
        totalNumberOfPasses ?? 0,
      );
      // Успішність за місяць
      const monthAcademicPerformance =
        averageGrades(startMonth, endMonth, monthNumberOfPasses ?? 0) ?? 0;

      const statistics = {
        overallAcademicPerformance: overallAcademicPerformance ?? 0,
        totalNumberOfPasses: totalNumberOfPasses ?? 0,
        monthAcademicPerformance: monthAcademicPerformance ?? 0,
        monthNumberOfPasses: monthNumberOfPasses ?? 0,
      };

      return res.status(200).json({
        role: currentRole,
        fullName: student.fullName,
        group: student.group?.name || null,
        curator: student.group?.teacher?.fullName || null,
        email: student.user?.login || null,
        statistics,
      });
    }

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
// Список груп для <select> розкладу.
// STUDENT — усі групи + myGroup (власна), TEACHER — лише групи, де він викладає.
exports.getGroups = async (req, res) => {
  try {
    const currentRole = resolveCurrentRole(req);

    if (currentRole === "TEACHER") {
      const teacher = await Teacher.findOne({ where: { userId: req.userId } });
      if (!teacher) {
        return res.status(404).json({ message: "Викладача не знайдено" });
      }

      const subjects = await Subject.findAll({
        where: { teacherId: teacher.id },
        attributes: ["id"],
        include: { model: Group, attributes: ["id", "name"], required: true },
      });

      const uniqueGroups = new Map(
        subjects.map((subject) => [subject.group.id, subject.group]),
      );
      const groups = [...uniqueGroups.values()].sort((a, b) =>
        a.name.localeCompare(b.name, "uk"),
      );

      return res
        .status(200)
        .json({ role: currentRole, myGroup: null, group: groups });
    }

    const allGroups = await Group.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    let myGroup = null;
    if (currentRole === "STUDENT") {
      const student = await Student.findOne({
        where: { userId: req.userId },
        attributes: ["groupId"],
      });
      if (!student) {
        return res.status(404).json({ message: "Студента не знайдено" });
      }
      myGroup = allGroups.find((group) => group.id === student.groupId) ?? null;
    }

    res.status(200).json({ role: currentRole, myGroup, group: allGroups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка завантаження груп" });
  }
};

// Розклад будь-якої групи за період — масив пар
exports.getSchedule = async (req, res) => {
  try {
    const { groupId, start, end } = req.params;
    const lessons = await getLessons({ subjectWhere: { groupId }, start, end });
    res.status(200).json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка завантаження розкладу" });
  }
};
exports.changePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmty()) {
    const err = new Error(errors.array()[0].msg);
    err.codeSatus = 422;
    throw err;
  }
  const currentUserId = req.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(currentUserId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Старий пароль невірний" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;

    await user.save();

    res.status(200).json({ message: "Пароль успішно змінено" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка зміни пароля" });
  }
};
