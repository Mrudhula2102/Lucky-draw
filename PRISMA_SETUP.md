# Prisma Backend Setup for Lucky Draw Project

## Overview
This project now includes a complete Prisma backend setup that connects to your existing Supabase PostgreSQL database. The backend includes all the database models and services needed for the Lucky Draw application.

## Database Schema
The Prisma schema includes the following models:
- **Admin** - Admin users with role-based access
- **AdminActivityLog** - Audit trail for admin actions
- **Contest** - Contest management
- **Prize** - Prize definitions for contests
- **Participant** - Contest participants
- **Draw** - Draw execution records
- **Winner** - Winner records from draws
- **Form** - Dynamic form definitions
- **FormResponse** - Form submission data
- **Message** - Communication system

## Setup Instructions

### 1. Database Connection
Update your `.env` file with your Supabase PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.rnihpvwaugrekmkbvhlk.supabase.co:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### 2. Generate Database Schema
Run the following command to create the database tables:

```bash
npx prisma db push
```

This will create all the tables, enums, and relationships in your Supabase database.

### 3. Generate Prisma Client
The Prisma client is already generated, but if you make schema changes, regenerate it:

```bash
npx prisma generate
```

### 4. View Database (Optional)
To view and manage your database through Prisma Studio:

```bash
npx prisma studio
```

## Available Services

### ContestService
- `createContest()` - Create new contests
- `getAllContests()` - Get all contests
- `getContestById()` - Get contest by ID
- `updateContest()` - Update contest details
- `deleteContest()` - Delete contest
- `getActiveContests()` - Get currently active contests

### ParticipantService
- `addParticipant()` - Add new participant
- `getParticipantsByContest()` - Get all participants for a contest
- `getValidatedParticipants()` - Get validated participants only
- `checkDuplicateParticipant()` - Check for duplicate entries
- `getParticipantStats()` - Get participation statistics

### DrawService
- `executeRandomDraw()` - Execute random winner selection
- `executeManualDraw()` - Execute manual winner selection
- `getDrawsByContest()` - Get all draws for a contest
- `getWinnersByContest()` - Get all winners for a contest
- `updateWinnerNotification()` - Update winner notification status

### PrizeService
- `createPrize()` - Create new prizes
- `getPrizesByContest()` - Get all prizes for a contest
- `getAvailablePrizes()` - Get prizes still available to win
- `getPrizeStats()` - Get prize statistics

### AdminService
- `createAdmin()` - Create new admin users
- `getAdminByEmail()` - Get admin by email
- `logActivity()` - Log admin activities
- `checkAdminPermissions()` - Check role-based permissions
- `getAdminStats()` - Get admin statistics

### FormService
- `createForm()` - Create dynamic forms
- `submitFormResponse()` - Submit form responses
- `getFormResponses()` - Get form submissions
- `getFormStats()` - Get form statistics

## Usage Example

```typescript
import { ContestService, ParticipantService, DrawService } from './services';

// Create a new contest
const contest = await ContestService.createContest({
  name: "Summer Giveaway",
  description: "Win amazing prizes!",
  startDate: new Date(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  status: "UPCOMING"
});

// Add a participant
const participant = await ParticipantService.addParticipant({
  contestId: contest.id,
  name: "John Doe",
  contact: "john@example.com",
  validated: true
});

// Execute a random draw
const draw = await DrawService.executeRandomDraw(
  contest.id,
  adminId,
  1 // number of winners
);
```

## Database Migration
If you need to make changes to the schema:

1. Update `prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Run `npx prisma generate` to update the client

## Security Notes
- Never commit your `.env` file with real database credentials
- Use environment variables for all sensitive data
- Implement proper authentication before using these services in production
- Consider implementing rate limiting for API endpoints

## Troubleshooting

### Connection Issues
- Verify your Supabase database password is correct
- Check that your Supabase project is active
- Ensure your IP is whitelisted in Supabase (if applicable)

### Schema Issues
- If you get schema conflicts, you may need to reset the database
- Use `npx prisma db push --force-reset` (⚠️ This will delete all data)

### Type Issues
- Make sure to regenerate the Prisma client after schema changes
- Restart your TypeScript server in VS Code if types aren't updating
