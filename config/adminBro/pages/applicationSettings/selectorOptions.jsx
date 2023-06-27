import React, { useEffect, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  FormGroup,
  Header,
  Icon,
  Input,
  InputGroup,
  Label,
  Loader,
  Section
} from '@admin-bro/design-system';

export const optionConstants = {
  DAYLY: 'dayly',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMI_ANNUALLY: 'semi-annually',
  YEARLY: 'yearly'
};

export const cronTimeTriggerOptions = [
  {
    key: 'Once a day',
    value: optionConstants.DAYLY
  },
  {
    key: 'Once a week',
    value: optionConstants.WEEKLY
  },
  {
    key: 'Once a month',
    value: optionConstants.MONTHLY
  },
  {
    key: 'Once a quarter',
    value: optionConstants.QUARTERLY
  },
  {
    key: 'Once semi-annually',
    value: optionConstants.SEMI_ANNUALLY
  },
  {
    key: 'Once a year',
    value: optionConstants.YEARLY
  }
];

export const onceWeekSelectOption = [
  { key: 'Sunday', value: '0' },
  { key: 'Monday', value: '1' },
  { key: 'Tuesday', value: '2' },
  { key: 'Wednesday', value: '3' },
  { key: 'Thursday', value: '4' },
  { key: 'Friday', value: '5' },
  { key: 'Saturday', value: '6' }
];

const Selector = ({ otherProps, options, defaultValue, onChange }) => {
  return (
    <select
      style={{ width: '120px', height: '20px !important', padding: '5px' }}
      onChange={onChange}
      defaultValue={defaultValue}
      {...otherProps}
    >
      {options.map(option => (
        <option
          key={option.key}
          value={option.value}
          style={{ width: '120px', height: '20px !important' }}
        >
          {' '}
          {option.key}
        </option>
      ))}
    </select>
  );
};

export const MultiSelectorRow = ({ initialValue, onChange, onRemove }) => {
  const [item, setItem] = useState(initialValue);

  useEffect(() => {
    onChange(item);
  }, [item]);

  return (
    <InputGroup>
      <Input value={item} mr={5} onChange={e => setItem(e.target.value)} />
      <Button
        onClick={() => onRemove(item)}
        rounded
        size="icon"
        variant="danger"
        ml={5}
      >
        <Icon icon="Delete" />
      </Button>
    </InputGroup>
  );
};

export const MultiSelector = ({
  title,
  initialValue,
  onChange,
  onSave,
  isLoading
}) => {
  const [items, setItems] = useState(initialValue);

  const removeItem = item => {
    setItems(items.filter(i => i !== item));
  };

  const handleAddNewItem = () => {
    setItems([...items, '']);
  };

  const handleChange = (item, index) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  useEffect(() => {
    onChange(items);
  }, [items]);

  useEffect(() => {
    if (!items.length) {
      setItems(initialValue);
    }
  }, [initialValue]);

  if (isLoading) console.log('Rerendering MultiSelector with isLoading true');

  return isLoading ? (
    <Loader />
  ) : (
    <>
      <Box variant="white">
        <Header.H5>{title}</Header.H5>
      </Box>
      <Section>
        <FormGroup>
          {Array.isArray(items) &&
            items.map((item, index) => (
              <>
                <Label>[{index + 1}]</Label>
                <MultiSelectorRow
                  initialValue={item}
                  onChange={updatedValue => handleChange(updatedValue, index)}
                  onRemove={removeItem}
                />
                <br />
              </>
            ))}
        </FormGroup>
        <Box>
          <Button onClick={handleAddNewItem} style={{ borderRadius: '9999px' }}>
            <Icon icon="Add" /> Add New Item
          </Button>
          <Box
            flex
            alignItems="flex-end"
            justifyContent="flex-end"
            height={100}
            width="100%"
          >
            <Button type="submit" onClick={onSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Section>
    </>
  );
};

export default Selector;
