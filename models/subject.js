const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Subject = sequelize.define("subject", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  gradingSystem: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Subject;
