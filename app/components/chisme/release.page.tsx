import { formatReleaseDate, Release } from '@/app/utils/cision';
import { Title, Container, Paper, Text, Badge, Group, Button, Stack, Box } from "@mantine/core";
import Link from 'next/link';
import { IconArrowLeft, IconBrandGoogle } from '@tabler/icons-react';

type Props =  {
  release: Release,
}

const ReleasePage = ({release}: Props) => {

  return (
    <Container my="lg">
      <Stack gap="lg">
        <Group>
          <Link href={`/chisme#${release.release_id}`} passHref>
            <Button leftSection={<IconArrowLeft size={14} />} variant="outline">
              Back to Chisme
            </Button>
          </Link>
          <Button
            component="a"
            href={`https://google.com/search?q="${encodeURIComponent(release.title)}" ${release?.company?.[0]}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="light"
            radius="md"
            size="sm"
            leftSection={<IconBrandGoogle size={18} />}
          >
            Read more
          </Button>
        </Group>

        <Paper shadow="xs" p="md" withBorder>
          <Stack gap="md">
            <Title order={2}>{release?.title}</Title>

            <Group>
              <Text size="sm" c="dimmed">Published:</Text>
              <Text size="sm">{formatReleaseDate(release.date)}</Text>
            </Group>

            <Group>
              <Text size="sm" c="dimmed">Source:</Text>
              <Text size="sm" fw={500}>{release?.source_company}</Text>
            </Group>

            {release?.geography?.length > 0 && (
              <Group gap="xs">
                <Text size="sm" c="dimmed">Geography:</Text>
                {release.geography.map((geo) => (
                  <Badge key={geo} variant="light">{geo}</Badge>
                ))}
              </Group>
            )}

            {release?.industry?.length > 0 && (
              <Group gap="xs">
                <Text size="sm" c="dimmed">Industry:</Text>
                {release.industry.map((ind) => (
                  <Badge key={ind} variant="light" color="blue">{ind}</Badge>
                ))}
              </Group>
            )}

            {release?.subject?.length > 0 && (
              <Group gap="xs">
                <Text size="sm" c="dimmed">Subject:</Text>
                {release.subject.map((sub) => (
                  <Badge key={sub} variant="light" color="teal">{sub}</Badge>
                ))}
              </Group>
            )}

            <Box style={{ fontSize: 'var(--mantine-font-size-md)', lineHeight: 'var(--mantine-line-height-md)' }}>
              <style dangerouslySetInnerHTML={{ __html: release?.style || '' }} />
              <div dangerouslySetInnerHTML={{ __html: release?.body || '' }}></div>
            </Box>

          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}

export default ReleasePage;
