const Category = require("../models/Category");
const Course = require("../models/Course");
const { deleteFile } = require("../utils/file");
const { validationResult } = require("express-validator");
exports.getCategories = async (req, res, next) => {
  const { _q, _cateName } = req.query;

  console.log("query: ", _q);

  const query = {};

  if (_q) {
    query.$text = { $search: _q };
  }

  if (_cateName && _cateName !== "all") {
    query.name = _cateName;
  }

  try {
    const categories = await Category.find(query, {
      ...(query.$text && { score: { $meta: "textScore" } }),
    });
    // console.log("categories: ", categories);

    const finalCategories = categories.map(async (cate) => {
      try {
        const courses = await Course.countDocuments({
          categoryId: cate._id,
        });

        console.log(courses);

        return {
          _id: cate._id,
          name: cate.name,
          cateImage: cate.cateImage,
          cateSlug: cate.cateSlug,
          description: cate.description,
          courses,
          createdAt: cate.createdAt,
          updatedAt: cate.updatedAt,
        };
      } catch (error) {
        if (!error) {
          const error = new Error("Failed to fetch categories!");
          error.statusCode(422);
          return error;
        }
        next(error);
      }
    });

    res.status(200).json({
      message: "Fetch categories sucessfully!",
      categories: await Promise.all(finalCategories),
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

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      message: "Fetch all categories sucessfully!",
      categories,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch all categories!");
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
      message: "fetch single category successfully!",
      category,
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

exports.postCategory = async (req, res, next) => {
  const { name, description } = req.body;

  const errors = validationResult(req);

  // if (!req.file) {
  //   const error = new Error("No image provided.");
  //   error.statusCode = 422;
  //   throw error;
  // }

  // Category: check whether category is already in the database ?

  try {
    if (!errors.isEmpty()) {
      console.log("errors: ", errors);
      // Get the first error
      const validationError = new Error(errors.errors[0].msg);
      validationError.statusCode = 422;
      throw validationError;
    }

    const imageUrl = req.file ? req.file.path.replace("\\", "/") : "images/user-avatar.jpg";
    const category = new Category({ name, cateImage: imageUrl, description });
    const response = await category.save();
    res.status(201).json({
      message: "Create category succesfully!",
      category: response,
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

exports.updateCategories = async (req, res, next) => {
  const { name, description, cateImage, cateSlug } = req.body;

  const { categoryId } = req.params;

  // Handling error when no upload images
  // if (!req.file) {
  //   const error = new Error("No image provided.");
  //   error.statusCode = 422;
  //   throw error;
  // }
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      console.log("errors: ", errors);
      // Get the first error
      const validationError = new Error(errors.errors[0].msg);
      validationError.statusCode = 422;
      throw validationError;
    }

    const updatedCategory = await Category.findById(categoryId);
    updatedCategory.name = name;
    updatedCategory.description = description;
    updatedCategory.cateSlug = cateSlug;
    updatedCategory.cateImage = cateImage;
    // If file is empty get the old one!
    // if (req.file) {
    //   console.log(req.file);
    //   const cateImage = req.file.path.replace("\\", "/");
    //   updatedCategory.cateImage = cateImage;

    //   // Delete the old image
    //   deleteFile(oldImage);
    // }

    const response = await updatedCategory.save();

    res.status(200).json({
      message: "Update category succesfully!",
      category: response,
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

exports.deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  try {
    // const { cateImage } = await Category.findById(categoryId);
    const response = await Category.deleteOne({
      _id: categoryId,
    });
    res.status(200).json({
      message: "Category deleted successfully!",
      categoryId: categoryId,
    });

    // delete file when delete cate row
    // deleteFile(cateImage);
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to delete category by id!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
