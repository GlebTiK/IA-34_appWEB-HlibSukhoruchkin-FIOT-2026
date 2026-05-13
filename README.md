# Lab 5 — Security, performance and tests

This local branch continues the Puppy Haven backend and adds:

- HTTP security headers with Helmet;
- global rate limiting and login rate limiting;
- input validation with express-validator;
- pagination and optimized field selection for `GET /api/puppies`;
- response compression;
- optional Redis cache via `REDIS_URL` with in-memory fallback;
- Jest + Supertest API tests;
- Artillery load test scenario;
- Dockerfile.

## Run

```bash
npm install
cp .env.example .env
npm run db:sync
npm run db:seed
npm start
```

## Test

```bash
npm test
npm run artillery
```

Suggested branch name: `lab5`.
