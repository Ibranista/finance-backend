'use strict';
const { AccessControl } = require('accesscontrol');
const crypto = require('crypto');
const Roles = require('../app/models/Roles');
const {
  events: { NEW_ROLE, ROLE_UPDATE, NEW_PRIVILEGE, PRIVILEGE_UPDATE },
  TOP_CONTENT_CALLBACK_PATH,
  STRIPE_CALLBACK_PATH,
  XERO_CALLBACK_PATH
} = require('../app/utils/constants');
const { getCurrencyRates } = require('../app/utils/currencyRates');
const { _getRolesAccessProjection } = require('../app/utils/projectionUtil');
const stripe = require('../app/utils/stripe');
const xero = require('../app/utils/xero');

/**
 * Module dependencies.
 */
const passport = require('passport');

const adminBrouRouter = require('./adminBro');
const authRoutes = require('../app/routes/auth');

//secure routes
const accountRoute = require('../app/routes/account');
const tagsRoute = require('../app/routes/tags');
const contactPersonRoute = require('../app/routes/contactPerson');
const purchasedLinkRoute = require('../app/routes/purchasedLinks');
const ahrefRoutes = require('../app/routes/ahref');
const statRoutes = require('../app/routes/stats');
const groupsRoute = require('../app/routes/groups');
const settingsRoute = require('../app/routes/settings');
const wishListRoute = require('../app/routes/wishList');
const cartRoutes = require('../app/routes/cart');
const contentLengthRoute = require('../app/routes/contentLengths');
const ordersRoute = require('../app/routes/orders');
const notificationRoute = require('../app/routes/notification');
const messageRoute = require('../app/routes/messaging');
const backlinks = require('../app/routes/backlinks');
const keywords = require('../app/routes/keywords');
const linkRoutes = require('../app/routes/links');
const linkMarketRoutes = require('../app/routes/linkMarket');
const linkSuggestion = require('../app/routes/linkSuggestion');
const features = require('../app/routes/features');
const linkRequestRoutes = require('../app/routes/linkRequests');
const commissions = require('../app/routes/commissions');
const pages = require('../app/routes/pages');
const linkSights = require('../app/routes/linkSights');
const topContent = require('../app/routes/topContent');
const topContentWebhook = require('../app/routes/topContentWebhook');
const renewals = require('../app/routes/renewals');
const websiteKeywords = require('../app/routes/websiteKeywords');
const payment = require('../app/routes/payment');
const stripeWebhook = require('../app/routes/stripeWebhook');
const xeroWebhook = require('../app/routes/xeroWebhook');
const errorLogger = require('../app/routes/errorLogger');
const { logError } = require('../app/utils/errorLogger');

/**
 * Expose
 */

xero
  .initialize()
  .then(() => {
    if (xero.client.tenants.length)
      console.log('Successfully connected to Xero');
  })
  .catch(err => {
    console.log(
      'An error occured when initializing Xero client',
      err.body || err
    );

    if (err.body && err.body.Status === 401) {
      xero.refreshToken().catch(err => {
        console.log(
          'An error occured when refreshing Xero refresh token',
          err.body
        );
      });
    }
  });

let accessControl;

const setAccessControl = () => {
  const { generateGrantList } = require('../app/models/utils');
  console.log('generating grant list...');
  Roles.getRoles().then(roles => {
    if (roles && Array.isArray(roles) && roles.length) {
      const grantList = roles.map(role => generateGrantList(role)).flat();
      accessControl = new AccessControl(grantList);
      const projections = _getRolesAccessProjection(accessControl);
      global.projections = projections;
    }
  });
};

if (global.eventEmitter) {
  global.eventEmitter.on(NEW_ROLE, setAccessControl);
  global.eventEmitter.on(ROLE_UPDATE, setAccessControl);
  global.eventEmitter.on(NEW_PRIVILEGE, setAccessControl);
  global.eventEmitter.on(PRIVILEGE_UPDATE, setAccessControl);
}

getCurrencyRates();

const getExchangeRates = async (req, res) => res.send(global.currencyRates);

const authenticateMiddleWare = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user, message) => {
    if (error || !user) {
      if (!message) {
        message = { message: 'No user found with this token' };
      } else if (Object.keys(message).length <= 0) {
        message = { message: 'No auth token provided' };
      }
      res.status(401).send(message);
    } else if (user) {
      user.populate(
        {
          path: 'role',
          select: '-permissions -createdBy'
        },
        (err, user) => {
          if (err) {
            res.status(403).send(err);
          } else if (user) {
            req.user = user;
            next();
          }
        }
      );
    }
  })(req, res, next);
};

const authenticateTopContentWebhook = (req, res, next) => {
  if (req.body.api_key === process.env.TOP_CONTENT_API_KEY) {
    next();
  } else {
    next({ status: 401, message: 'Invalid Webhook Request' });
  }
};

const verifyStripeWebhookEvent = (req, res, next) => {
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
  let event = req.body;

  if (endpointSecret) {
    const signature = req.headers['stripe-signature'];

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.log(
        '⚠️ Stripe webhook signature verification failed.',
        err.message,
        event
      );
      return res.sendStatus(400);
    }
  }

  req.event = event;
  next();
};

