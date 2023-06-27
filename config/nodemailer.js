const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const User = require('../app/models/User');
const { MAIL_TYPE } = require('../app/utils/constants');
const { OAuth2 } = google.auth;

const emailService = process.env.EMAIL_SERVICE;

const debugEmailLogPath = path.join(__dirname, '../logs/emails');
const emails = process.env.APP_EMAIL_ADDRESS
  ? process.env.APP_EMAIL_ADDRESS.split(',')
  : [];
const passwords = process.env.APP_EMAIL_PASSWORD
  ? process.env.APP_EMAIL_PASSWORD.split(',')
  : [];
const clientIds = process.env.OAUTH2_CLIENT_ID
  ? process.env.OAUTH2_CLIENT_ID.split(',')
  : [];
const clientSecrets = process.env.OAUTH2_CLIENT_SECRET
  ? process.env.OAUTH2_CLIENT_SECRET.split(',')
  : [];
const refreshTokens = process.env.OAUTH2_REFRESH_TOKEN
  ? process.env.OAUTH2_REFRESH_TOKEN.split(',')
  : [];
const redirectUri = process.env.OAUTH2_REDIRECT_URI;
const whiteListedEmails = process.env.WHITE_LISTED_EMAILS
  ? process.env.WHITE_LISTED_EMAILS.split(',')
  : [];
const transportConfigs = {};

const WHITELISTED_MAIL_TYPES = [
  MAIL_TYPE.ACTIVATE_ACCOUNT,
  MAIL_TYPE.RESET_PASSWORD
];

const IS_DEVELOPMENT_MODE = process.env.NODE_ENV !== 'production';

emails.forEach((email, index) => {
  const clientId = clientIds[index];
  const clientSecret = clientSecrets[index];
  const refreshToken = refreshTokens[index];
  const password = passwords[index];
  const oauth2Client = new OAuth2(clientId, clientSecret, redirectUri);

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  oauth2Client.getAccessToken((err, token) => {
    // if (err) console.error(err);
    transportConfigs[email].auth.accessToken = token;
  });

  transportConfigs[email] = {
    auth:
      emailService === 'gmail'
        ? {
            type: 'OAuth2',
            user: email,
            clientId,
            clientSecret,
            refreshToken
          }
        : { user: email, pass: password },
    ...(emailService === 'gmail'
      ? {
          host: 'smtp.gmail.com',
          service: 'gmail',
          port: 465,
          secure: true,
          tls: {
            ciphers: 'SSLv3'
          }
        }
      : {
          host: 'smtpout.secureserver.net',
          secureConnection: true,
          tls: {
            ciphers: 'SSLv3'
          },
          port: 587
        })
  };
});

const smtpTransports = Object.keys(transportConfigs).reduce(
  (transports, email) => ({
    ...transports,
    [email]: nodemailer.createTransport(transportConfigs[email])
  }),
  {}
);

Object.keys(smtpTransports).forEach(email => {
  smtpTransports[email]._sendMail = smtpTransports[email].sendMail;
  smtpTransports[email].sendMail = async function(mailData, logToFile = true) {
    const { to, type } = mailData;
    mailData.to = await getRecipientMails(to, type);
    if (IS_DEVELOPMENT_MODE) {
      mailData.to = getWhiteListedMails(mailData.to);
    }
    if (logToFile && (IS_DEVELOPMENT_MODE || !mailData.to)) {
      logEmailToFile(mailData, to);
    }
    if (!mailData.to) {
      return Promise.reject('No valid recipient found');
    }
    return this._sendMail(mailData);
  }.bind(smtpTransports[email]);
});

const verify = () =>
  Object.keys(smtpTransports).forEach(email => {
    smtpTransports[email].verify(err => {
      if (err) {
        console.log(
          `[Nodemailer Loader] Verifying mailing account for ${email} failed: ${err}`
        );
      } else {
        console.log(`[Nodemailer] Ready to send messages for ${email}`);
      }
    });
  });

const getRecipientMails = async (to, mailType) => {
  if (!to) return;
  if (WHITELISTED_MAIL_TYPES.includes(mailType)) return to;
  const recipientEmails = to.split(',');
  try {
    const mailTypeKey = `emailPreferences.${mailType}`;
    const unsubscribedUser = await User.find(
      {
        email: { $in: recipientEmails },
        $or: [{ 'emailPreferences.subscribe': false }, { [mailTypeKey]: false }]
      },
      { email: 1, _id: 0 }
    );
    const validRecipientEmail = recipientEmails.filter(
      email =>
        !unsubscribedUser.find(({ email: userEmail }) => userEmail === email)
    );
    return validRecipientEmail.join(',');
  } catch (err) {
    console.error(err);
  }
};

const getWhiteListedMails = to => {
  if (!to) return;
  const recipientEmails = to.split(',');
  const validRecipientEmail = recipientEmails.filter(email =>
    whiteListedEmails.includes(email)
  );
  return validRecipientEmail.join(',');
};

const logEmailToFile = (mailData, to) => {
  let EMAIL_CONTENTS = `To: ${mailData.to}\nFrom:  ${mailData.from}\nSubject:  ${mailData.subject}\nBody:  \n${mailData.html}`;
  // Log email contents to console
  console.log(
    `Skipping email to ${mailData.to}\nEmail content:\n${EMAIL_CONTENTS}`
  );
  // Log email contents to file
  const TODAY = new Date();
  if (!fs.existsSync(debugEmailLogPath)) {
    fs.mkdirSync(debugEmailLogPath, { recursive: true });
  }
  const todayEmailDir = path.join(
    debugEmailLogPath,
    `${TODAY.getFullYear()}-${TODAY.getMonth() + 1}-${TODAY.getDate()}`
  );
  if (!fs.existsSync(todayEmailDir)) {
    fs.mkdirSync(todayEmailDir);
  }
  const emailLogFileName = `${to}-${mailData.type ||
    ''}${TODAY.getTime()}.html`;
  const emailLogFilePath = path.join(todayEmailDir, emailLogFileName);

  fs.appendFile(emailLogFilePath, EMAIL_CONTENTS, err => {
    if (err) console.error('Error writing email log file', err);
  });
};

module.exports = { mailer: smtpTransports, verify };
