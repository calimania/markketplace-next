import { Release } from '@/app/utils/cision';
import { Title, Container } from "@mantine/core";

type Props =  {
  release: Release,
}

const ReleasePage = ({release}: Props) => {

  return (
    <Container>
      <Title>{release?.title}</Title>
      <div dangerouslySetInnerHTML={{ __html: release?.body }}>
      </div>
    </Container>
  )
}

export default ReleasePage;
