const mongoose = require('mongoose');
const {
  Types: { ObjectId }
} = require('mongoose');
const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose');
const pug = require('pug');
const path = require('path');
const Ahrefs = require('../../app/models/Ahrefs');
const ApplicationSettings = require('../../app/models/ApplicationSettings');
const Backlinks = require('../../app/models/Backlinks');
const Commission = require('../../app/models/Commission');
const ContactPerson = require('../../app/models/ContactPerson');
const ContentLength = require('../../app/models/ContentLength');
const Groups = require('../../app/models/Groups');
const Keywords = require('../../app/models/Keywords');
const LinkPortfolio = require('../../app/models/LinkPortfolio');
const Link = require('../../app/models/Links');
const LinkMarket = require('../../app/models/LinkMarket');
const Notification = require('../../app/models/Notification');
const OwnedWebsites = require('../../app/models/OwnedWebsites');
const Privilege = require('../../app/models/Privileges');
const Permissions = require('../../app/models/Permissions');
const PurchasedLink = require('../../app/models/PurchasedLinks');
const Resource = require('../../app/models/Resources');
const Role = require('../../app/models/Roles');
const Tags = require('../../app/models/Tags');
const User = require('../../app/models/User');
const Features = require('../../app/models/Features');
const Orders = require('../../app/models/Orders');
const ThirdPartyApiSettings = require('../../app/models/ThirdPartyApiSettings');
const ScrappedKeywords = require('../../app/models/ScrappedKeywords');
const Pages = require('../../app/models/Pages');
const ErrorLogger = require('../../app/models/ErrorLogger');
const Payments = require('../../app/models/Payments');
const ActivityLog = require('../../app/models/ActivityLog');

const permissionsConfig = require('./permissionsConfig');
const { mainParent, monitorParent, resourcesParent } = require('./mainConfigs');
const applicationSettingsPage = require('./pages/applicationSettings');
const thirdPartyApiSettingsPage = require('./pages/thirdPartyApiSettings');
const {
  createAccountValidationToken
  // generateHashedPassword
} = require('../../app/models/User/utils');
const { mailer } = require('../nodemailer');
const {
  actions,
  possessions,
  MAIL_TYPE
} = require('../../app/utils/constants');
const { Resources } = require('./resources');

const { DOMAIN_URL, APP_EMAIL_ADDRESS } = process.env;
const emails = (APP_EMAIL_ADDRESS && APP_EMAIL_ADDRESS.split(',')) || [];
const NOREPLY_EMAIL =
  emails.find(email => email.startsWith('noreply')) || emails[0];

AdminBro.registerAdapter(AdminBroMongoose);

const dataMapper = data => {
  const sitemaps = [];
  const arrayed = Object.entries(data);
  arrayed.forEach(element => {
    if (typeof element[0] === 'string') {
      if (element[0].startsWith('sitemapPath')) {
        sitemaps.push(element[1]);
      }
    }
  });
  return sitemaps;
};

const activateEmail = async (request, response, context) => {
  const user = context.record;
  const { _id, email } = user.params;
  const urlEncodedEmail = encodeURIComponent(email);

  const { token, key } = createAccountValidationToken(_id);
  const url = `${DOMAIN_URL ||
    ''}/activate_account?token=${token}&email=${urlEncodedEmail}`;
  const mailData = {
    to: email,
    type: MAIL_TYPE.ACTIVATE_ACCOUNT,
    from: `"LinkBuilders" <${NOREPLY_EMAIL}>`,
    subject: 'Activate your Link Builders account',
    html: pug.renderFile(
      path.join(__dirname, '../../app/views/mail/activation.pug'),
      {
        domainURL: process.env.DOMAIN_URL,
        gettingStartedImgURL: `${DOMAIN_URL}/img/howtogetstarted.jpg`,
        activateLink: url,
        title: 'TIME TO ACTIVATE YOUR ACCOUNT',
        gettingStartedUrl:
          'https://link.builders/guide-get-started-with-link-builders/'
      }
    )
  };
  try {
    await mailer[NOREPLY_EMAIL].sendMail(mailData, false);
    await User.findByIdAndUpdate(_id, { $set: { password: key } });
  } catch (error) {
    console.log('Failed to send activation email', error);
    user.errors = 'Failed to send activation email';
  }

  return {
    record: user.toJSON(context.currentAdmin)
  };
};

