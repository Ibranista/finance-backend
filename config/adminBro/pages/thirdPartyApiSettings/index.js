const AdminBro = require('admin-bro');
const xero = require('../../../../app/utils/xero');

const thirdPartyApiSettings = {
  label: 'Third Party API settings',
  component: AdminBro.bundle('./components'),
  handler: async () => {
    const accounts = (await xero.getAccounts({})).body.accounts;
    const taxRates = (await xero.getTaxRates({})).body.taxRates;
    return { accounts, taxRates };
  }
};

module.exports = thirdPartyApiSettings;
