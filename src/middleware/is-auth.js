require("dotenv").config();
const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Не автентифіковано.");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodedTocen;

  try {
    decodedTocen = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedTocen) {
    const err = new Error("Не авторизований");
    err.statusCode = 401;
    throw err;
  }
  req.userId = decodedTocen.userId;
  req.userRole = decodedTocen.userRole;
  next();
};
