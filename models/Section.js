const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
const sectionSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    access: {
      type: String, // DRAFT, SOON, FREE, PAID, PUBLIC, PRIVATE
      required: true,
    },
    description: {
      type: String,
    },
    // lessonId: {
    //   type: Schema.Types.ObjectId,
    //   required: true,
    //   ref: "Lesson",
    // },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Section", sectionSchema);
