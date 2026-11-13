# HeadCount

HeadCount helps event hosts collect RSVPs from a single link so that they know who is coming and who has arrived.

---

## Features & Flows

### Host Experience
- **Authentication**: Secure email-and-password sign-up and login.
- **My Events**: View all hosted events, capacity, and quick links to guest lists.
- **Guest List & Check-in**:
  - Live totals: RSVP count, total booked guests, checked-in guests, and spots left.
  - Real-time name filter for quick guest lookup.
  - Large, phone-optimized check-in toggle per RSVP.
  - Inline RSVP removal option.
- **Access Control**: Strict server-side verification ensuring hosts can only view and manage their own events and guest lists.

### Guest Experience
- **Public Invite Page (`/events/[eventId]` & `/e/[eventId]`)**:
  - Requires **no account or sign-in**.
  - Displays event details: title, formatted date & time, venue, description, and capacity context.
  - Mobile-first RSVP form collecting guest name, contact (phone or email), and party size (1–10).
  - Informative feedback: Confirmation, Event Full, Party Too Large (with remaining spots), Duplicate Contact, Event Ended, or Link Not Found.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Partial Prerendering & Cache Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Supabase Auth, `@supabase/ssr`)

---

## Route Overview

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Host sign-in screen |
| `/signup` | Public | Host account registration screen |
| `/events` | Host Only | Host dashboard ("My Events") |
| `/events/[eventId]/guests` | Host Only | Host guest list and check-in screen |
| `/events/[eventId]` | Public | Public event invite and RSVP screen |
| `/e/[eventId]` | Public | Short link alias for public event invite |
| `POST /api/rsvp` | Public | API endpoint for public RSVP submissions |

---

## Setup & Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to create your local environment file:

```bash
cp .env.example .env.local
```

Set the following variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

> **Note:** Do not place secret keys in `NEXT_PUBLIC_` variables. `.env.local` is ignored by Git and should never be committed.

### 3. Apply Database Migrations (Supabase SQL Editor)

Apply the SQL files in `supabase/migrations/` in chronological order using your Supabase Dashboard **SQL Editor**:

1. **`20261113133000_create_events_table.sql`**:
   - Creates `public.events` table with UUID primary key, `owner_id` linked to `auth.users`, title, date, venue, capacity, and host RLS policies.
2. **`20261113133500_enable_rls_and_policies.sql`**:
   - Creates `public.rsvps` table, indexes, and unique constraint on `(event_id, lower(trim(contact)))`.
   - Enforces host-only RSVP management policies and public read-only access to event details.
3. **`20261113140000_public_rsvp_submission_function.sql`**:
   - Creates the concurrency-safe `public.submit_rsvp` stored procedure (`SECURITY DEFINER`).
   - Uses `FOR UPDATE` row locking to prevent race conditions when checking remaining capacity.
   - Enforces party size limits (1–10) and ensures guest lists remain private.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

- `npm run dev`: Start the development server with Turbopack
- `npm run build`: Create an optimized production build
- `npm run start`: Start the Next.js production server
- `npm run lint`: Run ESLint checks

---

## Architecture & Security Highlights

- **Server-Side Authorization**: Every host action and route directly verifies the authenticated user using Supabase Auth on the server.
- **Race Condition Safety**: Spots left are dynamically computed as `capacity - sum(party_size)`. Simultaneous submissions lock the event row during capacity validation.
- **Guest Privacy**: Public routes and functions strictly return event metadata only. No guest names, contact numbers, or host account data are exposed to browsers.
- **Mobile-First UX**: Large touch targets (`min-h-[44px]` to `min-h-[52px]`) and `text-base sm:text-sm` font sizing to prevent unwanted mobile zooming.
