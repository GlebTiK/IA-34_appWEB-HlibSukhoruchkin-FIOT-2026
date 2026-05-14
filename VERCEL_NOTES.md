# Vercel notes for Lab 4

This project is configured so that Vercel serves the static frontend from `public/` and sends only backend API requests to the serverless function.

Routes:

- `/` -> `public/index.html`
- `/about.html` -> `public/about.html`
- `/css/style.css` -> `public/css/style.css`
- `/js/main.js` -> `public/js/main.js`
- `/assets/...` -> files from `public/assets/...`
- `/api/*` -> Express backend through `api/index.js`

Do not route every request to `api/index.js`, otherwise Vercel may return 404 for static pages or treat the frontend as a backend route.

Required environment variables:

```env
MYSQL_URL=...
DB_SSL=true
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
SEQUELIZE_SYNC=false
```

Optional admin bootstrap variables:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secret123
ADMIN_FULL_NAME=Administrator
```

The admin variables are only used to auto-create an admin user during backend initialization. They are not required for the static frontend.
