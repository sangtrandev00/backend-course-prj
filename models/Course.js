const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
const courseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    subTitle: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    access: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    courseSlug: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    requirements: [
      {
        _id: Schema.Types.ObjectId,
        type: String,
      },
    ],
    willLearns: [
      {
        _id: Schema.Types.ObjectId,
        type: String,
      },
    ],
    tags: [
      {
        _id: Schema.Types.ObjectId,
        type: String,
      },
    ],
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Course", courseSchema);
