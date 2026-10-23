# FreightBrokerCMR Mobile (Expo)

Expo client for the FreightBrokerCMR platform. Unlike the web app (which goes
through the Next.js BFF and an httpOnly cookie), the mobile app talks to the
**Express backend on Render directly** and stores the returned JWT in
AsyncStorage.

## Stack

| Concern    | Choice                                              |
| ---------- | --------------------------------------------------- |
| Runtime    | Expo SDK 54 (`expo@~54.0.0`)                        |
| Navigation | `expo-router` (file-based, `app/` directory)        |
| Auth state | React Context + `@react-native-async-storage/async-storage` |
| HTTP       | `fetch` via `components/api.ts`                     |
| Language   | TypeScript (strict)                                 |

## Environment variables

All Expo public variables must be prefixed with `EXPO_PUBLIC_` to be inlined
into the bundle by the Metro bundler.

| Variable                        | Required | Description                                                        |
| ------------------------------- | -------- | ------------------------------------------------------------------ |
| `EXPO_PUBLIC_BACKEND_API_URL`   | Yes      | Base URL of the Render backend, e.g. `https://freightbroker-backend.onrender.com` (no trailing slash) |

Create a local `.env` (git-ignored) or export it before starting:

```bash
EXPO_PUBLIC_BACKEND_API_URL=https://freightbroker-backend.onrender.com
```

> **Note:** `EXPO_PUBLIC_*` values are embedded in the app bundle and are
> therefore *not* secret. Never place a secret in them. The backend enforces
> authorization via the JWT, so the mobile app only ever needs the public URL.

## Running locally

```bash
cd mobile
npm install
npx expo start
```

Then press `a` (Android), `i` (iOS) or `w` (web) in the Metro terminal.

To point at a locally running backend use `http://localhost:5000`. Note that
Android emulators reach the host machine via `http://10.0.2.2:5000`.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npx expo export --platform web --output-dir /tmp/expo-export   # bundle check
```

## Project layout

```
mobile/
├── app.json                 # Expo config (expo-router plugin, assets)
├── app/
│   ├── _layout.tsx          # Root layout: AuthProvider + Stack
│   ├── (auth)/
│   │   ├── _layout.tsx      # Redirects signed-in users to (app)
│   │   ├── login.tsx        # POST /api/auth/login
│   │   └── signup.tsx       # POST /api/auth/register
│   └── (app)/
│       ├── _layout.tsx      # Redirects anonymous users to (auth)/login
│       ├── index.tsx        # Dashboard + sign out
│       ├── loads/index.tsx  # Load board with status filters
│       ├── loads/create.tsx # POST /api/loads
│       ├── loads/[id].tsx   # Load detail + carrier assignment
│       └── carriers/index.tsx # Carrier directory with search
├── components/
│   ├── api.ts               # Typed API client + endpoint helpers
│   ├── AuthContext.tsx      # Session state + AsyncStorage persistence
│   └── ui.tsx               # Shared styles, StatusBadge, DataPoint
├── assets/                  # icon / adaptive-icon / splash / favicon
└── tsconfig.json
```

## Authentication flow

1. `login()` / `register()` call the backend and receive `{ token, user }`.
2. The JWT is written to AsyncStorage under the key `fbc_session`.
3. Every subsequent request attaches `Authorization: Bearer <token>`.
4. On cold start, `AuthContext` reads the stored token and validates it with
   `GET /api/auth/me`. An invalid or expired token is discarded and the user
   is returned to the login screen.
5. `logout()` removes the token from AsyncStorage.

## Deploying to Expo (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile production
eas build --platform android --profile production
```

Set `EXPO_PUBLIC_BACKEND_API_URL` in the EAS project environment (or in
`eas.json` `env`) before building — the value is baked into the bundle at
build time.
