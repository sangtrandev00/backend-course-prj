const express = require("express");
const clientController = require("../controllers/client");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");

// GET Courses/
router.get("/courses", clientController.getCourses);

// GET Course
router.get("/courses/:courseId", clientController.getCourse);

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

// POST ORDER
router.post("/order", clientController.postOrder);

// GET ORDER: id
router.get("/orders/:orderId", clientController.getOrder);

// GET USER: id

router.get("/users/:userId", clientController.getUser);

module.exports = router;
