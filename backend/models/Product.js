import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    stockQuantity: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock quantity cannot be negative"],
    },
    reorderLevel: {
      type: Number,
      required: [true, "Reorder level is required"],
      min: [0, "Reorder level cannot be negative"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ─── Performance Indexes ───────────────────────────────────────────────────────
// These indexes are critical for sub-100ms query times on 50k+ records.
// Without them, MongoDB performs a full collection scan on every request.
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ productName: "text" }); // Full-text search index
productSchema.index({ category: 1, price: -1 }); // Compound: filter + sort

const Product = mongoose.model("Product", productSchema);

export default Product;
