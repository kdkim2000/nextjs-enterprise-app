# Enterprise Next.js Application Architecture

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: Material-UI (MUI) v6
- **Language**: TypeScript
- **State Management**: React Context + Custom Hooks
- **Data Grid**: MUI X Data Grid Premium (Excel-like experience)
- **Rich Text Editor**: TipTap (HTML5-based, editor/viewer modes)
- **File Handling**:
  - Excel: xlsx, exceljs
  - PDF: jsPDF, react-pdf
- **i18n**: next-intl
- **HTTP Client**: Axios with interceptors
- **Form Management**: React Hook Form + Zod validation

### Backend (Mocking)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Data**: JSON files (simulating database)
- **Future**: Spring Boot migration ready

## Directory Structure

```
nextjs-enterprise-app/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # i18n routing
│   │   │   ├── (auth)/              # Auth layout group
│   │   │   │   ├── login/
│   │   │   │   ├── mfa/
│   │   │   │   └── sso/
│   │   │   ├── (dashboard)/         # Main app layout group
│   │   │   │   ├── layout.tsx       # Dashboard layout with menu
│   │   │   │   └── [...menu]/       # Dynamic nested menu routes
│   │   │   └── layout.tsx           # Root locale layout
│   │   ├── api/                     # API routes (proxy to backend)
│   │   │   ├── auth/
│   │   │   ├── menu/
│   │   │   ├── user/
│   │   │   ├── file/
│   │   │   └── log/
│   │   └── layout.tsx               # Root layout
│   │
│   ├── components/                   # Reusable components
│   │   ├── common/                  # Common UI components
│   │   │   ├── DataGrid/            # Excel-like grid
│   │   │   ├── RichTextEditor/      # TipTap editor
│   │   │   ├── FileUpload/
│   │   │   ├── Footer/              # Current program footer
│   │   │   ├── Header/
│   │   │   └── LoadingSpinner/
│   │   ├── layout/                  # Layout components
│   │   │   ├── Sidebar/             # Multi-level menu
│   │   │   ├── Navbar/
│   │   │   └── MainLayout/
│   │   └── auth/                    # Auth components
│   │       ├── LoginForm/
│   │       ├── MFAVerification/
│   │       └── ProtectedRoute/
│   │
│   ├── features/                    # Feature-based modules
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── menu/
│   │   ├── user/
│   │   └── logging/
│   │
│   ├── lib/                         # Utilities and configurations
│   │   ├── axios/                   # HTTP client setup
│   │   ├── auth/                    # Auth helpers
│   │   ├── i18n/                    # i18n configuration
│   │   ├── excel/                   # Excel utilities
│   │   ├── pdf/                     # PDF utilities
│   │   └── utils/                   # Common utilities
│   │
│   ├── contexts/                    # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── MenuContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── SessionContext.tsx       # Auto-logout handler
│   │
│   ├── hooks/                       # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useMenu.ts
│   │   ├── usePermission.ts
│   │   ├── useLogger.ts
│   │   └── useAutoLogout.ts
│   │
│   ├── types/                       # TypeScript types
│   │   ├── auth.ts
│   │   ├── menu.ts
│   │   ├── user.ts
│   │   └── common.ts
│   │
│   ├── styles/                      # Global styles
│   │   └── theme.ts                 # MUI theme config
│   │
│   └── middleware.ts                # Next.js middleware (auth, logging)
│
├── backend/                         # Mock backend
│   ├── server.js                    # Express server
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── user.js
│   │   ├── file.js
│   │   └── log.js
│   ├── data/                        # JSON data files
│   │   ├── users.json
│   │   ├── menus.json
│   │   ├── permissions.json
│   │   └── logs.json
│   ├── middleware/                  # Backend middleware
│   │   ├── auth.js
│   │   └── logger.js
│   └── utils/                       # Backend utilities
│       ├── jwt.js
│       └── email.js
│
├── public/                          # Static files
│   ├── locales/                     # i18n translations
│   │   ├── en/
│   │   └── ko/
│   └── uploads/                     # Uploaded files
│
└── docs/                            # Documentation
    ├── API.md
    ├── DEPLOYMENT.md
    └── DEVELOPMENT.md
```

## Key Features Implementation

### 1. Multi-Level Menu System
- Recursive menu structure in Sidebar component
- Dynamic routing with `[...menu]` catch-all routes
- Breadcrumb navigation
- Menu state persistence in localStorage

### 2. Authentication & Authorization
- JWT-based authentication
- Multi-factor authentication (email-based)
- SSO placeholder (future implementation)
- Permission-based access control (RBAC)
- Session management with auto-logout