const verifyXeroWebhookEvent = (req, res, next) => {
  const webhookKey = process.env.XERO_WEBHOOK_KEY;
  const signature = req.headers['x-xero-signature'];

  const hmac = crypto
    .createHmac('sha256', webhookKey)
    .update(req.body.toString())
    .digest('base64');

  if (signature === hmac) {
    next();
  } else {
    console.log(
      '⚠️ Xero webhook signature verification failed.',
      signature,
      hmac
    );
    res.sendStatus(401);
  }
};

exports.setAccessControl = setAccessControl;

exports.init = function(app) {
  app.use(function(req, res, next) {
    req.accessControl = accessControl;
    next();
  });

  app.use('/admin', adminBrouRouter);
  app.use('/admin/password', (req, res) => res.redirect('/admin'));
  app.use('/api/auth', authRoutes);

  /**
   * public webhook endpoints
   */
  app.post(
    TOP_CONTENT_CALLBACK_PATH,
    authenticateTopContentWebhook,
    topContentWebhook
  );

  app.post(STRIPE_CALLBACK_PATH, verifyStripeWebhookEvent, stripeWebhook);

  app.post(XERO_CALLBACK_PATH, verifyXeroWebhookEvent, xeroWebhook);

  /**
   * xero oauth2 endpoints
   */
  app.get('/xero/oauth/consent', async (req, res) => {
    try {
      const consentUrl = await xero.buildConsentUrl();
      res.redirect(consentUrl);
    } catch (err) {
      console.log(err);
      res.status(res.statusCode).send(err);
    }
  });

  app.get('/xero/callback', async (req, res) => {
    try {
      const callbackUrl = `${req.protocol}://${req.get('host')}${
        req.originalUrl
      }`;
      await xero.callback(callbackUrl);
      res.send('OK');
    } catch (err) {
      console.log(err);
      res.status(res.statusCode).send(err);
    }
  });

  //jwt secured routes
  app.use('/api/account', authenticateMiddleWare, accountRoute);
  app.use('/api/tags', authenticateMiddleWare, tagsRoute);
  app.use('/api/contact_person', authenticateMiddleWare, contactPersonRoute);
  app.use('/api/purchased_links', authenticateMiddleWare, purchasedLinkRoute);
  app.use('/api/ahref', authenticateMiddleWare, ahrefRoutes);
  app.use('/api/stats', authenticateMiddleWare, statRoutes);
  app.use('/api/groups', authenticateMiddleWare, groupsRoute);
  app.use('/api/settings', authenticateMiddleWare, settingsRoute);
  app.use('/api/cart', authenticateMiddleWare, cartRoutes);
  app.use('/api/wish_lists', authenticateMiddleWare, wishListRoute);
  app.use('/api/content_lengths', authenticateMiddleWare, contentLengthRoute);
  app.use('/api/orders', authenticateMiddleWare, ordersRoute);
  app.use('/api/notifications', authenticateMiddleWare, notificationRoute);
  app.use('/api/messages', authenticateMiddleWare, messageRoute);
  app.use(
    '/api/curreny_exchange_rate',
    authenticateMiddleWare,
    getExchangeRates
  );
  app.use('/api/backlinks', authenticateMiddleWare, backlinks);
  app.use('/api/keywords', authenticateMiddleWare, keywords);
  app.use('/api/links', authenticateMiddleWare, linkRoutes);
  app.use('/api/link_market', authenticateMiddleWare, linkMarketRoutes);
  app.use('/api/link_suggestion', authenticateMiddleWare, linkSuggestion);
  app.use('/api/features', authenticateMiddleWare, features);
  app.use('/api/link_requests', authenticateMiddleWare, linkRequestRoutes);
  app.use('/api/pages', authenticateMiddleWare, pages);
  app.use('/api/linkSights', authenticateMiddleWare, linkSights);
  app.use('/api/commissions', authenticateMiddleWare, commissions);
  app.use('/api/top_content', authenticateMiddleWare, topContent);
  app.use('/api/renewals', authenticateMiddleWare, renewals);
  app.use('/api/websiteKeywords', authenticateMiddleWare, websiteKeywords);
  app.use('/api/payment', authenticateMiddleWare, payment);
  app.use('/api/logger', authenticateMiddleWare, errorLogger);

  /**
   * Error handling
   */

  // eslint-disable-next-line no-unused-vars
  app.use(function(err, req, res, _) {
    const { status, message } = err;
    const developmentMode = process.env.NODE_ENV === 'development';
    if (!status) {
      res.status(500).send(
        (developmentMode && err.stack) || {
          message: 'Internal Server Error'
        }
      );
    } else if (status === 400) {
      res.status(400).send({ message: message || 'Bad Request' });
    } else if (status === 403) {
      res.status(403).send({ message: message || 'Not Authorized' });
    } else if (status === 409) {
      res.status(409).send({ message: message || 'Conflict' });
    } else if (status === 500) {
      res.status(500).send({ message: message || 'Internal Server Error' });
    } else {
      res.status(status).send({ message: message || 'Service Unavailable' });
    }
    if (!status || status === 500) {
      logError(err, req);
    }
  });

  app.use(function(req, res) {
    res.status(404).send('404 ' + req.url + ' is not found');
  });
};
