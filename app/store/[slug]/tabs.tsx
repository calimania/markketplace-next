"use client";

import { Tabs, Stack, Text } from "@mantine/core";
import { NavLink } from "@mantine/core";

interface StoreTabProps {
  urls?: { id: number; Label: string; URL: string }[];
}

export function StoreTab({ urls }: StoreTabProps) {
  // Group links by Label
  const groupedLinks = urls?.reduce((acc, link) => {
    if (!acc[link.Label]) {
      acc[link.Label] = [];
    }
    acc[link.Label].push(link);
    return acc;
  }, {} as Record<string, { id: number; URL: string }[]>);

  const labels = groupedLinks ? Object.keys(groupedLinks) : [];

  return (
    <Tabs defaultValue={labels[0] || "empty"}>
      <Tabs.List>
        {labels.length > 0 ? (
          labels.map((label) => <Tabs.Tab key={label} value={label}>{label}</Tabs.Tab>)
        ) : (
          <Tabs.Tab value="empty">No Links</Tabs.Tab>
        )}
      </Tabs.List>

      {labels.length > 0 ? (
        labels.map((label) => (
          <Tabs.Panel key={label} value={label}>
            <Stack>
              {groupedLinks && groupedLinks[label].map((link) => (
                <NavLink
                  key={link.id}
                  label={link.URL}
                  component="a"
                  href={link.URL}
                  target="_blank"
                />
              ))}
            </Stack>
          </Tabs.Panel>
        ))
      ) : (
        <Tabs.Panel value="empty">
          <Text>No links available</Text>
        </Tabs.Panel>
      )}
    </Tabs>
  );
}
