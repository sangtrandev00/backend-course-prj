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
      default:
        "https://lwfiles.mycourse.app/64b5524f42f5698b2785b91e-public/avatars/thumbs/64c077e0557e37da3707bb92.jpg",
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
    lastLogin: {
      type: Date,
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

userSchema.index({ name: "text", email: "text" });


//Export the model
module.exports = mongoose.model("User", userSchema);
