const { mainParent } = require('./mainConfigs');

const config = {
  parent: mainParent,
  properties: {
    name: {
      custom: {
        name: 'The MANE',
        label: 'THE NAME'
      }
    },

    'purchasedLinks.create': {
      name: 'Create'
    },
    'purchasedLinks.read': {
      name: 'Read'
    },
    'purchasedLinks.update': {
      name: 'Update'
    },
    'purchasedLinks.write': {
      name: 'write'
    },
    'purchasedLinks.delete': {
      name: 'Delete'
    }
  }
};

module.exports = config;
