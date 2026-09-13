const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Grades = sequelize.define("grades", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  value: {
    type: Sequelize.STRING,
  },
});

module.exports = Grades;
