const express = require("express");
const uploadMiddleware = require("../middleware/upload");
const { check, body } = require("express-validator");

const adminCategoriesController = require("../controllers/adminCategories");
const isAuth = require("../middleware/is-auth");
const isAdmin = require("../middleware/is-admin");
const isAuthorize = require("../middleware/authorization");
const Category = require("../models/Category");

const router = express.Router();

// GET CATEGORIES
// Is Auth to protect the route
router.get("/categories", isAuth, adminCategoriesController.getCategories);

// GET ALL CATEGORIES
router.get("/all-categories", adminCategoriesController.getAllCategories);

// GET CATEGORY
router.get("/categories/:categoryId/single", isAuth, adminCategoriesController.getCategory);

// POST CATE
// Should put the middleware upload multer here at route
router.post(
  "/category",
  isAuth,
  isAdmin,
  uploadMiddleware.single("cateImage"),
  body("name")
    .isLength({ min: 3 })
    .withMessage("Please enter a input field category with at least 3 characters.")
    .custom((value, { req }) => {
      return Category.findOne({ name: value }).then((categoryDoc) => {
        if (categoryDoc) {
          return Promise.reject("Category exists already, please pick a different one.");
        }
      });
    }),
  adminCategoriesController.postCategory
);

// PUT CATE
router.put(
  "/category/:categoryId",
  isAuth,
  isAdmin,
  uploadMiddleware.single("cateImage"),
  body("name")
    .isLength({ min: 2 })
    .withMessage("Please enter a input field category with at least 3 characters."),
  // .custom((value, { req }) => {
  //   return Category.findOne({ name: value }).then((categoryDoc) => {
  //     if (categoryDoc) {
  //       return Promise.reject("Category exists already, please pick a different one.");
  //     }
  //   });
  // }),
  adminCategoriesController.updateCategories
);

// DELETE CATE
router.delete("/categories/:categoryId", isAuth, isAdmin, adminCategoriesController.deleteCategory);

module.exports = router;
