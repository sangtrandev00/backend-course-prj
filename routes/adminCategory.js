const express = require("express");
const uploadMiddleware = require("../middleware/upload");
const { check, body } = require("express-validator");

const adminCategoriesController = require("../controllers/adminCategories");
const isAuth = require("../middleware/is-auth");
const Category = require("../models/Category");

const router = express.Router();

// GET CATEGORIES
router.get("/categories", adminCategoriesController.getCategories);

// GET ALL CATEGORIES
router.get("/categories", adminCategoriesController.getAllCategories);

// GET CATEGORY
router.get("/categories/:categoryId/single", adminCategoriesController.getCategory);

// POST CATE
// Should put the middleware upload multer here at route
router.post(
  "/category",
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
  uploadMiddleware.single("cateImage"),
  body("name")
    .isLength({ min: 3 })
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
router.delete("/categories/:categoryId", adminCategoriesController.deleteCategory);

module.exports = router;
