import React, { useState } from 'react';
import Select from 'react-select';
import { Box, Label } from '@admin-bro/design-system';
import countries from '../../../app/assets/countries';

export default function CountrySelect({ onChange, record }) {
  const [defaultCountry] = useState(() => {
    const selectedCountry = record.params['billingInformation.country'];
    if (selectedCountry) {
      const country = countries.find(
        country => country.code === selectedCountry
      );
      if (country) return { value: country.code, label: country.name };
    }
    return null;
  });
  const [options] = useState(() =>
    countries.map(country => ({
      value: country.code,
      label: country.name
    }))
  );

  return (
    <Box mb="3rem">
      <Label>Country</Label>
      <Select
        name="country"
        options={options}
        onChange={option => {
          onChange('billingInformation.country', option.value);
        }}
        defaultValue={defaultCountry}
      />
    </Box>
  );
}
