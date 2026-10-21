const { Op } = require("sequelize");

const Schedule = require("../models/schedule");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const Group = require("../models/group");

// Єдиний формат пари для всіх ендпоінтів розкладу
const toLessonDto = (lesson) => ({
  id: lesson.id,
  date: lesson.date,
  lessonNumber: lesson.lessonNumber,
  room: lesson.room,
  subjectName: lesson.subject?.name ?? null,
  teacherFullName: lesson.subject?.teacher?.fullName ?? null,
  groupName: lesson.subject?.group?.name ?? null,
  topic: lesson.topic ?? null,
  homework: lesson.homework ?? null,
});

/**
 * Пари за період, відфільтровані за предметами.
 * @param {object} options
 * @param {object} options.subjectWhere - умова для Subject: { groupId } або { teacherId }
 * @param {string} options.start - початок періоду (YYYY-MM-DD)
 * @param {string} options.end - кінець періоду (YYYY-MM-DD)
 */
const getLessons = async ({ subjectWhere, start, end }) => {
  const lessons = await Schedule.findAll({
    where: { date: { [Op.between]: [start, end] } },
    include: [
      {
        model: Subject,
        attributes: ["name"],
        where: subjectWhere,
        include: [
          { model: Teacher, attributes: ["fullName"] },
          { model: Group, attributes: ["name"] },
        ],
      },
    ],
    order: [
      ["date", "ASC"],
      ["lessonNumber", "ASC"],
    ],
  });

  return lessons.map(toLessonDto);
};

module.exports = { getLessons };
