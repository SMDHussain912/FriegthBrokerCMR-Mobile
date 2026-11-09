# Mobile Engineering Rules

These rules apply to the FreightBrokerCMR Expo / React Native application.

## Approved stack
- Runtime: existing Expo SDK 54; upgrade only as a planned compatibility change.
- Framework: React Native with Expo Router and the existing `app/` route structure.
- Language: TypeScript strict mode.
- Auth state: existing React Context pattern unless a measured need justifies a replacement.
- API: typed helpers in `components/api.ts`, using the documented backend URL.
- Local session storage: migrate JWT persistence from AsyncStorage to Expo SecureStore (or an explicitly approved equivalent) before production release.
- CI: `npm ci`, TypeScript typecheck and Expo export/build checks.
- Native builds: EAS profiles and documented environment configuration.

## Architecture
1. Keep route screens focused; extract reusable UI and domain components.
2. Centralize HTTP behavior, auth headers, timeouts and error mapping in the API client.
3. Keep request/response types aligned with backend contracts; do not invent client-only API fields.
4. Keep server state distinct from temporary form/UI state.
5. Handle app foreground/background and session expiry explicitly.
6. Use bounded/paginated list requests and avoid unnecessary polling.
7. Make platform-specific behavior explicit; test Android and iOS separately where supported.
8. Keep navigation guards for user experience, not as a substitute for API authorization.

## Security — must do
- Store authentication tokens in secure device storage before production.
- Never put secrets in `EXPO_PUBLIC_*`; those values are bundled into the app.
- Clear session material on logout and invalid/expired session.
- Request camera, media, location and notification permissions only when the feature needs them; explain the purpose.
- Minimize sensitive data cached on device and define retention/clearance behavior.
- Use HTTPS for production API traffic.
- Protect document previews/downloads and avoid logging private data or tokens.
- Treat deep links and notification payloads as untrusted input.

## Must not do
- Do not persist JWTs in plain AsyncStorage for production.
- Do not hardcode backend URLs or credentials in source.
- Do not claim a mutation succeeded before the API confirms it.
- Do not retry non-idempotent actions blindly after timeouts.
- Do not implement authoritative eligibility, compliance or financial calculations in the app.
- Do not silently switch tenants or reuse cached data across accounts.
- Do not add background location tracking without explicit product approval and user permission.
- Do not add native packages without checking Expo SDK compatibility, maintenance, license and security.
- Do not disable typecheck or export checks to hide regressions.

## UX and quality
- Provide loading, empty, error, offline, forbidden and retry states.
- Prevent duplicate taps on submit actions and show server-confirmed outcomes.
- Preserve unsent form drafts where safe.
- Support safe areas, keyboard behavior, accessible labels and adequate touch targets.
- Use platform conventions and test on actual Android devices, not only web export.
- Avoid storing large files or full API payloads unnecessarily.

## Required tests
- Auth restore, expired token, logout and account switching.
- API success, validation errors, timeout/offline and retry behavior.
- Tenant/role-specific navigation and server-side forbidden responses.
- Load creation/detail and assignment conflict handling.
- Duplicate-submit protection and stale screen state after navigation.
- Typecheck, Expo export and EAS build smoke checks.

## Completion checklist
- [ ] Backend contract and permissions confirmed.
- [ ] Secure token storage implemented and tested.
- [ ] Tenant/account switching clears stale state.
- [ ] Loading/empty/error/offline/forbidden states handled.
- [ ] No secrets in public config or logs.
- [ ] Android device tests pass.
- [ ] Typecheck and Expo export pass.
- [ ] EAS profile/environment configuration documented.
