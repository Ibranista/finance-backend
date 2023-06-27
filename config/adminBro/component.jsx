import React from 'react';
import { Box, Text, H1 } from '@admin-bro/design-system';

const Custom = props => {
  return (
    <Box
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly'
      }}
    >
      <Box>
        <H1 textAlign="center">Welcome To LinkBuilders</H1>
        <Text textAlign="center">
          This is your admin interface you can add and edit your platform users
          as well as your websites
        </Text>
      </Box>
      {/* <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly'
        }}
      >
        <Box
          boxShadow="0 10px 10px -5px grey"
          flex={0.4}
          alignItems="center"
          flexDirection="column"
          justifyItems="center"
          variant="white"
        >
          <H1>0</H1>
          <H6>Default Users</H6>
        </Box>
        <Box
          boxShadow="0 10px 10px -5px grey"
          flex={0.4}
          alignItems="center"
          flexDirection="column"
          variant="white"
        >
          <H1>0</H1>
          <H6>Web Sites</H6>
        </Box>
      </Box> */}
    </Box>
  );
};

export default Custom;
