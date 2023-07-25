const { faker } = require("@faker-js/faker");
const Category = require("../models/Category");
const Course = require("../models/Course");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");

exports.getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar");
    // courses will now contain the desired result with specific fields from the referenced documents

    // Map here to create beautiful course
    res.status(200).json({
      message: "Fetch all Courses successfully!",
      courses: courses,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

// exports.countCourseByCateId = async (req, res, next) => {
//   try {
//     const count = await Course.countDocuments({
//       categoryId: req.params.categoryId,
//     });
//     res.status(200).json({
//       message: "Count Courses by CategoryId successfully!",
//       count,
//     });
//   } catch (error) {
//     if (!error) {
//       const error = new Error("Failed to count Courses by CategoryId!");
//       error.statusCode(422);
//       return error;
//     }
//     next(error);
//   }
// };

exports.getCourse = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name");
    res.status(200).json({
      message: "Fetch single course successfully!",
      course,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch course by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.createRandomCourses = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const randNumber = Math.trunc(Math.random() * 3);
    const randNumberDiscount = Math.trunc(Math.random() * 10);

    let result = [];

    for (let i = 0; i < 10; i++) {
      const courseData = {
        name: faker.commerce.courseName(),
        oldPrice: faker.commerce.price({ min: 100, max: 200 }),
        discount: randNumberDiscount,
        images: new Array(5)
          .fill(faker.image.urlLoremFlickr({ width: 358, height: 358, category: "technology" }))
          .join(","),
        shortDesc: faker.commerce.courseDescription(),
        fullDesc: faker.commerce.courseDescription(),
        stockQty: 100,
        categoryId: categories.map((cate) => cate._id)[randNumber],
        thumbnail: faker.image.urlLoremFlickr({ width: 358, height: 358, category: "technology" }),
        views: 100,
      };

      const newCourse = new Course(courseData);

      await newCourse.save();

      result.push(courseData);
    }

    res.status(200).json({
      message: "Get random Courses success !!!",
      result,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to create random Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.postCourse = async (req, res, next) => {
  const {
    name,
    thumbnail,
    access,
    price,
    finalPrice,
    description,
    level,
    categoryId,
    userId,
    courseSlug,
  } = req.body;
  console.log(req.files);
  // const images = req.files.map((item) => item.path.replace("\\", "/"));
  // const thumb = images.find((image) => image.includes("thumb"));

  try {
    const course = new Course({
      name,
      thumbnail,
      access,
      price,
      finalPrice,
      description,
      level,
      courseSlug,
      categoryId,
      userId,
    });

    const response = await course.save();

    res.json({
      message: "Create course successfully!",
      course: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateCourse = async (req, res, next) => {
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
    const course = await Course.findById(cousreId);

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
      const error = new Error("Failed to fetch Courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    // const { images } = await Course.findById(courseId);
    const response = await Course.deleteOne({
      _id: courseId,
    });

    res.json({
      message: "Delete course successfully!",
      courseId: courseId,
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
