import { createSwaggerSpec } from 'next-swagger-doc';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(
  () => import('swagger-ui-react'),
);

export const metadata = {
  title: 'API Documentation - Markket',
  description: 'API documentation for Markket Next.ts application'
};

async function generateSpec() {
  return createSwaggerSpec({
    apiFolder: 'app/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'MarkketNext API',
        version: '1.0',
      },
    },
  });
}


export default async function ApiDoc() {
  const spec = await generateSpec();

  return (
    <div className="api-docs">
      <SwaggerUI spec={spec} />
    </div>
  );
};
