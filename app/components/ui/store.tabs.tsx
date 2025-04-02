"use client";

import { Tabs, Stack } from "@mantine/core";
import { NavLink } from "@mantine/core";
import { usePathname } from "next/navigation";

interface StoreTabProps {
  urls?: { id: number; Label: string; URL: string }[];
}

//@TODO: Add contact and address tabs - after fixing API response
export function StoreTabs({ urls = [] }: StoreTabProps) {  // Default empty array
  const pathname = usePathname();

  if (!urls.length) {
    return null;
  }

  return (
    <Tabs defaultValue="links">
      <Tabs.List>
        <Tabs.Tab value="links">Links</Tabs.Tab>
        {/* <Tabs.Tab value="contact">Contact Info</Tabs.Tab>
        <Tabs.Tab value="addresses">Addresses</Tabs.Tab> */}
      </Tabs.List>

      <Tabs.Panel value="links">
        <Stack>
          {urls.map((link) => (
            <NavLink
              key={link.id}
              label={link.Label}
              component="a"
              href={link.URL?.startsWith('/') ? `${pathname}${link.URL}` : link.URL}
              target={link.URL?.startsWith('https') ? '_blank' : '_self'}
            />
          ))}
        </Stack>
      </Tabs.Panel>

      {/* <Tabs.Panel value="contact"><Text>Contact info coming soon</Text></Tabs.Panel>
      <Tabs.Panel value="addresses"><Text>Addresses coming soon</Text></Tabs.Panel> */}
    </Tabs>
  );
}
