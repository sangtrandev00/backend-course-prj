const express = require("express");
const adminCourseController = require("../controllers/adminCourses");
const uploadMiddleware = require("../middleware/upload");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");

// GET Courses
router.get("/courses", adminCourseController.getCourses);

// GET BY RANGES [MIN, MAX];

// router.get("/courses-by-price-range", adminCourseController.getcoursesInRange);
router.get("/random-courses", adminCourseController.createRandomCourses);

// GET Course

router.get("/courses/:courseId", adminCourseController.getCourse);

// POST Course
router.post("/course", uploadMiddleware.array("images[]"), adminCourseController.postCourse);

// PUT Course
router.put(
  "/course/:courseId",
  uploadMiddleware.array("images[]"),
  adminCourseController.updateCourse
);

// DELETE Course
router.delete("/courses/:courseId", adminCourseController.deleteCourse);

module.exports = router;
