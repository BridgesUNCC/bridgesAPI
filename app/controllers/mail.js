var nodemailer = require('nodemailer'),
    crypto = require('crypto');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    service: "yahoo",
    auth: {
        user: "bridgesuncc_reset@yahoo.com",
        pass: process.env.PASSWORD_RESET_KEY
    },
    debug: false,
    logger: true
});

// Send a password reset email to the given email address
exports.resetPass = function(email, cb) {
  // generate random unique token
  var token = crypto.randomBytes(48).toString('hex');

  // send a password reset email with the new token
  var mailOptions = {
    from: '<bridgesuncc_reset@yahoo.com>', // sender address
    to: email, // list of receivers
    subject: 'Reset Password Link', // Subject line
    html: '<b>Forgot your password?</b>' + // html body
          '<p>We received a request to reset the password for the account associated with this email address.</p>' +
          '<p>To reset and change your password, click on this link or cut and paste it into your browser. <b>This link will expire in 2 hours.</b><br />' +
          '<br /><a href="https://bridges-clone.herokuapp.com/reset/' + token + '">https://bridges-clone.herokuapp.com/reset/'+ token + '</a></p>' +
          '<br /><p>If you did not request this email or you do not want to change your password, please ignore this message.</p>'
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      console.log('sending mail...');
      if (error) {
          return cb({"err": "email delivery failed."});
      }
      console.log('Message sent: %s', info.messageId);
      cb(null, email, token);
  });
};
