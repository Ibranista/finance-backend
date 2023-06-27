import React, { useEffect, useState } from 'react';
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
  FormGroup,
  Icon,
  Input,
  Label,
  Loader,
  Text
} from '@admin-bro/design-system';
import { Privileges } from '../../../resources';
import { CollectionSelect } from '../../../components';
import styles from '../../../components/styles';
import { removeParams } from '../../../utils';

const CreateRole = ({ resource, action, record: initialRecord }) => {
  const history = useHistory();
  const api = new ApiClient();
  const { translateButton } = useTranslation();
  const { record, handleChange, submit, loading, setRecord } = useRecord(
    initialRecord,
    resource.id
  );
  const [fetchingPermissions, setFetchingPermissions] = useState(false);
  const [mb] = useState(25);
  const [name, setName] = useState('');
  const [records, setRecords] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [errors, setErrors] = useState({});

  const mapPermissions = () =>
    records.map(record => ({
      label: record.params.name,
      value: record.id
    }));

  const fetchPermissions = () => {
    setFetchingPermissions(true);
    api
      .resourceAction({
        resourceId: Privileges,
        actionName: 'list?perPage=null'
      })
      .then(res => {
        const { records } = res.data;
        setRecords(records);
      })
      .catch(err => console.error(err))
      .finally(() => {
        setFetchingPermissions(false);
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
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (initialRecord) setRecord(initialRecord);
  }, [initialRecord]);

  useEffect(() => {
    if (records && Array.isArray(records) && records.length > 0) {
      const permissions = mapPermissions();
      setPermissions(permissions);
    }
  }, [records]);

  useEffect(() => {
    handleChange('name', name);
  }, [name]);

  useEffect(() => {
    const params = removeParams(record.params, /permissions.(\d+)/i);
    if (selectedPermissions.length)
      selectedPermissions.forEach((permission, index) => {
        params[`permissions.${index}`] = permission.value;
      });
    setRecord({ ...record, params });
  }, [selectedPermissions]);

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
        {fetchingPermissions ? (
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
            <FormGroup mb={mb} error={errors.permissions}>
              <Label required>Permissions</Label>
              <CollectionSelect
                name="permissions"
                options={permissions}
                items={selectedPermissions}
                setItems={setSelectedPermissions}
              />
              {errors.permissions && errors.permissions.message && (
                <Text>{errors.permissions.message}</Text>
              )}
            </FormGroup>
            <BasePropertyComponent
              resource={resource}
              property={resource.properties.allowThisTagsOnly}
              record={record}
              onChange={handleChange}
              where="edit"
            />
            <BasePropertyComponent
              resource={resource}
              property={resource.properties.authorizedOwnWebsites}
              record={record}
              onChange={handleChange}
              where="edit"
            />
            <BasePropertyComponent
              resource={resource}
              property={resource.properties.clientAccess}
              record={record}
              onChange={handleChange}
              where="edit"
            />
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

export default CreateRole;
