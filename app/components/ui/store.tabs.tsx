"use client";

import { Tabs, Stack, Text } from "@mantine/core";
import { NavLink } from "@mantine/core";

interface StoreTabProps {
  urls?: { id: number; Label: string; URL: string }[];
}

//@TODO: Add contact and address tabs - after fixing API response
export function StoreTabs({ urls = [] }: StoreTabProps) {  // Default empty array

  return (
    <Tabs defaultValue="links">
      <Tabs.List>
        {urls.length > 0 && <Tabs.Tab value="links">Links</Tabs.Tab>}
        {/* <Tabs.Tab value="contact">Contact Info</Tabs.Tab>
        <Tabs.Tab value="addresses">Addresses</Tabs.Tab> */}
      </Tabs.List>

      <Tabs.Panel value="links">
        {urls.length > 0 ? (
          <Stack>
            {urls.map((link) => (
              <NavLink
                key={link.id}
                label={link.Label}
                component="a"
                href={link.URL}
                target="_blank"
              />
            ))}
          </Stack>
        ) : (
          <Text>No links available</Text>
        )}
      </Tabs.Panel>

      {/* <Tabs.Panel value="contact"><Text>Contact info coming soon</Text></Tabs.Panel>
      <Tabs.Panel value="addresses"><Text>Addresses coming soon</Text></Tabs.Panel> */}
    </Tabs>
  );
}
