import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import {
  ApiClient,
  BasePropertyComponent,
  useRecord,
  useTranslation
} from 'admin-bro';
import {
  Box,
  Button,
  CheckBox,
  Label,
  Loader,
  FormGroup,
  Icon,
  Input,
  Text
} from '@admin-bro/design-system';
import Select from 'react-select';
import { Resources } from '../../../resources';
import styles from '../../../components/styles';
import { mapParamsToOptionsArray, removeParams } from '../../../utils';

const CreatePermission = ({ resource, action, record: initialRecord }) => {
  const history = useHistory();
  const api = new ApiClient();
  const { translateButton } = useTranslation();
  const { record, handleChange, submit, loading, setRecord } = useRecord(
    initialRecord,
    resource.id
  );
  const [mb] = useState(25);
  const [fetchingResources, setFetchingResources] = useState(false);
  const [name, setName] = useState('');
  const [records, setRecords] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [allowAllAttributes, setAllowAllAttributes] = useState(false);
  const [attributesRequired, setAttributesRequired] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [allowedActions, setAllowedActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [possessions] = useState(
    ['OWN', 'ANY'].map(possession => ({ label: possession, value: possession }))
  );
  const [selectedPossession, setSelectedPossession] = useState(null);
  const [errors, setErrors] = useState({});

  const mapResources = () =>
    records.map(record => ({
      label: record.params.name,
      value: record.id
    }));

  const mapAttributes = params =>
    mapParamsToOptionsArray(params, /attributes.(\d+)/i);

  const mapAllowedActions = params =>
    mapParamsToOptionsArray(params, /allowedActions.(\d+)/i);

  const reverseAttributes = attributes =>
    (attributes &&
      attributes.length > 0 &&
      attributes.map(attribute => ({
        label: allowAllAttributes
          ? `!${attribute.label}`
          : attribute.label.replace('!', ''),
        value: allowAllAttributes
          ? `!${attribute.value}`
          : attribute.value.replace('!', '')
      }))) ||
    [];

  const fetchResources = () => {
    setFetchingResources(true);
    api
      .resourceAction({
        resourceId: Resources,
        actionName: 'list?perPage=null'
      })
      .then(res => {
        const { records } = res.data;
        setRecords(records);
      })
      .catch(err => console.error(err))
      .finally(() => {
        setFetchingResources(false);
      });
  };

  const handleSubmit = e => {
    e.preventDefault();
    submit().then(res => {
      const { redirectUrl, record } = res.data;
      const { errors } = record;
      if (errors && Object.keys(errors).length > 0) setErrors(errors);
      if (redirectUrl) history.push(redirectUrl);
      if (record.id) handleChange({ params: {}, populated: {}, errors: {} });
    });
    return false;
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (initialRecord) setRecord(initialRecord);
  }, [initialRecord]);

  useEffect(() => {
    if (records && Array.isArray(records) && records.length > 0) {
      const resources = mapResources();
      setResources(resources);
    }
  }, [records]);

  useEffect(() => {
    handleChange('name', name);
  }, [name]);

  useEffect(() => {
    if (selectedResource) handleChange('resource', selectedResource.value);
    if (selectedResource && selectedResource.value) {
      const id = selectedResource.value;
      const record = records.find(record => record.id === id);
      if (record) {
        const attributes = mapAttributes(record.params);
        const allowedActions = mapAllowedActions(record.params);
        setAttributes(attributes);
        setSelectedAttributes([]);
        setAllowedActions(allowedActions);
      }
    }
  }, [selectedResource]);

  useEffect(() => {
    handleChange('allowAllAttributes', allowAllAttributes);
    if (allowAllAttributes) {
      setAttributesRequired(false);
      setAttributes(reverseAttributes(attributes));
      setSelectedAttributes(reverseAttributes(selectedAttributes));
    } else {
      setAttributesRequired(true);
      setAttributes(reverseAttributes(attributes));
      setSelectedAttributes(reverseAttributes(selectedAttributes));
    }
  }, [allowAllAttributes]);

  useEffect(() => {
    if (selectedAction) handleChange('action', selectedAction.value);
  }, [selectedAction]);

  useEffect(() => {
    const params = removeParams(record.params, /attributes.(\d+)/i);
    if (selectedAttributes.length)
      selectedAttributes.forEach((attribute, index) => {
        params[`attributes.${index}`] = attribute.value;
      });
    setRecord({ ...record, params });
  }, [selectedAttributes]);

  useEffect(() => {
    if (selectedPossession)
      handleChange('possession', selectedPossession.value);
  }, [selectedPossession]);

  return (
    <Box variant="grey">
      <Box
        as="form"
        onSubmit={handleSubmit}
        flex
        flexGrow={1}
        flexDirection="column"
        variant="white"
      >
        {fetchingResources ? (
          <Loader />
        ) : (
          <div>
            <FormGroup mb={mb} error={errors.name}>
              <Label required>Name</Label>
              <Input
                value={name}
                onChange={e => {
                  setName(e.target.value);
                }}
              />
              {errors.name && errors.name.message && (
                <Text>{errors.name.message}</Text>
              )}
            </FormGroup>
            <FormGroup mb={mb} error={errors.resource}>
              <Label required>Resource</Label>
              <Select
                options={resources}
                value={selectedResource}
                onChange={option => {
                  setSelectedResource(option);
                }}
              />
              {errors.resource && errors.resource.message && (
                <Text>{errors.resource.message}</Text>
              )}
            </FormGroup>
            {selectedResource && allowedActions.length > 0 && (
              <FormGroup mb={mb} error={errors.action}>
                <Label required>Action</Label>
                <Select
                  options={allowedActions}
                  value={selectedAction}
                  onChange={setSelectedAction}
                />
                {errors.action && errors.action.message && (
                  <Text>{errors.action.message}</Text>
                )}
              </FormGroup>
            )}
            {selectedResource &&
              selectedAction &&
              ['READ', 'UPDATE'].includes(selectedAction.value) &&
              attributes.length > 0 && (
                <>
                  <FormGroup mb={mb} error={errors.attributes}>
                    <Label required={attributesRequired}>Attributes</Label>
                    <Select
                      isMulti
                      options={attributes}
                      value={selectedAttributes}
                      onChange={options => {
                        options
                          ? setSelectedAttributes(options)
                          : setSelectedAttributes([]);
                      }}
                    />
                    {errors.attributes && errors.attributes.message && (
                      <Text>{errors.attributes.message}</Text>
                    )}
                  </FormGroup>
                  <FormGroup mb={mb}>
                    <Box style={styles.flexRow}>
                      <CheckBox
                        checked={allowAllAttributes}
                        onChange={() => {
                          setAllowAllAttributes(!allowAllAttributes);
                        }}
                      />
                      <Label>Allow All Attributes</Label>
                    </Box>
                  </FormGroup>
                </>
              )}
            <FormGroup mb={mb} error={errors.possession}>
              <Label required>Possession</Label>
              <Select
                options={possessions}
                value={selectedPossession}
                onChange={setSelectedPossession}
              />
              {errors.possession && errors.possession.message && (
                <Text>{errors.possession.message}</Text>
              )}
            </FormGroup>
            <BasePropertyComponent
              resource={resource}
              property={resource.properties.createdBy}
              record={record}
              onChange={handleChange}
              where="edit"
            />
            <Box style={styles.center}>
              <Button type="submit" variant="primary" size="lg">
                {loading ? <Icon icon="Fade" spin /> : null}
                {translateButton('save', resource.id)}
              </Button>
            </Box>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default CreatePermission;
