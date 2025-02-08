
import { Container, Group, Button, Image } from '@mantine/core';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-4 border-b">
      <Container size="lg">
        <Group justify="space-between">
          <Link href="/">
            <Image
              src="https://markketplace.nyc3.digitaloceanspaces.com/uploads/968ff4839f8b0cf91f105b8a2de35bec.png"
              alt="Markket"
              style={{ maxHeight: '40px' }}
            />
          </Link>

          <Group>
            <Button component={Link} href="/stores" variant="light">
              Stores
            </Button>
            <Button component={Link} href="/docs" variant="light">
              Docs
            </Button>
          </Group>
        </Group>
      </Container>
    </header>
  );
};

export default Header;