const handleUpdateUser = async (req, res, context) => {
  const { record, resource, currentAdmin, h, translateMessage } = context;
  if (req.method === 'post') {
    const { payload } = req;
    const user = await User.findOneAndUpdate({ _id: record.id() }, payload, {
      responsibleUser: currentAdmin
    }).lean();

    const baseRecord = new AdminBro.BaseRecord(
      AdminBro.flatten(user),
      resource
    );
    return {
      redirectUrl: h.resourceUrl({
        resourceId: resource._decorated?.id() || resource.id()
      }),
      notice: {
        message: translateMessage('successfullyUpdated', resource.id()),
        type: 'success'
      },
      record: baseRecord.toJSON(currentAdmin)
    };
  }
  const { params } = record;
  const baseRecord = new AdminBro.BaseRecord(
    AdminBro.flatten(params),
    resource
  );

  return {
    record: baseRecord.toJSON(currentAdmin)
  };
};

const handleDeleteUser = async (req, res, context) => {
  const { record, resource, currentAdmin, h, translateMessage } = context;

  await User.deleteOne(
    { _id: record.id() },
    {
      responsibleUser: currentAdmin
    }
  );

  return {
    record: record.toJSON(context.currentAdmin),
    redirectUrl: h.resourceActionUrl({
      resourceId: resource.id(),
      actionName: 'list'
    }),
    notice: {
      message: translateMessage('successfullyDeleted', resource.id()),
      type: 'success'
    }
  };
};

const restoreActivityHandler = async (request, response, context) => {
  const { record, h, resource } = context;
  const {
    _id,
    action,
    collectionType,
    changes,
    restoreDependencies,
    restored
  } = AdminBro.unflatten(record.params);
  try {
    if (restored) {
      throw new Error('Activity already restored!');
    }
    let nModified = 0;
    if (action === 'delete') {
      // restore dependency documents
      if (restoreDependencies) {
        for (let i = 0; i < changes.length; i++) {
          const originalDoc = JSON.parse(changes[i].originalDoc);
          // restore all document dependencies
          for await (const { path, ref } of restoreDependencies) {
            let originalDocPathValue;
            const dependencyDoc = originalDoc[path];
            if (dependencyDoc) {
              if (Array.isArray(dependencyDoc)) {
                const dependencyIds = [];
                const docs = dependencyDoc.map(doc => {
                  dependencyIds.push(doc._id);
                  // eslint-disable-next-line no-unused-vars
                  const { updatedAt, createdAt, ...rest } = doc;
                  return mongoose
                    .model(ref)
                    .updateOne(
                      { _id: ObjectId(doc._id) },
                      { $setOnInsert: rest },
                      { upsert: true, ignoreLog: true }
                    );
                });
                originalDocPathValue = dependencyIds;
                await Promise.all(docs);
                nModified += docs.length;
              } else {
                const docId = dependencyDoc._id;
                // eslint-disable-next-line no-unused-vars
                const { updatedAt, createdAt, ...rest } = dependencyDoc;
                const result = await mongoose
                  .model(ref)
                  .updateOne(
                    { _id: ObjectId(docId) },
                    { $setOnInsert: rest },
                    { upsert: true, ignoreLog: true }
                  );
                nModified += result.nModified;
                originalDocPathValue = docId;
              }
              originalDoc[path] = originalDocPathValue;
              changes[i].originalDoc = originalDoc;
            }
          }
        }
      }
      const deletedDocs = changes.map(doc =>
        typeof doc.originalDoc === 'string'
          ? JSON.parse(doc.originalDoc)
          : doc.originalDoc
      );
      const result = await mongoose
        .model(collectionType)
        .insertMany(deletedDocs);
      nModified += result.length;
    } else if (action === 'update') {
      for (const change of changes) {
        const { originalDoc, reference, modifiedDoc } = change;
        const _originalDoc = JSON.parse(originalDoc);
        const { incremented } = JSON.parse(modifiedDoc);
        const updateObject = {};
        // remove increment fields from original doc
        if (incremented) {
          const $inc = {};
          Object.keys(incremented).forEach(key => {
            delete _originalDoc[key];
            $inc[key] = -incremented[key];
          });
          updateObject.$inc = $inc;
        }
        if (Object.keys(_originalDoc).length) updateObject.$set = _originalDoc;
        const result = await mongoose
          .model(collectionType)
          .updateOne({ _id: ObjectId(reference) }, updateObject, {
            ignoreLog: true
          });
        nModified += result.nModified;
      }
    } else {
      throw new Error('Unknown action');
    }
    if (nModified)
      await ActivityLog.findByIdAndUpdate(_id, {
        restored: true,
        restoredBy: context.currentAdmin._id
      });
  } catch (error) {
    console.log('Failed to restore activity', error);
    record.errors = `Failed to restore activity : ${error.message}`;
  }

  return {
    record: record.toJSON(context.currentAdmin),
    redirectUrl: h.resourceUrl({
      resourceId: resource._decorated?.id() || resource.id(),
      actionName: 'list'
    })
  };
};

