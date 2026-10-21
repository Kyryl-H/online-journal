const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op, Model, where } = require("sequelize");
const User = require("../models/user");
const Teacher = require("../models/teacher");
const { validationResult } = require("express-validator");

exports.login = (req, res, next) => {
  const { gmail, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg);
    err.statusCode = 422;
    throw err;
  }

  let loadUser;
  User.findOne({ where: { login: gmail } })
    .then((user) => {
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
      const token = jwt.sign(
        {
          userId: loadUser.id,
          userRole: loadUser.role,
          isCurator: isCuratorFlag,
        },
        "secret",
        { expiresIn: "24h" },
      );
      res.status(200).json({
        token: token,
        userId: loadUser.id,
        userRole: loadUser.role,
        isCurator: isCuratorFlag,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
