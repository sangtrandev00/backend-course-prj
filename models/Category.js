const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model
const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    cateImage: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cateParent: {
      type: String,
    },
  },
  { timestamps: true }
);

//  Define the text index on 'name' and 'description' fields
categorySchema.index({ name: "text", description: "text" });

//Export the model
module.exports = mongoose.model("Category", categorySchema);