const handler = async (request, response, context) => {
  const website = context.record;
  const url = website.params.fullUrl;
  const sitemaps = dataMapper(website.params);
  website.errors = null;

  try {
    const result = await OwnedWebsites.fetchSubpages({
      fullUrl: url,
      sitemapPath: sitemaps
    });
    if (result.length <= 0) {
      website.errors = 'No sitemap data was found';
    } else {
      await OwnedWebsites.updateNewLinks(website.params._id, result);
    }
  } catch (error) {
    website.errors = 'An error occured while reriving sitemap data.';
  }

  return {
    record: website.toJSON(context.currentAdmin)
  };
};

const updateLinks = {
  actionType: 'record',
  isVisible: true,
  component: AdminBro.bundle('./linkUpdated'),
  handler
};
const resendEmailActivation = {
  actionType: 'record',
  isVisible: true,
  component: AdminBro.bundle('./ResendEmailactivation'),
  handler: activateEmail
};

const restoreActivity = {
  actionType: 'record',
  isVisible: true,
  component: AdminBro.bundle('./RestoreActivity'),
  handler: restoreActivityHandler
};

const resourceValidator = async req => {
  const { payload } = req;
  const errors = {};
  let foundAllowedActions = false;

  if (req.method === 'post') {
    if (!payload.name || (payload.name && !payload.name.trim()))
      errors.name = { message: 'Name is required' };

    for (const key in payload) {
      if (['attributes', 'allowedActions'].includes(key)) continue;
      if (/attributes.(\d+)/i.test(key)) {
        if (!payload[key] || !payload[key].trim())
          errors[key] = { message: `${key} cannot be empty` };
      } else if (/allowedActions.(\d+)/i.test(key)) {
        foundAllowedActions = true;
        if (!actions.includes(payload[key]))
          errors[key] = {
            message: `${key} can only be ${actions.join(' or ')}`
          };
      }
    }

    if (!foundAllowedActions)
      errors.allowedActions = {
        message: 'There must be at least one allowed action for a resource'
      };

    if (Object.keys(errors).length > 0)
      throw new AdminBro.ValidationError(errors);
  }

  return req;
};

const privilegeValidator = async (req, ctx) => {
  const { payload } = req;
  const errors = {};
  let foundAttributes = false;
  let resourceHasAttributes = false;

  if (req.method === 'post') {
    const { name, resource, action, possession, allowAllAttributes } = payload;
    const foundResource = await ctx._admin
      .findResource(Resources)
      .findOne(resource);

    for (const key in foundResource.params) {
      if (/attributes.(\d+)/i.test(key)) {
        resourceHasAttributes = true;
        break;
      }
    }

    if (!name || (name && !name.trim()))
      errors.name = { message: 'Name is required' };

    if (!resource) errors.resource = { message: 'Resource is required' };
    else if (resource !== new ObjectId(resource).toString())
      errors.resource = { message: 'Resource must be a valid resource id' };

    if (!action) errors.action = { message: 'Action is required' };
    else if (!actions.includes(action))
      errors.action = { message: `Action can only be ${actions.join(' or ')}` };

    if (!possession) errors.possession = { message: 'Possession is required' };
    else if (!possessions.includes(possession))
      errors.possession = {
        message: `Possession can only be either ${possessions.join(' or ')}`
      };

    if (allowAllAttributes && ![true, false].includes(allowAllAttributes))
      errors.allowAllAttributes = {
        message: `allowAllAttributes can only be either ${true} or ${false}`
      };

    for (const key in payload) {
      if (key === 'attributes') continue;
      if (/attributes.(\d+)/i.test(key)) {
        foundAttributes = true;
        if (!payload[key] || !payload[key].trim())
          errors[key] = { message: `${key} cannot be empty` };
        else if (allowAllAttributes && !payload[key].includes('!'))
          errors[key] = {
            message: `${key} must be prefixed by ! if allowAllAttributes is checked`
          };
        else if (!allowAllAttributes && payload[key].includes('!'))
          errors[key] = {
            message: `${key} must not be prefixed by ! if allowAllAttributes is not checked`
          };
      }
    }

    if (
      !allowAllAttributes &&
      ['READ', 'UPDATE'].includes(action) &&
      resourceHasAttributes &&
      !foundAttributes
    )
      errors.attributes = {
        message:
          'There must be at least one attribute if allowAllAttributes is not checked'
      };

    if (Object.keys(errors).length > 0)
      throw new AdminBro.ValidationError(errors);
  }

  return req;
};

