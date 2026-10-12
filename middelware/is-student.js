module.exports = (req, res, next) => {
  if (req.userRole !== "STUDENT") {
    const error = new Error(
      "Немає доступу. Виконувати цю дію можуть лише студенти.",
    );
    error.statusCode = 403;
    throw error;
  }
  next();
};
