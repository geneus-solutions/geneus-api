import shortid from "shortid";
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import sendEmail from "./EmailController.js";
import { configDotenv } from "dotenv";
configDotenv();
const postRazorpay = async (req, res) => {
  try {
    const getExistingCourse = await User.findOne({email: req.body.email}).select('courses');
    console.log(getExistingCourse, 'this is getExistingCourse')
    if(getExistingCourse?.courses?.length > 0) {
      const existingCourse = getExistingCourse.courses;
      const cartDetails = req.body.cart_details;

      const isCourseAlreadyEnrolled = existingCourse.some((course) => {
        return cartDetails.includes(course);
      });
      if (isCourseAlreadyEnrolled) {  
        return res.status(409).json({ error: "You have already enrolled for this course" });        
      }
    }

    const payment_capture = 1;
    const amount = parseInt(req.body.amount);
    const currency = req.body.currency;

    if (isNaN(amount)) {
      throw new Error("Invalid amount");
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt: shortid.generate(),
      payment_capture,
    };

    try {
      const currentDate = new Date();
      const orderStatus = "Geneus Solutions New Order Initited";
      const updatedOrderStatus = `${orderStatus} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;

      sendEmail(
        process.env.toAdmin,
        req.body.email,
        updatedOrderStatus,
        `Name: ${req.body.username}\namount: ${amount}\nreceipt: ${options.receipt}`
      );
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    // console.log("rezorpay", razorpay);

    const response = await razorpay.orders.create(options);
    // console.log("this is response", response);

    res.status(200).json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const paymentVerification = async (req, res) => {
  console.log('this is body payment verification---->', req.body)
  try {
    const razorpay_order_id = req.body.data.razorpay_order_id;
    const razorpay_payment_id = req.body.data.razorpay_payment_id;
    const razorpay_signature = req.body.data.razorpay_signature;
    const user_id = req.body.data.user_id;
    const cart_details = req.body.data.cart_details;

    //console.log(razorpay_order_id, razorpay_payment_id);

    // Create a nodemailer transporter

    const currentDate = new Date();
    const orderStatus = "Geneus Solutions New Order Placed";
    const updatedOrderStatus = `${orderStatus} on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`;

    // Define the email content

    
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");
      
      const isAuthentic = expectedSignature === razorpay_signature;
      console.log(isAuthentic);

    if (isAuthentic) {
      const payment = await Payment.create({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
        status: "success",
        user_id: user_id,
        cart_details: cart_details,
      });
      // 67822d1c7fa62ea6bd76cf15
      console.log('this is cartDetials', cart_details)
      console.log('this is userId', user_id)
      const user = await User.findOne({_id: user_id});
      console.log('this is user', user)
      cart_details.forEach((item) => {
        user.courses.push(item.course_id);
      });
      
      await user.save();
      //console.log(user.courses);
      
      sendEmail(
        process.env.toAdmin,
        req.body.data.user_email,
        updatedOrderStatus,
        `Dear user\n\nThank you for Enrolling the course. We have received the request.\n\nrazorpay_order_id: ${razorpay_order_id}\nrazorpay_payment_id: ${razorpay_payment_id}\nuser_id: ${user_id}. \n\nTo start learning goto https://www.geneussolutions.in/ and click on My Learning on the top right page. Thank you \n\nFor any queries, kindly reach out to us on support@geneussolutions.in. Happy Learning!\n\nThank you and Warm Regards,\nGeneus Solutions\n+91 9148950239`
      );
      res.status(200).json({ success: true });
    } else {
      console.log("error");
      res.status(500).json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export { paymentVerification, postRazorpay };
