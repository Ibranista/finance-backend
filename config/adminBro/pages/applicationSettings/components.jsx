/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import { ApiClient, flat } from 'admin-bro';
import {
  Box,
  Button,
  FormGroup,
  Header,
  Text,
  Label,
  Input,
  Loader,
  CheckBox
} from '@admin-bro/design-system';

import { MultiSelector, optionConstants } from './selectorOptions';
import CronjobSetting from './cronjobSetting';
import { ApplicationSettings } from '../../resources';

const PaymentInput = ({
  defaultValue,
  index,
  loading,
  step = 0.01,
  subTitle,
  title,
  value,
  onChange,
  onSave
}) => (
  <Box>
    <Box marginTop={`${index ? 3 : 0}rem`} marginBottom="10px">
      <Header.H5>{title}</Header.H5>
      <Text color="grey">{subTitle}</Text>
    </Box>
    {loading ? (
      <Loader />
    ) : (
      <Box flex flexDirection="row" justifyContent="space-between">
        <Input
          type="number"
          step={step}
          isLoading={loading}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
        />
        <Button onClick={onSave}> Save</Button>
      </Box>
    )}
  </Box>
);

const api = new ApiClient();
const ApplicationSettingsComponent = () => {
  const [recordId, setRecordId] = useState(null);
  const [settingCheckerState, setSettingCheckerState] = useState({
    ahref: false,
    field: false,
    sitemap: false,
    backlink: false,
    keywordScraper: false,
    renewal: false,
    renewalReminder: false
  });
  const [loading, setLoading] = useState({
    ahref: false,
    filed: false,
    sitemap: false,
    backlink: false,
    keywordScraper: false,
    priorityPages: false,
    excludeKeywords: false,
    excludeTags: false,
    renewal: false,
    defaultMinTopup: false,
    stripeFlatFee: false,
    stripePercentageFee: false,
    wireTransferPaymentDuration: false,
    maltaTaxRate: false
  });
  const [ahrefCronJob, setAhrefCronJob] = useState({
    frequency: optionConstants.MONTHLY,
    date: '1',
    day: '',
    hour: '3'
  });
  const [fieldCheckerCronJob, setFieldCheckerCronJob] = useState({
    frequency: optionConstants.MONTHLY,
    date: '1',
    day: '',
    hour: '3'
  });
  const [sitemapCheckerCronJob, setSitemapCheckerCronJob] = useState({
    frequency: optionConstants.MONTHLY,
    date: '1',
    day: '',
    hour: '3'
  });

  const [backlinkFetcherCronJob, setBacklinkFetcherCronJob] = useState({
    frequency: optionConstants.MONTHLY,
    date: '1',
    day: '',
    hour: '3'
  });

  const [renewalCronJob, setRenewalCronJob] = useState({
    frequency: optionConstants.MONTHLY,
    date: '1',
    day: '',
    hour: '3'
  });

  const [keywordScraperCronJob, setKeywordScraperCronJob] = useState({
    frequency: optionConstants.QUARTERLY,
    date: '1',
    day: '',
    hour: '3',
    month: '*/3'
  });

  const [keywordScraperSettings, setKeywordScraperSettings] = useState({
    priorityPages: [],
    excludeTags: [],
    excludeKeywords: [],
    topRelatedKeywordsLimit: 100,
    keywordScraperCrawlDepth: 2000,
    keywordsToScrapePerSite: 25,
    keywordScrapperConcurrentRequestsLimit: 8
  });

  const [linkSuggestionErrorMargins, setLinkSuggestionErrorMargins] = useState({
    DR: 0,
    Traffic: 0,
    priceOnIndexPage: 0,
    pricePerArticlePage: 0,
    pricePerSubPage: 0,
    priceArticlePermanent: 0
  });

  const [paymentSettings, setPaymentSettings] = useState({
    defaultMinTopup: null,
    stripeFlatFee: null,
    stripePercentageFee: null,
    wireTransferPaymentDuration: null,
    maltaTaxRate: null
  });

  const [
    linkSuggestionSpacingFactor,
    setLinkSuggestionSpacingFactor
  ] = useState(0);
  const [
    linkSuggestionDropFeedTimeSpan,
    setLinkSuggestionDropFeedTimeSpan
  ] = useState(0);
  const [
    ignoredSuggestionQuarantineDays,
    setIgnoredSuggestionQuarantineDays
  ] = useState(0);
  const [declineQuarantineDays, setDeclineQuarantineDays] = useState(0);

  const [renewalSettings, setRenewalSettings] = useState({
    showUpcomingRenewalUntil: 11,
    daysRemainingBeforeEndDateForAutoRenewal: 30
  });
  const renewalSettingLabel = [
    'Show Upcoming Renewals Until (in month)',
    'Auto Renewal Link Before EndDate (in days)'
  ];

  useEffect(() => {
    api
      .resourceAction({ resourceId: ApplicationSettings, actionName: 'list' })
      .then(results => {
        if (
          results.data.records &&
          Array.isArray(results.data.records) &&
          results.data.records.length > 0
        ) {
          const cronjobState = results.data.records[0].params;
          setRecordId(cronjobState._id);
          setSettingCheckerState({
            ...settingCheckerState,
            ahref: cronjobState.ahrefCronjobEnabled,
            field: cronjobState.filedCronjobEnabled,
            sitemap: cronjobState.sitemapCronjobEnabled,
            backlink: cronjobState.backlinkCronjobEnabled,
            keywordScraper: cronjobState.keywordScraperCronjobEnabled,
            renewal: cronjobState.autoRenewalCronjobEnabled,
            renewalReminder: cronjobState.renewalReminderCronjobEnabled
          });
          setAhrefCronJob({
            ...ahrefCronJob,
            frequency: cronjobState.ahrefFrequency || optionConstants.MONTHLY,
            date: cronjobState.ahrefDate || '1',
            day: cronjobState.ahrefDay || '',
            hour: cronjobState.ahrefHour || '3'
          });
          setFieldCheckerCronJob({
            ...fieldCheckerCronJob,
            frequency: cronjobState.fieldFrequency || optionConstants.MONTHLY,
            date: cronjobState.fieldDate || '1',
            day: cronjobState.fieldDay || '',
            hour: cronjobState.fieldHour || '3'
          });
          setSitemapCheckerCronJob({
            ...sitemapCheckerCronJob,
            frequency: cronjobState.sitemapFrequency || optionConstants.MONTHLY,
            date: cronjobState.sitemapDate || '1',
            day: cronjobState.sitemapDay || '',
            hour: cronjobState.sitemapHour || '3'
          });
          setBacklinkFetcherCronJob({
            ...backlinkFetcherCronJob,
            frequency:
              cronjobState.backlinkFrequency || optionConstants.MONTHLY,
            date: cronjobState.backlinkDate || '1',
            day: cronjobState.backlinkDay || '',
            hour: cronjobState.backlinkHour || '3'
          });
          setRenewalCronJob({
            ...renewalCronJob,
            frequency:
              cronjobState.autoRenewalFrequency || optionConstants.MONTHLY,
            date: cronjobState.autoRenewalDate || '1',
            day: cronjobState.autoRenewalDay || '',
            hour: cronjobState.autoRenewalHour || '3'
          });
          setRenewalSettings({
            ...renewalSettings,
            showUpcomingRenewalUntil: cronjobState.showUpcomingRenewalUntil,
            daysRemainingBeforeEndDateForAutoRenewal:
              cronjobState.daysRemainingBeforeEndDateForAutoRenewal
          });
          setKeywordScraperCronJob({
            ...keywordScraperCronJob,
            frequency:
              cronjobState.keywordScraperFrequency || optionConstants.QUARTERLY,
            date: cronjobState.keywordScraperDate || '1',
            day: cronjobState.keywordScraperDay || '',
            hour: cronjobState.keywordScraperHour || '3',
            month: cronjobState.keywordScraperMonth || '*/3'
          });
          setKeywordScraperSettings({
            ...keywordScraperSettings,
            priorityPages: cronjobState.keywordScraperPriorityPages || [],
            excludeTags: cronjobState.keywordScraperExcludeTags || [],
            excludeKeywords: cronjobState.keywordScraperExcludeKeywords || [],
            topRelatedKeywordsLimit:
              cronjobState.topRelatedKeywordsLimit || 100,
            keywordScraperCrawlDepth:
              cronjobState.keywordScraperCrawlDepth || 2000,
            keywordsToScrapePerSite: cronjobState.keywordsToScrapePerSite || 25,
            keywordScrapperConcurrentRequestsLimit:
              cronjobState.keywordScrapperConcurrentRequestsLimit || 8
          });
          setLinkSuggestionErrorMargins({
            DR:
              (cronjobState.linkSuggestionErrorMargins &&
                cronjobState.linkSuggestionErrorMargins.DR) ||
              5,
            Traffic:
              (cronjobState.linkSuggestionErrorMargins &&
                cronjobState.linkSuggestionErrorMargins.Traffic) ||
              500,
            priceOnIndexPage:
              (cronjobState.linkSuggestionErrorMargins &&
                cronjobState.linkSuggestionErrorMargins.priceOnIndexPage) ||
              50,
            pricePerArticlePage:
              (cronjobState.linkSuggestionErrorMargins &&
                cronjobState.linkSuggestionErrorMargins.pricePerArticlePage) ||
              50,
            pricePerSubPage:
              (cronjobState.linkSuggestionErrorMargins &&
                cronjobState.linkSuggestionErrorMargins.pricePerSubPage) ||
              50,
            priceArticlePermanent:
              (cronjobState.linkSuggestionErrorMargins &&
                cronjobState.linkSuggestionErrorMargins
                  .priceArticlePermanent) ||
              50
          });
          setLinkSuggestionSpacingFactor(
            cronjobState.linkSuggestionSpacingFactor || 0
          );
          setLinkSuggestionDropFeedTimeSpan(
            cronjobState.linkSuggestionDropFeedTimeSpan || 0
          );
          setIgnoredSuggestionQuarantineDays(
            cronjobState.ignoredSuggestionQuarantineDays || 0
          );
          setDeclineQuarantineDays(cronjobState.declineQuarantineDays || 0);
          setPaymentSettings({
            defaultMinTopup: cronjobState.defaultMinTopup || 100,
            stripeFlatFee:
              typeof cronjobState.stripeFlatFee === 'number'
                ? cronjobState.stripeFlatFee
                : 0.3,
            stripePercentageFee:
              typeof cronjobState.stripePercentageFee === 'number'
                ? cronjobState.stripePercentageFee
                : 2.9,
            wireTransferPaymentDuration:
              cronjobState.wireTransferPaymentDuration || 2,
            maltaTaxRate: cronjobState.maltaTaxRate || 18
          });
        }
      })
      .catch(err => {
        console.log('err', err);
      });
  }, []);

  const onAhrefCronjobSettingSave = () => {
    const form = new FormData();
    form.append('ahrefCronjobEnabled', settingCheckerState.ahref);
    form.append('ahrefDate', ahrefCronJob.date);
    form.append('ahrefDay', ahrefCronJob.day);
    form.append('ahrefHour', ahrefCronJob.hour);
    form.append('ahrefFrequency', ahrefCronJob.frequency);
    setLoading({ ...loading, ahref: true });
    api
      .recordAction({
        resourceId: ApplicationSettings,
        recordId: `${recordId}`,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, ahref: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, ahref: false });
      });
  };
  const onFieldCronjobSettingSave = () => {
    const form = new FormData();
    form.append('filedCronjobEnabled', settingCheckerState.field);
    form.append('fieldDate', fieldCheckerCronJob.date);
    form.append('fieldDay', fieldCheckerCronJob.day);
    form.append('fieldHour', fieldCheckerCronJob.hour);
    form.append('fieldFrequency', fieldCheckerCronJob.frequency);
    setLoading({ ...loading, filed: true });
    api
      .recordAction({
        resourceId: ApplicationSettings,
        recordId: `${recordId}`,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, filed: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, filed: false });
      });
  };
  const onSitemapjobSettingfSave = () => {
    const form = new FormData();
    form.append('sitemapCronjobEnabled', settingCheckerState.sitemap);
    form.append('sitemapDay', sitemapCheckerCronJob.day);
    form.append('sitemapDate', sitemapCheckerCronJob.date);
    form.append('sitemapHour', sitemapCheckerCronJob.hour);
    form.append('sitemapFrequency', sitemapCheckerCronJob.frequency);
    setLoading({ ...loading, sitemap: true });
    api
      .recordAction({
        resourceId: ApplicationSettings,
        recordId: `${recordId}`,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, sitemap: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, sitemap: false });
      });
  };

  const onBacklinkFetcherJobSave = () => {
    const form = new FormData();
    form.append('backlinkCronjobEnabled', settingCheckerState.backlink);
    form.append('backlinkDay', backlinkFetcherCronJob.day);
    form.append('backlinkDate', backlinkFetcherCronJob.date);
    form.append('backlinkHour', backlinkFetcherCronJob.hour);
    form.append('backlinkFrequency', backlinkFetcherCronJob.frequency);
    setLoading({ ...loading, backlink: true });

    api
      .recordAction({
        resourceId: 'ApplicationSettings',
        recordId,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, backlink: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, backlink: false });
      });
  };

  const onRenewalCronJobSave = () => {
    const form = new FormData();
    form.append('autoRenewalCronjobEnabled', settingCheckerState.renewal);
    form.append('autoRenewalDay', renewalCronJob.day);
    form.append('autoRenewalDate', renewalCronJob.date);
    form.append('autoRenewalHour', renewalCronJob.hour);
    form.append('autoRenewalFrequency', renewalCronJob.frequency);
    form.append(
      'renewalReminderCronjobEnabled',
      settingCheckerState.renewalReminder
    );
    setLoading({ ...loading, renewal: true });
    api
      .recordAction({
        resourceId: 'ApplicationSettings',
        recordId,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, renewal: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, renewal: false });
      });
  };

  const onKeywordScraperJobSave = () => {
    const form = new FormData();
    form.append(
      'keywordScraperCronjobEnabled',
      settingCheckerState.keywordScraper
    );
    form.append('keywordScraperDay', keywordScraperCronJob.day);
    form.append('keywordScraperMonth', keywordScraperCronJob.month);
    form.append('keywordScraperDate', keywordScraperCronJob.date);
    form.append('keywordScraperHour', keywordScraperCronJob.hour);
    form.append('keywordScraperFrequency', keywordScraperCronJob.frequency);
    setLoading({ ...loading, keywordScraper: true });

    api
      .recordAction({
        resourceId: 'ApplicationSettings',
        recordId,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, keywordScraper: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, keywordScraper: false });
      });
  };

  const onLinkSuggestionSettingsSave = () => {
    const form = new FormData();
    Object.keys(linkSuggestionErrorMargins).forEach(key => {
      form.append(
        `linkSuggestionErrorMargins.${key}`,
        linkSuggestionErrorMargins[key]
      );
    });
    form.append('linkSuggestionSpacingFactor', linkSuggestionSpacingFactor);
    form.append(
      'linkSuggestionDropFeedTimeSpan',
      linkSuggestionDropFeedTimeSpan
    );
    form.append(
      'ignoredSuggestionQuarantineDays',
      ignoredSuggestionQuarantineDays
    );
    form.append('declineQuarantineDays', declineQuarantineDays);

    setLoading({ ...loading, linkSuggestion: true });
    return api
      .recordAction({
        resourceId: 'ApplicationSettings',
        recordId,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, linkSuggestion: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, linkSuggestion: false });
      });
  };
  const onRenewalSettingSave = () => {
    const form = new FormData();
    Object.keys(renewalSettings).forEach(key => {
      form.append(key, renewalSettings[key]);
    });
    setLoading({ ...loading, renewal: true });
    return api
      .recordAction({
        resourceId: 'ApplicationSettings',
        recordId,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, renewal: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, renewal: false });
      });
  };

  const onKeywordScraperSettingsSave = async () => {
    const form = new FormData();

    const nonEmptyPriorityPages = keywordScraperSettings.priorityPages.filter(
      page => !!page
    );
    if (nonEmptyPriorityPages.length > 0) {
      nonEmptyPriorityPages.forEach(
        (page, index) =>
          page && form.append(`keywordScraperPriorityPages.${index}`, page)
      );
    } else {
      form.append('keywordScraperPriorityPages', []);
    }

    const nonEmptyExcludeTags = keywordScraperSettings.excludeTags.filter(
      tag => !!tag
    );
    if (nonEmptyExcludeTags.length > 0) {
      nonEmptyExcludeTags.forEach(
        (tag, index) =>
          tag && form.append(`keywordScraperExcludeTags.${index}`, tag)
      );
    } else {
      form.append('keywordScraperExcludeTags', []);
    }

    const nonEmptyExcludeKeywords = keywordScraperSettings.excludeKeywords.filter(
      keyword => !!keyword
    );
    if (nonEmptyExcludeKeywords.length > 0) {
      nonEmptyExcludeKeywords.forEach(
        (keyword, index) =>
          keyword &&
          form.append(`keywordScraperExcludeKeywords.${index}`, keyword)
      );
    } else {
      form.append('keywordScraperExcludeKeywords', []);
    }

    form.append('keywordScraperEnabled', keywordScraperSettings.enabled);
    form.append(
      'topRelatedKeywordsLimit',
      keywordScraperSettings.topRelatedKeywordsLimit || 100
    );
    form.append(
      'keywordScraperCrawlDepth',
      keywordScraperSettings.keywordScraperCrawlDepth || 2000
    );
    form.append(
      'keywordsToScrapePerSite',
      keywordScraperSettings.keywordsToScrapePerSite || 25
    );
    form.append(
      'keywordScrapperConcurrentRequestsLimit',
      keywordScraperSettings.keywordScrapperConcurrentRequestsLimit || 8
    );

    setLoading({ ...loading, keywordScraperSettings: true });
    return api
      .recordAction({
        resourceId: 'ApplicationSettings',
        recordId,
        actionName: 'edit',
        data: form
      })
      .then(() => {
        setLoading({ ...loading, keywordScraperSettings: false });
      })
      .catch(err => {
        console.log('err', err);
        setLoading({ ...loading, keywordScraperSettings: false });
      });
  };

  const onPaymentSettingsSave = async () => {
    const form = new FormData();
    const defaultMinTopup = paymentSettings.defaultMinTopup;
    const stripeFlatFee = paymentSettings.stripeFlatFee;
    const stripePercentageFee = paymentSettings.stripePercentageFee;
    const wireTransferPaymentDuration =
      paymentSettings.wireTransferPaymentDuration;
    const maltaTaxRate = paymentSettings.maltaTaxRate;

    if (defaultMinTopup) form.append('defaultMinTopup', defaultMinTopup);
    if (stripeFlatFee) form.append('stripeFlatFee', stripeFlatFee);
    if (stripePercentageFee)
      form.append('stripePercentageFee', stripePercentageFee);
    if (wireTransferPaymentDuration)
      form.append('wireTransferPaymentDuration', wireTransferPaymentDuration);
    if (maltaTaxRate) form.append('maltaTaxRate', maltaTaxRate);

    return api
      .recordAction({
        resourceId: 'ApplicationSettings',
        recordId,
        actionName: 'edit',
        data: form
      })
      .catch(err => {
        console.log('err', err);
      });
  };

  const frequencyChangeHandler = event => {
    switch (event.target.name) {
      case 'ahref':
        if (event.target.value === optionConstants.WEEKLY) {
          setAhrefCronJob({
            ...ahrefCronJob,
            frequency: event.target.value,
            date: '',
            day: '0'
          });
        } else if (event.target.value === optionConstants.MONTHLY) {
          setAhrefCronJob({
            ...ahrefCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        } else if (event.target.value === optionConstants.DAYLY) {
          setAhrefCronJob({
            ...ahrefCronJob,
            frequency: event.target.value,
            date: '',
            day: '',
            hour: '3'
          });
        } else {
          setAhrefCronJob({
            ...ahrefCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        }
        break;
      case 'field':
        if (event.target.value === optionConstants.WEEKLY) {
          setFieldCheckerCronJob({
            ...fieldCheckerCronJob,
            frequency: event.target.value,
            date: '',
            day: '0'
          });
        } else if (event.target.value === optionConstants.MONTHLY) {
          setFieldCheckerCronJob({
            ...fieldCheckerCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        } else if (event.target.value === optionConstants.DAYLY) {
          setFieldCheckerCronJob({
            ...fieldCheckerCronJob,
            frequency: event.target.value,
            date: '',
            day: '',
            hour: '3'
          });
        } else {
          setFieldCheckerCronJob({
            ...fieldCheckerCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        }
        break;
      case 'sitemap':
        if (event.target.value === optionConstants.WEEKLY) {
          setSitemapCheckerCronJob({
            ...sitemapCheckerCronJob,
            frequency: event.target.value,
            date: '',
            day: '0'
          });
        } else if (event.target.value === optionConstants.MONTHLY) {
          setSitemapCheckerCronJob({
            ...sitemapCheckerCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        } else if (event.target.value === optionConstants.DAYLY) {
          setSitemapCheckerCronJob({
            ...sitemapCheckerCronJob,
            frequency: event.target.value,
            date: '',
            day: '',
            hour: '3'
          });
        } else {
          setSitemapCheckerCronJob({
            ...sitemapCheckerCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        }
        break;
      case 'backlink':
        if (event.target.value === optionConstants.WEEKLY) {
          setBacklinkFetcherCronJob({
            ...backlinkFetcherCronJob,
            frequency: event.target.value,
            date: '',
            day: '0'
          });
        } else if (event.target.value === optionConstants.MONTHLY) {
          setBacklinkFetcherCronJob({
            ...backlinkFetcherCronJob({
              frequency: event.target.value,
              date: '1',
              day: ''
            })
          });
        } else if (event.target.value === optionConstants.DAYLY) {
          setBacklinkFetcherCronJob({
            ...backlinkFetcherCronJob,
            frequency: event.target.value,
            date: '',
            day: '',
            hour: '3'
          });
        } else {
          setBacklinkFetcherCronJob({
            ...backlinkFetcherCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        }
        break;
      case 'renewal':
        if (event.target.value === optionConstants.WEEKLY) {
          setRenewalCronJob({
            ...renewalCronJob,
            frequency: event.target.value,
            date: '',
            day: '0'
          });
        } else if (event.target.value === optionConstants.MONTHLY) {
          setRenewalCronJob({
            ...renewalCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        } else if (event.target.value === optionConstants.DAYLY) {
          setRenewalCronJob({
            ...renewalCronJob,
            frequency: event.target.value,
            date: '',
            day: '',
            hour: '3'
          });
        } else {
          setRenewalCronJob({
            ...renewalCronJob,
            frequency: event.target.value,
            date: '1',
            day: ''
          });
        }
        break;
      case 'keywordScraper':
        setKeywordScraperCronJob({
          ...keywordScraperCronJob,
          frequency: event.target.value
        });
    }
  };
  const dayChangeHandler = event => {
    switch (event.target.name) {
      case 'ahref':
        setAhrefCronJob({ ...ahrefCronJob, day: event.target.value });
        break;
      case 'field':
        setFieldCheckerCronJob({
          ...fieldCheckerCronJob,
          day: event.target.value
        });
        break;
      case 'sitemap':
        setSitemapCheckerCronJob({
          ...sitemapCheckerCronJob,
          day: event.target.value
        });
        break;
      case 'backlink':
        setBacklinkFetcherCronJob({
          ...backlinkFetcherCronJob,
          day: event.target.value
        });
        break;
      case 'keywordScraper':
        setKeywordScraperCronJob({
          ...keywordScraperCronJob,
          day: event.target.value
        });
    }
  };
  const dateChangeHandler = event => {
    switch (event.target.name) {
      case 'ahref':
        setAhrefCronJob({ ...ahrefCronJob, date: event.target.value });
        break;
      case 'field':
        setFieldCheckerCronJob({
          ...fieldCheckerCronJob,
          date: event.target.value
        });
        break;
      case 'sitemap':
        setSitemapCheckerCronJob({
          ...sitemapCheckerCronJob,
          date: event.target.value
        });
        break;
      case 'backlink':
        setBacklinkFetcherCronJob({
          ...backlinkFetcherCronJob,
          date: event.target.value
        });
        break;
      case 'renewal':
        setRenewalCronJob({
          ...renewalCronJob,
          date: event.target.value
        });
        break;
      case 'keywordScraper':
        setKeywordScraperCronJob({
          ...keywordScraperCronJob,
          date: event.target.value
        });
        break;
    }
  };
  const hourChangeHandler = event => {
    switch (event.target.name) {
      case 'ahref':
        setAhrefCronJob({ ...ahrefCronJob, hour: event.target.value });
        break;
      case 'field':
        setFieldCheckerCronJob({
          ...fieldCheckerCronJob,
          hour: event.target.value
        });
        break;
      case 'sitemap':
        setSitemapCheckerCronJob({
          ...sitemapCheckerCronJob,
          hour: event.target.value
        });
        break;
      case 'backlink':
        setBacklinkFetcherCronJob({
          ...backlinkFetcherCronJob,
          hour: event.target.value
        });
        break;
      case 'renewal':
        setRenewalCronJob({
          ...renewalCronJob,
          hour: event.target.value
        });
        break;
      case 'keywordScraper':
        setKeywordScraperCronJob({
          ...keywordScraperCronJob,
          hour: event.target.value
        });
        break;
    }
  };

  const dayly_weekly_monthly_filter = trigger =>
    [
      optionConstants.DAYLY,
      optionConstants.WEEKLY,
      optionConstants.MONTHLY
    ].includes(trigger.value);

  const onPriorityPagesChange = priorityPages =>
    setKeywordScraperSettings({
      ...keywordScraperSettings,
      priorityPages
    });

  const onPriorityPagesSave = async () => {
    setLoading({ ...loading, priorityPages: true });
    await onKeywordScraperSettingsSave()
      .then(() => {
        setLoading({ ...loading, priorityPages: false });
      })
      .catch(err => {
        console.log(err);
        setLoading({ ...loading, priorityPages: false });
      });
  };

  const onExcludeTagsChange = excludeTags =>
    setKeywordScraperSettings({
      ...keywordScraperSettings,
      excludeTags
    });

  const onExcludeTagsSave = async () => {
    setLoading({ ...loading, excludeTags: true });
    await onKeywordScraperSettingsSave()
      .then(() => {
        setLoading({ ...loading, excludeTags: false });
      })
      .catch(err => {
        console.log(err);
        setLoading({ ...loading, excludeTags: false });
      });
  };

  const onExcludeKeywordsChange = excludeKeywords =>
    setKeywordScraperSettings({
      ...keywordScraperSettings,
      excludeKeywords
    });

  const onExcludeKeywordsSave = async () => {
    setLoading({ ...loading, excludeKeywords: true });
    await onKeywordScraperSettingsSave()
      .then(() => {
        setLoading({ ...loading, excludeKeywords: false });
      })
      .catch(() => {
        setLoading({ ...loading, excludeKeywords: false });
      });
  };

  const onTopRelatedKeywordsLimitChange = event => {
    setKeywordScraperSettings({
      ...keywordScraperSettings,
      topRelatedKeywordsLimit: event.target.value
    });
  };

  const onKeywordScraperCrawlDepthChange = event => {
    setKeywordScraperSettings({
      ...keywordScraperSettings,
      keywordScraperCrawlDepth: event.target.value
    });
  };

  const onKeywordsToScrapePerSiteChange = event => {
    setKeywordScraperSettings({
      ...keywordScraperSettings,
      keywordsToScrapePerSite: event.target.value
    });
  };

  const onKeywordScraperConcurrentRequestsChange = event => {
    setKeywordScraperSettings({
      ...keywordScraperSettings,
      keywordScrapperConcurrentRequestsLimit: event.target.value
    });
  };

  const onLinkSuggestionErrorMarginsChange = field => {
    return event => {
      setLinkSuggestionErrorMargins({
        ...linkSuggestionErrorMargins,
        [field]: event.target.value
      });
    };
  };

  const onLinkSuggestionSpacingFactorChange = event => {
    setLinkSuggestionSpacingFactor(event.target.value);
  };

  const onLinkSuggestionDropFeedTimeSpanChange = event => {
    setLinkSuggestionDropFeedTimeSpan(event.target.value);
  };

  const onIgnoredSuggestionQuarantineDaysChange = event => {
    setIgnoredSuggestionQuarantineDays(event.target.value);
  };

  const onDeclineQuarantineDaysChange = event => {
    setDeclineQuarantineDays(event.target.value);
  };

  const onRenewalSettingChange = field => {
    return event => {
      setRenewalSettings({
        ...renewalSettings,
        [field]: event.target.value
      });
    };
  };

  const onDefaultMinTopupChange = event =>
    setPaymentSettings({
      ...paymentSettings,
      defaultMinTopup: event.target.value
    });

  const onDefaultMinTopupSave = async () => {
    setLoading({ ...loading, defaultMinTopup: true });
    await onPaymentSettingsSave()
      .then(() => {
        setLoading({ ...loading, defaultMinTopup: false });
      })
      .catch(err => {
        console.log(err);
        setLoading({ ...loading, defaultMinTopup: false });
      });
  };

  const onStripeFlatFeeChange = event =>
    setPaymentSettings({
      ...paymentSettings,
      stripeFlatFee: event.target.value
    });

  const onStripeFlatFeeSave = async () => {
    setLoading({ ...loading, stripeFlatFee: true });
    await onPaymentSettingsSave()
      .catch(console.log)
      .finally(() => setLoading({ ...loading, stripeFlatFee: false }));
  };

  const onStripePercentageFeeChange = event =>
    setPaymentSettings({
      ...paymentSettings,
      stripePercentageFee: event.target.value
    });

  const onStripePercentageFeeSave = async () => {
    setLoading({ ...loading, stripePercentageFee: true });
    await onPaymentSettingsSave()
      .catch(console.log)
      .finally(() => setLoading({ ...loading, stripePercentageFee: false }));
  };

  const onWireTransferPaymentDurationChange = event =>
    setPaymentSettings({
      ...paymentSettings,
      wireTransferPaymentDuration: event.target.value
    });

  const onWireTransferPaymentDurationSave = async () => {
    setLoading({ ...loading, wireTransferPaymentDuration: true });
    await onPaymentSettingsSave()
      .catch(console.log)
      .finally(() =>
        setLoading({ ...loading, wireTransferPaymentDuration: false })
      );
  };

  const onMaltaTaxRateChange = event =>
    setPaymentSettings({
      ...paymentSettings,
      maltaTaxRate: event.target.value
    });

  const onMaltaTaxRateSave = async () => {
    setLoading({ ...loading, maltaTaxRate: true });
    await onPaymentSettingsSave()
      .catch(console.log)
      .finally(() => setLoading({ ...loading, maltaTaxRate: false }));
  };

  return (
    <Box variant="grey">
      <Box p={'10px !important'}>
        <Header.H3 textAlign={'center'} style={{ marginBottom: '10px' }}>
          Application Settings
        </Header.H3>
        <Text textAlign={'center'} color="grey" fontSize={16} fontWeight="bold">
          This page is inteded to set a global application setting that will be
          applied for the application
        </Text>
      </Box>
      <Header.H4>Cronjob Settings</Header.H4>
      <CronjobSetting
        id="ahref"
        title="Ahref API Settings"
        isLoading={loading.ahref}
        changeHandler={() =>
          setSettingCheckerState({
            ...settingCheckerState,
            ahref: !settingCheckerState.ahref
          })
        }
        enable={settingCheckerState.ahref}
        enableLabel="Enable Ahref Api"
        cronJob={ahrefCronJob}
        frequencyChangeHandler={frequencyChangeHandler}
        dayChangeHandler={dayChangeHandler}
        dateChangeHandler={dateChangeHandler}
        hourChangeHandler={hourChangeHandler}
        cronTimeFilter={dayly_weekly_monthly_filter}
        onSave={onAhrefCronjobSettingSave}
      />
      <CronjobSetting
        id="field"
        title="Field status shecker settings"
        isLoading={loading.filed}
        changeHandler={() =>
          setSettingCheckerState({
            ...settingCheckerState,
            field: !settingCheckerState.field
          })
        }
        enable={settingCheckerState.field}
        enableLabel="Enable Field status shecker"
        cronJob={fieldCheckerCronJob}
        frequencyChangeHandler={frequencyChangeHandler}
        dayChangeHandler={dayChangeHandler}
        dateChangeHandler={dateChangeHandler}
        hourChangeHandler={hourChangeHandler}
        cronTimeFilter={dayly_weekly_monthly_filter}
        onSave={onFieldCronjobSettingSave}
      />
      <CronjobSetting
        id="sitemap"
        title="Sitemap status checker setting"
        isLoading={loading.sitemap}
        changeHandler={() =>
          setSettingCheckerState({
            ...settingCheckerState,
            sitemap: !settingCheckerState.sitemap
          })
        }
        enable={settingCheckerState.sitemap}
        enableLabel="Enable sitemap status shecker"
        cronJob={sitemapCheckerCronJob}
        frequencyChangeHandler={frequencyChangeHandler}
        dayChangeHandler={dayChangeHandler}
        dateChangeHandler={dateChangeHandler}
        hourChangeHandler={hourChangeHandler}
        cronTimeFilter={dayly_weekly_monthly_filter}
        onSave={onSitemapjobSettingfSave}
      />
      <CronjobSetting
        id="backlink"
        title="Backlink fetcher settings"
        isLoading={loading.backlink}
        changeHandler={() =>
          setSettingCheckerState({
            ...settingCheckerState,
            backlink: !settingCheckerState.backlink
          })
        }
        enable={settingCheckerState.backlink}
        enableLabel="Enable Backlink fetcher "
        cronJob={backlinkFetcherCronJob}
        frequencyChangeHandler={frequencyChangeHandler}
        dayChangeHandler={dayChangeHandler}
        dateChangeHandler={dateChangeHandler}
        hourChangeHandler={hourChangeHandler}
        cronTimeFilter={dayly_weekly_monthly_filter}
        onSave={onBacklinkFetcherJobSave}
      />
      <CronjobSetting
        id="keywordScraper"
        title="Keyword scraper settings"
        isLoading={loading.keywordScraper}
        changeHandler={() =>
          setSettingCheckerState({
            ...settingCheckerState,
            keywordScraper: !settingCheckerState.keywordScraper
          })
        }
        enable={settingCheckerState.keywordScraper}
        enableLabel="Enable Keyword scraper"
        cronJob={keywordScraperCronJob}
        frequencyChangeHandler={frequencyChangeHandler}
        dayChangeHandler={dayChangeHandler}
        dateChangeHandler={dateChangeHandler}
        hourChangeHandler={hourChangeHandler}
        cronTimeFilter={trigger =>
          [
            optionConstants.MONTHLY,
            optionConstants.QUARTERLY,
            optionConstants.SEMI_ANNUALLY,
            optionConstants.YEARLY
          ].includes(trigger.value)
        }
        onSave={onKeywordScraperJobSave}
      />
      <CronjobSetting
        id="renewal"
        title="Renewal Settings"
        isLoading={loading.renewal}
        changeHandler={() =>
          setSettingCheckerState({
            ...settingCheckerState,
            renewal: !settingCheckerState.renewal
          })
        }
        enable={settingCheckerState.renewal}
        enableLabel="Enable Renewal Cronjob"
        cronJob={renewalCronJob}
        frequencyChangeHandler={frequencyChangeHandler}
        dayChangeHandler={dayChangeHandler}
        dateChangeHandler={dateChangeHandler}
        hourChangeHandler={hourChangeHandler}
        cronTimeFilter={dayly_weekly_monthly_filter}
        onSave={onRenewalCronJobSave}
      />

      <Box variant="white" mt="-4rem" pl={'3.4rem !important'}>
        <CheckBox
          title="Enable Renewal Reminder"
          label="Send Renewal Reminder"
          checked={settingCheckerState.renewalReminder}
          onChange={() => {
            setSettingCheckerState({
              ...settingCheckerState,
              renewalReminder: !settingCheckerState.renewalReminder
            });
          }}
        />
        <Label inline ml="default">
          Send Renewal Reminder
        </Label>
      </Box>
      <Header.H4>Renewal settings</Header.H4>
      <Box variant="white" p={'10px !important'}>
        {Object.keys(renewalSettings).map((key, index) => (
          <FormGroup key={index}>
            <Label>{renewalSettingLabel[index]}</Label>
            <Input
              type="number"
              value={renewalSettings[key]}
              onChange={onRenewalSettingChange(key)}
            />
          </FormGroup>
        ))}
        <Box flex alignItems="flex-end" justifyContent="flex-end" width="100%">
          <Button type="submit" onClick={onRenewalSettingSave}>
            {loading.renewal ? <Loader style={{ height: '10px' }} /> : 'Save'}
          </Button>
        </Box>
      </Box>
      <Header.H4>Link suggestion settings</Header.H4>
      <Box variant="white" p={'10px !important'}>
        {Object.keys(linkSuggestionErrorMargins).map((key, index) => (
          <FormGroup key={index}>
            <Label>Keyword scraper error margin {key}</Label>
            <Input
              type="number"
              value={linkSuggestionErrorMargins[key]}
              onChange={onLinkSuggestionErrorMarginsChange(key)}
            />
          </FormGroup>
        ))}
        <FormGroup>
          <Label>Link suggestion publish date spacing factor</Label>
          <Input
            type="number"
            value={linkSuggestionSpacingFactor}
            onChange={onLinkSuggestionSpacingFactorChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Link suggestion drop feed range</Label>
          <Input
            type="number"
            value={linkSuggestionDropFeedTimeSpan}
            onChange={onLinkSuggestionDropFeedTimeSpanChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Ignored Link Suggestion Quarantine Days</Label>
          <Input
            type="number"
            value={ignoredSuggestionQuarantineDays}
            onChange={onIgnoredSuggestionQuarantineDaysChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Declined Link Suggestion Quarantine Days</Label>
          <Input
            type="number"
            value={declineQuarantineDays}
            onChange={onDeclineQuarantineDaysChange}
          />
        </FormGroup>
        <Box flex alignItems="flex-end" justifyContent="flex-end" width="100%">
          <Button type="submit" onClick={onLinkSuggestionSettingsSave}>
            {loading.linkSuggestion ? (
              <Loader style={{ height: '10px' }} />
            ) : (
              'Save'
            )}
          </Button>
        </Box>
      </Box>
      <Header.H4>Keyword scraper settings</Header.H4>
      <Box variant="white" p={'10px !important'}>
        <FormGroup>
          <Label>Top related keywords limit</Label>
          <Input
            type="number"
            value={keywordScraperSettings.topRelatedKeywordsLimit}
            onChange={onTopRelatedKeywordsLimitChange}
          />
        </FormGroup>
        <FormGroup>
          <Label> Keyword Scraper Crawl Depth</Label>
          <Input
            type="number"
            value={keywordScraperSettings.keywordScraperCrawlDepth}
            onChange={onKeywordScraperCrawlDepthChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Keywords to scrape per site</Label>
          <Input
            type="number"
            value={keywordScraperSettings.keywordsToScrapePerSite}
            onChange={onKeywordsToScrapePerSiteChange}
          />
        </FormGroup>
        <FormGroup>
          <Label>Keyword Scraper Concurrent Requests</Label>
          <Input
            type="number"
            value={keywordScraperSettings.keywordScraperConcurrentRequests}
            onChange={onKeywordScraperConcurrentRequestsChange}
          />
        </FormGroup>
        <Box flex alignItems="flex-end" justifyContent="flex-end" width="100%">
          <Button type="submit" onClick={onKeywordScraperSettingsSave}>
            {loading.keywordScraperSettings ? (
              <Loader style={{ height: '10px' }} />
            ) : (
              'Save'
            )}
          </Button>
        </Box>
      </Box>
      <Box variant="white" p={'10px !important'}>
        <MultiSelector
          title="Priority Pages"
          placeholder="Enter priority pages"
          isLoading={loading.priorityPages}
          initialValue={keywordScraperSettings.priorityPages}
          onChange={onPriorityPagesChange}
          onSave={onPriorityPagesSave}
        />
      </Box>
      <Box variant="white" p={'10px !important'}>
        <MultiSelector
          title="Exclude Tags"
          placeholder="Enter tags to exclude"
          isLoading={loading.excludeTags}
          initialValue={keywordScraperSettings.excludeTags}
          onChange={onExcludeTagsChange}
          onSave={onExcludeTagsSave}
        />
      </Box>
      <Box variant="white" p={'10px !important'}>
        <MultiSelector
          title="Exclude Keywords"
          placeholder="Enter keywords to exclude"
          isLoading={loading.excludeKeywords}
          initialValue={keywordScraperSettings.excludeKeywords}
          onChange={onExcludeKeywordsChange}
          onSave={onExcludeKeywordsSave}
        />
      </Box>
      <Box>
        <Header.H4 style={{ marginTop: '2rem' }}>Payment Settings</Header.H4>
        <Box>
          <Box variant="white" pl="10px" pr="20px">
            {[
              {
                title: 'Default Minimum Top Up',
                subTitle:
                  'Minimum top up amounts can be defined on a role basis but this will be used as a fallback value if left empty.',
                loading: loading.defaultMinTopup,
                value: paymentSettings.defaultMinTopup,
                onChange: onDefaultMinTopupChange,
                onSave: onDefaultMinTopupSave
              },
              {
                title: 'Stripe Flat Fee',
                subTitle:
                  'Stripe charges a flat fee of 30¢. In case Stripe introduces changes to their policy, you can change it here.',
                loading: loading.stripeFlatFee,
                value: paymentSettings.stripeFlatFee,
                onChange: onStripeFlatFeeChange,
                onSave: onStripeFlatFeeSave
              },
              {
                title: 'Stripe Percentage Fee',
                subTitle:
                  'Stripe charges a percentage fee of 2.9%. In case Stripe introduces changes to their policy, you can change it here.',
                loading: loading.stripePercentageFee,
                value: paymentSettings.stripePercentageFee,
                onChange: onStripePercentageFeeChange,
                onSave: onStripePercentageFeeSave
              },
              {
                title: 'Bank Transfer Payment Duration',
                subTitle:
                  'The number of days a user should complete a credit top up using bank transfer payment.',
                loading: loading.wireTransferPaymentDuration,
                step: 1,
                value: paymentSettings.wireTransferPaymentDuration,
                onChange: onWireTransferPaymentDurationChange,
                onSave: onWireTransferPaymentDurationSave
              },
              {
                title: 'Malta Tax Rate',
                loading: loading.maltaTaxRate,
                value: paymentSettings.maltaTaxRate,
                onChange: onMaltaTaxRateChange,
                onSave: onMaltaTaxRateSave
              }
            ].map((paymentSetting, index) => (
              <PaymentInput index={index} {...paymentSetting} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
export default ApplicationSettingsComponent;
