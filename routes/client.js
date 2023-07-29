const express = require("express");
const clientController = require("../controllers/client");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");

// GET Courses/
router.get("/courses", clientController.getCourses);

// GET Course
router.get("/courses/:courseId", clientController.getCourse);

// GET Course enrolled
router.get("/courses/:courseId/enrolled", clientController.getCourseEnrolledByUserId);

// GET Course Detail
router.get("/courses/:courseId/detail", clientController.getCourseDetail);

// GET SECTIONS BY COURSE ID
router.get("/sections/:courseId/course", clientController.getSectionsByCourseId);

// GET SECTIONS BY COURSE ID
router.get("/lessons/:sectionId/section", clientController.getLessonsBySectionId);

// GET SECTIONS BY COURSE ID
router.get(
  "/lessons/:sectionId/section/course-enrolled",
  clientController.getLessonsBySectionIdEnrolledCourse
);

// POST reset password

// GET CATES
router.get("/categories", clientController.getCategories);

// GET MAX PRICE
router.get("/course-max-price", clientController.getMaxPrice);

// GET MIN PRICE
router.get("/course-min-price", clientController.getMinPrice);

// GET CATES -- ID
router.get("/categories/:categoryId", clientController.getCategory);

// router.get('/status', clientController.getUserStatus)

router.patch("/courses/:courseId", clientController.updateViews);

// UPDATE CURRENT LESSON DONE BY USER ID
router.post("/lesson-done/:lessonId", clientController.updateLessonDoneByUser);

//
router.get("/lesson/:lessonId/is-done", clientController.checkLessonDoneUserId);

// POST ORDER
router.post("/order", clientController.postOrder);

// GET ORDER: id
router.get("/orders/:orderId", clientController.getOrder);

// GET COURSE BY STUDENTS HAVE BOUGHT
router.get("/courses/:userId/ordered", clientController.getCoursesOrderedByUser);

// GET USER: id

router.get("/users/:userId", clientController.getUser);

// GET USER DETAIL
router.get("/users/:userId/detail", clientController.getUserDetail);

// CREATE REVIEW FOR COURSE ID OF USER ID AFTER ORDER

router.post("/courses/:courseId/reviews", clientController.postReview);

// GET COURES REVIEWS
router.get("/courses/:courseId/reviews", clientController.getCourseReviews);

// POST CREATE CERTIFICATIONS
router.post("/generate-certification", clientController.postCertification);

// GENREATE AI IMAGES
router.get("/genrate-ai-images", clientController.getAiImages);

// GENREATE AI IMAGES
router.get("/genrate-random-courses", clientController.generateRandomCourses);

module.exports = router;
