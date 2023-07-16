const express = require("express");
const adminSectionController = require("../controllers/adminSections");
const uploadMiddleware = require("../middleware/upload");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");

// GET Sections
router.get("/sections", adminSectionController.getSections);

// GET BY RANGES [MIN, MAX];

// router.get("/Sections-by-price-range", adminSectionController.getSectionsInRange);
// router.get("/random-sections", adminSectionController.createRandomSections);

// GET Section

router.get("/sections/:sectionId", adminSectionController.getSection);

// GET SECTIONS BY COURSE ID

router.get("/sections/:courseId/course", adminSectionController.getSectionsByCourseId);

// POST Section
router.post("/section", uploadMiddleware.array("images[]"), adminSectionController.postSection);

// PUT Section
router.put(
  "/section/:sectionId",
  uploadMiddleware.array("images[]"),
  adminSectionController.updateSection
);

// DELETE Section
router.delete("/sections/:sectionId", adminSectionController.deleteSection);

module.exports = router;
