const Category = require("../models/Category");
const Course = require("../models/Course");
const IsLessonDone = require("../models/IsLessonDone");
const Lesson = require("../models/Lesson");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Section = require("../models/Section");
const User = require("../models/User");
const axios = require("axios");

const {
  getProgressOfCourse,
  generateRandomAiImages,
  openai,
  generateRandomCourses,
  generateSectionsName,
  createOutline,
} = require("../utils/helper");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { UNSPLASH_API_KEY } = require("../config/constant");
const { searchYouTubeVideos } = require("../utils/youtube");
// const Category = require('../models/category');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    // console.log("categories: ", categories);
    res.status(200).json({
      message: "Fetch categories sucessfully!",
      categories,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch categories!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);

    res.status(200).json({
      message: "Fetch category by id successfully!",
      category,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch category by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateViews = async (req, res, next) => {
  const { CourseId } = req.params;

  try {
    const Course = await Course.findById(CourseId);

    Course.views += 1;

    const result = await Course.save();

    res.status(200).json({
      message: `view of Course: ${CourseId} increase to 1`,
      result,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch category by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateLessonDoneByUser = async (req, res, next) => {
  const { lessonId } = req.params;

  const { userId } = req.body;

  try {
    const lessonDoneByUser = await IsLessonDone.findOne({
      lessonId: lessonId,
      userId: userId,
    });

    console.log(lessonDoneByUser);

    if (!lessonDoneByUser) {
      const lessonDone = new IsLessonDone({
        lessonId: lessonId,
        userId: userId,
        isDone: true,
      });

      const result = await lessonDone.save();

      res.status(200).json({
        message: `Update lesson done successfully!`,
        result,
      });
    } else {
      res.status(200).json({
        message: `Lesson aldready done by user`,
        result: "nothing",
      });
    }
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to Update lesson done!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCourses = async (req, res, next) => {
  const { _limit, _sort, _order, _q, _min, _max, _page, _cateIds } = req.query;

  const searchWord = _q;

  const regexPattern = new RegExp(searchWord, "i");

  const page = _page || 1;

  const skip = (+page - 1) * _limit;

  try {
    const query = {
      name: regexPattern,
      // categoryId: {
      //   $in: categories || allCates,
      // },
    };

    if (_cateIds) {
      query.categoryId = {
        $in: _cateIds.split(","),
      };
    }

    if (_min !== undefined || _max !== undefined) {
      query.$expr = {
        $and: [],
      };

      if (_min !== undefined) {
        query.$expr.$and.push({
          $gte: [
            { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
            parseFloat(_min),
          ],
        });
      }

      if (_max !== undefined) {
        query.$expr.$and.push({
          $lte: [
            { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
            parseFloat(_max),
          ],
        });
      }
    }

    const courses = await Course.find(query)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name avatar")
      .skip(skip)
      .limit(_limit || 8)
      .sort({
        [_sort]: _order || "desc",
      });

    const totalCourses = await Course.where(query).countDocuments();

    res.status(200).json({
      message: "Fetch all Courses successfully!",
      courses,
      pagination: {
        _page: +_page || 1,
        _limit: +_limit || 12,
        _totalRows: totalCourses,
      },
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses!");
      error.statusCode = 422;
      return error;
    }
    next(error);
  }
};

exports.getSectionsByCourseId = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const sectionsOfCourse = await Section.find({ courseId });

    const result = sectionsOfCourse.map(async (section) => {
      const lessons = await Lesson.find({ sectionId: section._id });
      const totalVideosLength = lessons.reduce((acc, lesson) => acc + lesson.videoLength, 0);
      return {
        ...section._doc,
        numOfLessons: lessons.length,
        totalVideosLength,
      };
    });

    console.log(result);

    res.status(200).json({
      message: "Fetch all Sections by course id successfully!",
      sections: await Promise.all(result),
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
exports.getSectionsByCourseIdEnrolledCourse = async (req, res, next) => {
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

exports.getLessonsBySectionId = async (req, res, next) => {
  const { sectionId } = req.params;
  const userId = req.get("userId");

  console.log(userId);
  console.log("sectionId: ", sectionId);

  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });

    // const result = lessonsOfSection.map(async (lessonItem) => {
    //   const isDone = await IsLessonDone.findOne({
    //     userId: userId,
    //     lessonId: lessonItem._id,
    //   });

    //   return {
    //     _id: lessonItem._id,
    //     sectionId: lessonItem.sectionId,
    //     name: lessonItem.name,
    //     content: lessonItem.content,
    //     access: lessonItem.access,
    //     type: lessonItem.type,
    //     description: lessonItem.description,
    //     isDone: Boolean(isDone) ? true : false,
    //   };
    // });

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

exports.getLessonsBySectionIdEnrolledCourse = async (req, res, next) => {
  const { sectionId } = req.params;
  const userId = req.get("userId");

  console.log(userId);
  console.log("sectionId: ", sectionId);

  try {
    const lessonsOfSection = await Lesson.find({
      sectionId: sectionId,
    });

    const result = lessonsOfSection.map(async (lessonItem) => {
      const isDone = await IsLessonDone.findOne({
        userId: userId,
        lessonId: lessonItem._id,
      });

      return {
        _id: lessonItem._id,
        sectionId: lessonItem.sectionId,
        name: lessonItem.name,
        content: lessonItem.content,
        access: lessonItem.access,
        type: lessonItem.type,
        description: lessonItem.description,
        isDone: Boolean(isDone) ? true : false,
      };
    });

    res.status(200).json({
      message: "Fetch all lessons of section id successfully!",
      lessons: await Promise.all(result),
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

exports.getMaxPrice = async (req, res, next) => {
  try {
    const max = await Course.aggregate([
      {
        $project: {
          maxFieldValue: {
            $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }],
          },
        },
      },
      {
        $sort: {
          maxFieldValue: -1,
        },
      },
      { $limit: 1 },
    ]);

    res.status(200).json({
      message: "OK",
      result: max,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch price value!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getMinPrice = async (req, res, next) => {
  try {
    const min = await Course.aggregate([
      {
        $project: {
          minFieldValue: {
            $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }],
          },
        },
      },
      {
        $sort: {
          minFieldValue: 1,
        },
      },
      { $limit: 1 },
    ]);

    res.status(200).json({
      message: "OK",
      result: min,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch price value!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCoursesInRange = async (req, res, next) => {
  const { _min, _max } = req.query;

  try {
    const Courses = await Course.find({
      $expr: {
        $and: [
          {
            $gte: ["$oldPrice", _min],
          },
          {
            $lte: ["$oldPrice", _max],
          },
          {
            $gte: [
              { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
              _min,
            ],
          },

          {
            $gte: [
              { $multiply: ["$oldPrice", { $subtract: [1, { $divide: ["$discount", 100] }] }] },
              _max,
            ],
          },
        ],
      },
    });

    res.status(200).json({
      message: "Oke",
      Courses,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch Courses in range");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCourse = async (req, res, next) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name");

    res.status(200).json({
      message: "Fetch single Course successfully!",
      course,
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

exports.getCourseEnrolledByUserId = async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.get("userId");

  try {
    const course = await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name");

    const sectionsOfCourse = await Section.find({
      courseId,
    });

    let numOfLesson = 0;
    let numOfLessonDone = 0;

    let lessonsOfCourse = [];

    for (const section of sectionsOfCourse) {
      const lessons = await Lesson.find({
        sectionId: section._id,
      });
      lessonsOfCourse.push(lessons);
    }

    lessonsOfCourse = lessonsOfCourse.flat();

    console.log(lessonsOfCourse);

    for (const lesson of lessonsOfCourse) {
      const isDone = await IsLessonDone.findOne({
        userId,
        lessonId: lesson._id,
      });

      if (isDone) {
        numOfLessonDone += 1;
      }
    }

    console.log("num of lesson Done: ", numOfLessonDone);

    const result = {
      ...course._doc,
      progress: numOfLessonDone / lessonsOfCourse.length,
    };

    res.status(200).json({
      message: "Fetch single Course successfully!",
      course: result,
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

exports.getCourseDetail = async (req, res, next) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId)
      .populate("categoryId", "_id name")
      .populate("userId", "_id name");

    const sections = await Section.find({
      courseId,
    });

    const lessonsOfCoursePromise = sections.map(async (sectionItem) => {
      const lessons = await Lesson.find({
        sectionId: sectionItem._id,
      });

      return lessons;
    });

    const lessonsOfCourse = (await Promise.all(lessonsOfCoursePromise)).flat();

    const orders = await Order.find({
      "items._id": courseId,
    });

    const numOfStudents = orders.length;

    const totalVideosLength = lessonsOfCourse.reduce((acc, lesson) => acc + lesson.videoLength, 0);
    // console.log(sections);

    const reviews = await Review.find({ courseId });

    const avgRatingStars =
      reviews.reduce((acc, review) => acc + review.ratingStar, 0) / reviews.length;

    const result = {
      id: course._id,
      name: course.name,
      price: course.price,
      finalPrice: course.finalPrice,
      thumbnail: course.thumbnail,
      access: course.access,
      views: course.views,
      description: course.description,
      categoryId: {
        _id: course.categoryId._id,
        name: course.categoryId.name,
      },
      userId: {
        _id: course.userId._id,
        name: course.userId.name,
      },
      courseSlug: course.courseSlug,
      level: course.level,
      sections: sections.length,
      lessons: lessonsOfCourse.length,
      students: numOfStudents,
      totalVideosLength,
      numOfReviews: reviews.length,
      avgRatingStars: avgRatingStars || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };

    res.status(200).json({
      message: "Fetch single Course successfully!",
      course: result,
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

exports.getUserDetail = async (req, res, next) => {
  const { userId } = req.params;

  console.log(userId);

  try {
    const user = await User.findById(userId);

    const courses = await Order.find({
      "user._id": userId,
    })
      .select("items")
      .populate("items._id");

    // .populate("categoryId", "_id name")
    // .populate("userId", "_id name");

    const coursesEnrolled = courses
      .map((courseItem) => {
        return courseItem.items;
      })
      .flat()
      .map((item) => item._id)
      .map(async (courseItem) => {
        const progress = (await getProgressOfCourse(courseItem._id, userId)).progress;
        const totalVideosLengthDone = (await getProgressOfCourse(courseItem._id, userId))
          .totalVideosLengthDone;
        const user = await User.findById(userId);

        return {
          ...courseItem._doc,
          userId: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar,
          },
          progress: progress,
          totalVideosLengthDone,
        };
      });

    const result = {
      ...user._doc,
      courses: await Promise.all(coursesEnrolled),
    };

    res.status(200).json({
      message: "Fetch User Detail with fully data successfully!",
      user: result,
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
exports.getCoursesOrderedByUser = async (req, res, next) => {
  const { userId } = req.params;

  console.log(userId);

  try {
    const courses = await Order.find({
      "user._id": userId,
    })
      .select("items")
      .populate("items._id");

    // .populate("categoryId", "_id name")
    // .populate("userId", "_id name");

    const results = courses
      .map((courseItem) => {
        return courseItem.items;
      })
      .flat()
      .map((item) => item._id);

    res.status(200).json({
      message: "Fetch Courses by user have ordered successfully!",
      courses: results,
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

exports.checkLessonDoneUserId = async (req, res, next) => {
  const { lessonId } = req.params;
  const { userId } = req.body;

  try {
    const lessonFound = await IsLessonDone.findOne({
      lessonId: lessonId,
      userId: userId,
    });

    res.status(200).json({
      message: "Check lesson done successfully!",
      lesson: lessonFound,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to check Lesson Done!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  const { note, transaction, vatFee, items, user, totalPrice } = req.body;

  try {
    const courses = await Course.find({
      _id: {
        $in: items.map((item) => item.courseId),
      },
    });

    const order = new Order({
      note,
      vatFee,
      totalPrice,
      transaction: {
        method: transaction.method,
      },
      items: courses,
      user,
    });

    const response = await order.save();
    // Update qty Course at database (-qty);
    // Courses.items.forEach(async (Course) => {
    //   const { prodId, qty } = Course;
    //   console.log("update stock qty at database!!!");
    //   const CourseItem = await Course.findById(prodId);
    //   CourseItem.stockQty = CourseItem.stockQty - qty;
    //   CourseItem.save();
    // });

    // for (const Course of Courses.items) {
    //   const { prodId, qty } = Course;
    //   console.log("update stock qty at database!!!");
    //   const Course = await Course.findById(prodId);
    //   Course.stockQty = Course.stockQty - qty;
    //   Course.save();
    // }

    res.status(201).json({
      message: "Created order successfully!",
      order: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post order!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getOrder = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);

    res.status(200).json({
      message: "Get order by id successfully!",
      order,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to get order by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  // console.log("id: ", userId);

  try {
    const user = await User.findById(userId).select("_id name avatar email phone");

    const lessonDoneList = await IsLessonDone.find({
      userId: userId,
    });

    console.log(lessonDoneList);

    res.status(200).json({
      message: "fetch single user successfully!",
      user: user,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch categories!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.postReview = async (req, res, next) => {
  const { courseId, title, content, ratingStar, orderId } = req.body;

  console.log("req.body: ", req.body);

  try {
    const newReview = new Review({
      courseId,
      title,
      content,
      ratingStar,
      orderId,
    });

    const result = await newReview.save();

    res.status(200).json({
      message: "Post review successfully!",
      review: result,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post course review!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.getCourseReviews = async (req, res, next) => {
  const { courseId } = req.params;

  console.log("course Id: ", courseId);

  try {
    const reviews = await Review.find({ courseId });

    res.status(200).json({
      message: "Fetch reviews successfully!",
      reviews,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to post course review!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {};

// Retrieve to see history to track orders.
exports.getOrdersByIduser = async (req, res, next) => {};

// List all of orders at db
exports.getOrders = async (req, res, next) => {};

// GET all invoice
exports.getInvoices = async (req, res, next) => {};

// POST (GENREATE) CERTIFICATIONS

exports.postCertification = async (req, res, next) => {
  const { userName, courseName, completionDate } = req.body;

  // Load the certificate template
  // "images/certificate-template.pdf"
  const certificateTemplatePath = path.join("images", "certificate-template.png");
  const certifcationName = `${userName}-certificate.pdf`;
  const outputCertification = path.join("images", certifcationName);
  const outputPath = `certificates/${userName}-certificate.pdf`;

  // Create a new PDF document
  const doc = new PDFDocument({ layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment", 'inline; filename="' + certifcationName + '"');

  // Pipe the PDF content to a writable stream (save it to a file)
  const writeStream = fs.createWriteStream(outputCertification);
  doc.pipe(writeStream);

  // Load the certificate template
  doc.image(certificateTemplatePath, 0, 0, { width: 792, height: 612 });

  // Function to center text horizontally
  const centerTextX = (text) => (doc.page.width - doc.widthOfString(text)) / 2;

  // Function to center text vertically with a top margin
  const centerTextY = (text) => doc.page.height / 2 + doc.heightOfString(text) / 2 - 10; // Adjust the top margin here

  // Add the user's name, course name, and completion date with technology-themed styling
  doc
    .fontSize(48)
    .fillColor("#007BFF")
    .text(userName, centerTextX(userName), centerTextY(userName));
  doc.fontSize(36).fillColor("#4CAF50").text("Certificate of Completion", { align: "center" });
  doc.fontSize(28).fillColor("#333").text(courseName, { align: "center" });
  doc.fontSize(18).fillColor("#555").text("This certificate is awarded to", { align: "center" });
  doc.fontSize(18).fillColor("#555").text(completionDate, { align: "center" });

  // Finalize the PDF document
  doc.end();

  // Respond with the generated certificate path
  res.json({ certificatePath: outputCertification });
};

exports.getAiImages = async (req, res, next) => {
  try {
    const response = await openai.createImage({
      prompt: "Nodejs advanced thumbnail course",
      n: 3,
      size: "256x256",
    });

    console.log(response.data);

    const image_url = response.data.data[0].url;

    console.log(image_url);

    res.status(200).json({
      image: image_url,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getImagesFromUnsplash = async (req, res, next) => {
  try {
    const response = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query: "Machine Learning",
        orientation: "landscape",
        client_id: UNSPLASH_API_KEY,
        per_page: 10,
      },
    });

    const randomIndex = Math.floor(Math.random() * response.data.results.length);

    res.status(200).json({
      message: "Fetch images from unsplash successfully!",
      response: response.data.results[randomIndex].urls.regular,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to get images from unsplash!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.generateRandomCourses = async (req, res, next) => {
  const randomCourses = await generateRandomCourses(10);

  try {
    for (const course of randomCourses) {
      const newCourse = new Course(course);
      await newCourse.save();
    }

    res.status(200).json({
      courses: randomCourses,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate random courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.createOutlineCourse = async (req, res, next) => {
  const { courseId } = req.body;

  try {
    const response = await createOutline(courseId);

    res.status(200).json({
      message: "Successfully to create outline course!",
      response,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.generateOutlineCourse = async (req, res, next) => {
  try {
    const outline = await generateSectionsName("64c5d873c573c1ec5d4a1907");

    res.status(200).json({
      message: "Successfully to generate outline course!",
      outline: outline,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate random courses!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.generateLessonOfOutline = async (req, res, next) => {
  try {
    const outline = await generateSectionsName("64c5d873c573c1ec5d4a18f5");

    const lessons = [];

    for (const sectionName of outline) {
      const currentLessons = await searchYouTubeVideos(sectionName);
      lessons.push(currentLessons);
    }

    res.status(200).json({
      message: "Successfully to generate lesson base on outline!",
      lessons,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate youtube videos and descriptions,... !");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.createLessonsOfOutlineCourse = async (req, res, next) => {
  const { courseId } = req.body;
  try {
    const outline = await Section.find({ courseId });

    const lessons = [];

    for (const sectionItem of outline) {
      // Search youtube video base on query.
      const currentYoutubeVideos = await searchYouTubeVideos(sectionItem.name);

      const currSectionId = sectionItem._id;

      const newLessons = currentYoutubeVideos.map((video) => {
        return {
          sectionId: currSectionId,
          name: video.title,
          content: video.link,
          description: video.title,
          access: "PAID",
          type: "video",
          videoLength: video.videoLength,
        };
      });

      const createdLessons = await Lesson.insertMany(newLessons);
      lessons.push(createdLessons);
    }

    res.status(200).json({
      message: "Successfully to create lessons base on outline!",
      lessons: lessons.flat(),
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate youtube videos and descriptions,... !");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.generateTheWholeCourse = async (req, res, next) => {
  const courseId = "64c5d873c573c1ec5d4a18f5";

  try {
    const outline = await generateSectionsName(courseId);

    // const sectionsCreatedcc = await Section.insertMany(outline);

    const lessons = [];

    for (const sectionName of outline) {
      // Search youtube video base on query.
      const currentYoutubeVideos = await searchYouTubeVideos(sectionName);

      // const currSectionId = sectionItem._id;

      const newLessons = currentYoutubeVideos.map((video) => {
        return {
          sectionId: "sdjfkldsjfklsdjfkldsjfkdsljf",
          name: video.title,
          content: video.link,
          description: video.title,
          access: "PAID",
          type: "video",
          videoLength: video.videoLength,
        };
      });

      // const createdLessons = await Lesson.insertMany(newLessons);
      lessons.push(newLessons);
    }

    const newCourse = {
      courseId,
      sections: outline,
      lessons: lessons.flat(),
    };

    res.status(200).json({
      message: "Successfully to generate the whole course with course id",
      courseCreated: newCourse,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate the whole course with course id");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.createTheWholeCourse = async (req, res, next) => {
  const { courseId } = req.body;

  console.log(courseId);

  try {
    const sectionNameList = await generateSectionsName(courseId);
    const outline = sectionNameList.map((sectionName, index) => {
      return {
        courseId,
        name: `Section ${String(index + 1).padStart(2, "0")}: ${sectionName}`,
        access: "PAID", // Adjust the access type as needed
        description: sectionName, // Add a description for each section if required
      };
    });
    const sectionsCreated = await Section.insertMany(outline);

    const sectionsFound = await Section.find({ courseId });

    const lessons = [];

    for (const sectionItem of sectionsFound) {
      // Search youtube video base on query.
      const currentYoutubeVideos = await searchYouTubeVideos(sectionItem.name);

      const currSectionId = sectionItem._id;

      const newLessons = currentYoutubeVideos.map((video) => {
        return {
          sectionId: currSectionId,
          name: video.title,
          content: video.link,
          description: video.title,
          access: "PAID",
          type: "video",
          videoLength: video.videoLength,
        };
      });

      const createdLessons = await Lesson.insertMany(newLessons);
      lessons.push(createdLessons);
    }

    const newCourse = {
      courseId,
      sections: outline,
      lessons: lessons.flat(),
    };

    res.status(200).json({
      message: "Successfully to generate the whole course with course id",
      courseCreated: newCourse,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to generate the whole course with course id");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
