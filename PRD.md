# FreightBrokerCMR — Product Requirements Document

**Status:** Working product baseline; implementation status must be verified in code  
**Product:** Multi-tenant freight brokerage operations platform  
**Target mobile stack:** Expo SDK 58, React Native 0.88, React 19.3, Expo Router, TypeScript  
**Current repository baseline:** package.json currently declares Expo SDK 54 / React Native 0.81.4 / React 19.1.0; SDK 58 migration is required  
**API:** Node.js/Express + MongoDB

## 1. Product vision
Provide brokerage staff with a secure, dependable mobile companion for time-sensitive carrier, load and dispatch operations. Mobile must use the same tenant boundaries, permissions and business rules as web.

## 2. Goals
- Let authorized users securely sign in and work in their company workspace.
- Make dashboard, load board, load creation/detail and carrier directory workflows practical on phones.
- Support field-friendly status updates, carrier lookup and dispatch actions as approved by role.
- Handle unreliable connectivity, expired sessions and API errors without losing user work.
- Keep sensitive business and document data protected on device.

## 3. Users
Company owner/admin, broker/dispatcher, compliance officer, finance user and read-only/auditor. Mobile navigation and actions must follow API permissions. The backend remains the authorization authority.

## 4. Core mobile modules
1. Authentication, session restore, expiry and logout.
2. Tenant/workspace context and role-aware navigation.
3. Dashboard with operational summaries and actionable alerts.
4. Load board with filters and pagination.
5. Load creation, detail, status timeline and permitted updates.
6. Carrier directory, search and carrier detail.
7. Carrier assignment/dispatch actions with server-confirmed conflict feedback.
8. Notifications and activity history.
9. Compliance review and document access where approved for mobile.
10. Finance read views and approved actions as a later phase.

## 5. Mobile UX requirements
- Touch-first layouts, safe-area handling, readable typography and accessible controls.
- Every screen provides loading, empty, offline/network error, forbidden and retry states.
- Forms preserve drafts after recoverable failures and prevent duplicate submissions.
- Use pagination or bounded loading for lists.
- Clearly show pending versus server-confirmed changes.
- Avoid placing large sensitive documents or unnecessary personal data in persistent local storage.
- Support Android as the primary release target; iOS compatibility must be tested before claiming support.

## 6. Business and security rules
- All business decisions, eligibility checks and state transitions come from the backend.
- Tenant context must be tied to authenticated membership.
- Tokens must be stored only through the approved secure-storage strategy; current AsyncStorage JWT persistence must be migrated to secure storage before production release.
- Logout and session revocation must clear local session material.
- Offline mode must not pretend an unconfirmed mutation succeeded.
- External compliance states distinguish verified, pending, stale, unavailable and failed.

## 7. Non-functional requirements
Performance: efficient lists, optimized images and limited background work. Reliability: request timeouts, safe retry rules and clear offline messaging. Security: secure token storage, no secrets in Expo public variables, minimal local data retention. Accessibility: screen-reader labels, adequate touch targets and scalable text. Compatibility: use Expo SDK 58-compatible package versions, React Native 0.88 and React 19.3; verify the complete dependency matrix using Expo's installer and doctor before release.

## 8. Integrations and staged scope
Push notifications, camera/document capture, GPS/ELD, load-board, insurance verification and offline synchronization require approved provider/configuration, permissions, privacy review and acceptance tests. Do not ship fake provider responses.

## 9. Out of scope for core
A complete driver/shipper portal, continuous location tracking, autonomous dispatch and complex offline mutation synchronization until backend contracts and security model are approved.

## 10. Success and acceptance
Core login, dashboard, carrier lookup and load workflow must work against staging API on real Android hardware. Permission, tenant-isolation, session, network-failure and duplicate-action tests must pass. A successful Expo export alone is insufficient.

## 11. Mobile repository responsibilities
Own the native/mobile user experience, Expo configuration, navigation, local presentation/session state, typed API client, secure device integration, mobile-specific permissions and EAS build configuration. Backend owns authoritative business rules and authorization.

## 12. Open decisions
Confirm secure token storage, push provider, supported Android/iOS versions, document capture/retention, offline requirements and mobile-specific role permissions before implementation.
