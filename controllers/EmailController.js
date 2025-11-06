import nodemailer from "nodemailer";
import { configDotenv } from 'dotenv';
configDotenv()
const sendEmail = async (sender, receiver, subject, text, html, attachments) => {
    try {

      let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password,
        },
      });
  
     
      let mailOptions = {
        from: sender , 
        to: receiver, 
        subject: subject, // Subject of the email
        text: text, // Plain text body
        html: html,
        attachments: attachments,
      };
  
      // Send the email
      let info = await transporter.sendMail(mailOptions);
  
      console.log('Email sent: ' + info.response);

      return {
        status: true,
        message: 'Email sent successfully',
      };

    } catch (error) {
      console.error('Error sending email: ', error);
      return {
        status: false,
        message: 'Error sending email',
      };
    }
  };

  export default sendEmail;
