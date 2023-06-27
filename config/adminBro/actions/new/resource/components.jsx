import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { BasePropertyComponent, useRecord, useTranslation } from 'admin-bro';
import {
  Box,
  Button,
  FormGroup,
  Icon,
  Input,
  Label,
  Text
} from '@admin-bro/design-system';
import Select from 'react-select';
import { CollectionInput } from '../../../components';
import styles from '../../../components/styles';
import { removeParams } from '../../../utils';

const CreateResource = ({ resource, record: initialRecord }) => {
  const history = useHistory();
  const { translateButton } = useTranslation();
  const { record, handleChange, submit, loading, setRecord } = useRecord(
    initialRecord,
    resource.id
  );
  const [mb] = useState(25);
  const [name, setName] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [actions] = useState(['CREATE', 'READ', 'UPDATE', 'DELETE']);
  const [allowedActions, setAllowedActions] = useState([]);
  const options = actions.map(action => ({ label: action, value: action }));
  const [errors, setErrors] = useState({});

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
    if (initialRecord) setRecord(initialRecord);
  }, [initialRecord]);

  useEffect(() => {
    handleChange('name', name);
  }, [name]);

  useEffect(() => {
    const params = removeParams(record.params, /attributes.(\d+)/i);
    if (attributes.length)
      attributes.forEach((attribute, index) => {
        params[`attributes.${index}`] = attribute;
      });
    setRecord({ ...record, params });
  }, [attributes]);

  useEffect(() => {
    const params = removeParams(record.params, /allowedActions.(\d+)/i);
    if (allowedActions.length) {
      allowedActions.forEach((action, index) => {
        params[`allowedActions.${index}`] = action.value;
      });
      setRecord({ ...record, params });
    }
  }, [allowedActions]);

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
        <FormGroup mb={mb} error={errors.name}>
          <Label required>Name</Label>
          <Input
            name="name"
            value={name}
            onChange={e => {
              setName(e.target.value);
            }}
          />
          {errors.name && errors.name.message && (
            <Text>{errors.name.message}</Text>
          )}
        </FormGroup>
        <FormGroup mb={mb}>
          <Label>Attributes</Label>
          <CollectionInput
            name="attributes"
            items={attributes}
            setItems={setAttributes}
            errors={errors || {}}
          />
        </FormGroup>
        <FormGroup mb={mb} error={errors.allowedActions}>
          <Label required>Allowed Actions</Label>
          <Select
            isMulti
            name="allowedActions"
            options={options}
            value={allowedActions}
            onChange={options => {
              options ? setAllowedActions(options) : setAllowedActions([]);
            }}
          />
          {errors.allowedActions && errors.allowedActions.message && (
            <Text>{errors.allowedActions.message}</Text>
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
      </Box>
    </Box>
  );
};

export default CreateResource;
