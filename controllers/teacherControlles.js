const express = require("express");
const { Op, Model, where } = require("sequelize");
const Teacher = require("../models/teacher");
const Schedule = require("../models/schedule");
const Subject = require("../models/subject");
const Group = require("../models/group");
const User = require("../models/user");

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
