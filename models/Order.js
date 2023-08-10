const mongoose = require("mongoose"); // Erase if already required

const Schema = mongoose.Schema;

// Declare the Schema of the Mongo model

const orderSchema = new Schema(
  {
    // Id: auto genrate!!!
    vatFee: {
      type: Number,
    },
    transaction: {
      method: {
        type: String,
        required: true,
        default: "COD",
      },
    },
    note: {
      type: String,
    },
    vatFee: {
      type: Number,
    },
    totalPrice: {
      type: Number,
    },
    user: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      email: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
    },

    items: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          ref: "Course",
          // required: true,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index(
  {
    "user.name": "text",
    "user.email": "text",
    "items.name": "text",
  },
  {
    name: "order_text_index",
  }
);
//Export the model
module.exports = mongoose.model("Order", orderSchema);
