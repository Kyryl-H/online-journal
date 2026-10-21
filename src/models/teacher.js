const Sequelize = require("sequelize");

const sequelize = require("../config/database");

const Teacher = sequelize.define("teacher", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fullName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isCurator: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
});

module.exports = Teacher;
