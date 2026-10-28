const { body, param } = require("express-validator");
const Schedule = require("../models/schedule");
const Subject = require("../models/subject");
const { where } = require("sequelize");

exports.resetPassword = [
  body("oldPassword")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Пароль має містити щонайменше 8 символів.")
    .isAlphanumeric()
    .withMessage("Пароль повинен містити лише літери та цифри.")
    .matches(/[a-zA-Z]/)
    .withMessage("Пароль повинен містити мінімум одну літеру."),
  ,
  body("newPassword")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Пароль має містити щонайменше 8 символів.")
    .isAlphanumeric()
    .withMessage("Пароль повинен містити лише літери та цифри.")
    .matches(/[a-zA-Z]/)
    .withMessage("Пароль повинен містити мінімум одну літеру."),
  ,
];

exports.lessonBaseValidators = [
  body("lessonType")
    .notEmpty()
    .isString()
    .withMessage("Такого типу заняття не існує! Виберіть інший"),

  body("date", "Неправильно введена дата")
    .isISO8601()
    .custom((value) => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      let startYear, endYear;
      if (currentMonth >= 8) {
        startYear = currentYear;
        endYear = currentYear + 1;
      } else {
        startYear = currentYear - 1;
        endYear = currentYear;
      }
      const min = new Date(`${startYear}-09-01`);
      const max = new Date(`${endYear}-06-30`);

      console.log(min);
      console.log(max);
      console.log(new Date(value));
      if (!(new Date(value) <= max && new Date(value) >= min)) {
        const err = new Error("Неправильно введена дата");
        err.statusCode = 422;
        throw err;
      }
      return true;
    }),

  body("lessonNumber", "Заняття може бути від 1 до 7")
    .if((value, { req }) => req.body.lessonType === "para")
    .notEmpty()
    .isInt({ min: 1, max: 7 }),
  body("room")
    .if((value, { req }) => {
      req.body.lessonType === "para";
    })
    .notEmpty()
    .isAlphanumeric()
    .withMessage("Можна використовувати тільки букви й цифри"),
  body("topic")
    .optional({ checkFalsy: true })
    .isLength({ min: 5, max: 255 })
    .withMessage("Тема має бути довжиною від 5 до 255 символів"),
  body("homework")
    .if((value, { req }) => req.body.lessonType === "para")
    .optional({ checkFalsy: true })
    .isLength({ min: 5 })
    .withMessage("Домашня робота має бути довжиною мінімум 5 букв"),
];

exports.EditLesson = [
  body("id")
    .notEmpty()
    .custom(async (value) => {
      const res = await Schedule.findByPk(value);
      if (!res) {
        return Promise.reject("Заняття не знайдено");
      }
      return true;
    }),
  ...this.lessonBaseValidators,
];

exports.CreateLesson = [
  body("subjectId").custom(async (value) => {
    const res = await Subject.findByPk(value);
    if (!res) {
      return Promise.reject("Предмет не знайдено");
    }
    return true;
  }),
  ...this.lessonBaseValidators,
];

exports.deleteLesson = [
  param("id")
    .notEmpty()
    .custom((id) => {
      return Schedule.findByPk(id).then((res) => {
        if (!res) {
          return Promise.reject("Занятя не знайдено");
        }
      });
    }),
];
exports.pushGrades = [
  body("grades")
    .isArray({ min: 1 })
    .withMessage("Відсотній масив оцінок")
    .custom(async (grade) => {
      const gradingSystem = await Schedule.findOne({
        where: { id: grade[0].scheduleId },
        include: {
          model: Subject,
          attributes: ["gradingSystem"],
        },
      });
      const gradingSystemValue = gradingSystem.subject.gradingSystem;
      for (const g of grade) {
        const valid =
          g.value === "" ||
          g.value === "н" ||
          g.value === "Н" ||
          g.value === "н/а" ||
          g.value === "зар" ||
          (Number(g.value) >= 1 && Number(g.value) <= gradingSystemValue);
        if (!valid) {
          const err = new Error("Невалідна оцінка");
          err.statusCode = 422;
          throw err;
        }
      }
      return true;
    }),
];
