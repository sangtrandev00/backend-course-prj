const { faker } = require("@faker-js/faker");
const Category = require("../models/Category");
const Lesson = require("../models/Lesson");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");
const IsLessonDone = require("../models/IsLessonDone");

exports.getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find();
    res.status(200).json({
      message: "Fetch all lessons successfully!",
      lessons,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch lessons!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getLessonsBySectionId = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });
    res.status(200).json({
      message: "Fetch all lessons of section id successfully!",
      lessons: lessonsOfSection,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch lessons!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getLesson = async (req, res, next) => {
  const { lessonId } = req.params;

  try {
    const lesson = await Lesson.findById(lessonId);
    res.status(200).json({
      message: "Fetch single Lesson successfully!",
      lesson,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Lesson by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.postLesson = async (req, res, next) => {
  const { sectionId, name, icon, description, type, content, access, password, videoLength } =
    req.body;

  console.log(req.files);

  // const images = req.files.map((item) => item.path.replace("\\", "/"));
  // const thumb = images.find((image) => image.includes("thumb"));

  try {
    const lesson = new Lesson({
      sectionId,
      name,
      icon,
      description,
      content,
      access,
      type,
      videoLength,
    });

    const response = await lesson.save();

    res.json({
      message: "Create Lesson successfully!",
      lesson: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post lesson!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  const { name, oldPrice, discount, oldImages, shortDesc, fullDesc, stockQty, categoryId } =
    req.body;
  const { lessonId } = req.params;

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
    // Find Lesson by id
    const lesson = await Lesson.findById(lessonId);

    console.log("Lesson images: ", lesson.images);
    console.log("old images: ", oldImages);

    // Update lesson follow by that id
    lesson.name = name;
    lesson.oldPrice = +oldPrice;
    lesson.discount = +discount;
    console.log("is difference: ", isDifferentImages);
    console.log("is empty: ", isEmptyFiles);

    // Trường hợp không up ảnh nào thì sao ???
    if (isDifferentImages && !isEmptyFiles) {
      console.log("updated images successfully!");
      lesson.images = imageStrings;
      lesson.thumbnail = thumb;

      oldImages?.split(", ").forEach((image) => {
        deleteFile(image);
      });

      console.log("delete old images successfully!", oldImages);
      console.log("new images: ", imageStrings);
    }

    lesson.shortDesc = shortDesc;
    lesson.fullDesc = fullDesc;
    lesson.stockQty = +stockQty;
    lesson.categoryId = categoryId;

    const response = await lesson.save();

    res.json({
      message: "Update lesson successfully!",
      lesson: response,
    });

    if (isDifferentImages && !isEmptyFiles) {
      // Delete images from source
    }
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Lessons!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  const { lessonId } = req.params;

  try {
    const { images } = await Lesson.findById(lessonId);
    const response = await Lesson.deleteOne({
      _id: lessonId,
    });

    res.json({
      message: "Delete Lesson successfully!",
      lessonId: lessonId,
      result: response,
    });

    // Loop and Delete Lesson images from images folder source
    images?.split(", ").forEach((image) => {
      deleteFile(image);
      console.log("deleted: ", image);
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to delete Lesson!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
