const passportJWT = require('passport-jwt');
const { parse } = require('cookie');

const JWTstrategy = passportJWT.Strategy;
const User = require('../../app/models/User');

module.exports = new JWTstrategy(
  {
    jwtFromRequest: req =>
      parse(req.headers.cookie || '')[
        process.env.NODE_ENV === 'development'
          ? 'dev-access-token'
          : '__Host-access-token'
      ],
    secretOrKey: process.env.JWT_KEY
  },
  function(jwtPayload, done) {
    User.findById(jwtPayload._id)
      .populate('permission')
      .then(user => {
        if (user) {
          return done(null, user);
        } else {
          return done(true, false, {
            message: 'No user found with that token'
          });
        }
      })
      .catch(err => {
        return done(true, false, { err });
      });
  }
);
