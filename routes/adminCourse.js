const express = require("express");
const adminCourseController = require("../controllers/adminCourses");
const uploadMiddleware = require("../middleware/upload");
const isAuth = require("../middleware/is-auth");
const isOwnerOfCourse = require("../middleware/is-owner-course");
const router = express.Router();
const { check, body } = require("express-validator");
const isAdmin = require("../middleware/is-admin");

// GET Courses
router.get("/courses", isAuth, adminCourseController.getCourses);

// GET BY RANGES [MIN, MAX];

// router.get("/courses-by-price-range", adminCourseController.getcoursesInRange);
router.get("/random-courses", isAuth, isAdmin, adminCourseController.createRandomCourses);

// GET Course

router.get("/courses/:courseId", isAuth, adminCourseController.getCourse);

// POST Course
router.post(
  "/course",
  isAuth,
  uploadMiddleware.array("images[]"),
  adminCourseController.postCourse
);

// PUT Course
router.put(
  "/course/:courseId",
  uploadMiddleware.array("images[]"),
  adminCourseController.updateCourse
);

// DELETE Course
router.delete("/courses/:courseId", isAuth, isOwnerOfCourse, adminCourseController.deleteCourse);

module.exports = router;
