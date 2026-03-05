import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerDefinition = {
  openapi: '3.0.1',
  info: {
    title: 'Backend API',
    version: '1.0.0',
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const apis = ['./src/routes/*.ts', './dist/routes/*.js'];

export const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis,
});
