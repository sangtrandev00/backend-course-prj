const Category = require("../models/Category");
const Course = require("../models/Course");
const IsLessonDone = require("../models/IsLessonDone");
const Lesson = require("../models/Lesson");
const Order = require("../models/Order");
const Section = require("../models/Section");
const User = require("../models/User");
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
    const lessonDoneByUser = await IsLessonDone.find({
      lessonId: lessonId,
      userId: userId,
    });

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
      .populate("userId", "_id name")
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

  console.log("id: ", userId);

  try {
    const user = await User.findById(userId);

    console.log(user);

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

exports.updateUser = async (req, res, next) => {};

exports.getOrdersByIduser = async (req, res, next) => {};

exports.getOrders = async (req, res, next) => {};

exports.getInvoices = async (req, res, next) => {};
