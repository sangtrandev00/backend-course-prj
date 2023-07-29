const { faker } = require("@faker-js/faker");
const Category = require("../models/Category");
const Section = require("../models/Section");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");

exports.getSections = async (req, res, next) => {
  try {
    const sections = await Section.find();
    res.status(200).json({
      message: "Fetch all Sections successfully!",
      sections,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Sections!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getSectionsByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const sectionsOfCourse = await Section.find({ courseId });

    res.status(200).json({
      message: "Fetch all Sections by course id successfully!",
      sections: sectionsOfCourse,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Sections by course id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getSection = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    const section = await Section.findById(sectionId).populate("courseId");
    res.status(200).json({
      message: "Fetch single section successfully!",
      section,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Section by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.postSection = async (req, res, next) => {
  const { courseId, name, access, description } = req.body;

  // console.log(req.files);

  // const images = req.files.map((item) => item.path.replace("\\", "/"));
  // const thumb = images.find((image) => image.includes("thumb"));

  try {
    const section = new Section({
      courseId,
      name,
      access,
      description,
    });

    const response = await section.save();

    res.json({
      message: "Create Section successfully!",
      Section: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post section!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateSection = async (req, res, next) => {
  const { name, oldPrice, discount, oldImages, shortDesc, fullDesc, stockQty, categoryId } =
    req.body;
  const { cousreId } = req.params;

  const images = req.files.map((item) => item.path.replace("\\", "/"));
  const imageStrings = images.join(", ");
  const thumb = images.find((image) => image.includes("thumb"));

  console.log("req.files", req.files);
  console.log("images", images);
  console.log("thumb", thumb);
  const isEmptyFiles = req.files.length === 0;
  const isDifferentImages = imageStrings !== oldImages;

  // if (req.files.length > 0) {
  // }
  // console.log("isEmptyFiles", isEmptyFiles);

  // if (isDifferentImages && !isEmptyFiles) {
  //   console.log("delete old images successfully!", oldImages);
  //   console.log("new images: ", imageStrings);
  // }

  // return;
  try {
    // Find course by id
    const course = await Section.findById(cousreId);

    console.log("course images: ", course.images);
    console.log("old images: ", oldImages);

    // Update course follow by that id
    course.name = name;
    course.oldPrice = +oldPrice;
    course.discount = +discount;
    console.log("is difference: ", isDifferentImages);
    console.log("is empty: ", isEmptyFiles);

    // Trường hợp không up ảnh nào thì sao ???
    if (isDifferentImages && !isEmptyFiles) {
      console.log("updated images successfully!");
      course.images = imageStrings;
      course.thumbnail = thumb;

      oldImages?.split(", ").forEach((image) => {
        deleteFile(image);
      });

      console.log("delete old images successfully!", oldImages);
      console.log("new images: ", imageStrings);
    }

    course.shortDesc = shortDesc;
    course.fullDesc = fullDesc;
    course.stockQty = +stockQty;
    course.categoryId = categoryId;

    const response = await course.save();

    res.json({
      message: "Update course successfully!",
      course: response,
    });

    if (isDifferentImages && !isEmptyFiles) {
      // Delete images from source
    }
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Sections!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.deleteSection = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    const { images } = await course.findById(sectionId);
    const response = await course.deleteOne({
      _id: sectionId,
    });

    res.json({
      message: "Delete course successfully!",
      sectionId: sectionId,
      result: response,
    });

    // Loop and Delete course images from images folder source
    // images?.split(", ").forEach((image) => {
    //   deleteFile(image);
    //   console.log("deleted: ", image);
    // });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to delete course!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
