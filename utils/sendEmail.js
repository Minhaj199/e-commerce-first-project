const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config({ path: "./configaration.env" });

const mailSender = async (emailAddress, title, body) => {
  try {
    //create a Transported to send emails
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
      tls:{
        rejectUnauthorized: false
      }
    });

    //SEND EMAIL TO USER
    let info = await transporter.sendMail({
      from: process.env.SMTP_MAIL,
      to: emailAddress,
      subject: title,
      html: body,
    });
    return info;
  } catch (error) {
    console.log(error)
  }
};

module.exports = mailSender;
