const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op, Model, where } = require("sequelize");
const User = require("../models/user");

exports.login = (req, res, next) => {
  const { gmail, password } = req.body;
  let loadUser;
  User.findOne({ where: { login: gmail } })
    .then((user) => {
      if (!user) {
        const err = new Error("Користувача з такою поштою не знайдено.");
        err.statusCode = 401;
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
      const token = jwt.sign(
        {
          userId: loadUser.id,
          userRole: loadUser.role,
        },
        "secret",
        { expiresIn: "24h" },
      );
      res
        .status(200)
        .json({ token: token, userId: loadUser.id, userRole: loadUser.role });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
