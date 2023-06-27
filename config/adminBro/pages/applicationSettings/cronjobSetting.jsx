import React from 'react';
import {
  Box,
  Button,
  Header,
  Text,
  Label,
  CheckBox,
  Loader
} from '@admin-bro/design-system';

import Selector, {
  onceWeekSelectOption,
  cronTimeTriggerOptions,
  optionConstants
} from './selectorOptions';

const CronjobSetting = ({
  id,
  title,
  isLoading,
  changeHandler,
  enable,
  enableLabel,
  cronJob,
  frequencyChangeHandler,
  dayChangeHandler,
  dateChangeHandler,
  hourChangeHandler,
  cronTimeFilter,
  onSave
}) => {
  const filteredCronTime =
    cronTimeFilter instanceof Function
      ? cronTimeTriggerOptions.filter(cronTimeFilter)
      : cronTimeTriggerOptions;
  return (
    <Box variant="white" mt={3}>
      <Header.H5>{title}</Header.H5>
      <Text color="grey">Please make sure to select all fields properly</Text>

      {isLoading ? (
        <Loader />
      ) : (
        <Box flex flexDirection="row">
          <Box flexGrow={0}>
            <Box p="xl">
              <CheckBox
                type={'checkbox'}
                id={'checkbox1'}
                onChange={changeHandler}
                checked={enable}
              />
              <Label inline ml="default">
                {enableLabel}
              </Label>
            </Box>
          </Box>

          <Box flexGrow={1} py={'20px !important'} px={'20px !important'}>
            <Box flex flexDirection="row">
              <Box px={'10px !important'}>
                <Label>Select cron job frequency</Label>
                <Selector
                  options={filteredCronTime}
                  otherProps={{
                    disabled: !enable,
                    value: cronJob.frequency || '',
                    name: id
                  }}
                  onChange={frequencyChangeHandler}
                />
              </Box>

              {enable &&
                cronJob &&
                cronJob.frequency &&
                cronJob.frequency === optionConstants.WEEKLY && (
                  <Box px={'10px !important'}>
                    <Label>Select a day for cronjob</Label>
                    <Selector
                      otherProps={{
                        disabled: !enable,
                        value: cronJob.day || '',
                        name: id
                      }}
                      options={onceWeekSelectOption}
                      disabled={!cronJob.frequency}
                      onChange={dayChangeHandler}
                    />
                  </Box>
                )}

              <Box px={'10px !important'}>
                {enable &&
                  cronJob &&
                  cronJob.frequency &&
                  cronJob.frequency === optionConstants.MONTHLY && (
                    <>
                      <Label>Select a day 1-31</Label>
                      <input
                        name={id}
                        style={{
                          width: '100px',
                          height: '20px',
                          padding: '2px',
                          textAlign: 'center'
                        }}
                        disabled={!enable}
                        value={cronJob.date || ''}
                        disabled={!cronJob.frequency}
                        type="number"
                        min={1}
                        max={31}
                        onChange={dateChangeHandler}
                      />
                    </>
                  )}
              </Box>
              {enable && cronJob && cronJob.frequency && (
                <Box px={'10px !important'}>
                  <Label>Select a time 0-23</Label>
                  <input
                    name={id}
                    style={{
                      width: '100px',
                      height: '20px',
                      padding: '2px',
                      textAlign: 'center'
                    }}
                    disabled={!enable}
                    value={cronJob.hour || ''}
                    type="number"
                    min={0}
                    max={23}
                    onChange={hourChangeHandler}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box py={'40px !important'} ml={5}>
            <Button onClick={onSave}> Save</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
export default CronjobSetting;
