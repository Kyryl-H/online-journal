module.exports = (req, res, next) => {
  if (req.userRole !== "TEACHER") {
    const error = new Error(
      "Немає доступу. Виконувати цю дію можуть лише викладачі.",
    );
    error.statusCode = 403;
    throw error;
  }
  next();
};
