import mongoose from "mongoose";
const cartItemSchema = new mongoose.Schema({
  course_id: String,
  course_title: String,
  course_description: String,
  course_image: String,
  course_price: Number,
  course_discountPrice: Number,
  timestamp: Date,
});
const cartSchema = mongoose.Schema(
  {
    user_id: String,
    cart_items: {
      type: [cartItemSchema],
    },
    cart_total: Number,
    discount: Number,
    total_after_discount: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
