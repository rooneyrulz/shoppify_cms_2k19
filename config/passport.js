const { Strategy } = require('passport-local');
const { compare } = require('bcryptjs');

// IMPORT MODEL
const User = require('../models/User');

const passportConfig = passport => {
  passport.use(
    new Strategy(async (username, password, done) => {
      try {
        // FIND RIGHT EMAIL
        const user = await User.findOne({ email: username }).exec();

        if (!user) return done(null, false, { message: 'User not found!' });

        const isMatch = await compare(password, user.password);

        if (!isMatch)
          return done(null, false, { message: 'Password is not match!' });

        return done(null, user);
      } catch (error) {
        console.log(error.message);
        return done(null, false, { message: 'Something went wrong!' });
      }
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function(id, done) {
    await User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};

module.exports = passportConfig;
