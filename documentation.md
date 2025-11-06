## Smart HR – Project Documentation

### Overview
Smart HR is a Next.js (App Router) portal for HR operations: authentication, employee management, attendance, leaves, tickets, notifications, leads, hosting renewals, teams, kanban boards, and real-time chat. It uses NextAuth for auth, Prisma/PostgreSQL for persistence, role/permission-based access control, and a Socket.IO-based real-time layer for chat and presence.

### Tech stack
- Next.js App Router
- TypeScript, React, TailwindCSS, shadcn/ui
- NextAuth (credentials), JWT sessions
- Prisma ORM with PostgreSQL
- Socket.IO for real-time (chat, presence)
- Nodemailer/email services

---

## Architecture and Flow
- Auth flow:
  - `app/middleware.ts` restricts `/admin/**`, redirects unauthenticated to `/login`, and blocks INACTIVE users.
  - `app/api/auth/[...nextauth]/route.ts` sets up credentials login, extends JWT/session with `id`, `role`, `status`, `onboardingCompleted`, with legacy and new role system reconciliation.
  - Providers in `app/provider.tsx` add `SessionProvider` and `PermissionProvider` globally.
  - Client-side permission checks via `contexts/PermissionContext.tsx` and `components/PermissionGuard.tsx`.

- Layout/navigation:
  - `app/layout.tsx` wraps all pages with `Providers` and `ClientLayout`.
  - `app/client-layout.tsx` renders `components/sidebar.tsx` for all authenticated pages except `/onboarding`, `/login`, `/register`.

- Dashboard:
  - `app/page.tsx` fetches session and user; redirects to `/login` or `/onboarding` when needed; loads recent `attendance`, `leaves`, `tasks`, `skills`, `performance` and renders `components/dashboard/DashboardContent.tsx`.

- Access control:
  - Server-side: `middleware/checkPermission.ts` (`withPermission`, `withAnyPermission`) validates permissions for API routes.
  - Library helpers: `lib/permissions.ts` (get/has permissions), `lib/auth.ts` (admin check).

- Data layer:
  - Prisma client: `lib/prisma.ts` (singleton). Schema in `prisma/schema.prisma` defines users, attendance, leaves, roles/permissions, tickets, notifications, leads, teams, kanban, chat, etc.

- Real-time chat:
  - `lib/websocket-server.ts` Socket.IO server with events for auth, room join/leave, send/edit/delete messages, upload files, typing indicators, read receipts, presence.

---

## Directory and File Summaries

### app/
- `layout.tsx`: Root app layout; HTML shell; wraps children with `Providers` and `ClientLayout`.
- `client-layout.tsx`: Conditionally renders `Sidebar` or `SkeletonSidebar` based on route and session.
- `provider.tsx`: Adds `SessionProvider` and `PermissionProvider` around children.
- `page.tsx`: Server page for user dashboard, enforces login/onboarding, fetches related user data; renders `DashboardContent`.
- `globals.css`: Global styles.

Pages:
- `login/page.tsx`: Credential signin form; uses `next-auth` `signIn`.
- `register/page.tsx`: Simple register page posting to `/api/auth/register`.
- `dashboard/page.tsx`: (If present) route-level dashboard page.
- `chat/page.tsx`: Chat UI entry (uses chat components and APIs).
- `kanban/page.tsx`, `kanban/[id]/page.tsx`: Kanban boards and board details.
- `leads/page.tsx`: Leads UI.
- `leaves/page.tsx`, `leaves/apply/page.tsx`: Leave list and application form.
- `onboarding/page.tsx`: User onboarding flow.
- `teams/page.tsx`, `teams/[id]/page.tsx`, `teams/[id]/edit/page.tsx`: Teams listing, details, and edit.
- `tickets/page.tsx`: Tickets module landing.
- `test-email/page.tsx`: Email delivery verification page.

