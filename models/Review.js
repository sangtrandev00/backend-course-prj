const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model

const reviewSchema = new Schema(
  {
    // userId: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    ratingStar: {
      type: Number,
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Review", reviewSchema);
