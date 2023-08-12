const jwt = require("jsonwebtoken");
const User = require("../models/User");

//Some patterns
module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  console.log("auth header: ", authHeader);

  const token = req.get("Authorization").split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "somesupersecret");
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;

    throw error;
  }

  const userId = decodedToken.userId;

  try {
    //   retrieve userid from db

    const user = await User.findById(userId);
    console.log("user: ", user);

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    console.log("fail to authorize user!");

    if (!error) {
      const error = new Error("Failed to authorize user!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
