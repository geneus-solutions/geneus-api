import nodemailer from "nodemailer";
import { configDotenv } from 'dotenv';
configDotenv()
const sendEmail = async (receiver, sender, subject, text) => {
    try {

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.toAdmin,
            pass: process.env.Email_Pass,
        },
      });
  
     
      let mailOptions = {
        from: sender , 
        to: receiver, 
        subject: subject, // Subject of the email
        text: text, // Plain text body
      };
  
      // Send the email
      let info = await transporter.sendMail(mailOptions);
  
      console.log('Email sent: ' + info.response);
    } catch (error) {
      console.error('Error sending email: ', error);
    }
  };

  export default sendEmail;