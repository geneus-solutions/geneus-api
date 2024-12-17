import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    isDiscountInPercent: {
        type: Boolean,
        default: true,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    min_caert_value: {
        type: Number,
        required: true,
    },
    expiry: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', CouponSchema);

export default Coupon;