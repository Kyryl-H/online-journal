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

exports.getScheduleForDay = async (req, res, next) => {
  const currentUserId = req.userId;
  const currentRole = req.userRole;
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
      const student = await Student.findOne({
        where: { userId: currentUserId },
        include: {
          model: Group,
          include: {
            model: Teacher,
            attributes: ["fullName"],
          },
        },
      });

      if (!student) {
        const error = new Error("Студента не знайдено");
        error.statusCode = 404;
        throw error;
      }

      // get curator (if any) via include
      let curatorFullName = student.group?.teacher?.fullName ?? null;

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
          schedule: [],
          curator: curatorFullName,
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
        schedule: formattedSchedule,
        curator: curatorFullName,
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
    const currentRole = req.userRole;

    if (currentRole === "STUDENT") {
      const student = await Student.findOne({
        where: { userId: currentUserId },
        include: [
          {
            model: User,
            where: { id: currentUserId },
            attributes: ["login"],
          },
          {
            model: Group,
            attributes: ["name"],
          },
        ],
      });

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
        group: student.group?.name,
        email: student.user.login,
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
