# Oyo Biz - Business Directory PRD

## Original Problem Statement
Create a complete React + Supabase project called "Oyo Biz" (a business directory for Oyo State). Features include:
- User authentication (signup/login/logout)
- Business owner registration and business listing
- Admin approval workflow for business listings
- Search functionality with category and city filters
- Business detail pages with reviews and comments
- User dashboard, business owner dashboard, admin dashboard
- Responsive design (works on mobile and desktop)

## User Personas
1. **Regular Users**: Browse businesses, leave reviews, save favorites
2. **Business Owners**: List businesses, manage listings, respond to reviews
3. **Administrators**: Approve/reject businesses, manage categories/cities/users

## Core Requirements (Static)
- React frontend with Supabase (Auth, Database, Storage)
- No separate backend server (direct Supabase connection)
- Role-based access control (user, owner, admin)
- RLS policies for data security
- Responsive design for mobile/desktop

## What's Been Implemented (December 2025)

### Pages Created
- [x] Home Page - Hero, search form, categories, featured businesses, CTA, footer
- [x] Search Page - Filters, business cards grid, empty state
- [x] Business Detail Page - Photos, info, reviews, comments, favorites
- [x] Login Page - Email/password authentication
- [x] Signup Page - With account type selection (user/owner)
- [x] User Dashboard - Profile, favorites, reviews management
- [x] Owner Dashboard - Add/manage businesses, view reviews
- [x] Admin Dashboard - Approve/reject businesses, manage categories/cities/users
- [x] Contact Admin Page

### Components Created
- [x] Layout (Navbar, Footer with role-based navigation)
- [x] AuthContext (Session management)
- [x] ProtectedRoute (Role-based access)

### Recent Updates (December 2025)
- [x] Business owner login redirect - Now redirects to homepage (/) instead of /owner
- [x] Admin Dashboard - Added "Delete User" functionality with confirmation
- [x] Admin Dashboard - Fixed role change dropdown in Users table
- [x] Created comprehensive README.md project documentation

### Files Structure
```
/app/frontend/
├── src/
│   ├── lib/supabase.js
│   ├── context/AuthContext.js
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ui/ (Shadcn components)
│   └── pages/
│       ├── Home.jsx
│       ├── Login.jsx
│       ├── Signup.jsx
│       ├── Search.jsx
│       ├── BusinessDetail.jsx
│       ├── UserDashboard.jsx
│       ├── OwnerDashboard.jsx
│       ├── AdminDashboard.jsx
│       └── ContactAdmin.jsx
├── setup.md (Database schema & setup instructions)
└── README.md (Project documentation)
```

## Database Schema (in setup.md)
- users, cities, categories, businesses
- business_photos, reviews, comments, favorites
- RLS policies for security

## Prioritized Backlog

### P0 (Critical - User must do)
- [ ] Run SQL schema in Supabase SQL Editor (in setup.md)
- [ ] Run RLS policies SQL
- [ ] Run seed data SQL for cities/categories
- [ ] Create admin user via SQL

### P1 (Enhancement)
- [ ] File upload for business photos (currently URL-based)
- [ ] Implement review submission on business detail page
- [ ] Email verification flow
- [ ] Password reset functionality

### P2 (Nice to have)
- [ ] Social login (Google, Facebook)
- [ ] Business analytics dashboard
- [ ] Push notifications for reviews
- [ ] Advanced search (filters, sorting)

## Known Issues
1. **"body stream already read" error** - Suppressed with user-friendly message during login
2. **"signal is aborted" errors** - React.StrictMode removed as workaround
3. **Supabase Rate Limiting** - Handled with toast messages

## Testing Status
- Frontend testing: PASS (100% success rate)
- All pages load correctly
- Navigation works as expected
- Protected routes redirect to login when unauthenticated

## Next Tasks
1. User to run setup.md SQL commands in Supabase
2. User to create admin account and test approval workflow
3. Consider adding Supabase Storage bucket for photo uploads
