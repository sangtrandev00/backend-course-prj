const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/RevokedToken");

//Some patterns
module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    if (!error) {
      const error = new Error("Failed to authenticate user!");
      error.statusCode(401);
      return error;
    }
    return next(error);
  }

  console.log("auth header: ", authHeader);

  const token = req.get("Authorization").split(" ")[1];

  let decodedToken;

  try {
    const isTokenRevoked = await RevokedToken.exists({ token });
    if (isTokenRevoked) {
      return res.status(401).json({ message: "Token revoked" });
    }

    decodedToken = jwt.verify(token, "somesupersecret");
  } catch (error) {
    error.statusCode = 500;
    if (!error) {
      const error = new Error("Failed to authenticate user!");
      error.statusCode(500);
      return error;
    }
    return next(error);
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;

    if (!error) {
      const error = new Error("Failed to authenticate user!");
      error.statusCode(422);
      return error;
    }
    return next(error);
  }

  req.userId = decodedToken.userId;
  if (req.query.courseId) {
    req.courseId = req.query.courseId; // Authorize for author (who added the course for theirself)
  }
  req.decodedToken = decodedToken;

  // console.log("admin role: ", req.headers.adminrole);
  // console.log("user role: ", req.headers.userrole);

  // if (req.headers.adminrole === "admin") {
  //   req.adminToken = token;
  // } else if (req.headers.userrole === "user") {
  // }
  req.token = token;
  next();
};
