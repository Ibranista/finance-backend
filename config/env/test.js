/**
 * Expose
 */

module.exports = {
  db: encodeURI(
    process.env.MONGODB_URL || 'mongodb://localhost:27017/zad_updated_test'
  ),
  facebook: {
    clientID: 'APP_ID',
    clientSecret: 'SECRET',
    callbackURL: 'http://localhost:5000/auth/facebook/callback',
    scope: ['email', 'user_about_me', 'user_friends']
  },
  google: {
    clientID: 'APP_ID',
    clientSecret: 'SECRET',
    callbackURL: 'http://localhost:5000/auth/google/callback',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.google.com/m8/feeds'
    ]
  }
};
