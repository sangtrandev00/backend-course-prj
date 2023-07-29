const Course = require("../models/Course");
const IsLessonDone = require("../models/IsLessonDone");
const Lesson = require("../models/Lesson");
const Order = require("../models/Order");
const Section = require("../models/Section");
const { Configuration, OpenAIApi } = require("openai");
const mongoose = require("mongoose");
const { courseNames } = require("./fakerData");
const slugify = require("slugify");
const { faker } = require("@faker-js/faker");
const myApiKey = "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";

const configuration = new Configuration({
  apiKey: myApiKey,
});
const openai = new OpenAIApi(configuration);
exports.openai = openai;
// const chatCompletion = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   messages: [{ role: "user", content: "Hello world" }],
// });
// console.log(chatCompletion.data.choices[0].message);

exports.updateStockQty = updateStockQty = (courseList) => {
  courseList.forEach(async (course) => {
    const { prodId, qty } = course;
    console.log("update stock qty at database!!!");
    const courseItem = await course.findById(prodId);
    courseItem.stockQty = courseItem.stockQty - qty;
    courseItem.save();
  });
};

exports.getCoursesOrderByUserId = async (userId) => {
  const courses = await Order.find({
    "user._id": userId,
  })
    .select("items")
    .populate("items._id");

  const results = courses
    .map((courseItem) => {
      return courseItem.items;
    })
    .flat()
    .map((item) => item._id);

  return results;
};

exports.getProgressOfCourse = async (courseId, userId) => {
  const sectionsOfCourse = await Section.find({
    courseId,
  });
  let numOfLessonDone = 0;
  let totalVideosLengthDone = 0;
  let lessonsOfCourse = [];

  for (const section of sectionsOfCourse) {
    const lessons = await Lesson.find({
      sectionId: section._id,
    });
    lessonsOfCourse.push(lessons);
  }

  lessonsOfCourse = lessonsOfCourse.flat();

  for (const lesson of lessonsOfCourse) {
    const isDone = await IsLessonDone.findOne({
      userId,
      lessonId: lesson._id,
    });

    if (isDone) {
      numOfLessonDone += 1;
      totalVideosLengthDone += lesson.videoLength;
    }
  }

  const numOfLessons = lessonsOfCourse.length;

  let progress = 0;

  if (numOfLessons === 0) {
    progress = 0;
  } else {
    progress = numOfLessonDone / numOfLessons;
  }

  return {
    progress,
    totalVideosLengthDone,
  };
};

// Function to generate random courses
exports.generateRandomCoursesFakerjs = (numCourses) => {
  const courses = [];
  for (let i = 0; i < numCourses; i++) {
    const course = {
      name: courseNames[Math.floor(Math.random() * courseNames.length)],
      subTitle: faker.lorem.sentence(),
      thumbnail: `https://placeimg.com/640/480/tech/${i + 1}`,
      access: faker.random.arrayElement(["Free", "Paid"]),
      views: faker.datatype.number({ min: 0, max: 1000 }),
      price: faker.datatype.number({ min: 0, max: 100 }),
      finalPrice: faker.datatype.number({ min: 0, max: 100 }),
      description: courseDescriptions[Math.floor(Math.random() * courseDescriptions.length)],
      level: faker.random.arrayElement(["Beginner", "Intermediate", "Advanced"]),
      courseSlug: faker.lorem.slug(),
      userId: mongoose.Types.ObjectId(),
      categoryId: mongoose.Types.ObjectId(),
      requirements: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () =>
        mongoose.Types.ObjectId()
      ),
      willLearns: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () =>
        mongoose.Types.ObjectId()
      ),
      tags: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () =>
        mongoose.Types.ObjectId()
      ),
    };
    courses.push(course);
  }
  return courses;
};

exports.generateRandomSections = async () => {};

exports.generateRandomAiImages = async () => {};

// Function to generate random course descriptions using OpenAI API
// const generateCourseDescriptions = async (numCourses) => {
//   const courseDescriptions = [];
//   for (let i = 0; i < numCourses; i++) {
//     try {
//       const promptCourseIdx = courseNames[Math.floor(Math.random() * courseNames.length)];
//       const prompt = `Generate a course description for the course "${promptCourseIdx}".`;
//       const response = await openai.createCompletion({
//         model: "text-davinci-003", // Choose an appropriate engine
//         prompt,
//         max_tokens: 100, // Adjust the length of the generated description
//         n: 1,
//         temperature: 0.6,
//       });
//       const description = response.data.choices[0].text.trim();
//       courseDescriptions.push(description);
//     } catch (error) {
//       console.log("Error generating description:", error);
//       // If there's an error, you can provide a fallback or placeholder description.
//       courseDescriptions.push("Description not available.");
//     }
//   }
//   return courseDescriptions;
// };

const generateCourseDescriptionByCourseName = async (courseName) => {
  try {
    console.log("course name: ", courseName);

    const prompt = `Generate a course description for the course: "${courseName}".`;
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Choose an appropriate engine
      prompt,
      max_tokens: 100, // Adjust the length of the generated description
      n: 1,
      temperature: 0.2,
    });
    const description = response.data.choices[0].text.trim();
    return description;
  } catch (error) {
    console.log("Error generating description:", error);
    // If there's an error, you can provide a fallback or placeholder description.
    return "Description not available.";
  }
};

// Function to generate random courses
exports.generateRandomCourses = async (numCourses) => {
  // const courseDescriptions = await generateCourseDescriptions(numCourses);
  const categoriesIdList = [
    "646781266859a50acfca8e93",
    "64b363573bbbb6317297378d",
    "64b363b13bbbb6317297378f",
    "64b364203bbbb63172973793",
    "64bb4e1582a5abc6b1c13305",
  ];
  const courses = [];
  for (let i = 0; i < numCourses; i++) {
    const courseName = courseNames[i];

    // Generate thumbnail image using OpenAI
    let thumbnail;
    try {
      const response = await openai.createImage({
        prompt: `${courseName} thumbnail course`,
        n: 1,
        size: "512x512",
      });
      thumbnail = response.data.data[0].url;
    } catch (error) {
      console.log("Error generating thumbnail:", error);
      // If there's an error, you can provide a fallback thumbnail URL.
      thumbnail = faker.image.urlLoremFlickr({ category: courseName });
    }

    const price = Math.floor(Math.random() * 50) + 100;
    const description = await generateCourseDescriptionByCourseName(courseName);
    const course = {
      name: courseName,
      subTitle: "Subtitle not available.", // You can provide a static value for the subtitle or generate it using OpenAI as well
      thumbnail,
      access: "PAID", // You can adjust this based on your requirements
      views: 0,
      price: price,
      finalPrice: price - 20,
      description: description,
      level: "All Level", // You can adjust this based on your requirements
      courseSlug: slugify(courseName, { lower: true, strict: true }), // Generate a unique slug for each course
      userId: "6468a145401d3810494f4797", // You can adjust this based on your requirements
      categoryId: categoriesIdList[Math.floor(Math.random() * categoriesIdList.length)],
      requirements: [],
      willLearns: [],
      tags: [],
    };
    courses.push(course);
  }
  return courses;
};
