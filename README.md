# Smart Bookmark App

A modern, real-time bookmark manager built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**.

Live Demo: https://smart-bookmark-cyan.vercel.app

## ✨ Features

- ✅ Google OAuth Login (No email/password signup)
- ✅ Add bookmark with title + URL
- ✅ Private bookmarks per user (User A cannot see User B's data)
- ✅ Real-time bookmark list updates across multiple tabs (no refresh needed)
- ✅ Delete bookmarks
- ✅ Optimistic UI updates for instant feedback
- ✅ Background tab throttling fix (visibilitychange + refetch)
- ✅ Deployed on Vercel

## 🛠 Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Authentication, PostgreSQL, Realtime)
- **Tailwind CSS**
- **TypeScript**

## 🚀 Quick Start (Local Setup)

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- Note your project URL and anon key

### 2. Setup Google OAuth (Google Cloud Console)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → APIs & Services → Credentials
3. Create **OAuth 2.0 Client ID** → Web application
4. Authorized JavaScript origins: `http://localhost:3000`
5. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - Your Vercel URL `/auth/callback`
6. Copy Client ID & Client Secret

### 3. Configure Supabase Auth
- In Supabase Dashboard → Authentication → Providers → Google
- Paste Client ID & Secret
- Enable Google provider
- Set Site URL: `http://localhost:3000`

### 4. Create Database Table + RLS
```sql
-- Table
create table bookmark (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table bookmark enable row level security;

-- Policies
create policy "Users can view own bookmarks"
  on bookmark for select using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on bookmark for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on bookmark for delete using (auth.uid() = user_id);
```

### 5. Enable Realtime
- Go to Database → Replication
- Add `bookmark` table to the publication

### 6. Next.js + Tailwind Setup
```bash
npx create-next-app@latest smart-bookmark-app --typescript --tailwind --eslint --app
cd smart-bookmark-app
npm install @supabase/supabase-js
```

### 7. Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🔧 Challenges & How I Solved Them

### 1. WebSocket Connection Failed (TIMED_OUT / CLOSED)
**Problem**:  
`wss://.../realtime/v1/websocket` failed to connect. Status: `TIMED_OUT`, `CLOSED`.

**Cause**: Browser/network blocking WebSocket:
- VPN
- Brave Browser shields
- Ad blockers / uBlock
- Browser extensions
- College/office firewall

**Solution**:
- Tested in Chrome Incognito (no extensions)
- Disabled VPN
- Used mobile hotspot
- Added proper error logging

### 2. Realtime Not Updating in Background/Inactive Tabs
**Problem**:  
Insert/delete worked in active tab but delayed in another tab until focused or refreshed.

**Cause**: Browser tab throttling (Chrome/Edge throttle JS & WebSocket in background tabs to save battery).

**Solutions Implemented**:
- **Optimistic UI Updates** (instant feedback in current tab)
- **`visibilitychange` listener** → refetch data when tab becomes visible
- Realtime subscription only after user is loaded
- Proper cleanup with `supabase.removeChannel()`

### 3. Realtime Subscription Issues
**Problems**:
- Wrong filter syntax (`user_id=eq.${user.id}` without backticks)
- Subscribing before `user?.id` exists
- Not calling `fetchBookmarks()` initially
- Listening to all users' changes

**Solution**:
```tsx
useEffect(() => {
  if (!user?.id) return;

  fetchBookmarks();

  const channel = supabase.channel("realtime-bookmarks")
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "bookmark",
      filter: `user_id=eq.${user.id}`,
    }, (payload) => {
      setBookmarks(prev => [payload.new, ...prev]);
    })
    // similar for DELETE
    .subscribe();
}, [user]);
```

### 4. Optimistic Delete Implementation
Added instant UI removal before server confirmation + rollback on error.

### 5. Google Auth User Display Name
Used `user.user_metadata.full_name` from Google OAuth.


## 🚀 Deployment

Deployed on **Vercel**:
- Connected GitHub repo
- Added environment variables in Vercel dashboard
- Automatic deployments on push
- Live URL: https://smart-bookmark-cyan.vercel.app

## 📋 Future Improvements

- Optimistic insert with temporary ID
- Undo delete functionality
- Bookmark editing
- Search & filter
- Dark mode
- Bookmark preview cards (favicon + metadata)

## 🧠 Lessons Learned

- Realtime alone isn't enough for great UX — combine with optimistic updates + visibility refetch
- Always test in Incognito + different networks
- Proper RLS policies are critical for data privacy
- Supabase Realtime + Next.js App Router works beautifully when set up correctly

---

