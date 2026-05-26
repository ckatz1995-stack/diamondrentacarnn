# Diamond Rent A Car — Members Portal

Full-stack Members Portal for Diamond Rent A Car, Thessaloniki Greece.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS v3
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens)
- **Email**: Nodemailer + SMTP
- **PDF**: PDFKit
- **Language**: Greek (el-GR)

## Quick Start (5 steps)

### 1. Install dependencies
```bash
cd diamond-portal
npm install
npm run install:all
```

### 2. Configure environment
```bash
cp .env server/.env
# Edit server/.env with your MongoDB URI and SMTP credentials
```

### 3. Start MongoDB
```bash
mongod --dbpath /data/db
```

### 4. Seed the database
```bash
npm run seed
```
This creates:
- Admin: `admin@diamondrentacar.gr` / `Admin123!`
- Test members: `member1@test.gr`, `member2@test.gr`, `member3@test.gr` / `Member123!`
- 5 vehicle categories, 10 bookings per member, sample reviews/tickets/notifications

### 5. Run in development
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/api/health

## Production Build
```bash
npm run build      # Build React app
npm start          # Start production server
```

## API Documentation
All endpoints under `/api/`:
- `/api/auth` — Authentication (register, login, refresh, forgot/reset password)
- `/api/bookings` — Booking management
- `/api/profile` — Member profile & documents
- `/api/loyalty` — Loyalty points & rewards
- `/api/notifications` — In-app notifications
- `/api/analytics` — Spending analytics
- `/api/support` — Support tickets
- `/api/admin` — Admin panel (admin users only)

## Features
- JWT authentication with token rotation
- Email verification gate
- Complete booking lifecycle (view, edit, cancel, extend, review)
- Loyalty program with 4 tiers (New/Silver/Gold/Platinum)
- PDF voucher and invoice generation
- In-app notifications with polling
- Support ticket system
- Analytics dashboard with Chart.js
- Full Greek language (el-GR)
- Dark mode
- Mobile-responsive (375px+)
- Admin panel
