const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
// Verify the connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error);
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Verify your email password is correct');
        console.log('2. Try logging in at: https://hostinger.titan.email/');
        console.log('3. Ensure your domain is properly connected to Hostinger');
        console.log('4. If using 2FA, generate an app password');
    } else {
        console.log('✅ Email configuration successful!');
        console.log(`📧 Ready to send emails from: care@brandel.shop`);
    }
});

module.exports = transporter;