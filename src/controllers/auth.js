const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
const { Op, Model, where, DATE } = require("sequelize");
const User = require("../models/user");
const Teacher = require("../models/teacher");
const { validationResult } = require("express-validator");
const { buffer } = require("stream/consumers");

sgMail.setApiKey(process.env.API_KEY);

exports.login = (req, res, next) => {
  const { gmail, password, rememberMe } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg);
    err.statusCode = 422;
    throw err;
  }

  let loadUser;
  User.findOne({ where: { login: gmail } })
    .then((user) => {
      if (!user) {
        const err = new Error("Користувача не знайдено!");
        err.statusCode = 404;
        throw err;
      }
      loadUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const err = new Error("Невірний пароль!");
        err.statusCode = 401;
        throw err;
      }
      return Teacher.findOne({ where: { userId: loadUser.id } });
    })
    .then((teacher) => {
      const isCuratorFlag = teacher ? teacher.isCurator : false;
      const teacherId = teacher ? teacher.id : null;
      const timeActive = rememberMe === true ? "30d" : "24h";

      const token = jwt.sign(
        {
          userId: loadUser.id,
          userRole: loadUser.role,
          isCurator: isCuratorFlag,
          teacherId: teacherId,
        },
        process.env.JWT_SECRET,
        { expiresIn: timeActive },
      );

      res.status(200).json({
        token: token,
        userId: loadUser.id,
        userRole: loadUser.role,
        isCurator: isCuratorFlag,
        teacherId: teacherId,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.sendLetter = async (req, res, next) => {
  try {
    const { email } = req.body;

    const buffer = crypto.randomBytes(32);
    const tocen = buffer.toString("hex");

    const user = await User.findOne({ where: { login: email } });
    if (!user) {
      const err = new Error("Дана електрона адреса не знайдена");
      err.statusCode = 404;
      throw err;
    }

    user.resetTocen = tocen;
    user.resetTocenExpiration = Date.now() + 3600000; // 1 година
    await user.save();

    await sgMail.send({
      to: email,
      from: "aleph.journal.notify@gmail.com",
      subject: "Reset password",
      html: `<p>Ви подали заявку на скидання пароля</p>
            <p>Натисніть на це <a href='http://localhost:3000/reset/${tocen}'>Посилання</a>, щоб встановити новий пароль.</p>`,
    });

    res.status(200).json({ message: "Лист для скидання пароля відправлено." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getNewPassword = async (req, res, next) => {
  try {
    const tocen = req.params.tocen;

    const user = await User.findOne({
      where: {
        resetTocen: tocen,
        resetTocenExpiration: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.redirect("/resetPassword.html?error=invalid-link");
    }

    // Якщо токен дійсний, пускаємо на форму і передаємо токен в URL
    res.redirect(`/new-password.html?token=${tocen}`);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.postNewPassword = async (req, res, next) => {
  try {
    const { password, tocen } = req.body;
    const user = await User.findOne({
      where: {
        resetTocen: tocen,
        resetTocenExpiration: { [Op.gt]: Date.now() },
      },
    });
    if (!user) {
      const err = new Error("Користувача не знайдено");
      err.statusCode = 404;
      throw err;
    }
    const newPassword = await bcrypt.hash(password, 12);
    user.password = newPassword;
    user.resetTocen = null;
    user.resetTocenExpiration = null;
    await user.save();
    res.status(200).json({ message: "Пароль успішно оновлено" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
