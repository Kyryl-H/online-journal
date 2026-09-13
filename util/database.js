const Sequelize = require("sequelize");

const sequelize = new Sequelize("online-journal", "admin", "1111", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
