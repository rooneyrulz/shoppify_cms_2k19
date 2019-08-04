import { Strategy } from 'passport-local';
import { compare } from 'bcryptjs';

// IMPORT MODEL
import User from '../models/User';

export default passport => {
  passport.use(
    new Strategy(async (email, password, done) => {
      try {
        // FIND RIGHT EMAIL
        const user = await User.findOne({ email }).exec();

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

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
