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


## Vercel deploy

This archive includes `api/index.js` and `vercel.json`. Push the branch to GitHub, import it in Vercel, and set the same MySQL/JWT/admin environment variables as in `.env.example`. On Vercel, logs are written to the function console instead of `logs/app.log`. Lab 4 uploads use temporary `/tmp` storage on Vercel.
