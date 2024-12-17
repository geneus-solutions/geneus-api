import mongoose from "mongoose";


const VoucherSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['unused', 'redeemed'],
        default: 'unused',
    },
    coupon_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { timestamps: true });

const Voucher = mongoose.model('Voucher', VoucherSchema);

export default Voucher;