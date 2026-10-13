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

      const statistics = {
        overallAcademicPerformance: student.overallAcademicPerformance ?? 0,
        totalNumberOfPasses: student.totalNumberOfPasses ?? 0,
        monthAcademicPerformance: student.monthAcademicPerformance ?? 0,
        monthNumberOfPasses: student.monthNumberOfPasses ?? 0,
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
