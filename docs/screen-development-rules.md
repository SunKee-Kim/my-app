# Screen Development Rules

UI/layout rules for admin/management screens in this project.
Referenced from `CLAUDE.md`. Load this file when creating or modifying screen layouts, page components, or `AppLayout`.

## Scope (what these rules do NOT apply to)

- **Login screen** (`/login`) is exempt. It is a standalone, full-viewport screen that does not use `AppLayout`, has no sidebar/top bar/bottom status bar, and may be sized freely (typically centered on the viewport). The rules below — resolution, top bar, bottom status bar — apply only to screens rendered inside `AppLayout`.

## Resolution

- **Target resolution: 1920 × 1080** (Full HD desktop). All admin/management screens are designed for this viewport.
- Layout should fit cleanly within 1920px width without horizontal scroll.
- Use this as the baseline when sizing containers, tables, sidebars, and spacing.
- Responsive/mobile support is NOT required unless explicitly requested.

Implementation: outer `Layout` in `src/components/AppLayout.js` sets `minWidth: 1920, minHeight: 1080`.

## Top Bar (Header)

- The top bar displays the **current screen name** automatically, derived from the active route in `AppLayout`.
- Page components MUST NOT render their own screen-name title (no `<h2>사용자 관리</h2>` inside a page). The screen name lives only in the top bar to avoid duplication.
- Page-level toolbar items (e.g. "등록" button, filter Select) remain inside the page.

Implementation: `AppLayout` looks up `menuItems` by `location.pathname` and renders the matched `label` in `<Header>`.

## Bottom Status Bar (Footer)

Every screen MUST include a status bar fixed at the bottom of the layout with three areas:

| Area | Position | Content |
|---|---|---|
| Message | Left | Status/notification text passed to the screen (e.g., "저장되었습니다.") |
| Login ID | Right | Current logged-in user's login ID |
| User Name | Right (after Login ID) | Current logged-in user's display name |

- Implement once in `AppLayout` so all pages inherit it; do not re-add per page.
- Message area is updatable from the current page via the `useStatusMessage()` hook (returns `{ message, setMessage }`).
- Login ID and user name come from the auth/session state (currently dummy values until auth is implemented).
- Pages should use `setMessage(...)` for status feedback instead of antd's `message.success/error` toasts.
