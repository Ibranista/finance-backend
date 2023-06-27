import React, { useState, useEffect } from 'react';
import { ApiClient, flatten, unflatten } from 'admin-bro';
import {
  Text,
  Box,
  CheckBox,
  Label,
  Input,
  FormGroup,
  Button,
  Header,
  Loader,
  TextArea,
  MessageBox
} from '@admin-bro/design-system';
import Select from 'react-select';
import styled from 'styled-components';
import { ThirdPartyApiSettings } from '../../resources';
import { LANGUAGES } from '../../../../app/models/ContentOrder/constants';

const BoldLabel = styled(Label)`
  font-weight: 400;
  font-size: 1.05em;
`;

const XeroResourceSelector = ({
  options,
  mb,
  label,
  onChange,
  required = true,
  value
}) => (
  <FormGroup mb={mb}>
    <BoldLabel required={required}>{label}</BoldLabel>
    <Select
      value={options.find(option => option.value === value)}
      options={options}
      onChange={onChange}
      required={required}
    />
  </FormGroup>
);

const ThirdPartyApiSettingsPage = props => {
  const api = new ApiClient();

  // spacing
  const mb = 25;
  const mt = 35;

  const taxRateTypes = {
    EU: 'EU Tax Rate',
    NonEU: 'Non-EU Tax Rate',
    Malta: 'Malta Tax Rate'
  };

  // selector options
  const contentQualityOptions = [
    { label: 'raw', value: 'raw' },
    { label: 'standard', value: 'standard' },
    { label: 'business', value: 'business' }
  ];
  const keywordMatchOptions = ['exact', 'near'].map(option => ({
    label: option,
    value: option
  }));
  const languageOptions = LANGUAGES.map(({ code, name, country }) => ({
    label: `${name}${country ? ` (${country})` : ''}`,
    value: code
  }));

  const [gettingPageData, setGettingPageData] = useState(false);
  const [
    gettingThirdPartyApiSettings,
    setGettingThirdPartyApiSettings
  ] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [taxRates, setTaxRates] = useState([]);
  const [topContentSettings, setTopContentSettings] = useState({
    defaultLanguage: '',
    defaultQuality: 'raw',
    defaultWriterInstructions: '',
    defaultKeywordMatch: 'exact',
    useMetaTags: false,
    templateId: ''
  });
  const [xeroSettings, setXeroSettings] = useState({
    xeroAccounts: {
      directCost: {
        content: { accountID: null, code: null },
        link: { accountID: null, code: null }
      },
      prepayment: { accountID: null, code: null },
      sales: {
        content: { accountID: null, code: null },
        link: { accountID: null, code: null }
      },
      payment: {
        stripeAccount: { accountID: null, code: null },
        bankAccount: { accountID: null, code: null }
      }
    },
    xeroTaxRates: {
      expense: {
        EU: { taxType: null, amount: null },
        NonEU: { taxType: null, amount: null },
        Malta: { taxType: null, amount: null }
      },
      sales: {
        EU: { taxType: null, amount: null },
        NonEU: { taxType: null, amount: null },
        Malta: { taxType: null, amount: null }
      }
    }
  });
  const [recordId, setRecordId] = useState(null);
  const [savingTopContentSettings, setSavingTopContentSettings] = useState(
    false
  );
  const [topContentSettingsResult, setTopContentSettingsResult] = useState(
    null
  );
  const [savingXeroSettings, setSavingXeroSettings] = useState(false);
  const [xeroSettingsResult, setXeroSettingsResult] = useState(null);

  const accountSettings = () => [
    {
      label: 'Prepaid Income Account',
      value: xeroSettings.xeroAccounts.prepayment.accountID,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroAccounts: {
            ...xeroSettings.xeroAccounts,
            prepayment: {
              accountID: value,
              code: accounts.find(account => account.value === value).code
            }
          }
        })
    },
    {
      label: 'Link Sales Account',
      value: xeroSettings.xeroAccounts.sales.link.accountID,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroAccounts: {
            ...xeroSettings.xeroAccounts,
            sales: {
              ...xeroSettings.xeroAccounts.sales,
              link: {
                accountID: value,
                code: accounts.find(account => account.value === value).code
              }
            }
          }
        })
    },
    {
      label: 'Content Sales Account',
      value: xeroSettings.xeroAccounts.sales.content.accountID,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroAccounts: {
            ...xeroSettings.xeroAccounts,
            sales: {
              ...xeroSettings.xeroAccounts.sales,
              content: {
                accountID: value,
                code: accounts.find(account => account.value === value).code
              }
            }
          }
        })
    },
    {
      label: 'Direct Cost (Content) Account',
      value: xeroSettings.xeroAccounts.directCost.content.accountID,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroAccounts: {
            ...xeroSettings.xeroAccounts,
            directCost: {
              ...xeroSettings.xeroAccounts.directCost,
              content: {
                accountID: value,
                code: accounts.find(account => account.value === value).code
              }
            }
          }
        })
    },
    {
      label: 'Direct Cost (Link) Account',
      value: xeroSettings.xeroAccounts.directCost.link.accountID,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroAccounts: {
            ...xeroSettings.xeroAccounts,
            directCost: {
              ...xeroSettings.xeroAccounts.directCost,
              link: {
                accountID: value,
                code: accounts.find(account => account.value === value).code
              }
            }
          }
        })
    },
    {
      label: 'Stripe Account',
      value: xeroSettings.xeroAccounts.payment.stripeAccount.accountID,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroAccounts: {
            ...xeroSettings.xeroAccounts,
            payment: {
              ...xeroSettings.xeroAccounts.payment,
              stripeAccount: {
                accountID: value,
                code: accounts.find(account => account.value === value).code
              }
            }
          }
        })
    },
    {
      label: 'Bank Account',
      value: xeroSettings.xeroAccounts.payment.bankAccount.accountID,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroAccounts: {
            ...xeroSettings.xeroAccounts,
            payment: {
              ...xeroSettings.xeroAccounts.payment,
              bankAccount: {
                accountID: value,
                code: accounts.find(account => account.value === value).code
              }
            }
          }
        })
    }
  ];

  const expenseTaxRateSettings = () =>
    Object.keys(taxRateTypes).map(key => ({
      label: taxRateTypes[key],
      value: xeroSettings.xeroTaxRates.expense[key].taxType,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroTaxRates: {
            ...xeroSettings.xeroTaxRates,
            expense: {
              ...xeroSettings.xeroTaxRates.expense,
              [key]: {
                taxType: value,
                amount: taxRates.find(taxRate => taxRate.value === value).amount
              }
            }
          }
        })
    }));

  const salesTaxRateSettings = () =>
    Object.keys(taxRateTypes).map(key => ({
      label: taxRateTypes[key],
      value: xeroSettings.xeroTaxRates.sales[key].taxType,
      onChange: ({ value }) =>
        setXeroSettings({
          ...xeroSettings,
          xeroTaxRates: {
            ...xeroSettings.xeroTaxRates,
            sales: {
              ...xeroSettings.xeroTaxRates.sales,
              [key]: {
                taxType: value,
                amount: taxRates.find(taxRate => taxRate.value === value).amount
              }
            }
          }
        })
    }));

  const fetchApiSettings = () => {
    setGettingThirdPartyApiSettings(true);
    api
      .resourceAction({ resourceId: ThirdPartyApiSettings, actionName: 'list' })
      .then(({ data }) => {
        if (
          data.records &&
          Array.isArray(data.records) &&
          data.records.length
        ) {
          const thirdPartyApiSettings = unflatten(data.records[0].params);
          const {
            _id,
            defaultLanguage,
            defaultQuality,
            defaultWriterInstructions,
            defaultKeywordMatch,
            useMetaTags,
            templateId,
            xeroAccounts,
            xeroTaxRates
          } = thirdPartyApiSettings;

          setRecordId(_id);

          setTopContentSettings({
            ...topContentSettings,
            ...(defaultLanguage ? { defaultLanguage } : {}),
            ...(defaultQuality ? { defaultQuality } : {}),
            ...(defaultWriterInstructions ? { defaultWriterInstructions } : {}),
            ...(defaultKeywordMatch ? { defaultKeywordMatch } : {}),
            ...(useMetaTags ? { useMetaTags } : {}),
            ...(templateId ? { templateId } : {})
          });

          setXeroSettings({
            ...xeroSettings,
            ...(xeroAccounts && {
              xeroAccounts: {
                ...xeroSettings.xeroAccounts,
                ...xeroAccounts
              }
            }),
            ...(xeroTaxRates && {
              xeroTaxRates: {
                ...xeroSettings.xeroTaxRates,
                ...xeroTaxRates
              }
            })
          });
        }
      })
      .catch(console.error)
      .finally(() => setGettingThirdPartyApiSettings(false));
  };

  const fetchPageData = async () => {
    try {
      setGettingPageData(true);
      const response = await api.getPage({
        pageName: 'thirdPartyApiSettingsPage'
      });
      if (Array.isArray(response.data.accounts))
        setAccounts(
          response.data.accounts.map(account => ({
            code: account.code,
            label: account.name,
            value: account.accountID
          }))
        );
      if (Array.isArray(response.data.taxRates))
        setTaxRates(
          response.data.taxRates.map(taxRate => ({
            amount: taxRate.effectiveRate,
            label: `${taxRate.name} (${taxRate.displayTaxRate}%)`,
            value: taxRate.taxType
          }))
        );
    } catch (err) {
      console.error(err);
    } finally {
      setGettingPageData(false);
    }
  };

  const onTopContentSettingsSave = e => {
    const formData = new FormData();

    e.preventDefault();

    setSavingTopContentSettings(true);

    Object.keys(topContentSettings).forEach(key =>
      formData.append(key, topContentSettings[key])
    );

    api
      .recordAction({
        resourceId: ThirdPartyApiSettings,
        ...(recordId ? { recordId } : {}),
        actionName: recordId ? 'edit' : 'new',
        data: formData
      })
      .then(record => {
        const {
          _id,
          defaultLanguage,
          defaultQuality,
          defaultWriterInstructions,
          defaultKeywordMatch,
          useMetaTags
        } = unflatten(record.data.record.params);

        setTopContentSettings({
          defaultLanguage,
          defaultQuality,
          defaultWriterInstructions,
          defaultKeywordMatch,
          useMetaTags
        });

        setTopContentSettingsResult({
          message: 'Successfully updated Topcontent default settings',
          variant: 'success'
        });

        if (!recordId) setRecordId(_id);
      })
      .catch(err => {
        console.error(err);
        setTopContentSettingsResult({
          message:
            err.message || 'Failed to update Topcontent default settings',
          variant: 'error'
        });
      })
      .finally(() => {
        setSavingTopContentSettings(false);
      });
  };

  const onXeroSettingsSave = e => {
    const formData = new FormData();
    const values = flatten(xeroSettings);

    e.preventDefault();

    setSavingXeroSettings(true);

    Object.keys(values).forEach(key => formData.append(key, values[key]));

    api
      .recordAction({
        resourceId: ThirdPartyApiSettings,
        ...(recordId ? { recordId } : {}),
        actionName: recordId ? 'edit' : 'new',
        data: formData
      })
      .then(record => {
        const { _id, xeroAccounts, xeroTaxRates } = unflatten(
          record.data.record.params
        );

        setXeroSettings({
          xeroAccounts,
          xeroTaxRates
        });

        setXeroSettingsResult({
          message: 'Successfully updated Xero settings',
          variant: 'success'
        });

        if (!recordId) setRecordId(_id);
      })
      .catch(err => {
        console.error(err);
        setTopContentSettingsResult({
          message: err.message || 'Failed to update Xero settings',
          variant: 'error'
        });
      })
      .finally(() => {
        setSavingXeroSettings(false);
      });
  };

  useEffect(() => {
    fetchPageData();
    fetchApiSettings();
  }, []);

  return (
    <Box variant="grey">
      <Header.H3 textAlign={'center'}>Third Party Api Settings</Header.H3>
      <Text mb={mb} textAlign={'center'} color="grey">
        This page is intended to set third party api setting that will be
        applied for the application.
      </Text>
      <Box mb={mb} mx={[0, 0, mb]}>
        {topContentSettingsResult && (
          <MessageBox
            {...topContentSettingsResult}
            onCloseClick={() => setTopContentSettingsResult(null)}
          />
        )}
        {xeroSettingsResult && (
          <MessageBox
            {...xeroSettingsResult}
            onCloseClick={() => setXeroSettingsResult(null)}
          />
        )}
      </Box>
      {gettingThirdPartyApiSettings ? (
        <Loader />
      ) : (
        <Box
          flex
          flexDirection={['column', 'column', 'row']}
          justifyContent="space-around"
          variant="white"
        >
          <Box width={['100%', '100%', '45%']}>
            <Header.H4 textAlign={'center'}>Topcontent Settings</Header.H4>
            <Box
              as="form"
              onSubmit={onTopContentSettingsSave}
              display="flex"
              flexDirection="column"
            >
              <FormGroup mb={mb}>
                <BoldLabel>Default content quality</BoldLabel>
                <Select
                  value={contentQualityOptions.find(
                    option => option.value === topContentSettings.defaultQuality
                  )}
                  options={contentQualityOptions}
                  onChange={({ value }) =>
                    setTopContentSettings({
                      ...topContentSettings,
                      defaultQuality: value
                    })
                  }
                />
              </FormGroup>
              <FormGroup mb={mb}>
                <BoldLabel>Default content language</BoldLabel>
                <Select
                  value={languageOptions.find(
                    option =>
                      option.value === topContentSettings.defaultLanguage
                  )}
                  options={languageOptions}
                  onChange={({ value }) =>
                    setTopContentSettings({
                      ...topContentSettings,
                      defaultLanguage: value
                    })
                  }
                />
              </FormGroup>
              <FormGroup mb={mb}>
                <BoldLabel>Default keyword match</BoldLabel>
                <Select
                  value={keywordMatchOptions.find(
                    option =>
                      option.value === topContentSettings.defaultKeywordMatch
                  )}
                  options={keywordMatchOptions}
                  onChange={({ value }) =>
                    setTopContentSettings({
                      ...topContentSettings,
                      defaultKeywordMatch: value
                    })
                  }
                />
              </FormGroup>
              <FormGroup mb={mb}>
                <BoldLabel>Default writer instructions</BoldLabel>
                <TextArea
                  value={topContentSettings.defaultWriterInstructions}
                  onChange={e =>
                    setTopContentSettings({
                      ...topContentSettings,
                      defaultWriterInstructions: e.target.value
                    })
                  }
                  style={{ width: '100%' }}
                  rows={6}
                />
              </FormGroup>
              <FormGroup mb={mb}>
                <BoldLabel>Template Id</BoldLabel>
                <Input
                  value={topContentSettings.templateId}
                  onChange={e =>
                    setTopContentSettings({
                      ...topContentSettings,
                      templateId: e.target.value
                    })
                  }
                />
              </FormGroup>
              <FormGroup mb={mb}>
                <CheckBox
                  type={'checkbox'}
                  checked={topContentSettings.useMetaTags}
                  onChange={() =>
                    setTopContentSettings({
                      ...topContentSettings,
                      useMetaTags: !topContentSettings.useMetaTags
                    })
                  }
                />
                <BoldLabel inline>Enable Topcontent meta tags</BoldLabel>
                {topContentSettings.useMetaTags && (
                  <Text style={{ color: '#dc3545' }}>
                    Warning: This will increase the cost of content orders
                  </Text>
                )}
              </FormGroup>
              <Box mt={mt}>
                <Button
                  disabled={savingTopContentSettings}
                  variant="primary"
                  type="submit"
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
          <Box
            display={['none', 'none', 'block']}
            style={{ border: '1px solid rgb(234, 234, 234)' }}
          />
          <Box width={['100%', '100%', '45%']}>
            <Header.H4 textAlign={'center'}>Xero Settings</Header.H4>
            {gettingPageData || savingXeroSettings ? (
              <Loader />
            ) : (
              <Box
                as="form"
                onSubmit={onXeroSettingsSave}
                display="flex"
                flexDirection="column"
              >
                <Header.H5>Accounts</Header.H5>
                {accountSettings().map(option => (
                  <XeroResourceSelector
                    options={accounts}
                    mb={mb}
                    {...option}
                  />
                ))}
                <Header.H5>Tax Rates</Header.H5>
                <Header.H5>Sales Tax Rates</Header.H5>
                {salesTaxRateSettings().map(option => (
                  <XeroResourceSelector
                    options={taxRates}
                    mb={mb}
                    {...option}
                  />
                ))}
                <Header.H5>Expense Tax Rates</Header.H5>
                {expenseTaxRateSettings().map(option => (
                  <XeroResourceSelector
                    options={taxRates}
                    mb={mb}
                    {...option}
                  />
                ))}
                <Box mt={mt}>
                  <Button
                    disabled={savingXeroSettings}
                    variant="primary"
                    type="submit"
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ThirdPartyApiSettingsPage;
