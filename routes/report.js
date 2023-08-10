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

// GET REPORTS FOR USER PROGRESS
router.get("/reports/users-progress", reportController.getReportsUserProgress);

// GET REPORTS FOR COURSE INSIGHTS
router.get("/reports/course-insights", reportController.getReportsCourseInsights);

module.exports = router;
