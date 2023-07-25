const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model

const discussSchema = new Schema(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    replies: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        contentReply: {
          type: String,
          required: true,
        },
        createdAt: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: String,
        },
      },
    ],
    emotions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Discuss", discussSchema);
