import React, { useEffect, useState } from 'react';
import { Box, Button, FormGroup, Label, Text } from '@admin-bro/design-system';
import Select from 'react-select';
import { Add16, TrashCan16 } from '@carbon/icons-react';
import styles from './styles';

const CollectionSelect = ({ options, items, setItems, name, errors = {} }) => {
  const [availableOptions, setAvailableOptions] = useState(options);

  const filterOptions = () => {
    const selectedOptions = items.map(item => item.value);
    setAvailableOptions(
      options.filter(option => !selectedOptions.includes(option.value))
    );
  };

  const handleSelectionChange = (option, index) => {
    const cpy = [...items];
    cpy.splice(index, 1, option);
    setItems(cpy);
  };

  const handleAddButtonClick = e => {
    e.preventDefault();
    if (items.length + 1 <= options.length) {
      setItems([...items, availableOptions[0]]);
    }
  };

  const handleRemoveButtonClick = (e, index) => {
    e.preventDefault();
    const cpy = [...items];
    cpy.splice(index, 1);
    setItems(cpy);
  };

  useEffect(() => {
    filterOptions();
  }, [items]);

  useEffect(() => {
    setItems([]);
  }, [options]);

  return (
    <Box>
      {items.map((item, index) => {
        return (
          <Box key={index} mb={25}>
            <Label>[{index}]</Label>
            <FormGroup error={errors[`${name}.${index}`]}>
              <Box style={styles.flexRow}>
                <Box width="100%">
                  <Select
                    name={`${name}.${index}`}
                    options={availableOptions}
                    value={item}
                    onChange={option => {
                      handleSelectionChange(option, index);
                    }}
                    width="100%"
                  />
                </Box>
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
      <Button
        type="button"
        size="md"
        disabled={items.length + 1 > options.length}
        onClick={handleAddButtonClick}
      >
        <Add16 aria-label="Add" /> Add New Item
      </Button>
    </Box>
  );
};

export default React.memo(CollectionSelect);
