const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: "pgandhi2512@zohomail.in",
    pass: '8TNJkRenaQhh'
  }
});
module.exports = transporter;