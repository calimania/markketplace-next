'use client';

import { useState } from 'react';
import { Box, Image, Modal, UnstyledButton } from '@mantine/core';

type LightboxImageProps = {
  src: string;
  alt: string;
  radius?: number | string;
  className?: string;
};

export default function LightboxImage({ src, alt, radius = 'md', className }: LightboxImageProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <UnstyledButton
        component="button"
        onClick={() => setOpened(true)}
        aria-label="Open image"
        style={{ display: 'block', width: '100%' }}
      >
        <Box style={{ cursor: 'zoom-in' }}>
          <Image src={src} alt={alt} radius={radius} className={className} />
        </Box>
      </UnstyledButton>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        centered
        size="90vw"
        title={alt}
        styles={{
          content: { background: '#05080f' },
          header: { background: '#05080f' },
          title: { color: '#ffffff' },
          close: { color: '#ffffff' },
        }}
      >
        <Box
          style={{
            width: '100%',
            height: 'min(80vh, 860px)',
            backgroundImage: `url(${src})`,
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            borderRadius: 12,
            backgroundColor: '#0b1220',
          }}
        />
      </Modal>
    </>
  );
}
