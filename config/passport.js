'use strict';

/*
 * Module dependencies.
 */

module.exports = function(passport) {
  const local = require('./passport/local');
  const jwt = require('./passport/jwt');
  const User = require('../app/models/User');
  // serialize and deserialize sessions
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => User.findOne({ _id: id }, done));

  // use these strategies
  passport.use(local);
  passport.use(jwt);
};
