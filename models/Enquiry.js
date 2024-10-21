import mongoose from "mongoose";
const { Schema } = mongoose;
var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
var validatePhone = function (contact) {
    var re = /^\d{10}$/;
    return re.test(contact);
};
const enquirySchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            required: "Email address is required",
            validate: [validateEmail, "Please fill a valid Email"],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please fill a valid Email",
            ],
        },
        contact: {
            type: Number,
            trim: true,
            required: true,
            required: "Contact number is required",
            validate: [validatePhone, "Please fill a valid Phone Number"],
            match: [/^\d{10}$/, "Please fill a valid Phone Number"],
        },
    },
    { timestamp: true }
);
export default mongoose.model("Enquiry", enquirySchema);
