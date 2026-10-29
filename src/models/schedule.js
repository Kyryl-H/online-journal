const Sequelize = require("sequelize");

const sequelize = require("../config/database");

const Schedule = sequelize.define("schedule", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  lessonNumber: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  room: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  topic: {
    type: Sequelize.TEXT,
  },
  lessonType: {
    type: Sequelize.STRING,
    defaultValue: "para",
  },
  homework: {
    type: Sequelize.TEXT,
  },
});

module.exports = Schedule;
