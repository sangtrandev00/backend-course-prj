// middleware/extractUserId.js

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1]; // Assuming you send the token in the "Authorization" header

  try {
    const decodedToken = jwt.verify(token, "somesupersecret");
    req.token = decodedToken.token; // Attach the user ID to the request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
