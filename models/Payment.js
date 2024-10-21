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
const paymentSchema = mongoose.Schema(
  {
    order_id: String,
    payment_id: String,
    signature: String,
    status: String,
    user_id: String,
    cart_details: {
      type: [cartItemSchema],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