Admin:
- `admin/page.tsx`: Admin landing (likely renders `AdminDashboard`).
- `admin/AdminDashboard.tsx`: Client dashboard with tabs for live alerts, attendance, employees, leaves, tickets, notifications; guards on `dashboard.admin` permission.
- Employees routes: `admin/employees/page.tsx`, `admin/employees/new/page.tsx`, `admin/employees/[id]/page.tsx`, `admin/employees/[id]/edit/page.tsx` – CRUD screens.
- Roles/Permissions: `admin/roles/page.tsx`, `admin/roles/create/page.tsx`, `admin/roles/edit/[id]/page.tsx`, `admin/permissions/page.tsx`.
- Hosting: `admin/hosting/page.tsx`, `admin/hosting/new/page.tsx`, `admin/hosting/[id]/page.tsx`.
- Users: `admin/users/page.tsx`.

### app/api/ (API routes; all use Next.js App Router `route.ts`)
Auth:
- `auth/[...nextauth]/route.ts`: NextAuth credentials authentication.
- `auth/register/route.ts`: User registration endpoint.

Users:
- `users/route.ts`: Users listing/creation (if present).
- `users/[id]/route.ts`: User details update/delete (if present).
- `users/[id]/permissions/route.ts`: Returns permissions and roles for signed-in user used by `PermissionContext`.
- `users/me/route.ts`: Current user info.
- `users/[id]/team-leader/route.ts`: Returns a leader for team banner in dashboard.

Employees:
- `employees/route.ts`:
  - GET: list employees with pagination and filters (department, status, search).
  - POST: admin-only create user and related records; assigns default Employee role; sends welcome email.
- `employees/[id]/route.ts`:
  - GET: employee with relations (emergencyContact, education, experience, documents, bankDetails).
  - PUT: admin-only full update with upserts for related models.
  - DELETE: admin-only delete with cascading related records cleanup.
- `employees/[id]/status/route.ts`: Update user status.
- `employees/[id]/role/route.ts`, `employees/[id]/system-role/route.ts`: Change user role assignments.
- `employees/check-username/route.ts`: Validate username uniqueness.
- `employees/quick-create/route.ts`: Lightweight create endpoint.

Attendance:
- `attendance/checkin/route.ts`, `attendance/checkout/route.ts`: Punch in/out with validations and hour calculations.
- `attendance/break-start/route.ts`, `attendance/break-end/route.ts`: Start/end breaks; totals tracked.
- `attendance/today/route.ts`: Returns today’s attendance.
- `attendance/stats/route.ts`: Aggregated today/week/month stats.
- `attendance/history/route.ts`: Attendance history list.
- `attendance/admin/route.ts`, `attendance/create/route.ts`, `attendance/import/route.ts`, `attendance/debug-import/route.ts`, `attendance/employee/[id]/route.ts`: Admin and import utilities.

Leaves:
- `leaves/route.ts`: Create/list leaves.
- `leaves/[id]/route.ts`: Read/update/approve/reject a leave.
- `leaves/history/route.ts`, `leaves/stats/route.ts`: Leave history and stats.

Tickets:
- `tickets/route.ts`: Query tickets (filters: createdBy/current, assignedTo/current, limit).
- `tickets/[id]/route.ts`: Ticket read/update actions.
- `tickets/[id]/comments/route.ts`: Add/list comments.

Notifications:
- `notifications/user/route.ts`: Current user notifications.
- `notifications/mark-all-read/route.ts`: Mark all as read.
- `notifications/[id]/acknowledge/route.ts`: Acknowledge one.
- Admin notifications under `api/admin/notifications/*` for creating/removing.

Admin roles and permissions:
- `api/admin/permissions/route.ts`: CRUD permissions.
- `api/admin/roles/route.ts`, `api/admin/roles/[id]/route.ts`: Roles CRUD.
- `api/admin/roles/[id]/permissions/route.ts` and nested `[permissionId]`: Attach/detach permissions to a role.
- `api/admin/users/route.ts`, `api/admin/users/[id]/roles/route.ts`: Attach roles to users.

Teams:
- `teams/route.ts`, `teams/[id]/route.ts`: Teams CRUD.
- `teams/[id]/members/route.ts`: Manage members.
- `teams/employees/route.ts`, `teams/leading/route.ts`: Queries related to teams and leadership.

Leads:
- `leads/route.ts`, `leads/[id]/route.ts`: Leads CRUD.
- `leads/import/route.ts`: Bulk import.

