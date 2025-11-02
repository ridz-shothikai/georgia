# 🧭 Product Requirements Document (PRD)

## Project Title

**Unified Multi-App Platform**
(Three Next.js 16 frontends served under one domain, with centralized authentication and admin control)

---

## 1. 🎯 Objective

To build a **unified platform** that serves three independent Next.js 16 applications — `app1`, `app2`, and `admin-dashboard` — under a **single domain** with shared authentication and centralized user management.

The system should deliver a seamless experience where users log in once via a **central login portal**, and based on assigned permissions, are automatically redirected to the specific app they are allowed to access.

---

## 2. 🧩 System Overview

| Component         | Description                                                                                                         | Technology                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Frontend Apps** | Three standalone Next.js 16 applications served under `/app1`, `/app2`, and `/admin-dashboard`                      | Next.js 16, TypeScript, TailwindCSS         |
| **Backend**       | One unified Node.js Express (TypeScript) backend handling authentication, user management, permissions, and routing | Node.js + Express + TypeScript              |
| **Database**      | Central database for users, permissions, sessions, and logs                                                         | MongoDB (Mongoose ORM)                      |
| **Auth Service**  | Shared authentication & authorization microservice (JWT-based)                                                      | Express middleware + JWT                    |
| **Deployment**    | All apps deployed under a single domain (e.g., `https://platform.example.com`)                                      | NGINX reverse proxy + PM2 or Docker Compose |
| **Admin Panel**   | SuperAdmin portal for user & app management                                                                         | Next.js 16 app under `/admin-dashboard`     |

---

## 3. 🌐 Domain and Routing Structure

All apps will be hosted under **one domain**:

| App             | URL Prefix                                     | Description                             |
| --------------- | ---------------------------------------------- | --------------------------------------- |
| App 1           | `https://platform.example.com/app1`            | Main user-facing app (App 1 users only) |
| App 2           | `https://platform.example.com/app2`            | Secondary user app (App 2 users only)   |
| Admin Dashboard | `https://platform.example.com/admin-dashboard` | SuperAdmin control center               |
| Central Login   | `https://platform.example.com/login`           | Common authentication portal            |
| API             | `https://platform.example.com/api`             | Express backend endpoints               |

---

## 4. 🔐 Authentication & Authorization Flow

### 4.1 User Roles

| Role           | Description                                 |
| -------------- | ------------------------------------------- |
| **SuperAdmin** | Full access to all apps and user management |
| **AppAdmin**   | Admin for specific app (optional)           |
| **User**       | Access limited to assigned app(s) only      |

### 4.2 Login Flow

1. User visits `https://platform.example.com/login`.
2. Enters credentials → API verifies via `/api/auth/login`.
3. Backend generates a JWT with user permissions (`appAccess: ['app1']`).
4. After login:

   - If `SuperAdmin`: redirect → `/admin-dashboard`.
   - If `User`: redirect → first assigned app (e.g., `/app1`).

5. Each frontend app validates token via backend middleware before rendering.

### 4.3 Token Validation

- JWT stored in `httpOnly` cookie.
- Shared middleware in all apps to verify token via `/api/auth/verify`.
- Token payload:

  ```json
  {
    "userId": "64b12...",
    "role": "user",
    "appAccess": ["app1"],
    "exp": 1739876543
  }
  ```

### 4.4 Permission Enforcement

- Frontend guards (middleware) block access to unauthorized routes.
- Backend endpoints check permissions from decoded JWT.

---

## 5. 🧱 Architecture Design

### 5.1 High-Level Diagram

```
                +------------------------------+
                |      platform.example.com    |
                +------------------------------+
                  |        |          |     |
                  |        |          |     |
                /app1    /app2   /admin-dashboard   /api
                  |        |          |     |
          Next.js App1  Next.js App2  Next.js Admin  Express Backend
                  |        |          |     |
                  +--------------------------+
                             |
                         MongoDB
```

---

## 6. 🗃️ Database Schema (MongoDB)

### 6.1 Collections

#### **users**

| Field          | Type     | Description                                  |
| -------------- | -------- | -------------------------------------------- |
| `_id`          | ObjectId | Unique user ID                               |
| `email`        | String   | Login email                                  |
| `passwordHash` | String   | Hashed password                              |
| `role`         | String   | “superadmin” / “user”                        |
| `assignedApps` | [String] | List of accessible apps (`['app1', 'app2']`) |
| `createdAt`    | Date     | Creation timestamp                           |
| `status`       | String   | “active” / “inactive”                        |

#### **sessions**

| Field       | Type     | Description |
| ----------- | -------- | ----------- |
| `userId`    | ObjectId | Linked user |
| `jwtToken`  | String   | Active JWT  |
| `createdAt` | Date     | Login time  |
| `expiresAt` | Date     | Expiry      |

