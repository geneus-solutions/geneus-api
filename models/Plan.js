import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    plan: {
        type: String,
        required: true,
        default: 'Free Trial',
        enum: ['Free Trial', 'Premium Plan']
    },
    duration: {
        type: Number,
        required: true,
        default: 3,
        enum: [3, 30],
    },
    price: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return (this.plan === 'Free Trial' && value === 0) || 
                       (this.plan === 'Premium Plan' && value > 0);
            },
            message: 'Invalid price for the selected plan',
        },
        default:0
    },
    paymentId: {
        type: String,
        // required: true,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    }
});

// Pre-save middleware to calculate the endDate based on startDate and duration
planSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('startDate') || this.isModified('duration')) {
        this.endDate = new Date(this.startDate);
        this.endDate.setDate(this.endDate.getDate() + this.duration);
    }
    next();
});

const Plan = mongoose.model('Plan', planSchema);

export default Plan;