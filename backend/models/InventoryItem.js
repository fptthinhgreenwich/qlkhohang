const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
