# 🧭 Unified Multi-App Platform

A unified platform serving three independent Next.js 16 applications under a single domain with centralized authentication and admin control.

## 🏗️ Architecture

```
platform.example.com/
├── /app1              → Next.js App 1 (Port 3001)
├── /app2              → Next.js App 2 (Port 3002)
├── /admin-dashboard   → Admin Dashboard (Port 3003)
├── /api               → Express Backend (Port 4000)
└── /login             → Central Login Portal
```

## 📁 Project Structure

```
georgia-new-demo/
├── backend/           # Express + TypeScript API
├── app1/             # Next.js 16 App 1
├── app2/             # Next.js 16 App 2
├── admin-dashboard/  # Next.js 16 Admin Dashboard
├── shared/           # Shared auth SDK & types
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## 🚀 Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, TanStack Query
- **Backend**: Node.js 18+, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Auth**: JWT with httpOnly cookies
- **Deployment**: Docker, NGINX reverse proxy

## 🔐 Authentication Flow

1. User visits `/login` → Central authentication portal
2. JWT token stored in httpOnly cookie
3. Role-based redirect:
   - SuperAdmin → `/admin-dashboard`
   - User → assigned app (`/app1` or `/app2`)
4. Route protection via Next.js middleware

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Docker (optional)

### Quick Start

1. **Install dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend apps
   cd ../app1 && npm install
   cd ../app2 && npm install
   cd ../admin-dashboard && npm install
   ```

2. **Environment setup**:
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp app1/.env.example app1/.env.local
   cp app2/.env.example app2/.env.local
   cp admin-dashboard/.env.example admin-dashboard/.env.local
   ```

3. **Start development servers**:
   ```bash
   # Backend (Port 4000)
   cd backend && npm run dev
   
   # App1 (Port 3001)
   cd app1 && npm run dev
   
   # App2 (Port 3002)
   cd app2 && npm run dev
   
   # Admin Dashboard (Port 3003)
   cd admin-dashboard && npm run dev
   ```

4. **Using Docker Compose**:
   ```bash
   docker-compose up -d
   ```

## 📋 User Roles

| Role | Description | Access |
|------|-------------|---------|
| **SuperAdmin** | Full platform access | All apps + admin dashboard |
| **User** | Limited access | Assigned app(s) only |

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

### Admin Operations
- `POST /api/admin/create-user` - Create new user
- `PUT /api/admin/assign-app` - Assign app to user
- `GET /api/admin/list-users` - List all users

### User Management
- `GET /api/users` - Get user profile
- `PUT /api/users` - Update user profile

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd app1 && npm test
cd app2 && npm test
cd admin-dashboard && npm test
```

## 🚀 Deployment

The platform is designed for single-domain deployment using NGINX reverse proxy:

```nginx
server {
  server_name platform.example.com;
  
  location /app1/ { proxy_pass http://localhost:3001/; }
  location /app2/ { proxy_pass http://localhost:3002/; }
  location /admin-dashboard/ { proxy_pass http://localhost:3003/; }
  location /api/ { proxy_pass http://localhost:4000/; }
}
```

## 📝 Development Guidelines

- Follow functional programming patterns
- Use TypeScript strict mode
- Implement proper error handling
- Add comprehensive logging
- Follow security best practices
- Write tests for all components

## 🔒 Security Features

- Password hashing with bcrypt
- JWT tokens with short expiry
- httpOnly cookie storage
- Role-based access control (RBAC)
- Route protection middleware
- Audit logging for admin actions

---

Built with ❤️ following the Unified Multi-App Platform PRD specifications.# georgia
