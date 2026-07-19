# Oyo Biz - Business Directory for Oyo State

A modern, full-stack business directory application built with React and Supabase, designed specifically for businesses in Oyo State, Nigeria.

## Features

### User Roles
- **Regular Users**: Browse businesses, leave reviews, save favorites
- **Business Owners**: Register and manage business listings with CAC verification
- **Administrators**: Approve/reject businesses, manage users, categories, and cities

### Key Functionality
- Email/password authentication
- Multi-step business registration with CAC document upload
- Business search with category and city filters
- Reviews and favorites system
- Role-based dashboards
- Admin approval workflow

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Tailwind CSS, Shadcn/UI |
| Backend | Supabase (Auth, Database, Storage) |
| Routing | React Router v6 |
| State | React Context API |
| UI Components | Shadcn/UI (Radix Primitives) |

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn UI components
│   │   ├── Layout.jsx    # Main layout with navbar/footer
│   │   ├── ProtectedRoute.jsx
│   │   └── ErrorBoundary.jsx
│   ├── context/
│   │   └── AuthContext.js  # Authentication state
│   ├── lib/
│   │   └── supabase.js   # Supabase client
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── BusinessDetail.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── OwnerDashboard.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── ContactAdmin.jsx
│   ├── App.js
│   └── index.js
├── .env                  # Environment variables
├── setup.md              # Database setup instructions
└── package.json
```

## Setup Instructions

### 1. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `setup.md` in the SQL Editor
3. Update `.env` with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn start
```

### 3. Create Admin User

After signing up, run this SQL to make yourself an admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## User Flows

### Business Owner Registration
1. Sign up with "Business Owner" account type
2. Fill multi-step form with business and CAC details
3. Submit for admin approval
4. Wait for admin to approve/reject
5. Once approved, business appears in search

### Admin Workflow
1. Login as admin
2. Go to Admin Dashboard
3. Review pending businesses
4. Approve or reject each submission
5. Manage categories, cities, and users

## Database Schema

| Table | Purpose |
|-------|---------|
| users | User profiles (extends Supabase Auth) |
| businesses | Business listings |
| categories | Business categories |
| cities | Cities in Oyo State |
| business_photos | Business images |
| reviews | User reviews |
| comments | Review replies |
| favorites | Saved businesses |

## Environment Variables

| Variable | Description |
|----------|-------------|
| REACT_APP_SUPABASE_URL | Your Supabase project URL |
| REACT_APP_SUPABASE_ANON_KEY | Your Supabase anon/public key |

## Security

- Row Level Security (RLS) policies protect all data
- Users can only edit their own profiles
- Business owners can only manage their own businesses
- Only admins can approve businesses and manage users

## API Reference

All data operations use the Supabase JS client directly. No separate backend required.

### Authentication
```javascript
import { supabase } from './lib/supabase';

// Sign up
await supabase.auth.signUp({ email, password });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();
```

### Database Operations
```javascript
// Fetch businesses
const { data } = await supabase
  .from('businesses')
  .select('*, category:categories(name), city:cities(name)')
  .eq('status', 'approved');

// Add review
await supabase.from('reviews').insert({
  business_id: businessId,
  user_id: userId,
  rating: 5,
  comment: 'Great service!'
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

---

Built with love for Oyo State businesses
