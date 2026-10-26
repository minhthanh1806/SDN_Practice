const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be greater than or equal to 0']
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock must be greater than or equal to 0']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
