import React from "react";
import { Text } from "@mantine/core";
import { IconWheat } from "@tabler/icons-react";

interface FeatureCardProps {
  icon?: React.ElementType;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const Icon = icon || IconWheat;

  return (
    <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-800 transition-all hover:border-blue-500">
      <Icon className="text-blue-500 mb-4" size={32} />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <Text c="dimmed">{description}</Text>
    </div>
  );
};
