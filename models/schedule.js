const Sequelize = require("sequelize");

const sequelize = require("../util/database");

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
  topic: {
    type: Sequelize.TEXT,
  },
});

module.exports = Schedule;
