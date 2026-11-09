# Mobile Engineering Rules

These rules apply to the FreightBrokerCMR Expo / React Native application.

## Approved stack and version policy
- Target Expo SDK: **58 (latest stable baseline)**.
- Target React Native: **0.88**.
- Target React: **19.3.0**.
- Navigation: Expo Router version compatible with SDK 58.
- Language: TypeScript strict mode.
- Auth state: existing React Context pattern unless a measured need justifies a replacement.
- API: typed helpers in `components/api.ts`, using the documented backend URL.
- Local session storage: use Expo SecureStore (or an explicitly approved secure equivalent) for authentication tokens; do not use plain AsyncStorage for credentials.
- CI: `npm ci`, TypeScript typecheck, Expo export/build checks and `npx expo-doctor`.
- Native builds: EAS profiles and documented environment configuration.

**Repository status:** package.json currently pins Expo SDK 54, React Native 0.81.4 and React 19.1.0. This is below the target. Complete and verify the SDK 58 migration before treating the mobile app as SDK 58-compliant. Do not merely change version strings by hand.

## Upgrade requirements
1. Follow the official Expo SDK 58 upgrade guide and changelog.
2. Upgrade the Expo package and align all Expo/React Native dependencies using `npx expo install --fix`.
3. Run `npx expo-doctor`; resolve incompatibilities rather than suppressing warnings.
4. Review SDK 58 and React Native 0.88 breaking changes and removed/deprecated APIs.
5. Regenerate native projects when using Continuous Native Generation; otherwise apply the documented native project changes.
6. Rebuild development clients and EAS production binaries after native dependency changes.
7. Run typecheck, lint, export, Android device smoke tests and EAS build before merging.
8. Commit the lockfile with package changes; CI must use `npm ci`.

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
- Do not persist JWTs or credentials in plain AsyncStorage for production.
- Do not hardcode backend URLs or credentials in source.
- Do not claim a mutation succeeded before the API confirms it.
- Do not retry non-idempotent actions blindly after timeouts.
- Do not implement authoritative eligibility, compliance or financial calculations in the app.
- Do not silently switch tenants or reuse cached data across accounts.
- Do not add background location tracking without explicit product approval and user permission.
- Do not add native packages without checking SDK 58 compatibility, maintenance, license and security.
- Do not downgrade Expo SDK or pin mismatched React Native/React versions without an approved compatibility reason.
- Do not disable typecheck, Expo Doctor or export checks to hide regressions.

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
- Expo Doctor, typecheck, lint, Expo export and EAS build smoke checks.
- Real-device tests against the supported Android/iOS matrix.

## Completion checklist
- [ ] SDK 58 and matching React Native/React dependency matrix installed.
- [ ] Expo Doctor reports no unresolved compatibility errors.
- [ ] Secure token storage implemented and tested.
- [ ] Tenant/account switching clears stale state.
- [ ] Loading/empty/error/offline/forbidden states handled.
- [ ] No secrets in public config or logs.
- [ ] Android device tests pass.
- [ ] Typecheck, lint and Expo export pass.
- [ ] EAS development and production builds verified.
