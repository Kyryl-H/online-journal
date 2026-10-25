const Sequelize = require("sequelize");

const sequelize = require("../config/database");
const { resetPassword } = require("../controllers/auth");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  login: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  resetTocen: {
    type: Sequelize.STRING,
  },
  resetTocenExpiration: {
    type: Sequelize.DATE,
  },
});

module.exports = User;