const roleValidator = async req => {
  const { payload } = req;
  const errors = {};
  let foundPermissions = false;
  let foundDuplicates = false;
  let permissions = [];

  if (req.method === 'post') {
    if (!payload.name || (payload.name && !payload.name.trim()))
      errors.name = { message: 'Name is required' };

    for (const key in payload) {
      if (key === 'permissions') continue;
      if (/permissions.(\d+)/i.test(key)) {
        foundPermissions = true;
        if (permissions.includes(payload[key])) foundDuplicates = true;
        permissions = [...permissions, payload[key]];
        if (!payload[key]) errors[key] = { message: `${key} cannot be empty` };
        else if (payload[key] !== new ObjectId(payload[key]).toString())
          errors[key] = {
            message: `${key} must be a valid permission id`
          };
      }
    }

    if (!foundPermissions)
      errors.permissions = {
        message: 'There must be at least one permission assigned to a role'
      };
    else if (foundDuplicates)
      errors.permissions = {
        message: 'Duplicate permissions are not allowed'
      };

    if (Object.keys(errors).length > 0)
      throw new AdminBro.ValidationError(errors);
  }

  return req;
};

const orderValidator = async req => {
  if (req.method === 'post') {
    const { payload } = req;
    const orderObj = AdminBro.unflatten(payload);
    req.payload = AdminBro.flatten({
      ...orderObj,
      items: orderObj.items.map(item => {
        // eslint-disable-next-line no-unused-vars
        const {
          linkText,
          linkType,
          filePath,
          status,
          contentOrder,
          ...restItem
        } = item;

        if (['Accepted', 'Canceled', 'Rejected'].includes(status))
          return {
            status,
            linkText,
            contentOrder:
              typeof contentOrder === 'object'
                ? {
                    ...contentOrder,
                    title: contentOrder.title || linkText,
                    language: contentOrder.language || 'en'
                  }
                : { title: linkText },
            ...(linkType ? { linkType } : {}),
            ...(filePath ? { filePath } : {}),
            ...restItem
          };

        if (['Index', 'Subpage'].includes(linkType) || filePath)
          return {
            status,
            linkText,
            ...(linkType ? { linkType } : {}),
            ...(filePath ? { filePath } : {}),
            ...restItem
          };

        return item;
      })
    });
  }

  return req;
};

const handleLinkUpdate = async (req, res, context) => {
  const { record, resource, currentAdmin, h, translateMessage } = context;

  if (req.method === 'post') {
    const { payload } = req;
    const newRecord = await record.update(payload);
    const { params } = newRecord;
    // eslint-disable-next-line no-unused-vars
    const { subPages, ...restParams } = AdminBro.unflatten(params);
    const baseRecord = new AdminBro.BaseRecord(
      AdminBro.flatten(restParams),
      resource
    );

    if (record.isValid())
      return {
        redirectUrl: h.resourceUrl({
          resourceId: resource._decorated?.id() || resource.id()
        }),
        notice: {
          message: translateMessage('successfullyUpdated', resource.id()),
          type: 'success'
        },
        record: baseRecord.toJSON(currentAdmin)
      };

    return {
      record: baseRecord.toJSON(currentAdmin),
      notice: {
        message: translateMessage('thereWereValidationErrors'),
        type: 'error'
      }
    };
  }

  const { params } = record;
  // eslint-disable-next-line no-unused-vars
  const { subPages, ...restParams } = AdminBro.unflatten(params);
  const baseRecord = new AdminBro.BaseRecord(
    AdminBro.flatten(restParams),
    resource
  );

  return {
    record: baseRecord.toJSON(currentAdmin)
  };
};

