# Lab 4 — Logging, file upload and monitoring

This local branch continues the `lab3` Puppy Haven backend and adds:

- Morgan HTTP request logging;
- Winston structured file logging into `logs/app.log` and `logs/error.log`;
- response-time logging middleware;
- single file upload endpoint `POST /api/files/upload`;
- multiple file upload endpoint `POST /api/files/upload-multiple`;
- file validation by type and size;
- server monitoring endpoint `GET /api/status`;
- PM2 config in `ecosystem.config.js`.

## Run

```bash
npm install
cp .env.example .env
npm run db:sync
npm run db:seed
npm start
```

## PM2

```bash
npm run pm2:start
npm run pm2:logs
```

Suggested branch name: `lab4`.
