const User = require("../models/User");

module.exports = async (req, res, next) => {
  console.log("req.decodedToken: ", req.decodedToken);
  console.log("req.userId: ", req.userId);

  try {
    //   retrieve userid from db
    const user = await User.findById(req.userId);
    const isAdmin = user.role === "ADMIN";

    if (!isAdmin) {
      const error = new Error("This user is not admin role!");
      error.statusCode = 401;
      throw error;
    }

    console.log("This user is admin role!");

    next();
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to authorize user with admin role!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