const adminBroOptions = new AdminBro({
  resources: [
    {
      href: null,
      resource: ApplicationSettings,
      options: {
        parent: {
          name: 'Settings'
        },
        href: false,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      href: null,
      resource: ThirdPartyApiSettings,
      options: {
        parent: {
          name: 'Settings'
        },
        href: false,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Resource,
      options: {
        parent: mainParent,
        actions: {
          new: {
            actionType: 'resource',
            component: AdminBro.bundle('./actions/new/resource/components'),
            before: resourceValidator
          },
          edit: {
            actionType: 'record',
            component: AdminBro.bundle('./actions/edit/resource/components'),
            before: resourceValidator
          }
        },
        filterProperties: ['createdBy', 'name'],
        listProperties: ['name', 'attributes', 'allowedActions', 'createdBy']
      }
    },
    {
      resource: Privilege,
      options: {
        parent: mainParent,
        actions: {
          new: {
            actionType: 'resource',
            component: AdminBro.bundle('./actions/new/privilege/components'),
            before: privilegeValidator
          },
          edit: {
            actionType: 'record',
            component: AdminBro.bundle('./actions/edit/privilege/components'),
            before: privilegeValidator
          }
        },
        filterProperties: [
          'action',
          'allowAllAttributes',
          'createdBy',
          'name',
          'possession',
          'resource'
        ],
        listProperties: [
          'name',
          'resource',
          'attributes',
          'allowAllAttributes',
          'action',
          'possession',
          'createdBy'
        ]
      }
    },
    {
      resource: Role,
      options: {
        parent: mainParent,
        actions: {
          new: {
            actionType: 'resource',
            component: AdminBro.bundle('./actions/new/role/components'),
            before: roleValidator
          },
          edit: {
            actionType: 'record',
            component: AdminBro.bundle('./actions/edit/role/components'),
            before: roleValidator
          }
        },
        filterProperties: ['clientAccess', 'createdBy', 'name'],
        listProperties: [
          'name',
          'permissions',
          'allowThisTagsOnly',
          'authorizedOwnWebsites',
          'clientAccess',
          'createdBy',
          'updatedAt'
        ]
      }
    },
    {
      resource: Permissions,
      options: {
        ...permissionsConfig,
        actions: {
          list: {
            isVisible: false
          }
        },
        listProperties: [
          'name',
          'linkPortfolio',
          'purchasedLink',
          'contactPerson'
        ]
      }
    },
    {
      resource: User,
      options: {
        actions: {
          resendEmailActivation,
          edit: {
            actionType: 'record',
            handler: handleUpdateUser
          },
          delete: {
            actionType: 'record',
            handler: handleDeleteUser
          }
        },
        listProperties: [
          'firstName',
          'email',
          'isSysAdmin',
          'role',
          'lastLogin'
        ],
        filterProperties: [
          'firstName',
          'lastName',
          'email',
          'role',
          'isSysAdmin',
          'lastLogin',
          'createdAt',
          'lastTopup',
          'emailPreferences.subscribe',
          'emailPreferences.orderConfirmation',
          'emailPreferences.orderCompleted',
          'emailPreferences.suggestions',
          'emailPreferences.linkPublished',
          'emailPreferences.renewalReminder',
          'xeroContactId',
          'stripeCustomerId'
        ],
        showProperties: [
          'firstName',
          'lastName',
          'email',
          'role',
          'isSysAdmin',
          'lastLogin',
          'createdAt',
          'lastTopup',
          'totalTopupAmount',
          'availableCredits',
          'unexpendableCredits',
          'emailPreferences',
          'xeroContactId',
          'stripeCustomerId',
          'billingInformation'
        ],
        editProperties: [
          'firstName',
          'lastName',
          'email',
          'role',
          'isSysAdmin',
          'createdAt',
          'availableCredits',
          'unexpendableCredits',
          'emailPreferences',
          'xeroContactId',
          'stripeCustomerId',
          'billingInformation',
          'createdAt'
        ],
        parent: mainParent,
        properties: {
          email: { required: true, unique: true },
          firstName: { required: true },
          password: { isVisible: false },
          notifications: { isVisible: false },
          linkPortfolioColumn: { isVisible: false },
          browseLinkColumns: { isVisible: false },
          'billingInformation.country': {
            components: {
              edit: AdminBro.bundle('./components/CountrySelect')
            }
          },
          emailPreferences: 'Email Preference'
        }
      }
    },
    {
      resource: Notification,
      options: {
        parent: mainParent,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Ahrefs,
      options: {
        parent: resourcesParent,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Groups,
      options: {
        parent: resourcesParent,
        properties: {
          description: { type: 'textarea' }
        },
        filterProperties: ['name', 'companyName', 'createdBy'],
        listProperties: ['name', 'companyName', 'description', 'createdBy']
      }
    },
    {
      resource: OwnedWebsites,
      options: {
        parent: resourcesParent,
        properties: {
          description: { type: 'richtext' }
        },
        actions: {
          updateLinks,
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: LinkPortfolio,
      options: {
        parent: resourcesParent,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Link,
      options: {
        parent: resourcesParent,
        actions: {
          edit: {
            actionType: 'record',
            handler: handleLinkUpdate
          }
        },
        filterProperties: [
          'country.name',
          'createdBy',
          'Domain_Rating.data',
          'group',
          'isCompetitor',
          'language',
          'name',
          'ownedBy',
          'Ref_domains_Dofollow.data',
          'Refdomains.data',
          'spamScore',
          'Total_Keywords.data',
          'Total_Traffic.data',
          'url',
          'disableSitemapParser'
        ],
        listProperties: ['name', 'url', 'language', 'description', 'tags'],
        showProperties: [
          'name',
          'url',
          'protocol',
          'domain',
          'language',
          'banner',
          'description',
          'tags',
          'group',
          'keywords',
          'scrappedKeywords',
          'importantLinkTypes',
          'topCompetitors',
          'lastCronJob',
          'sitemapPath',
          'country',
          'Domain_Rating',
          'Total_Traffic',
          'Total_Keywords',
          'Ref_domains_Dofollow',
          'Refdomains',
          'IP',
          'backlinkLimit',
          'ownedWebsite',
          'ownedBy',
          'createdBy',
          'isCompetitor',
          'ignoredBacklinks',
          'spamScore',
          'quality',
          'powerPages',
          'IP',
          'backlinkLimit',
          'ownedWebsite',
          'ownedBy',
          'createdBy',
          'isCompetitor',
          'ignoredBacklinks',
          'spamScore',
          'quality',
          'powerPages',
          'websitePreference',
          'disableSitemapParser'
        ],
        editProperties: [
          'name',
          'url',
          'protocol',
          'domain',
          'language',
          'banner',
          'description',
          'tags',
          'group',
          'keywords',
          'scrappedKeywords',
          'importantLinkTypes',
          'topCompetitors',
          'lastCronJob',
          'sitemapPath',
          'country',
          'Domain_Rating',
          'Total_Traffic',
          'Total_Keywords',
          'Ref_domains_Dofollow',
          'Refdomains',
          'IP',
          'backlinkLimit',
          'ownedWebsite',
          'ownedBy',
          'createdBy',
          'isCompetitor',
          'ignoredBacklinks',
          'spamScore',
          'quality',
          'powerPages',
          'websitePreference',
          'disableSitemapParser',
          'focusPages'
        ]
      }
    },
    {
      resource: LinkMarket,
      options: {
        parent: resourcesParent,
        filterProperties: [
          'commission',
          'country',
          'createdBy',
          'Domain_Rating',
          'language',
          'link',
          'monitored',
          'name',
          'priceArticlePermanent',
          'priceOnIndexPage',
          'pricePerArticlePage',
          'pricePerSubPage',
          'pricesCurrency',
          'published',
          'Ref_domains_Dofollow',
          'Refdomains',
          'Total_Keywords',
          'Total_Traffic',
          'url'
        ],
        showProperties: [
          'link',
          'contactPerson',
          'tradeOnly',
          'pricesCurrency',
          'pricePerArticlePage',
          'pricePerSubPage',
          'priceOnIndexPage',
          'priceArticlePermanent',
          'published',
          'commission',
          'notes',
          'monitored',
          'createdBy'
        ],
        editProperties: [
          'link',
          'contactPerson',
          'tradeOnly',
          'pricesCurrency',
          'pricePerArticlePage',
          'pricePerSubPage',
          'priceOnIndexPage',
          'priceArticlePermanent',
          'published',
          'commission',
          'notes',
          'monitored',
          'createdBy'
        ],
        createProperties: [
          'link',
          'contactPerson',
          'tradeOnly',
          'pricesCurrency',
          'pricePerArticlePage',
          'pricePerSubPage',
          'priceOnIndexPage',
          'priceArticlePermanent',
          'published',
          'commission',
          'notes',
          'monitored',
          'createdBy'
        ],
        listProperties: [
          'name',
          'link',
          'contactPerson',
          'tradeOnly',
          'pricesCurrency',
          'pricePerArticlePage',
          'pricePerSubPage'
        ]
      },
      actions: {
        list: {}
      }
    },
    {
      resource: Orders,
      options: {
        parent: resourcesParent,
        filterProperties: [
          '_id',
          'status',
          'outreach',
          'createdBy',
          'isRead',
          'ignoreJustification'
        ],
        listProperties: [
          'status',
          'isRead',
          'items',
          'outreach',
          'createdBy',
          'ignoreJustification',
          'updatedAt'
        ],
        actions: {
          delete: {
            isVisible: false
          },
          show: {
            actionType: 'record',
            component: AdminBro.bundle('./actions/show/order/components')
          },
          edit: {
            actionType: 'record',
            component: AdminBro.bundle('./actions/edit/order/components'),
            before: orderValidator
          },
          new: {
            actionType: 'resource',
            component: AdminBro.bundle('./actions/new/order/components'),
            before: orderValidator
          }
        }
      }
    },
    {
      resource: PurchasedLink,
      options: {
        parent: resourcesParent,
        listProperties: [
          'linkTo',
          'linkFrom',
          'ownFullUrl',
          'linkFromUrl',
          'anchorText',
          'linkType',
          'publishDate',
          'endDate',
          'acquiredType',
          'totalPrice'
        ],
        filterProperties: [
          'linkTo',
          'linkFrom',
          'broker',
          'createdBy',
          'ownFullUrl',
          'linkFromUrl',
          'linkFromCleanUrl',
          'anchorText',
          'linkType',
          'endDate',
          'acquiredType',
          'publishDate',
          'totalPrice',
          'totalPriceInCurrency',
          'soldCurrencyType',
          'isPermanent',
          'linkFromStatus',
          'linkFromStatusClassifier',
          'ownLinkStatus',
          'ownLinkStatusClassifier',
          'ownLinkHrefOnLinkers',
          'linkFromAtagRel',
          'numberOfExternalLinks',
          'lastCronJob',
          'Link_From_Domain_Rating',
          'Link_From_Total_Traffic',
          'Link_From_Total_Keywords',
          'Link_From_Ref_domains_Dofollow',
          'Link_From_IP',
          'fromOrder'
        ],
        showProperties: [
          'linkTo',
          'linkFrom',
          'broker',
          'createdBy',
          'ownFullUrl',
          'linkFromUrl',
          'linkFromCleanUrl',
          'anchorText',
          'linkType',
          'endDate',
          'acquiredType',
          'publishDate',
          'totalPrice',
          'totalPriceInCurrency',
          'soldCurrencyType',
          'note',
          'isPermanent',
          'linkFromStatus',
          'linkFromStatusClassifier',
          'ownLinkStatus',
          'ownLinkStatusClassifier',
          'ownLinkHrefOnLinkers',
          'linkFromAtagRel',
          'numberOfExternalLinks',
          'lastCronJob',
          'Link_From_Domain_Rating',
          'Link_From_Total_Traffic',
          'Link_From_Total_Keywords',
          'Link_From_Ref_domains_Dofollow',
          'Link_From_IP',
          'fromOrder'
        ],
        editProperties: [
          'linkTo',
          'linkFrom',
          'broker',
          'createdBy',
          'ownFullUrl',
          'linkFromUrl',
          'linkFromCleanUrl',
          'anchorText',
          'linkType',
          'endDate',
          'acquiredType',
          'publishDate',
          'totalPrice',
          'totalPriceInCurrency',
          'soldCurrencyType',
          'isPermanent',
          'note',
          'linkFromStatus',
          'linkFromStatusClassifier',
          'ownLinkStatus',
          'ownLinkStatusClassifier',
          'ownLinkHrefOnLinkers',
          'linkFromAtagRel',
          'numberOfExternalLinks',
          'Link_From_Domain_Rating',
          'Link_From_Total_Traffic',
          'Link_From_Total_Keywords',
          'Link_From_Ref_domains_Dofollow',
          'Link_From_IP',
          'fromOrder'
        ],
        createProperties: [
          'linkTo',
          'linkFrom',
          'broker',
          'createdBy',
          'ownFullUrl',
          'linkFromUrl',
          'linkFromCleanUrl',
          'anchorText',
          'linkType',
          'endDate',
          'acquiredType',
          'publishDate',
          'totalPrice',
          'totalPriceInCurrency',
          'soldCurrencyType',
          'isPermanent',
          'note',
          'linkFromStatus',
          'linkFromStatusClassifier',
          'ownLinkStatus',
          'ownLinkStatusClassifier',
          'ownLinkHrefOnLinkers',
          'linkFromAtagRel',
          'numberOfExternalLinks',
          'Link_From_Domain_Rating',
          'Link_From_Total_Traffic',
          'Link_From_Total_Keywords',
          'Link_From_Ref_domains_Dofollow',
          'Link_From_IP',
          'fromOrder'
        ]
      }
    },
    {
      resource: Backlinks,
      options: {
        parent: resourcesParent,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Keywords,
      options: {
        parent: resourcesParent,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Tags,
      options: {
        parent: resourcesParent,
        filterProperties: ['name', 'createdBy']
      }
    },
    {
      resource: ContentLength,
      options: {
        parent: resourcesParent,
        filterProperties: ['title', 'displayTitle', 'price', 'length'],
        listProperties: ['title', 'displayTitle', 'price', 'length']
      }
    },
    {
      resource: ContactPerson,
      options: {
        parent: resourcesParent,
        filterProperties: ['fullName', 'email', 'skype', 'role', 'createdBy']
      }
    },
    {
      resource: Commission,
      options: {
        parent: resourcesParent,
        filterProperties: ['value']
      }
    },
    {
      resource: Features,
      options: {
        properties: {
          content: {
            type: 'richtext'
          }
        },
        parent: resourcesParent,
        listProperties: [
          'description',
          'featureType',
          'externalLink',
          'youtube',
          'why',
          'createdAt'
        ],
        editProperties: [
          'description',
          'featureType',
          'why',
          'content',
          'youtube',
          'externalLink'
        ]
      }
    },
    {
      resource: ScrappedKeywords,
      options: {
        parent: resourcesParent,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Pages,
      options: {
        parent: resourcesParent,
        actions: {
          list: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: Payments,
      options: {
        parent: mainParent,
        actions: {
          bulkDelete: { isVisible: false },
          delete: { isVisible: false },
          edit: { isVisible: false },
          new: { isVisible: false }
        },
        listProperties: [
          'type',
          'status',
          'paymentIntentId',
          'amount',
          'fee',
          'vat',
          'invoice',
          'invoiceNumber',
          'dueDate',
          'createdBy'
        ]
      }
    },
    {
      resource: ErrorLogger,
      options: {
        parent: monitorParent,
        filterProperties: [
          'type',
          'message',
          'user',
          'userAgent',
          'autoFixed',
          'isFrontend',
          'status',
          'resolved'
        ],
        listProperties: [
          'type',
          'message',
          'location',
          'user',
          'count',
          'status',
          'autoFixed',
          'isFrontend',
          'createdAt',
          'resolved'
        ],
        editProperties: ['resolved'],
        actions: {
          delete: {
            isVisible: false
          },
          edit: {
            isVisible: true
          },
          new: {
            isVisible: false
          }
        }
      }
    },
    {
      resource: ActivityLog,
      options: {
        parent: monitorParent,
        filterProperties: [
          'collectionType',
          'operation',
          'condition',
          'action',
          'responsibleUser',
          'restored',
          'createdAt'
        ],
        listProperties: [
          'createdAt',
          'collectionType',
          'operation',
          'action',
          'responsibleUser',
          'message',
          'restored'
        ],
        actions: {
          restore: restoreActivity,
          delete: {
            isVisible: false
          },
          edit: {
            isVisible: false
          },
          new: {
            isVisible: false
          }
        }
      }
    }
  ],
  pages: {
    applicationSettingsPage,
    thirdPartyApiSettingsPage
  },
  branding: {
    logo: '/img/link-builders-black.png',
    companyName: 'LinkBuilders',
    softwareBrothers: false,
    favicon: '/img/favicon.ico'
  },
  locale: {
    translations: {
      labels: {
        User: 'Users',
        OwnedWebsites: 'Owned Websites',
        Tags: 'Website Tags'
      },
      properties: {
        'emailPreferences.subscribe':
          'Subscribe (if disable user can not receive most emails)',
        'emailPreferences.orderConfirmation': 'Order Confirmation',
        'emailPreferences.orderCompleted': 'Order Completed',
        'emailPreferences.suggestions': 'Suggestions',
        'emailPreferences.linkPublished': 'Link Published',
        'emailPreferences.renewalReminder': 'Renewal Reminder',
        'billingInformation.company_name': 'Company Name',
        'billingInformation.billing_email': 'Billing Email',
        'billingInformation.address': 'Address',
        'billingInformation.zip_code': 'Zip Code',
        'billingInformation.city': 'City',
        'billingInformation.region': 'Region',
        'billingInformation.country': 'Country',
        'billingInformation.VAT_number': 'VAT Number',
        'billingInformation.CO_number': 'CO Number',
        'billingInformation.IBAN': 'IBAN',
        'billingInformation.BIC': 'BIC',
        'changes.reference': 'Reference',
        'changes.originalDoc': 'Original Doc',
        'changes.modifiedDoc': 'Modified Doc'
      }
      // messages: {
      //   loginWelcome: 'To link.builders admin panel!'
      // }
    }
  },
  dashboard: {
    component: AdminBro.bundle('./component')
  },

  rootPath: '/admin'
});

const adminBroAuthentication = {
  authenticate: (email, password) => {
    return new Promise(resolve => {
      User.authenticateUser(email, password, true)
        .then(user => {
          resolve(user);
        })
        .catch(err => {
          console.log(err);
          resolve(false);
        });
    });
  },
  cookiePassword: process.env.ADMIN_BRO_COOKIE_PASSWORD,
  defaultMessage: 'Welcome To LinkBuilders Admin Panel'
};

if (process.env.NODE_ENV === 'development') adminBroOptions.watch();

const router = AdminBroExpress.buildAuthenticatedRouter(
  adminBroOptions,
  adminBroAuthentication,
  null,
  {
    resave: true,
    cookie: {
      maxAge: 10 * 60 * 1000
    }
  }
);
module.exports = router;