#### **logs**

| Field       | Type     | Description                      |
| ----------- | -------- | -------------------------------- |
| `userId`    | ObjectId | User performing action           |
| `action`    | String   | Login / logout / create / update |
| `timestamp` | Date     | Timestamp                        |

---

## 7. ⚙️ Backend (Express + TypeScript) Modules

| Module              | Description                          | Endpoints                                                                  |
| ------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| **AuthController**  | Handles login/logout/verify          | `/api/auth/login`, `/api/auth/logout`, `/api/auth/verify`                  |
| **UserController**  | CRUD for users                       | `/api/users`                                                               |
| **AppController**   | Metadata and access control for apps | `/api/apps`                                                                |
| **AdminController** | SuperAdmin operations                | `/api/admin/create-user`, `/api/admin/assign-app`, `/api/admin/list-users` |

### 7.1 Middleware

- `authMiddleware`: verifies JWT and attaches user to `req.user`.
- `permissionMiddleware(requiredApp)`: ensures user has access to the app route.

---

## 8. 💻 Frontend (Next.js 16) Setup

### 8.1 App1, App2, Admin-Dashboard Structure

Each app:

```
src/
  app/
    layout.tsx
    page.tsx
    (auth)/login/page.tsx   // Shared auth redirect
  components/
  lib/
  hooks/
  pages/
  utils/
```

### 8.2 Shared Auth Context

All apps share a common **Auth SDK** (internal npm package or shared lib):

```ts
import { verifyToken, getUserRole } from "@platform/auth-sdk";
```

### 8.3 Routing Guards

Next.js Middleware (`middleware.ts`):

```ts
import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(req) {
  const token = req.cookies.get("token");
  const user = verifyToken(token);

  if (!user) return NextResponse.redirect("/login");
  if (!user.appAccess.includes("app1"))
    return NextResponse.redirect("/unauthorized");
}
```

---

## 9. 🧰 Deployment Architecture

### 9.1 NGINX Configuration Example

```nginx
server {
  server_name platform.example.com;

  location /app1/ {
    proxy_pass http://localhost:3001/;
  }

  location /app2/ {
    proxy_pass http://localhost:3002/;
  }

  location /admin-dashboard/ {
    proxy_pass http://localhost:3003/;
  }

  location /api/ {
    proxy_pass http://localhost:4000/;
  }
}
```

### 9.2 Suggested Port Mapping

| App         | Local Port | Path               |
| ----------- | ---------- | ------------------ |
| App1        | 3001       | `/app1`            |
| App2        | 3002       | `/app2`            |
| Admin       | 3003       | `/admin-dashboard` |
| Backend API | 4000       | `/api`             |

---

## 10. 🧪 User Flows

### 10.1 SuperAdmin Flow

1. Login → `/admin-dashboard`
2. Create new user → assign app(s) → save
3. User receives credentials → login redirect

### 10.2 User Flow

1. Visit `platform.example.com/login`
2. Login → backend checks assigned app(s)
3. Redirect → `/app1` or `/app2`
4. Unauthorized routes auto-redirect to `/unauthorized`

---

## 11. 🛡️ Security & Compliance

- Passwords hashed using **bcrypt**
- JWT tokens with **short expiry + refresh tokens**
- Role-based access control (RBAC)
- HTTPS enforced
- Admin actions logged for audit trail

---

## 12. 🚀 Future Scalability

- Add `/app4`, `/app5` with minimal backend changes (config-based routing).
- Optional: integrate **Keycloak / Clerk / Auth0** later for enterprise SSO.
- Multi-region scaling using **Docker + Load Balancer**.
- Possible integration with **Micro Frontend architecture** in Next.js 17.

---

## 13. 📅 Timeline (High-Level)

| Phase     | Deliverables                 | Duration              |
| --------- | ---------------------------- | --------------------- |
| Phase 1   | Backend API & MongoDB schema | 2 weeks               |
| Phase 2   | Central login & auth SDK     | 1 week                |
| Phase 3   | App1 & App2 integration      | 2 weeks               |
| Phase 4   | Admin dashboard              | 1 week                |
| Phase 5   | Deployment & NGINX setup     | 1 week                |
| **Total** |                              | **7 weeks (approx.)** |

---

## 14. 🧠 Tech Stack Summary

| Layer           | Technology                                                    |
| --------------- | ------------------------------------------------------------- |
| Frontend        | Next.js 16 (App Router), TypeScript, Tailwind, TanStack Query |
| Backend         | Node.js 18+, Express, TypeScript                              |
| Auth            | JWT, bcrypt, custom middleware                                |
| Database        | MongoDB (Mongoose)                                            |
| Deployment      | NGINX + Docker                                                |
| Version Control | GitHub + GHCR                                                 |
| CI/CD           | GitHub Actions                                                |
