# Mobile Delivery Phases

This plan aligns with the web and backend plans. Mobile work must consume stable API contracts; backend authorization remains authoritative.

## Phase 0 — Repository baseline and SDK 58 migration
**Work:** inventory routes/screens, API helpers, auth/session behavior, Expo config, permissions, CI and EAS profiles. Current package.json uses Expo SDK 54, React Native 0.81.4 and React 19.1.0; upgrade to SDK 58 / React Native 0.88 / React 19.3.0. Align dependencies, review breaking changes and regenerate/update native projects as required.  
**Outputs:** screen inventory, API gap list, dependency compatibility report, completed SDK 58 migration, updated lockfile, Expo Doctor report, device compatibility matrix, security risk list and baseline typecheck/export report.  
**Exit gate:** SDK 58 dependency alignment is complete; Expo Doctor, typecheck, lint and export pass; development build launches on a real Android device; existing screens and unsupported workflows are documented.

## Phase 1 — Authentication and tenant foundation
**Work:** login/register, session restore/expiry/logout, secure token storage, tenant context, role-aware navigation and account-switch cleanup.  
**Outputs:** secure session implementation, auth error states, tenant-aware app shell and tests.  
**Exit gate:** tokens are not stored in plain AsyncStorage; account switching cannot expose cached data from another tenant.

## Phase 2 — Dashboard and carrier CRM
**Work:** dashboard summaries, carrier directory/search/detail, contact/equipment information and permitted compliance/document views.  
**Outputs:** touch-friendly screens, bounded list loading, empty/error states and permission tests.  
**Exit gate:** real API data loads correctly and private carrier/document data remains protected.

## Phase 3 — Loads and dispatch
**Work:** load board, filters, create/detail, lifecycle status, carrier assignment and conflict handling.  
**Outputs:** complete mobile load workflow, server-confirmed status feedback, duplicate-submit protection and integration tests.  
**Exit gate:** load creation through permitted dispatch action works on Android against staging API.

## Phase 4 — Notifications and compliance workflows
**Work:** notification center/preferences, approved push integration, compliance alerts and document capture/review where supported.  
**Outputs:** notification registration/handling, permission prompts, expiry/review screens and delivery/error tests.  
**Exit gate:** notification and document states are trustworthy; denied permissions and provider outages are handled.

## Phase 5 — Finance and advanced mobile workflows
**Work:** approved read views/actions for invoices, payables, expenses and settlements; offline read cache only if approved.  
**Outputs:** role-gated finance screens, reconciliation display and documented offline boundaries.  
**Exit gate:** figures match API values; offline behavior never presents unconfirmed writes as successful.

## Phase 6 — Device, security and release hardening
**Work:** Android/iOS compatibility as supported, secure storage review, permission/privacy review, performance, crash handling and EAS configuration.  
**Outputs:** device test matrix, security checklist, EAS build artifacts, release notes and rollback/remote-update policy.  
**Exit gate:** real-device smoke tests, typecheck, Expo export and production-profile build pass on SDK 58.

## Phase 7 — Release and operations
**Work:** staged rollout, crash/usage monitoring, feedback triage and hotfix process.  
**Outputs:** release evidence, known-issues list, support/runbook notes and prioritized next iteration.  
**Exit gate:** critical mobile workflows remain stable and no release-blocking security issue remains.

## Required phase report
- Screens and user journeys delivered.
- API contracts consumed and backend dependencies.
- SDK and dependency versions, Expo Doctor results and migration notes.
- Secure storage and permission impact.
- Device/OS versions tested.
- Tests and exact results.
- EAS build/deployment evidence.
- Known issues, offline limitations and next dependencies.

A web export or successful build does not prove native Android behavior is production-ready.
