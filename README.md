# Nebulix.dev — dark neon admin starter

Nebulix portfolio frontend with an Express + PostgreSQL API and a responsive dark-neon admin dashboard.

## Included
- Admin login with bcrypt password hashes, signed JWT in an HttpOnly cookie, login rate limiting.
- Dashboard stats, inbox with status filters, mark-read/archive/restore and delete.
- Project CRUD (create, list, edit, delete).
- Public contact API that stores submissions in PostgreSQL.
- Basic input validation, parameterized SQL, Helmet headers and JSON request-size limits.
- Existing supplied portfolio frontend is preserved in `public/`.

## Requirements
- Node.js 20+
- PostgreSQL 14+ (or a hosted PostgreSQL instance)

## Setup
1. Create a database, for example `nebulix`.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL`, `JWT_SECRET` (at least 32 characters), `ADMIN_USERNAME`, and a strong unique `ADMIN_PASSWORD`.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create tables and the initial admin user:
   ```bash
   npm run db:init
   ```
   Existing admin usernames are not overwritten. To change an admin password later, update the `admins.password_hash` using a one-off Node script with `bcryptjs` or implement a password-change screen.
6. Start:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:3000` for the portfolio and `http://localhost:3000/admin` for the control center.

## API overview
- `POST /api/contact` — public contact message: `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/me`
- `GET /api/admin/stats`
- `GET /api/admin/messages?status=new|read|archived`
- `PATCH /api/admin/messages/:id` — `{ "status": "read" }`
- `DELETE /api/admin/messages/:id`
- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`
- `GET /api/health`

## Contact form integration
The included portfolio currently uses a `mailto:` contact link, so it does not submit to the API yet. To connect it, replace that link in `public/index.html` with a form containing `name`, `email`, `subject`, and `message`, then `fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(formData) })`. The API endpoint is implemented and ready.

## Important before deployment
- Use HTTPS in production and set `NODE_ENV=production`.
- Use a long, random `JWT_SECRET` and a strong unique admin password. Never commit `.env`.
- Configure PostgreSQL network access and backups at your host.
- Consider adding CSRF protection if the admin API expands, email notifications, a password change flow, and audit logs.
- Project CRUD data is stored in PostgreSQL. The current public project cards are still static HTML; they need to be rendered from a public projects API to sync admin edits to the visible portfolio. This starter keeps the original front end intact and does not pretend that sync is already wired.
- This package is a starter implementation. Run the setup steps and test in your own environment before public deployment.
