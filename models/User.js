const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
const userSchema = new Schema(
  {
    providerId: {
      type: "string",
      default: "local",
    },
    name: {
      type: String,
      required: true,
      // index: true,
    },
    avatar: {
      type: String,
      default: "images/user-avatar.jpg",
    },
    email: {
      type: String,
      // required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    payment: {
      type: String,
      default: "COD",
    },
    resetToken: String,
    resetTokenExpiration: Date,
    loginToken: String,
    loginTokenExpiration: Date,
    // fbUserId: {
    //   type: String,
    //   default: "",
    // },
  },
  { timestamps: true }
);

//Export the model
module.exports = mongoose.model("User", userSchema);
