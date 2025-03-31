import { Container, Grid, Paper, Stack, Text, Group, Card, Avatar, Badge } from '@mantine/core';
import { IconBuildingStore, IconCalendarClock, IconHomeShare, IconLink } from '@tabler/icons-react';
import { useContext } from 'react';
import { DashboardContext } from '@/app/providers/dashboard.provider';
import { Store } from '@/markket';
import StoreMedia  from '../ui/store.media';

function StoreUploadPage() {
  const { store, setSelectedStore } = useContext(DashboardContext);

  if (!store) return null;

  return (
    <>
      <Container size="lg" py="xl">
        {
          store && (
            <Stack gap="xl">
              <Paper shadow="sm" p="lg" withBorder>
                <Group wrap="nowrap" gap="xl">
                  <Avatar
                    src={store.Favicon?.url || store.Logo?.url}
                    size={100}
                    radius="md"
                  />
                  <div style={{ flex: 1 }}>
                    <Text fz="lg" fw={500} mb={3}>
                      {store.title}
                    </Text>
                    <Markdown content={store.Description || ''} />
                    <Group gap="xs">
                      <Badge color="blue">Active</Badge>
                      {store.URLS?.length > 0 && (
                        <Badge color="teal">URLs</Badge>
                      )}
                    </Group>
                  </div>
                </Group>
              </Paper>
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Card.Section p="md">
                      <Group>
                        {store?.Favicon?.url ?
                          <img src={store.Favicon.url} alt={`${store.title} site icon`} width={24} height={24} /> :
                          (<IconBuildingStore size={24} />)
                        }
                        <Text fw={500}>Store Details</Text>
                      </Group>
                    </Card.Section>
                    <Stack gap="xs" mt="md">
                      <Group>
                        <IconHomeShare size={18} />
                        <Text size="sm">
                          <Link href={`/store/${store?.slug}`} target="de.preview" title={store?.title} className='cursor-pointer'>
                            <strong>Slug: </strong>
                            <span className="text-markket-blue">{store.slug}</span>
                          </Link>
                        </Text>
                      </Group>
                      <Group>
                        <IconCalendarClock size={18} />
                        <Text size="sm">
                          <strong>Created:</strong> {new Date(store.createdAt).toLocaleDateString()}
                        </Text>
                      </Group>
                      {!!store.URLS?.length && (
                        <>
                          <Text size="sm">
                            <strong>URLs:</strong>
                          </Text>
                          {store.URLS.map((url, i) => (
                            <Group key={i}>
                              <IconLink size={18} />
                              <Link href={url.URL} target="_blank" className='text-markket-blue'>
                                {url.Label || url.URL}
                              </Link>
                            </Group>
                          ))}
                        </>
                      )}
                    </Stack>
                  </Card>
                </Grid.Col>
                {store.SEO && (
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                      <Card.Section p="md">
                        <Group>
                          <IconLink size={24} />
                          <Text fw={500}>Social share Preview</Text>
                        </Group>
                      </Card.Section>
                      {(store.Cover?.url || store.SEO.socialImage) && (
                        <Image
                          src={store.SEO?.socialImage?.url || store.Cover?.url}
                          height={200}
                          alt="Store social preview"
                          mt="md"
                        />
                      )}
                      <Text fz="lg" fw={500} mt="md">
                        {store.SEO.metaTitle || store.title}
                      </Text>
                      <Text size="sm" c="dimmed" mt="xs">
                        {store.SEO.metaDescription}
                      </Text>
                    </Card>
                  </Grid.Col>
                )}
                <Grid.Col span={{ base: 12 }}>
                  <StoreMedia store={store} onUpdate={(media, field, id) => {
                    if (store?.id !== id) return;

                    if (field?.startsWith('SEO')) {
                      const newStore = {
                        ...store,
                        SEO: {
                          ...store?.SEO as Store['SEO'],
                          [field.split('.')[1]]: media
                        }
                      };
                      setSelectedStore(newStore);
                      return;
                    }
                    setSelectedStore({ ...store, [field]: media });
                  }} />
                </Grid.Col>
              </Grid>
            </Stack>
          )
        }
      </Container >
    </>
  );
}

export default StoreUploadPage;