Kanban:
- `kanban/boards/route.ts`, `kanban/boards/[id]/route.ts`: Boards CRUD and details; `star` route to toggle stars.
- `kanban/cards/route.ts`, `kanban/cards/[id]/move/route.ts`: Cards CRUD and moving.

Hosting:
- `hosting/route.ts`, `hosting/[id]/route.ts`, `hosting/notifications/route.ts`: Hosting entries and reminders.

Clients/Dashboard/Upload/Websocket:
- `clients/route.ts`: Clients list CRUD.
- `dashboard/live/route.ts`: Live dashboard data feed.
- `upload/route.ts`: File upload handler.
- `websocket/route.ts`: Websocket/SSE bootstrap (if used by server.js).

### components/
Core:
- `sidebar.tsx`: Sidebar with permission-based navigation items; logout; collapse control.
- `SkeletonSidebar.tsx`: Loading placeholder for sidebar.
- `PermissionGuard.tsx`: Gate children by permission(s) or Admin override.
- `theme-provider.tsx`: Theme context provider (shadcn).

Dashboard:
- `dashboard/DashboardContent.tsx`: Client dashboard rendering attendance widgets, charts, ticket widgets; calls `/api/attendance/*`, `/api/tickets`.
- `dashboard/cards/*`: Live alert cards (Absent, Birthday, Break, Leaves, Tickets, HostingExpiry), container logic.
- `dashboard/NotificationDropdown.tsx`: Displays notifications; interacts with notification APIs.
- `dashboard/TicketRequestModal.tsx`: Submit new support ticket UI.

Admin tabs:
- `admin/AttendanceTab.tsx`, `EmployeesTab.tsx`, `LeavesTab.tsx`, `NotificationsTab.tsx`, `TicketsTab.tsx`: Each tab’s list/CRUD UI calling respective APIs.

Employees:
- `employees/EmployeeList.tsx`, `EmployeeForm.tsx`, `EditEmployeeForm.tsx`, `QuickAddEmployeeDialog.tsx`: CRUD forms and list tied to `api/employees`.

Leaves:
- `leaves/LeaveApplicationForm.tsx`: Submit a leave application.

Hosting:
- `hosting/HostingList.tsx`, `HostingForm.tsx`, `HostingNotifications.tsx`: Hosting management.

Kanban:
- `kanban/KanbanList.tsx`, `KanbanCard.tsx`, `BoardCard.tsx`, `CreateBoardDialog.tsx`, `CreateCardDialog.tsx`: Board and card UIs, tied to `api/kanban/*`.

Leads:
- `leads/LeadForm.tsx`, `leads/ImportLeadsDialog.tsx`: CRUD/import UIs.

Chat:
 - `chat/ChatRoomList.tsx`, `ChatWindow.tsx`, `MessageBubble.tsx`, `FileUpload.tsx`, `NewChatDialog.tsx`: UI for rooms/messages; uploads; helpers.

Register:
- `register/RegisterForm.tsx`: Extended registration form posting to `/api/auth/register`.

UI primitives:
- `components/ui/*`: shadcn/ui primitives and hooks (`button`, `card`, `dialog`, `dropdown-menu`, `form`, `table`, `toast`, etc.).

