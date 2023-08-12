const jwt = require("jsonwebtoken");

//Some patterns
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    if (!error) {
      const error = new Error("Failed to authenticate user!");
      error.statusCode(401);
      return error;
    }
    next(error);
  }

  console.log("auth header: ", authHeader);

  const token = req.get("Authorization").split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "somesupersecret");
  } catch (error) {
    error.statusCode = 500;
    if (!error) {
      const error = new Error("Failed to authenticate user!");
      error.statusCode(500);
      return error;
    }
    next(error);
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;

    if (!error) {
      const error = new Error("Failed to authenticate user!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }

  req.userId = decodedToken.userId;
  if (req.query.courseId) {
    req.courseId = req.query.courseId;
  }
  req.decodedToken = decodedToken;
  next();
};
