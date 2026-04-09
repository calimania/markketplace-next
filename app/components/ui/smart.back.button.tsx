'use client';

import { Button, type ButtonProps } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

type SmartBackButtonProps = {
  fallbackHref: string;
  label?: string;
} & Omit<ButtonProps, 'onClick'>;

export default function SmartBackButton({
  fallbackHref,
  label = 'Back',
  ...buttonProps
}: SmartBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Button
      variant="default"
      leftSection={<IconArrowLeft size={16} />}
      onClick={handleBack}
      {...buttonProps}
    >
      {label}
    </Button>
  );
}