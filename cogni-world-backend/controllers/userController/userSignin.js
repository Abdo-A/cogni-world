const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const sendEmail = require('../helpers/sendEmail');
const emailVerificationTemplate = require('../../templates/emailTemplates/emailVerification');
const keys = require('../../keys.secret');

// Models
const User = mongoose.model('user');

// Validations
const validateForm = require('./validations/userSigninForm');

module.exports = (req, res) => {
  // Validate
  const { message, isValid } = validateForm(req.body);
  if (!isValid) {
    return res.status(400).json({ message });
  }

  const { email, password } = req.body;

  // Check for the user email
  User.findOne({ email }).then(user => {
    if (!user) {
      const message = 'No such user';
      return res.status(400).json({ message });
    }

    // Check Password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) {
        const message = 'Incorrect Password';
        return res.status(400).json({ message });
      }

      // User Matched ✅

      // JWT Payload
      const { token, password, ...userInfo } = user._doc;

      const loginTokenPayload = {
        ...userInfo,
        isAdmin: keys.adminEmails.includes(userInfo.email),
      };

      // Make JWT
      jwt.sign(
        loginTokenPayload,
        keys.secretOrKey,
        // { expiresIn: 604800 },
        (err, token) => {
          // resend verification email
          if (!userInfo.verified) {
            sendEmail({
              receiverEmail: userInfo.email,
              subject: 'Verify your Cogni World email',
              template: emailVerificationTemplate({ user: user._doc }),
            });
          }

          return res
            .status(200)
            .json({ success: true, token: `Bearer ${token}` });
        },
      );
    });
  });
};
