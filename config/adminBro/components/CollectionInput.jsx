import React from 'react';
import {
  Box,
  Button,
  FormGroup,
  Input,
  Label,
  Text
} from '@admin-bro/design-system';
import { Add16, TrashCan16 } from '@carbon/icons-react';
import styles from './styles';

const CollectionInput = ({ items, setItems, name, errors = {} }) => {
  const handleInputChange = (e, index) => {
    const cpy = [...items];
    cpy.splice(index, 1, e.target.value);
    setItems(cpy);
  };

  const handleAddButtonClick = e => {
    e.preventDefault();
    if (items.length === 0 || items[items.length - 1].trim())
      setItems([...items, '']);
  };

  const handleRemoveButtonClick = (e, index) => {
    e.preventDefault();
    const cpy = [...items];
    cpy.splice(index, 1);
    setItems(cpy);
  };

  return (
    <Box>
      {items.map((item, index) => {
        return (
          <Box key={index} mb={25}>
            <Label>[{index}]</Label>
            <FormGroup error={errors[`${name}.${index}`]}>
              <Box style={styles.flexRow}>
                <Input
                  name={`${name}.${index}`}
                  width="100%"
                  value={item}
                  onChange={e => {
                    handleInputChange(e, index);
                  }}
                />
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={e => {
                    handleRemoveButtonClick(e, index);
                  }}
                >
                  <TrashCan16 />
                </Button>
              </Box>
              {errors[`${name}.${index}`] &&
                errors[`${name}.${index}`].message && (
                  <Text>{errors[`${name}.${index}`].message}</Text>
                )}
            </FormGroup>
          </Box>
        );
      })}
      <Button type="button" size="md" onClick={handleAddButtonClick}>
        <Add16 aria-label="Add" /> Add New Item
      </Button>
    </Box>
  );
};

export default CollectionInput;
