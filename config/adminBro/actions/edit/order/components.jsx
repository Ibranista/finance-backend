/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import {
  Box,
  Button,
  CheckBox,
  DatePicker,
  FormGroup,
  Icon,
  Input,
  Label,
  Section,
  Text
} from '@admin-bro/design-system';
import Select from 'react-select';
import { ApiClient, BasePropertyComponent, flat, useRecord } from 'admin-bro';
import { LinkMarket, Links, Keywords } from '../../../resources';

const EditOrder = ({ record: initialRecord, resource }) => {
  const history = useHistory();

  const [errors, setErrors] = useState({});

  const [editProperties] = useState(
    resource.editProperties.reduce(
      (editProperties, property) => ({
        ...editProperties,
        [property.name]: property
      }),
      {}
    )
  );
  const [items] = useState(flat.unflatten(initialRecord.params).items);

  const { record, submit, handleChange, setRecord } = useRecord(
    initialRecord,
    resource.id
  );

  const [formValues, setFormValues] = useState({
    ...record.params,
    items
  });

  const [populatedItemValues] = useState(
    flat.unflatten(record.populated).items
  );

  const contentlessLinkTypes = ['Index', 'Subpage'];

  const [mb] = useState(35);

  const initialItemValues = {
    articleTitle: '',
    commission: 0,
    contentLength: {
      title: '',
      price: '',
      length: ''
    },
    contentOrder: {
      language: '',
      min_length: 5,
      focus_keyword: '',
      status: 'Not Started',
      sub_keywords: [],
      tone_of_voice: ''
    },
    createdAt: '',
    filePath: '',
    ignoreJustification: '',
    isPermanent: false,
    linkFromUrl: '',
    linkPrice: 0,
    linkText: '',
    linkType: '',
    marketLink: '',
    publishDate: '',
    requests: '',
    status: 'Pending',
    subPage: '',
    website: ''
  };

  const handleAddNewItem = e => {
    e.preventDefault();
    // to remove error colored item fields when the first item is added after submit error
    if (errors.items) {
      const { items, ...rest } = errors;
      setErrors({ rest });
    }
    const newValues = { ...formValues };
    newValues.items.push(initialItemValues);
    Object.keys(initialItemValues).map(
      key =>
        (newValues[`items.${newValues.items.length - 1}.${key}`] =
          initialItemValues[key])
    );
    setRecord({ ...record, params: newValues });
  };

  const handleDeleteItem = (e, index) => {
    e.preventDefault();
    const newValues = { ...formValues };
    newValues.items.splice(index, 1);
    Object.keys(initialItemValues).map(
      key => delete newValues[`items.${index}.${key}`]
    );
    setRecord({ ...record, params: newValues });
  };

  // select field option values
  const itemSubPropterties = resource.editProperties.find(
    OrderProperty => OrderProperty.propertyPath === 'items'
  ).subProperties;

  const itemStatusOptions = itemSubPropterties.find(
    itemProperty => itemProperty.propertyPath === 'items.status'
  ).availableValues;

  const itemLinkTypeOptions = itemSubPropterties.find(
    itemProperty => itemProperty.propertyPath === 'items.linkType'
  ).availableValues;

  const contentLanguageOptions =
    itemSubPropterties
      .find(itemProperty => itemProperty.propertyPath === 'items.contentOrder')
      .subProperties.find(
        contentSubProps =>
          contentSubProps.propertyPath === 'items.contentOrder.language'
      ).availableValues || [];

  const contentStatusOptions =
    itemSubPropterties
      .find(itemProperty => itemProperty.propertyPath === 'items.contentOrder')
      .subProperties.find(
        contentSubProps =>
          contentSubProps.propertyPath === 'items.contentOrder.status'
      ).availableValues || [];

  const [subKeywordOptions, setSubKeywordOptions] = useState([]);

  const [itemMarketLinkOptions, setItemMarketLinkOptions] = useState([]);

  const [itemWebsiteOptions, setItemWebsiteOptions] = useState([]);

  // non-enum select field option fetch and search handlers
  const api = new ApiClient();

  const handleFetchMarketLinks = () => {
    api
      .resourceAction({
        resourceId: LinkMarket,
        actionName: 'list?perPage=20'
      })
      .then(({ data }) => {
        const marketLinkOptions = data.records.map(({ title, id }) =>
          title
            ? {
                label: title,
                value: id
              }
            : {
                label: null,
                value: null
              }
        );
        items.forEach((item, index) => {
          marketLinkOptions.find(
            option => option.value && option.value === item.marketLink
          )
            ? null
            : marketLinkOptions.push({
                label: populatedItemValues[index].marketLink.title,
                value: populatedItemValues[index].marketLink.id
              });
        });
        setItemMarketLinkOptions(marketLinkOptions);
      });
  };

  const handleFetchLinks = () => {
    api
      .resourceAction({
        resourceId: Links,
        actionName: 'list?perPage=20'
      })
      .then(({ data }) => {
        const websiteOptions = data.records.map(({ title, id }) =>
          title
            ? {
                label: title,
                value: id
              }
            : {
                label: null,
                value: null
              }
        );
        items.forEach((item, index) => {
          websiteOptions.find(
            option => option.value && option.value === item.marketLink
          )
            ? null
            : websiteOptions.push({
                label: populatedItemValues[index].website.title,
                value: populatedItemValues[index].website.id
              });
        });
        setItemWebsiteOptions(websiteOptions);
      });
  };

  const handleFetchKeywords = () => {
    api
      .resourceAction({
        resourceId: Keywords,
        actionName: 'list?perPage=20'
      })
      .then(({ data }) => {
        let keywordOptions = data.records.map(({ title, id }) =>
          title
            ? {
                label: title,
                value: title
              }
            : {
                label: null,
                value: null
              }
        );
        items.forEach(item => {
          item.contentOrder &&
            Array.isArray(item.contentOrder.sub_keywords) &&
            item.contentOrder.sub_keywords.length > 0 &&
            (keywordOptions.find(
              option =>
                option.value &&
                item.contentOrder.sub_keywords.includes(option.value)
            )
              ? null
              : (keywordOptions = [
                  ...keywordOptions,
                  ...item.contentOrder.sub_keywords.map(subKeyword => {
                    return { label: subKeyword, value: subKeyword };
                  })
                ]));
        });
        setSubKeywordOptions(keywordOptions);
      });
  };

  const handleSearchKeywords = value => {
    // first rendition to be redone
    api
      .searchRecords({
        resourceId: Keywords,
        query: value
      })
      .then(res => {
        return res.map(optionRecord => ({
          value: optionRecord.title,
          label: optionRecord.title
          // record: optionRecord
        }));
      })
      .then(optionValues => {
        let options = [...optionValues];
        if (!subKeywordOptions[0].value.includes(value))
          options.unshift({ value, label: value });
        options[0] = { value, label: value };
        setSubKeywordOptions(options);
      });
  };

  const handleSearchMarketLink = searchValue => {
    api
      .searchRecords({
        resourceId: LinkMarket,
        query: searchValue
      })
      .then(res => {
        return res.map(optionRecord => ({
          value: optionRecord.id,
          label: optionRecord.title
          // record: optionRecord
        }));
      })
      .then(optionValues => setItemMarketLinkOptions(optionValues));
  };

  const handleSearchLinks = searchValue => {
    api
      .searchRecords({
        resourceId: Links,
        query: searchValue
      })
      .then(res => {
        return res.map(optionRecord => ({
          value: optionRecord.id,
          label: optionRecord.title
          // record: optionRecord
        }));
      })
      .then(optionValues => setItemWebsiteOptions(optionValues));
  };

  useEffect(() => {
    handleFetchMarketLinks();
    handleFetchLinks();
    handleFetchKeywords();
  }, []);

  const handleAddingContentOrder = () => {
    const initialContentOrders = {
      language: '',
      min_length: 0,
      focus_keyword: '',
      sub_keywords: [],
      title: '',
      tone_of_voice: '',
      source_url: '',
      status: 'Not Started'
    };
    const newItems = flat.unflatten(initialRecord.params).items;

    newItems.forEach((item, index) => {
      if (!item.contentOrder)
        newItems[index].contentOrder = initialContentOrders;
    });
    setRecord({
      ...record,
      params: flat.flatten({ ...record.params, items: newItems })
    });
    setFormValues({ ...formValues, items: newItems });
  };

  useEffect(() => {
    handleAddingContentOrder();
  }, []);

  useEffect(() => {
    if (Array.isArray(formValues.items)) {
      formValues.items.forEach((item, index) => {
        if (
          (item.linkType === 'Article' || item.isPermanent) &&
          (!item.publishDateStart || !item.publishDateEnd)
        ) {
          // substracts 3 days for the publish date start and adds 4 days for the publish date end
          const publishDateStart = new Date(item.publishDate);
          publishDateStart.setDate(publishDateStart.getDate() - 3);
          const publishDateEnd = new Date(item.publishDate);
          publishDateEnd.setDate(publishDateEnd.getDate() + 4);
          handleChange(
            `items.${index}.publishDateStart`,
            publishDateStart.toISOString()
          );
          handleChange(
            `items.${index}.publishDateEnd`,
            publishDateEnd.toISOString()
          );
        }
      });
    }
  }, [formValues.items]);

  const handleSubmit = e => {
    e.preventDefault();
    submit().then(res => {
      const { redirectUrl, record } = res.data;
      const { errors } = record;
      if (errors && Object.keys(errors).length > 0) setErrors(errors);
      if (redirectUrl) history.push(redirectUrl);
    });
    return false;
  };

  return (
    <Box overflowY="hidden" variant="grey">
      <Box
        width="100%"
        as="form"
        flex
        flexGrow={1}
        onSubmit={handleSubmit}
        flexDirection="column"
        variant="white"
      >
        <BasePropertyComponent
          where="edit"
          resource={resource}
          record={record}
          onChange={handleChange}
          property={resource.properties.status}
        />

        <BasePropertyComponent
          where="edit"
          resource={resource}
          record={record}
          onChange={handleChange}
          property={resource.properties.isRead}
        />
        <FormGroup error={errors && errors.items && errors.items.message}>
          <Label>{resource.properties.items.label}</Label>
          <Section mb={mb}>
            {formValues.items &&
              formValues.items.map((item, index) => (
                <Box key={index} width="100%" flex flexDirection="row">
                  <Box width="95%" mb={mb} key={index}>
                    <Label>{`[${index + 1}]`}</Label>
                    <Section>
                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.status`] &&
                          errors[`items.${index}.status`]
                        }
                      >
                        <Label>
                          {resource.properties['items.status'].label}
                        </Label>
                        <Select
                          value={itemStatusOptions.find(
                            itemOption => itemOption.value === item.status
                          )}
                          options={itemStatusOptions}
                          onChange={({ value }) => {
                            const newOption = [...formValues.items];
                            newOption[index].status = value;
                            setFormValues({
                              ...formValues,
                              items: newOption
                            });
                            handleChange(`items.${index}.status`, value);
                          }}
                        />
                        {errors && errors[`items.${index}.status`] && (
                          <Text>{errors[`items.${index}.status`].message}</Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.linkText`] &&
                          errors[`items.${index}.linkText`]
                        }
                      >
                        <Label>
                          {resource.properties['items.linkText'].label}
                        </Label>
                        <Input
                          value={item.linkText}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].linkText = e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.linkText`,
                              e.target.value
                            );
                          }}
                        />
                        {errors && errors[`items.${index}.linkText`] && (
                          <Text>
                            {errors[`items.${index}.linkText`].message}
                          </Text>
                        )}
                      </FormGroup>

                      {!item.isPermanent && (
                        <FormGroup
                          mb={mb}
                          error={
                            errors &&
                            errors[`items.${index}.linkType`] &&
                            errors[`items.${index}.linkType`]
                          }
                        >
                          <Label>
                            {resource.properties['items.linkType'].label}
                          </Label>
                          <Select
                            value={itemLinkTypeOptions.find(
                              linkTypeOption =>
                                linkTypeOption.value === item.linkType
                            )}
                            onChange={({ value }) => {
                              const newOption = [...formValues.items];
                              newOption[index].linkType = value;
                              setFormValues({
                                ...formValues,
                                items: newOption
                              });
                              handleChange(`items.${index}.linkType`, value);
                            }}
                            options={itemLinkTypeOptions}
                          />
                          {errors && errors[`items.${index}.linkType`] && (
                            <Text>
                              {errors[`items.${index}.linkType`].message}
                            </Text>
                          )}
                        </FormGroup>
                      )}

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.publishDate`] &&
                          errors[`items.${index}.publishDate`]
                        }
                      >
                        <Label>
                          {resource.properties['items.publishDate'].label}
                        </Label>
                        <DatePicker
                          value={item.publishDate}
                          onChange={value => {
                            const newOption = [...formValues.items];
                            newOption[index].publishDate = value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(`items.${index}.publishDate`, value);
                          }}
                        />
                        {errors && errors[`items.${index}.publishDate`] && (
                          <Text>
                            {errors[`items.${index}.publishDate`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.isPermanent`] &&
                          errors[`items.${index}.isPermanent`]
                        }
                      >
                        <Label>
                          {resource.properties['items.isPermanent'].label}
                        </Label>
                        <CheckBox
                          checked={item.isPermanent}
                          onChange={() => {
                            const newOption = [...formValues.items];
                            newOption[index].isPermanent = !newOption[index]
                              .isPermanent;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.isPermanent`,
                              !record.params[`items.${index}.isPermanent`]
                            );
                          }}
                        />
                        {errors && errors[`items.${index}.isPermanent`] && (
                          <Text>
                            {errors[`items.${index}.isPermanent`].message}
                          </Text>
                        )}
                      </FormGroup>

                      {!item.filePath && (
                        <FormGroup
                          mb={mb}
                          error={
                            errors &&
                            errors[`items.${index}.articleTitle`] &&
                            errors[`items.${index}.articleTitle`]
                          }
                        >
                          <Label>
                            {resource.properties['items.articleTitle'].label}
                          </Label>
                          <Input
                            value={item.articleTitle}
                            onChange={e => {
                              const newOption = [...formValues.items];
                              newOption[index].articleTitle = e.target.value;
                              setFormValues({
                                ...formValues,
                                items: newOption
                              });
                              handleChange(
                                `items.${index}.articleTitle`,
                                e.target.value
                              );
                            }}
                          />
                          {errors && errors[`items.${index}.articleTitle`] && (
                            <Text>
                              {errors[`items.${index}.articleTitle`].message}
                            </Text>
                          )}
                        </FormGroup>
                      )}

                      {!contentlessLinkTypes.includes(item.linkType) && (
                        <>
                          <FormGroup
                            mb={mb}
                            error={
                              errors &&
                              errors[`items.${index}.contentLength.title`] &&
                              errors[`items.${index}.contentLength.title`]
                            }
                          >
                            <Label>
                              {
                                resource.properties['items.contentLength.title']
                                  .label
                              }
                            </Label>
                            <Input
                              value={
                                item.contentLength && item.contentLength.title
                              }
                              onChange={e => {
                                const newOption = [...formValues.items];
                                newOption[index].contentLength.title =
                                  e.target.value;
                                setFormValues({
                                  ...formValues,
                                  items: newOption
                                });
                                handleChange(
                                  `items.${index}.contentLength.title`,
                                  e.target.value
                                );
                              }}
                            />
                            {errors &&
                              errors[`items.${index}.contentLength.title`] && (
                                <Text>
                                  {
                                    errors[`items.${index}.contentLength.title`]
                                      .message
                                  }
                                </Text>
                              )}
                          </FormGroup>
                          <FormGroup
                            mb={mb}
                            error={
                              errors &&
                              errors[`items.${index}.contentLength.price`] &&
                              errors[`items.${index}.contentLength.price`]
                            }
                          >
                            <Label>
                              {
                                resource.properties['items.contentLength.price']
                                  .label
                              }
                            </Label>
                            <Input
                              type="number"
                              min={0}
                              value={
                                item.contentLength && item.contentLength.price
                              }
                              onChange={e => {
                                const newOption = [...formValues.items];
                                newOption[index].contentLength.price =
                                  e.target.value;
                                setFormValues({
                                  ...formValues,
                                  items: newOption
                                });
                                handleChange(
                                  `items.${index}.contentLength.price`,
                                  e.target.value
                                );
                              }}
                            />
                            {errors &&
                              errors[`items.${index}.contentLength.price`] && (
                                <Text>
                                  {
                                    errors[`items.${index}.contentLength.price`]
                                      .message
                                  }
                                </Text>
                              )}
                          </FormGroup>
                          <FormGroup
                            mb={mb}
                            error={
                              errors &&
                              errors[`items.${index}.contentLength.length`] &&
                              errors[`items.${index}.contentLength.length`]
                            }
                          >
                            <Label>
                              {
                                resource.properties[
                                  'items.contentLength.length'
                                ].label
                              }
                            </Label>
                            <Input
                              type="number"
                              min={5}
                              value={
                                item.contentLength && item.contentLength.length
                              }
                              onChange={e => {
                                const newOption = [...formValues.items];
                                newOption[index].contentLength.length =
                                  e.target.value;
                                setFormValues({
                                  ...formValues,
                                  items: newOption
                                });
                                handleChange(
                                  `items.${index}.contentLength.length`,
                                  e.target.value
                                );
                              }}
                            />
                            {errors &&
                              errors[`items.${index}.contentLength.length`] && (
                                <Text>
                                  {
                                    errors[
                                      `items.${index}.contentLength.length`
                                    ].message
                                  }
                                </Text>
                              )}
                          </FormGroup>
                        </>
                      )}
                      {item.contentOrder && (
                        <React.Fragment>
                          {resource.properties['items.contentOrder.status'] && (
                            <FormGroup
                              mb={mb}
                              error={
                                errors &&
                                errors[`items.${index}.contentOrder.status`] &&
                                errors[`items.${index}.contentOrder.status`]
                              }
                            >
                              <Label>
                                {
                                  resource.properties[
                                    'items.contentOrder.status'
                                  ].label
                                }
                              </Label>
                              <Select
                                value={contentStatusOptions.find(
                                  itemOption =>
                                    itemOption.value ===
                                    item.contentOrder.status
                                )}
                                options={contentStatusOptions}
                                onChange={({ value }) => {
                                  const newOption = [...formValues.items];
                                  newOption[index].contentOrder.status = value;
                                  setFormValues({
                                    ...formValues,
                                    items: newOption
                                  });
                                  handleChange(
                                    `items.${index}.contentOrder.status`,
                                    value
                                  );
                                }}
                              />
                              {errors &&
                                errors[
                                  `items.${index}.contentOrder.status`
                                ] && (
                                  <Text>
                                    {
                                      errors[
                                        `items.${index}.contentOrder.status`
                                      ].message
                                    }
                                  </Text>
                                )}
                            </FormGroup>
                          )}
                          {resource.properties[
                            'items.contentOrder.language'
                          ] && (
                            <FormGroup
                              mb={mb}
                              error={
                                errors &&
                                errors[
                                  `items.${index}.contentOrder.language`
                                ] &&
                                errors[`items.${index}.contentOrder.language`]
                              }
                            >
                              <Label>
                                {
                                  resource.properties[
                                    'items.contentOrder.language'
                                  ].label
                                }
                              </Label>
                              <Select
                                value={contentLanguageOptions.find(
                                  itemOption =>
                                    itemOption.value ===
                                    item.contentOrder.language
                                )}
                                options={contentLanguageOptions}
                                onChange={({ value }) => {
                                  const newOption = [...formValues.items];
                                  newOption[
                                    index
                                  ].contentOrder.language = value;
                                  setFormValues({
                                    ...formValues,
                                    items: newOption
                                  });
                                  handleChange(
                                    `items.${index}.contentOrder.language`,
                                    value
                                  );
                                }}
                              />
                              {errors &&
                                errors[
                                  `items.${index}.contentOrder.language`
                                ] && (
                                  <Text>
                                    {
                                      errors[
                                        `items.${index}.contentOrder.language`
                                      ].message
                                    }
                                  </Text>
                                )}
                            </FormGroup>
                          )}
                          {resource.properties[
                            'items.contentOrder.source_url'
                          ] && (
                            <FormGroup
                              mb={mb}
                              error={
                                errors &&
                                errors[
                                  `items.${index}.contentOrder.source_url`
                                ] &&
                                errors[`items.${index}.contentOrder.source_url`]
                              }
                            >
                              <Label>
                                {(resource.properties[
                                  'items.contentOrder.source_url'
                                ] &&
                                  resource.properties[
                                    'items.contentOrder.source_url'
                                  ].label) ||
                                  'source_url'}
                              </Label>
                              <Input
                                value={
                                  item.contentOrder &&
                                  item.contentOrder.source_url
                                }
                                onChange={({ value }) => {
                                  const newOption = [...formValues.items];
                                  newOption[
                                    index
                                  ].contentOrder.source_url = value;
                                  setFormValues({
                                    ...formValues,
                                    items: newOption
                                  });
                                  handleChange(
                                    `items.${index}.contentOrder.source_url`,
                                    value
                                  );
                                }}
                              />
                              {errors &&
                                errors[
                                  `items.${index}.contentOrder.source_url`
                                ] && (
                                  <Text>
                                    {
                                      errors[
                                        `items.${index}.contentOrder.source_url`
                                      ].message
                                    }
                                  </Text>
                                )}
                            </FormGroup>
                          )}
                          {resource.properties[
                            'items.contentOrder.focus_keyword'
                          ] && (
                            <FormGroup
                              mb={mb}
                              error={
                                errors &&
                                errors[
                                  `items.${index}.contentOrder.focus_keyword`
                                ] &&
                                errors[
                                  `items.${index}.contentOrder.focus_keyword`
                                ]
                              }
                            >
                              <Label>
                                {(resource.properties[
                                  'items.contentOrder.focus_keyword'
                                ] &&
                                  resource.properties[
                                    'items.contentOrder.focus_keyword'
                                  ].label) ||
                                  'focus_keyword'}
                              </Label>
                              <Input
                                value={
                                  item.contentOrder &&
                                  item.contentOrder.focus_keyword
                                }
                                onChange={({ value }) => {
                                  const newOption = [...formValues.items];
                                  newOption[
                                    index
                                  ].contentOrder.focus_keyword = value;
                                  setFormValues({
                                    ...formValues,
                                    items: newOption
                                  });
                                  handleChange(
                                    `items.${index}.contentOrder.focus_keyword`,
                                    value
                                  );
                                }}
                              />
                              {errors &&
                                errors[
                                  `items.${index}.contentOrder.focus_keyword`
                                ] && (
                                  <Text>
                                    {
                                      errors[
                                        `items.${index}.contentOrder.focus_keyword`
                                      ].message
                                    }
                                  </Text>
                                )}
                            </FormGroup>
                          )}

                          {resource.properties[
                            'items.contentOrder.sub_keywords'
                          ] && (
                            <FormGroup
                              mb={mb}
                              error={
                                errors &&
                                errors[
                                  `items.${index}.contentOrder.sub_keywords`
                                ] &&
                                errors[
                                  `items.${index}.contentOrder.sub_keywords`
                                ]
                              }
                            >
                              <Label>
                                {(resource.properties[
                                  'items.contentOrder.sub_keywords'
                                ] &&
                                  resource.properties[
                                    'items.contentOrder.sub_keywords'
                                  ].label) ||
                                  'sub_keywords'}
                              </Label>
                              <Select
                                isMulti
                                value={
                                  item.contentOrder &&
                                  Array.isArray(
                                    item.contentOrder.sub_keywords
                                  ) &&
                                  item.contentOrder.sub_keywords.map(
                                    sub_keyword => {
                                      return {
                                        label: sub_keyword,
                                        value: sub_keyword
                                      };
                                    }
                                  )
                                }
                                onChange={value => {
                                  const newValues = value.map(
                                    ({ value }) => value
                                  );
                                  const newOption = [...formValues.items];
                                  newOption[
                                    index
                                  ].contentOrder.sub_keywords = newValues;
                                  setFormValues({
                                    ...formValues,
                                    items: newOption
                                  });
                                  handleChange(
                                    `items.${index}.contentOrder.sub_keywords`,
                                    newValues
                                  );
                                }}
                                onInputChange={value => {
                                  handleSearchKeywords(value);
                                }}
                                options={subKeywordOptions}
                              />
                              {errors &&
                                errors[
                                  `items.${index}.contentOrder.sub_keywords`
                                ] && (
                                  <Text>
                                    {
                                      errors[
                                        `items.${index}.contentOrder.sub_keywords`
                                      ].message
                                    }
                                  </Text>
                                )}
                            </FormGroup>
                          )}
                        </React.Fragment>
                      )}
                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.requests`] &&
                          errors[`items.${index}.requests`]
                        }
                      >
                        <Label>
                          {resource.properties['items.requests'].label}
                        </Label>
                        <Input
                          value={item.requests}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].requests = e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.request`,
                              e.target.value
                            );
                          }}
                        />
                        {errors && errors[`items.${index}.requests`] && (
                          <Text>
                            {errors[`items.${index}.requests`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.linkPrice`] &&
                          errors[`items.${index}.linkPrice`]
                        }
                      >
                        <Label>
                          {resource.properties['items.linkPrice'].label}
                        </Label>
                        <Input
                          value={item.linkPrice}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].linkPrice = e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.linkPrice`,
                              e.target.value
                            );
                          }}
                          type="number"
                        />
                        {errors && errors[`items.${index}.linkPrice`] && (
                          <Text>
                            {errors[`items.${index}.linkPrice`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.filePath`] &&
                          errors[`items.${index}.filePath`]
                        }
                      >
                        <Label>
                          {resource.properties['items.filePath'].label}
                        </Label>
                        <Input
                          value={item.filePath}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].filePath = e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.filePath`,
                              e.target.value
                            );
                          }}
                        />
                        {errors && errors[`items.${index}.filePath`] && (
                          <Text>
                            {errors[`items.${index}.filePath`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.marketLink`] &&
                          errors[`items.${index}.marketLink`]
                        }
                      >
                        <Label>
                          {resource.properties['items.marketLink'].label}
                        </Label>
                        <Select
                          value={
                            itemMarketLinkOptions &&
                            itemMarketLinkOptions.find(
                              marketLinkOption =>
                                marketLinkOption &&
                                marketLinkOption.value === item.marketLink
                            )
                          }
                          onChange={({ value }) => {
                            const newOption = [...formValues.items];
                            newOption[index].marketLink = value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(`items.${index}.marketLink`, value);
                          }}
                          onInputChange={value => handleSearchMarketLink(value)}
                          options={itemMarketLinkOptions}
                        />
                        {errors && errors[`items.${index}.marketLink`] && (
                          <Text>
                            {errors[`items.${index}.marketLink`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.website`] &&
                          errors[`items.${index}.website`]
                        }
                      >
                        <Label>
                          {resource.properties['items.website'].label}
                        </Label>
                        <Select
                          value={
                            itemWebsiteOptions &&
                            itemWebsiteOptions.find(
                              websiteOption =>
                                websiteOption &&
                                websiteOption.value === item.website
                            )
                          }
                          onChange={({ value }) => {
                            const newOption = [...formValues.items];
                            newOption[index].website = value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(`items.${index}.website`, value);
                          }}
                          onInputChange={value => handleSearchLinks(value)}
                          options={itemWebsiteOptions}
                        />
                        {errors && errors[`items.${index}.website`] && (
                          <Text>
                            {errors[`items.${index}.website`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.subPage`] &&
                          errors[`items.${index}.subPage`]
                        }
                      >
                        <Label>
                          {resource.properties['items.subPage'].label}
                        </Label>
                        <Input
                          value={item.subPage}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].subPage = e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.subPage`,
                              e.target.value
                            );
                          }}
                        />
                        {errors && errors[`items.${index}.subPage`] && (
                          <Text>
                            {errors[`items.${index}.subPage`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.linkFromUrl`] &&
                          errors[`items.${index}.linkFromUrl`]
                        }
                      >
                        <Label>
                          {resource.properties['items.linkFromUrl'].label}
                        </Label>
                        <Input
                          value={item.linkFromUrl}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].linkFromUrl = e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.linkFromUrl`,
                              e.target.value
                            );
                          }}
                        />
                        {errors && errors[`items.${index}.linkFromUrl`] && (
                          <Text>
                            {errors[`items.${index}.linkFromUrl`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.createdAt`] &&
                          errors[`items.${index}.createdAt`]
                        }
                      >
                        <Label>
                          {resource.properties['items.createdAt'].label}
                        </Label>
                        <DatePicker
                          value={item.createdAt}
                          onChange={value => {
                            const newOption = [...formValues.items];
                            newOption[index].createdAt = value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(`items.${index}.createdAt`, value);
                          }}
                        />
                        {errors && errors[`items.${index}.createdAt`] && (
                          <Text>
                            {errors[`items.${index}.createdAt`].message}
                          </Text>
                        )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.ignoreJustification`] &&
                          errors[`items.${index}.ignoreJustification`]
                        }
                      >
                        <Label>
                          {
                            resource.properties['items.ignoreJustification']
                              .label
                          }
                        </Label>
                        <Input
                          value={item.ignoreJustification}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].ignoreJustification =
                              e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.ignoreJustification`,
                              e.target.value
                            );
                          }}
                        />
                        {errors &&
                          errors[`items.${index}.ignoreJustification`] && (
                            <Text>
                              {
                                errors[`items.${index}.ignoreJustification`]
                                  .message
                              }
                            </Text>
                          )}
                      </FormGroup>

                      <FormGroup
                        mb={mb}
                        error={
                          errors &&
                          errors[`items.${index}.commission`] &&
                          errors[`items.${index}.commission`]
                        }
                      >
                        <Label>
                          {resource.properties['items.commission'].label}
                        </Label>
                        <Input
                          value={item.commission}
                          onChange={e => {
                            const newOption = [...formValues.items];
                            newOption[index].commission = e.target.value;
                            setFormValues({ ...formValues, items: newOption });
                            handleChange(
                              `items.${index}.commission`,
                              e.target.value
                            );
                          }}
                        />
                        {errors && errors[`items.${index}.commission`] && (
                          <Text>
                            {errors[`items.${index}.commission`].message}
                          </Text>
                        )}
                      </FormGroup>
                    </Section>
                  </Box>
                  <Box
                    flex
                    alignSelf="center"
                    justifyContent="center"
                    width="5%"
                  >
                    <Button
                      onClick={e => handleDeleteItem(e, index)}
                      rounded
                      size="icon"
                      variant="danger"
                    >
                      <Icon icon="Delete" />
                    </Button>
                  </Box>
                </Box>
              ))}
            <Button
              onClick={handleAddNewItem}
              style={{ borderRadius: '9999px' }}
            >
              <Icon icon="Add" /> Add New Item
            </Button>
          </Section>
          {errors && errors.items && <Text>{errors.items.message}</Text>}
        </FormGroup>

        <BasePropertyComponent
          where="edit"
          resource={resource}
          record={record}
          onChange={handleChange}
          property={resource.properties.outreach}
        />

        <BasePropertyComponent
          where="edit"
          resource={resource}
          record={record}
          onChange={handleChange}
          property={resource.properties.createdBy}
        />

        <BasePropertyComponent
          where="edit"
          resource={resource}
          record={record}
          onChange={handleChange}
          property={resource.properties.updatedAt}
        />

        <BasePropertyComponent
          where="edit"
          resource={resource}
          record={record}
          onChange={handleChange}
          property={resource.properties.createdAt}
        />

        <Box
          flex
          justifyContent="center"
          alignItems="flex-end"
          height={100}
          width="100%"
        >
          <Button variant="primary" size="lg" type="submit">
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditOrder;
