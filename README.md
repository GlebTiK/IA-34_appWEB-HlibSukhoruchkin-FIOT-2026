# Lab 6 — Swagger/OpenAPI documentation and deployment

This local branch continues the Puppy Haven backend and adds:

- Swagger/OpenAPI documentation with `swagger-jsdoc`;
- Swagger UI at `/api-docs`;
- raw OpenAPI JSON at `/openapi.json`;
- documented REST endpoints for puppies, visit requests and auth;
- MySQL/Sequelize CRUD basis reused from previous labs;
- Render deployment config in `render.yaml`;
- production-friendly `PORT` support.

## Run

```bash
npm install
cp .env.example .env
npm run db:sync
npm run db:seed
npm start
```

Open:

```text
http://localhost:3000/api-docs
```

Suggested branch name: `lab6`.
