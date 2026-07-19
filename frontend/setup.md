# Oyo Biz - Setup Instructions

A business directory for Oyo State, Nigeria built with React and Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- Yarn package manager

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose an organization and name your project "oyo-biz"
4. Set a strong database password (save this!)
5. Choose a region close to your users
6. Wait for the project to be created

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the **Project URL** (e.g., `https://xxxxx.supabase.co`)
3. Copy the **anon/public** key (starts with `eyJ...`)

## Step 3: Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'owner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL
);

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id),
    city_id UUID REFERENCES cities(id),
    address TEXT,
    phone TEXT,
    website TEXT,
    description TEXT,
    cac_number TEXT,
    cac_document_url TEXT,
    wants_website BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business photos table
CREATE TABLE business_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table (replies to reviews)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- Create indexes for better performance
CREATE INDEX idx_businesses_status ON businesses(status);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_city ON businesses(city_id);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);
CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
```

## Step 4: Set Up Row Level Security (RLS)

Run the following SQL to enable RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can update any user" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin can delete any user" ON users FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Cities policies (public read, admin write)
CREATE POLICY "Anyone can view cities" ON cities FOR SELECT USING (true);
CREATE POLICY "Admin can manage cities" ON cities FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Businesses policies
CREATE POLICY "Anyone can view approved businesses" ON businesses FOR SELECT 
    USING (status = 'approved' OR owner_id = auth.uid() OR 
           EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Owners can insert businesses" ON businesses FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own businesses" ON businesses FOR UPDATE 
    USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Owners can delete own businesses" ON businesses FOR DELETE 
    USING (auth.uid() = owner_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Business photos policies
CREATE POLICY "Anyone can view business photos" ON business_photos FOR SELECT USING (true);
CREATE POLICY "Owners can manage photos" ON business_photos FOR ALL USING (
    EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
```

## Step 5: Seed Initial Data

Run the following SQL to add initial cities and categories:

```sql
-- Insert Oyo State Cities
INSERT INTO cities (name) VALUES
    ('Ibadan'),
    ('Ogbomoso'),
    ('Oyo'),
    ('Iseyin'),
    ('Saki'),
    ('Eruwa'),
    ('Igboho'),
    ('Okeho'),
    ('Kishi'),
    ('Igbo-Ora'),
    ('Odo-Otin'),
    ('Fiditi'),
    ('Lalupon'),
    ('Egbeda');

-- Insert Categories
INSERT INTO categories (name) VALUES
    ('Restaurants'),
    ('Hotels'),
    ('Healthcare'),
    ('Education'),
    ('Shopping'),
    ('Services'),
    ('Transportation'),
    ('Entertainment'),
    ('Real Estate'),
    ('Agriculture'),
    ('Technology'),
    ('Finance');
```

## Step 6: Create Storage Bucket for Photos

Go to **Storage** in your Supabase dashboard and:

1. Click "New bucket"
2. Name it `business-photos`
3. Make it **Public** (toggle on)
4. Click "Create bucket"

Then go to **Policies** for this bucket and add:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload photos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'business-photos' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public can view photos" ON storage.objects 
FOR SELECT USING (bucket_id = 'business-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects 
FOR DELETE USING (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 7: Create Admin User

1. First, sign up on the app with your email
2. Then run this SQL to make yourself admin (replace with your email):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'ayoolamuhammed05@gmail.com';
```

## Step 8: Configure React App

Update the `.env` file in `/app/frontend/`:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Step 9: Run the Application

```bash
cd /app/frontend
yarn install
yarn start
```

The app will be available at http://localhost:3000

## Features

### For Users
- Browse and search businesses
- Filter by category and city
- View business details
- Leave reviews and ratings
- Save favorites
- Manage profile

### For Business Owners
- Register and list businesses
- Upload business photos
- Manage business information
- View customer reviews

### For Admins
- Approve/reject business listings
- Manage categories and cities
- Manage user roles
- View all business submissions

## Folder Structure

```
/app/frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn UI components
│   │   ├── Layout.jsx    # Main layout with navbar/footer
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.js
│   ├── lib/
│   │   └── supabase.js   # Supabase client
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Search.jsx
│   │   ├── BusinessDetail.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── OwnerDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── App.js
│   ├── App.css
│   └── index.css
├── .env                  # Environment variables
└── package.json
```

## Troubleshooting

### "Invalid API key" error
- Make sure your Supabase URL and Anon Key are correct in `.env`
- Restart the development server after changing `.env`

### RLS policy errors
- Ensure all RLS policies are created correctly
- Check if the user has the correct role

### Authentication not working
- Verify email confirmation is disabled or check your email
- Check Supabase Auth settings

## Support

For issues, check:
1. Supabase Dashboard logs
2. Browser console for errors
3. Network tab for API responses

## Fix: Admin Cannot Change User Roles

If you've already set up the database and admin cannot change user roles, run this SQL:

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admin can update any user" ON users;

-- Create admin update policy
CREATE POLICY "Admin can update any user" ON users FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Create admin delete policy
DROP POLICY IF EXISTS "Admin can delete any user" ON users;
CREATE POLICY "Admin can delete any user" ON users FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
```

## Fix: Business Owner Shows as User After Signup

If users who sign up as "Business Owner" appear as "User" role, the profile was created correctly during signup. Verify by checking the users table in Supabase. If the role is correct there but shows wrong in the app, try logging out and back in.
