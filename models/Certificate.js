const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model

const certificateSchema = new Schema(
  {
    certificateName: { type: String, required: true },
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    course: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("Certificate", certificateSchema);
