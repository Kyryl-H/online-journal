const { body } = require("express-validator");
const User = require("../models/user");

module.exports = [
  body("gmail")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Введіть дійсну електронну адресу.")
    .custom((value) => {
      return User.findOne({ where: { login: value } }).then((user) => {
        if (!user) {
          return Promise.reject("Користувача з такою поштою не знайдено.");
        }
      });
    }),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Пароль має містити щонайменше 8 символів.")
    .isAlphanumeric()
    .withMessage("Пароль повинен містити лише літери та цифри."),
];
