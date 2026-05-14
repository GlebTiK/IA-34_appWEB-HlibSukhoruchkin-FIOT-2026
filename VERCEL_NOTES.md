# Vercel notes

This branch is configured to run as a Vercel Node.js serverless function through `api/index.js` and `vercel.json`.

## Required Vercel environment variables

Use the same database/JWT variables as the local project:

```env
DB_HOST=...
DB_PORT=3306
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_SSL=true
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secret123
ADMIN_FULL_NAME=Administrator
SEQUELIZE_SYNC=false
```

Alternatively, use `MYSQL_URL` instead of the separate `DB_*` variables.

## Important serverless limitation

Vercel's project directory is not used for persistent writes at runtime. This version therefore:

- logs to the Vercel console instead of writing `logs/app.log` in production on Vercel;
- stores Lab 4 uploaded files in temporary `/tmp` storage on Vercel;
- keeps local file logs and local `uploads/` behavior when run with `npm start` on your computer.

Temporary `/tmp` files are not permanent. For a real production upload feature, use external storage such as S3, Cloudinary, UploadThing, or Vercel Blob.


## Static frontend routing

The static Puppy Haven frontend is kept in `public/`, the same way as the Lab 3 branch.

On Vercel:

- `/` serves `public/index.html`
- `/about.html`, `/css/style.css`, `/js/main.js`, `/assets/...` are served as static files
- `/api/*` is routed to the Node.js serverless function in `api/index.js`
