// This schema is for contact us page:-

import mongoose from 'mongoose';
const { Schema } = mongoose;
var validateEmail = function(email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const ContactSchema = new Schema(
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
      required: 'Email address is required',
      unique: false,
      validate: [validateEmail, 'Please fill a valid Email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid Email',
      ],
    },
    subject: {
      type: String,
      trim: true,
      required: true,
    },
    contactNumber:{
      type: Number,
      trim: true,
      required: true
    },
    message: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'REJECTED', 'COMPLETED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);


mongoose.connection.on('open', function () {
    const collection = mongoose.connection.collection('queries');
    // collection.dropIndex('email_1', function (error, result) {
    //   if (error) {
    //     console.log('Error dropping index:', error);
    //   } else {
    //     console.log('Index dropped successfully:', result);
    //   }
    // });
  });
  
ContactSchema.index({ email: 1 }, { unique: false });

export default mongoose.model('Contact', ContactSchema);