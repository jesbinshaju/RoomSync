# RoomSync - Hostel Room Allocation & Management System--

Full-stack hostel room allocation system with compatibility-based matching, fee management, and admin controls.

## Tech Stack-

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Auth**: NextAuth.js (Credentials + JWT)

## Setup

1. **Create PostgreSQL database**
   ```bash
   createdb hostel_db
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
   ```
   Never commit `.env` to GitHub. This repo includes a `.gitignore` rule to keep it local.

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run migrations**
   ```bash
   npx prisma migrate deploy
   # Or for dev: npx prisma db push
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Seed database**
   ```bash
   npm run db:seed
   ```

7. **Start dev server**
   ```bash
   npm run dev
   ```

## Default Credentials (after seed)

- **Admin**: admin@roomsync.com / password123
- **Students**: male1@test.com, female1@test.com, mixed1@test.com, etc. / password123

## Project Structure

```
├── app/
│   ├── (student)/          # Student portal (dashboard, room, fees, profile)
│   ├── admin/              # Admin portal
│   ├── api/                # API routes
│   ├── login/
│   └── register/
├── lib/
│   ├── allocation.ts       # Greedy triplet matching
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   ├── fees.ts             # Fee helpers
│   └── matching.ts         # Compatibility algorithm (TS)
├── prisma/
│   ├── migrations/         # SQL migrations + triggers
│   └── seed.ts
└── components/ui/          # shadcn components
```

## Features

- **Student**: 7-step registration wizard, room view with roommate compatibility chart, fee payment, profile edit
- **Admin**: Dashboard KPIs, run allocation algorithm, room grid, student list, fee management, room change approvals

## Environment Variables

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| NEXTAUTH_SECRET | Min 32 chars for JWT signing |
| NEXTAUTH_URL | App URL (e.g. http://localhost:3000) |
| NEXT_PUBLIC_APP_NAME | RoomSync |
#
