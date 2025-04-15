'use client';

import { strapiClient } from '@/markket/api.strapi';
import { markketConfig } from '@/markket/config';
import { Button, Divider, Paper, Title } from '@mantine/core';
import { useState } from 'react';
import { IconHttpGet} from '@tabler/icons-react';
import { CodeHighlight } from '@mantine/code-highlight';


const PreviewRequests = () => {
  const [response, setResponse] = useState('{}');

  const exec = async (slug: string ) => {
    const _response = await strapiClient.get('stores', slug, 'next')
    setResponse(JSON.stringify(_response || {}, null, 2));
  }

  return (
    <Paper withBorder p="sm" my="md" className='blocks-content'>
      <Title order={4}>Request Preview </Title>
      <Title order={5}>url: <small>{markketConfig.markket_url}</small></Title>
      <p><strong>endpoint</strong> /store </p>
      <Divider/>
      <Button variant="filled" aria-label="Settings" leftSection={<IconHttpGet size={24} stroke={1.5} />} onClick={() => { exec('store') }}>
          Execute
      </Button>
      <CodeHighlight code={response} language="json" />
    </Paper>
  )
};

export default PreviewRequests;
