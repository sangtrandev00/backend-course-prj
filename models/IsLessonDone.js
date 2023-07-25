const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
const isLessonDoneSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    lessonId: {
      type: String,
      required: true,
      ref: "Lesson",
    },
    isDone: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("IsLessonDone", isLessonDoneSchema);
