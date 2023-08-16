const jwt = require("jsonwebtoken");
const RevokedToken = require("../models/RevokedToken"); // Import your revoked tokens model

module.exports = async (req, res, next) => {
  const token = req.header("Authorization").split(" ")[1]; // Assuming you send the token in the "Authorization" header

  try {
    // Check if the token is in the revoked tokens collection
    const isTokenRevoked = await RevokedToken.exists({ token });
    if (isTokenRevoked) {
      return res.status(401).json({ message: "Token revoked" });
    }

    const decodedToken = jwt.verify(token, "somesupersecret");
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
