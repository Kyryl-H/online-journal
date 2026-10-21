const app = require("./app");
const db = require("./models/index");

db.sequelize
  .sync({ alter: false, force: false })
  .then(() => {
    console.log("База даних успішно синхронізована");
    app.listen(3000);
  })
  .catch((err) => console.log(`Помилка підключення до бази даних: ${err}`));