### 3. Logging System
- **Login logs**: User authentication tracking
- **Menu access logs**: Navigation tracking with timestamp
- **Transaction logs**: API call logging with request/response
- Middleware-based automatic logging
- Log storage in JSON files (future: database)

### 4. User Features
- Favorite menus (CRUD operations)
- Recent menu access (last 10 items)
- User preferences
- Permission matrix

### 5. Data Grid (Excel-like)
- MUI X Data Grid Premium
- Features:
  - Inline editing
  - Column resizing/reordering
  - Sorting, filtering, grouping
  - Excel export/import
  - Copy/paste support
  - Keyboard navigation

### 6. Rich Text Editor
- TipTap editor with:
  - Editor mode: Full editing capabilities
  - Viewer mode: Read-only display
  - HTML sanitization
  - Image upload support

### 7. File Operations
- **Upload**: Multipart form data handling
- **Download**: File streaming
- **Excel generation**: Server-side with exceljs
- **PDF generation**: Client/server-side with jsPDF

### 8. i18n (Internationalization)
- next-intl for routing and translations
- Language switcher component
- RTL support ready
- Date/number formatting

### 9. Auto-Logout
- Session timeout configuration
- Activity detection
- Warning modal before logout
- Token refresh mechanism

### 10. Footer Information
- Current route display
- Program ID/name from menu structure
- Version information
- User info

## Data Flow

### Authentication Flow
```
1. User submits credentials
2. Frontend → API → Backend validation
3. Backend returns JWT + refresh token
4. Frontend stores tokens (httpOnly cookies)
5. Axios interceptor adds token to requests
6. Middleware validates token on protected routes
7. MFA check if enabled
8. Log authentication event
```

### Menu Access Flow
```
1. User clicks menu item
2. Check permissions (client-side)
3. Navigate to route
4. Middleware validates access (server-side)
5. Log menu access
6. Update recent menus
7. Render page
8. Footer shows current program info
```

### Data Grid Operations
```
1. Fetch data with pagination
2. Render grid with MUI DataGrid
3. User actions (edit/delete):
   - Optimistic update
   - API call
   - Rollback on error
4. Export: Client-side Excel generation
5. Import: Parse Excel → validate → bulk API call
```

## Security Considerations

1. **Authentication**
   - JWT with short expiration
   - Refresh token rotation
   - Secure httpOnly cookies
   - CSRF protection

2. **Authorization**
   - Server-side permission checks
   - Route-level guards
   - API-level validation

3. **Input Validation**
   - Zod schemas for forms
   - Backend validation
   - SQL injection prevention (future DB)
   - XSS protection (HTML sanitization)

4. **Logging**
   - PII data masking
   - Sensitive data exclusion
   - Audit trail for compliance

## Performance Optimization

1. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting

2. **Caching**
   - React Query for data caching
   - Static menu data caching
   - Service Worker for offline support

3. **Bundle Optimization**
   - Tree shaking
   - MUI tree-shakable imports
   - Lazy loading images

4. **Server-Side Rendering**
   - Static generation for public pages
   - Server components for data fetching
   - Streaming for better UX

## Migration Path to Spring Boot

The mock backend structure mirrors typical Spring Boot patterns:

```
backend/routes/      → Spring Controllers
backend/data/        → JPA Entities + Repositories
backend/middleware/  → Spring Interceptors/Filters
backend/utils/       → Service Layer
```

API contracts remain the same, only implementation changes.

## Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement frontend component
   - Create mock API endpoint
   - Add types and tests
   - Update documentation

2. **Testing Strategy**
   - Unit tests: Vitest
   - Component tests: React Testing Library
   - E2E tests: Playwright
   - API mocking: MSW

3. **Code Quality**
   - ESLint + Prettier
   - TypeScript strict mode
   - Pre-commit hooks (Husky)
   - Code review checklist

## Deployment

- **Frontend**: Vercel/AWS Amplify
- **Backend Mock**: Node.js on AWS EC2/Lambda
- **Future Backend**: Spring Boot on AWS ECS/EKS
- **Database**: PostgreSQL on AWS RDS
- **File Storage**: AWS S3
- **CDN**: CloudFront

## Configuration Management

- Environment variables for:
  - API endpoints
  - JWT secrets
  - Feature flags
  - Timeout settings
  - Log levels

---

This architecture provides:
✅ Scalability for enterprise needs
✅ Clear separation of concerns
✅ Type safety with TypeScript
✅ Easy maintenance and debugging
✅ Smooth migration path to Spring Boot
✅ Modern development experience
