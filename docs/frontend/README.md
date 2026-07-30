# Nama Organisasi LMS Frontend

The frontend is a Create React App/CRACO single-page application using React 19, React Router, Axios, Tailwind CSS, Radix UI primitives, and i18next.

## Setup

```bash
cd frontend
cp .env.example .env  # if an example is added; otherwise create .env manually
npm install --legacy-peer-deps
```

Required environment value:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:8001
```

Do not include `/api`; `src/services/api.js` appends it.

## Commands

```bash
npm start
npm test -- --watchAll=false
npm run build
```

## Browser routes

| Path | Access | Screen |
|---|---|---|
| `/` | Public | Home |
| `/courses` | Public | Course catalog |
| `/courses/:id` | Public | Course detail |
| `/login` | Public | Login |
| `/register` | Public | Registration |
| `/my-learning` | Authenticated | Enrolled courses |
| `/learn/:id` | Authenticated | Course player |
| `/instructor` | Authenticated UI; API enforces instructor role | Instructor dashboard |
| `/admin` | Authenticated UI; API enforces admin role | Admin dashboard |
| `/profile` | Authenticated | Profile |

## Important modules

- `src/App.js`: route tree and authentication guard.
- `src/context/AuthContext.js`: session restore, login, registration, logout, profile state.
- `src/services/api.js`: Axios instance and all backend calls.
- `src/i18n/config.js`: language initialization.
- `src/i18n/locales/`: Indonesian and English catalogs.
- `src/pages/`: route-level feature screens.
- `src/components/ui/`: reusable Radix/Tailwind-based controls.

## Authentication behavior

The bearer token and cached user are stored in `localStorage`. At startup the app calls `/api/auth/me`; an invalid token is cleared. API role checks are authoritative. A frontend route being visible does not grant permission.

## Production build

Set `REACT_APP_BACKEND_URL` to the public HTTPS API origin before running `npm run build`. Deploy the generated `frontend/build/` directory with SPA fallback to `index.html`.

## Known considerations

- The project currently uses `--legacy-peer-deps` for installation compatibility; dependency upgrades should remove that need when possible.
- Protect against XSS because tokens live in `localStorage`.
- Add route-level role guards for clearer UX, while keeping backend role enforcement.
- Third-party image/avatar URLs require outbound browser access.
