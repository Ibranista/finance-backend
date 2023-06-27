/**
 * Module dependencies.
 */

const LocalStrategy = require('passport-local').Strategy;
const User = require('../../app/models/User');
/**
 * Expose
 */

module.exports = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.authenticateUser(email, password)
      .then(user => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Unknown error' });
        }
      })
      .catch(err => {
        return done(null, false, err);
      });
    // const options = {
    //   criteria: { email: email }
    // };
    // User.load(options, function(err, user) {
    //   if (err) return done(err);
    //   if (!user) {
    //     return done(null, false, { message: 'Unknown user' });
    //   }
    //   if (!user.authenticate(password)) {
    //     return done(null, false, { message: 'Invalid password' });
    //   }
    //   return done(null, user);
    // });
  }
);
