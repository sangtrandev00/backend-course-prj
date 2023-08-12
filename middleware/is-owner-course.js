const Course = require("../models/Course");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  console.log("req.decodedToken: ", req.decodedToken);
  console.log("req.userId: ", req.userId);
  console.log("req.courseId: ", req.courseId);
  console.log("req.query: ", req.query);
  console.log("req.params: ", req.params);

  const { courseId } = req.params;

  try {
    //   retrieve userid from db
    const user = await User.findById(req.userId);

    const isAdmin = user.role === "ADMIN";

    const currentCourse = await Course.findById(courseId);

    const isOwnerOfCourse = currentCourse.userId.toString() === req.userId;
    console.log("current course: ", currentCourse);
    console.log("is owner ???", isOwnerOfCourse);

    if (!isAdmin && !isOwnerOfCourse) {
      const error = new Error("This user is not admin role! and not the owner of this course");
      error.statusCode = 401;
      throw error;
    }

    console.log("This user is admin role! and course owner");

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