### contexts/
- `PermissionContext.tsx`: Client-side context; fetches `/api/users/{id}/permissions`; exposes list of permissions/roles and helpers (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`).

### hooks/
- `use-mobile.tsx`: Mobile detection hook for responsive UI.
- `use-toast.ts`: Toast hook (shadcn) re-export.
- `useChat.ts`: Chat-related client hook(s).

### lib/
- `prisma.ts`: Prisma client singleton.
- `permissions.ts`: Helpers to get/compute permissions and roles; `checkPermission` guard.
- `auth.ts`: `isUserAdmin` for admin checks using session and DB fallback.
- `utils.ts`: Utility `cn` for classnames.
- Email: `emailService.ts`, `serverEmailService.ts`, `nodemailer.ts`: Email sending services (server/client separation).
- Realtime: `websocket-server.ts` (TypeScript), `websocket-server.js` (JS variant).
- Prisma client generated: `lib/generated/prisma/*` (Prisma client and engines).

### middleware/
- `middleware.ts`: Global middleware guarding `/admin/**`, redirects to `/login`, blocks non-ACTIVE users for both API and pages.
- `middleware/checkPermission.ts`: Higher-order handlers to enforce permissions inside API routes.

### prisma/
- `schema.prisma`: Full database schema (Users, Roles/Permissions, Attendance, Leaves, Tickets, Notifications, Leads, Teams, Kanban, Chat, etc.).
- `migrations/*`: SQL migrations.
- `seed.ts`, `seed-chat.ts`: Seed scripts for initial data and chat.

### public/
- Static assets: logos, images, uploads (including `public/uploads` and `public/uploads/chat`).

### script/
- `main.py`, `requirements.txt`: Python script (likely face recognition/known_faces asset) – isolated utility tooling.

### root files
- `server.js`: Custom Node server bootstrap (e.g., to attach Socket.IO) if used.
- `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`: Build and tooling configs.
- `package.json`, `pnpm-lock.yaml`, `package-lock.json`: Package manifests.
- `middleware.ts`: (root) described above.
- `styles/globals.css`, `app/globals.css`: Global styles.

---

## Key Application Flows
- Login:
  1) User submits credentials on `/login` → NextAuth credentials provider validates via Prisma.
  2) JWT session includes `id`, effective `role`, `status`, `onboardingCompleted`.
  3) `middleware.ts` ensures access to admin routes and redirects unauthenticated.

- Permissions:
  1) `PermissionProvider` fetches `/api/users/{id}/permissions` and stores permission strings and roles.
  2) `PermissionGuard` uses these to allow/deny rendering; Admin overrides always allow.
  3) API routes use server-side `withPermission`/`withAnyPermission` or custom checks.

- Attendance (Dashboard):
  1) User punches in/out via `/api/attendance/checkin|checkout` and break start/end.
  2) Dashboard polls `/api/attendance/today|stats|history` for widgets and charts.

- Employees CRUD:
  1) Admin pages call `api/employees` to list/create.
  2) Details page uses `api/employees/[id]` for full profile; update/delete via PUT/DELETE.
  3) Default `Employee` role assignment on create.

- Leaves:
  1) Employee applies via `leaves/apply` → `api/leaves`.
  2) Approvals tracked via `managerId`/`adminId` and status fields.

- Tickets:
  1) Create and view tickets via `api/tickets`; comments at `api/tickets/[id]/comments`.
  2) Dashboard widgets show assigned and created tickets.

- Chat/Realtime:
  1) Socket.IO server authenticates, joins rooms, broadcasts messages and presence.
  2) Uploads create file messages; read receipts tracked via `MessageReadStatus`.

---

## Database Schema (high-level)
- Users with rich profile and HR data (education, experience, docs, bank details), relations to attendance, leaves, tasks, skills, performance, notifications, tickets, meetings.
- Roles/Permissions: `Role`, `Permission`, `UserRole`, `RolePermission`.
- Attendance: check-in/out, break tracking, daily unique per user.
- Leaves with dual approval (manager/admin) and statuses.
- Ticketing: `Ticket`, `TicketComment`, `TicketAttachment`, `TicketActivity` with priorities/statuses.
- Teams with members and leader; integrated with chat and kanban.
- Kanban: `Board`, `BoardMember`, `BoardStar`, `List`, `Card`, `CardComment`, `CardActivity`.
- Chat: `ChatRoom`, `ChatParticipant`, `ChatMessage`, `MessageReadStatus`, `MessageReaction`, `MessageMention`, `UserLastSeen`.
- Leads and Hosting models for CRM/ops features.

---

## Timeline

- First commit: 2025-04-30 (5190f01) "changes"
- Last commit: 2025-10-07 (529548d) "fixes"
- Total time: ≈ 5.2 months (5 months, 7 days)

---

## How to Extend
- Add new feature modules under `app/` and `app/api/` consistently.
- Define DB models in `prisma/schema.prisma`, run migrations, regenerate Prisma client.
- Gate UI with `PermissionGuard` and server endpoints with `withPermission`.
- For realtime needs, add events in `lib/websocket-server.ts` and corresponding client handlers.

## Setup (brief)
 - Set environment variables for database, NextAuth, email.
- Install deps and run Prisma migrations.
- Start dev server; ensure Socket.IO server is bootstrapped if using `server.js`.


