/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BasePropertyComponent, flat } from 'admin-bro';
import {
  Badge,
  Box,
  Label,
  Link,
  Section,
  Text,
  ValueGroup
} from '@admin-bro/design-system';

const ShowOrder = ({ resource, record }) => {
  const [mb] = useState(25);
  const [showProperties] = useState(
    resource.showProperties.reduce(
      (showProperties, property) => ({
        ...showProperties,
        [property.name]: property
      }),
      {}
    )
  );
  const [items] = useState(flat.unflatten(record.params).items);

  return (
    <Box variant="grey">
      <Box flex flexGrow={1} flexDirection="column" variant="white">
        {showProperties._id && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties._id}
            record={record}
            where="show"
          />
        )}
        {showProperties.status && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.status}
            record={record}
            where="show"
          />
        )}
        {showProperties.isRead && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.isRead}
            record={record}
            where="show"
          />
        )}
        {showProperties.items && (
          <ValueGroup label={resource.properties.items.name}>
            <Section>
              {items.map((item, index) => (
                <ValueGroup key={index} label={`[${index + 1}]`}>
                  <Section>
                    {item.status && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.status'].label}
                        </Label>
                        <Badge>{item.status}</Badge>
                      </Box>
                    )}
                    {item.linkText && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.linkText'].label}
                        </Label>
                        <Text>{item.linkText}</Text>
                      </Box>
                    )}
                    {item.linkType && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.linkType'].label}
                        </Label>
                        <Badge>{item.linkType}</Badge>
                      </Box>
                    )}
                    {item.publishDate && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.publishDate'].label}
                        </Label>
                        <Text>{new Date(item.publishDate).toDateString()}</Text>
                      </Box>
                    )}
                    {item.isPermanent !== (undefined || null) && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.isPermanent'].label}
                        </Label>
                        <Badge
                          style={{
                            backgroundColor: 'inherit',
                            color: 'darkgrey'
                          }}
                        >
                          {item.isPermanent ? 'Yes' : 'No'}
                        </Badge>
                      </Box>
                    )}
                    {item.contentOrder && (
                      <ValueGroup
                        label={
                          (resource.properties.items.contentOrder &&
                            resource.properties.items.contentOrder.name) ||
                          'Content Order'
                        }
                      >
                        <Section>
                          <Box mb={mb}>
                            <Label>
                              {(resource.properties[
                                'items.contentOrder.language'
                              ] &&
                                resource.properties[
                                  'items.contentOrder.language'
                                ].label) ||
                                'Language'}
                            </Label>
                            <Text>{item.contentOrder.language}</Text>
                          </Box>
                          <Box mb={mb}>
                            <Label>
                              {(resource.properties[
                                'items.contentOrder.status'
                              ] &&
                                resource.properties['items.contentOrder.status']
                                  .label) ||
                                'Status'}
                            </Label>
                            <Text>{item.contentOrder.status}</Text>
                          </Box>
                          <Box mb={mb}>
                            <Label>
                              {(resource.properties[
                                'items.contentOrder.tone_of_voice'
                              ] &&
                                resource.properties[
                                  'items.contentOrder.tone_of_voice'
                                ].label) ||
                                'Tone Of Voice'}
                            </Label>
                            <Text>{item.contentOrder.tone_of_voice}</Text>
                          </Box>
                          {item.contentOrder.sub_keywords &&
                            Array.isArray(
                              item.contentOrder.sub_keywords.length
                            ) &&
                            item.contentOrder.sub_keywords.length && (
                              <Box mb={mb}>
                                <Label>
                                  {(resource.properties[
                                    'items.contentOrder.sub_keywords'
                                  ] &&
                                    resource.properties[
                                      'items.contentOrder.sub_keywords'
                                    ].label) ||
                                    'Sub Keywords'}
                                </Label>
                                {item.contentOrder.sub_keywords.map(
                                  (subKeyword, index) => (
                                    <Text key={index}>
                                      {subKeyword.keyword}
                                    </Text>
                                  )
                                )}
                              </Box>
                            )}
                        </Section>
                      </ValueGroup>
                    )}
                    {item.contentLength && (
                      <Box mb={mb}>
                        <Label>
                          Item Content Length
                          {/* {resource.properties['items.contentLength.title']} */}
                        </Label>
                        <Text>{`${item.contentLength.title} - ${item.contentLength.price} €`}</Text>
                      </Box>
                    )}
                    {item.filePath && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.filePath'].label}
                        </Label>
                        <Text>{item.filePath}</Text>
                      </Box>
                    )}
                    {item.request && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.request'].label}
                        </Label>
                        <Text>{item.request}</Text>
                      </Box>
                    )}
                    {item.linkPrice && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.linkPrice'].label}
                        </Label>
                        <Text>{item.linkPrice}</Text>
                      </Box>
                    )}
                    {/* link from url */}
                    {item.marketLink && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.marketLink'].label}
                        </Label>
                        <Link
                          variant="primary"
                          href={
                            record.populated[`items.${index}.marketLink`].params
                              .url
                          }
                          rel="opener"
                        >
                          {
                            record.populated[`items.${index}.marketLink`].params
                              .name
                          }
                        </Link>
                      </Box>
                    )}
                    {item.subPage && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.subPage'].label}
                        </Label>
                        <Text>{item.subPage}</Text>
                      </Box>
                    )}
                    {item.linkFromUrl && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.linkFromUrl'].label}
                        </Label>
                        <Text>{item.linkFromUrl}</Text>
                      </Box>
                    )}
                    {item.createdAt && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.createdAt'].label}
                        </Label>
                        <Text>{new Date(item.createdAt).toDateString()}</Text>
                      </Box>
                    )}
                    {item.commission && (
                      <Box mb={mb}>
                        <Label>
                          {resource.properties['items.commission'].label}
                        </Label>
                        <Text>{item.commission}</Text>
                      </Box>
                    )}
                  </Section>
                </ValueGroup>
              ))}
            </Section>
          </ValueGroup>
        )}
        {showProperties.payment && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.payment}
            record={record}
            where="show"
          />
        )}
        {showProperties.creditNote && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.creditNote}
            record={record}
            where="show"
          />
        )}
        {showProperties.outreach && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.outreach}
            record={record}
            where="show"
          />
        )}
        {showProperties.createdBy && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.createdBy}
            record={record}
            where="show"
          />
        )}
        {showProperties.ignoreJustification && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.ignoreJustification}
            record={record}
            where="show"
          />
        )}
        {showProperties.updatedAt && (
          <BasePropertyComponent
            resource={resource}
            property={resource.properties.updatedAt}
            record={record}
            where="show"
          />
        )}
      </Box>
    </Box>
  );
};

export default ShowOrder;
