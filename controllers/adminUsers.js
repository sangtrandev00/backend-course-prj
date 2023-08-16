const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { deleteFile } = require("../utils/file");
const { faker } = require("@faker-js/faker");
const { validationResult } = require("express-validator");
const { getCoursesOrderByUserId } = require("../utils/helper");
const customError = require("../utils/error");
const Order = require("../models/Order");

exports.getUsers = async (req, res, next) => {
  const { _q } = req.query;

  const query = {};

  if (_q) {
    query.$text = { $search: _q };
  }

  try {
    const users = await User.find(query);
    // console.log("users: ", users);

    const result = users.map(async (user) => {
      const courses = await getCoursesOrderByUserId(user._id);
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phone: user.phone,
        address: user.address,
        payment: user.payment,
        courses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
      };
    });

    res.status(200).json({
      message: "Fetch users sucessfully!",
      users: await Promise.all(result),
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

exports.getUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    res.status(200).json({
      message: "fetch single user successfully!",
      user,
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

exports.createRandomUser = async (req, res, next) => {
  try {
    let result = [];

    for (let i = 0; i < 10; i++) {
      const userData = {
        providerId: "local",
        name: faker.person.fullName(),
        avatar: faker.image.avatarLegacy(),
        email: faker.internet.email({ provider: "gmail.com" }),
        phone: faker.phone.number("0#########"),
        address: faker.location.streetAddress(),
        password: await bcrypt.hash("123456789", 12),
        role: "client",
        payment: "COD",
      };

      const newUser = new User(userData);

      await newUser.save();

      result.push(newUser);
    }

    res.status(200).json({
      message: "Get random users !!!",
      result,
    });
  } catch (error) {
    if (!error.statusCode) {
      const error = new Error("Failed to get random users!");
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.postUser = async (req, res, next) => {
  const { name, email, phone, address, password, role, avatar } = req.body;

  console.log(req.body);
  let avatarUrl;
  if (!avatar) {
    avatarUrl =
      "https://lwfiles.mycourse.app/64b5524f42f5698b2785b91e-public/avatars/thumbs/64c077e0557e37da3707bb92.jpg";
  } else {
    avatarUrl = avatar;
  }

  //   No validate yet!
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new customError("Email is already registered", 422);
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email,
      name,
      phone,
      avatar: avatarUrl,
      role,
      password: hashedPassword,
    });

    const result = await newUser.save();

    res.status(201).json({
      message: "User created successfully!",
      userId: result._id,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  const { name, email, phone, role, avatar } = req.body;
  const { userId } = req.params;
  console.log(req.file);
  // console.log("old avatar: ", oldAvatar);

  // let avatar;
  // if (req.file) {
  //   avatar = req.file.path.replace("\\", "/");
  // } else {
  //   avatar = oldAvatar;
  // }
  // console.log("avatar: ", avatar);

  try {
    const updatedUser = await User.findById(userId);
    // const hashedPassword = await bcrypt.hash(password, 12);
    updatedUser.name = name;
    // if (oldAvatar !== avatar) {
    //   updatedUser.avatar = avatar;
    //   deleteFile(oldAvatar);
    //   console.log("update avatar!");
    // }
    updatedUser.email = email;
    // updatedUser.password = hashedPassword;
    updatedUser.phone = phone;
    updatedUser.role = role;
    updatedUser.avatar = avatar;
    const response = await updatedUser.save();

    res.status(200).json({
      message: "Update user succesfully!",
      user: response,
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to update user!");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    // const { avatar } = await User.findById(userId);
    const response = await User.deleteOne({
      _id: userId,
    });
    res.status(200).json({
      message: "user deleted successfully!",
      userId: userId,
    });
    // Delete avatar image

    // !avatar.startsWith("http") && deleteFile(avatar);
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to fetch categories!");
      error.statusCode(422);
      return error;
    }

    next(error);
  }
};
