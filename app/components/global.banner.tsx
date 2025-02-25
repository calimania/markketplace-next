"use client";

import {
  Group,
  ActionIcon,
  Container,
  Paper,
  Text,
  Menu,
} from "@mantine/core";
import { IconHome, IconUserCircle, IconLogout } from "@tabler/icons-react";
import Link from "next/link";
import { useAuth } from "@/app/providers/auth";
import { useEffect, useState } from "react";

interface GlobalBannerProps {
  extraActions?: React.ReactNode;
}

export function GlobalBanner({ extraActions }: GlobalBannerProps) {
  const { maybe, user, isLoggedIn, logout } = useAuth();
  const [isMaybe, setIsMaybe] = useState(false);

  useEffect(() => {
    const ismaybe = maybe();
    setIsMaybe(ismaybe);
  }, [maybe]);

  return (
    <Paper
      py="xs"
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-2)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--mantine-color-body)",
      }}
    >
      <Container size="lg">
        <Group justify="space-between">
          <Group>
            <Link href={isMaybe ? "/dashboard" : "/"}>
              <ActionIcon variant="subtle" size="md" aria-label="Home">
                <IconHome size={18} />
              </ActionIcon>
            </Link>
          </Group>
          {isLoggedIn() && (
            <Menu width={150} shadow="md">
              <Menu.Target>
                <Group style={{ cursor: "pointer" }}>
                  <IconUserCircle size={24} style={{ color: "#228be6" }} />
                  <Text fw={500}>{user?.username}</Text>
                </Group>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={logout}>
                  <div className="flex items-center justify-between">
                    Logout <IconLogout size={16} />
                  </div>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
          {extraActions && <Group gap="xs">{extraActions}</Group>}
        </Group>
      </Container>
    </Paper>
  );
}
