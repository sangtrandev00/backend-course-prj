const Course = require("../models/Course");

exports.updateStockQty = updateStockQty = (courseList) => {
  courseList.forEach(async (course) => {
    const { prodId, qty } = course;
    console.log("update stock qty at database!!!");
    const courseItem = await course.findById(prodId);
    courseItem.stockQty = courseItem.stockQty - qty;
    courseItem.save();
  });
};
