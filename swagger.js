'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Puppy Haven API',
      version: '1.0.0',
      description: 'REST API with MySQL, authentication and visit requests for Puppy Haven.'
    },
    servers: [{ url: SERVER_URL }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      },
      schemas: {
        Puppy: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Buddy' },
            description: { type: 'string', example: 'Friendly puppy' },
            age_months: { type: 'integer', example: 4 },
            price_uah: { type: 'number', example: 12000 },
            photo_url: { type: 'string', example: '/img/puppy-1.jpg' }
          }
        },
        VisitRequestInput: {
          type: 'object',
          required: ['puppy_id', 'visitor_name', 'phone', 'visit_datetime'],
          properties: {
            puppy_id: { type: 'integer', example: 1 },
            visitor_name: { type: 'string', example: 'Hlib Sukhoruchkin' },
            phone: { type: 'string', example: '+380501112233' },
            visit_datetime: { type: 'string', format: 'date-time', example: '2026-05-20T12:00:00.000Z' },
            note: { type: 'string', example: 'Want to visit in the afternoon' }
          }
        },
        UserRegisterInput: {
          type: 'object',
          required: ['full_name', 'email', 'password', 'password_confirm'],
          properties: {
            full_name: { type: 'string', example: 'Hlib Sukhoruchkin' },
            email: { type: 'string', example: 'hlib@example.com' },
            password: { type: 'string', example: 'secret123' },
            password_confirm: { type: 'string', example: 'secret123' }
          }
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'hlib@example.com' },
            password: { type: 'string', example: 'secret123' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
});
