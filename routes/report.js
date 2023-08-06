const express = require("express");
const reportController = require("../controllers/reports");
const uploadMiddleware = require("../middleware/upload");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");

// GET Summary reports
router.get("/reports/summary", reportController.getSummaryReports);

// GET Courses Sales
router.get("/reports/course-sales", reportController.getCourseSales);

// GET Revenue
router.get("/reports/revenues", reportController.getRevenues);

// GET NEW SIGNUPS
router.get("/reports/new-signups", reportController.getNewUserSignups);

// // GET LESSON BY SECTION ID
// router.get("/lessons/:sectionId/section", reportController.getLessonsBySectionId);

// // POST Lesson
// router.post("/lesson", uploadMiddleware.array("images[]"), reportController.postLesson);

// // PUT Lesson
// router.put(
//   "/lesson/:lessonId",
//   uploadMiddleware.array("images[]"),
//   reportController.updateLesson
// );

// // DELETE Lesson
// router.delete("/lessons/:lessonId", reportController.deleteLesson);

module.exports = router;
