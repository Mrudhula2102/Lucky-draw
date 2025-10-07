# Complete Database Setup Guide - Lucky Draw Project

## Overview
This project now has a complete database backend with two approaches:
1. **Supabase Client** (Primary - Working Solution)
2. **Prisma ORM** (Secondary - For when connection issues are resolved)

## 🚀 Quick Start (Recommended)

### Step 1: Set up the database tables
1. Go to your **Supabase Dashboard**: https://supabase.com/dashboard/project/rnihpvwaugrekmkbvhlk
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. **Execute the query** to create all tables

### Step 2: Test the setup
```bash
npm run db:test
```

This will:
- Test your Supabase connection
- Create sample data if the database is empty
- Verify everything is working

### Step 3: Start using in your components
```typescript
import { DatabaseService } from './services/database';
import { useContests, useParticipants } from './hooks/useDatabase';

// Using the service directly
const contests = await DatabaseService.getAllContests();

// Using React hooks
function MyComponent() {
  const { contests, loading, createContest } = useContests();
  const { participants, addParticipant } = useParticipants(contestId);
  
  // Your component logic here
}
```

## 📁 File Structure

```
src/
├── lib/
│   ├── prisma.ts              # Prisma client (for future use)
│   └── supabase-db.ts         # Supabase service (primary)
├── services/
│   ├── database.ts            # Main database service (uses Supabase)
│   ├── contestService.ts      # Prisma contest service
│   ├── participantService.ts  # Prisma participant service
│   └── index.ts               # Service exports
├── hooks/
│   └── useDatabase.ts         # React hooks for database operations
└── examples/
    └── ContestExample.tsx     # Working example component

prisma/
└── schema.prisma              # Prisma schema (ready for when connection works)

supabase-schema.sql            # SQL to create tables in Supabase
setup-database.js              # Automated setup script
```

## 🛠️ Available Services

### DatabaseService (Primary)
```typescript
// Contest operations
await DatabaseService.createContest(contestData);
await DatabaseService.getAllContests();
await DatabaseService.getContestById(id);
await DatabaseService.updateContest(id, updates);
await DatabaseService.deleteContest(id);

// Participant operations
await DatabaseService.addParticipant(participantData);
await DatabaseService.getParticipantsByContest(contestId);
await DatabaseService.getValidatedParticipants(contestId);

// Prize operations
await DatabaseService.createPrize(prizeData);
await DatabaseService.getPrizesByContest(contestId);

// Draw operations
await DatabaseService.executeRandomDraw(contestId, executedBy, numberOfWinners);
await DatabaseService.getWinnersByContest(contestId);

// Statistics
await DatabaseService.getContestStats(contestId);
```

### React Hooks
```typescript
// Contest management
const { contests, loading, error, createContest } = useContests();

// Participant management
const { participants, addParticipant } = useParticipants(contestId);

// Prize management
const { prizes, createPrize } = usePrizes(contestId);

// Draw execution
const { executeRandomDraw } = useDraws();
```

## 🔧 Database Schema

The database includes these tables:
- **contests** - Contest information
- **participants** - Contest participants
- **prizes** - Prize definitions
- **draws** - Draw execution records
- **winners** - Winner information
- **forms** - Dynamic form definitions
- **form_responses** - Form submissions
- **admins** - Admin users
- **admin_activity_log** - Admin activity tracking
- **messages** - Communication system

## 📊 Example Usage

### Creating a Contest
```typescript
const contest = await DatabaseService.createContest({
  name: "Summer Giveaway",
  description: "Win amazing prizes!",
  start_date: new Date().toISOString(),
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: "UPCOMING"
});
```

### Adding Participants
```typescript
const participant = await DatabaseService.addParticipant({
  contest_id: contest.contest_id,
  name: "John Doe",
  contact: "john@example.com",
  validated: true
});
```

### Executing a Draw
```typescript
const result = await DatabaseService.executeRandomDraw(
  contest.contest_id,
  adminId,
  3 // number of winners
);

console.log(`Selected ${result.winners.length} winners!`);
```

## 🔄 Prisma Setup (When Connection Works)

If you resolve the Prisma connection issues:

1. **Update your DATABASE_URL** in `.env` with the correct Supabase connection string
2. **Push the schema**:
   ```bash
   npm run db:push
   ```
3. **Switch to Prisma services** by updating imports in your components

## 🚨 Troubleshooting

### Supabase Connection Issues
- Verify your project is **active** (not paused)
- Check your **REACT_APP_SUPABASE_URL** and **REACT_APP_SUPABASE_ANON_KEY** in `.env`
- Run `npm run db:test` to diagnose issues

### Prisma Connection Issues
- The connection string format should be: `postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres`
- Try different ports: 5432 (direct), 6543 (transaction mode)
- Check network/firewall settings
- Try from a different network

### Table Not Found Errors
- Make sure you've run the SQL schema in Supabase Dashboard
- Check that all tables were created successfully

## 🎯 Production Considerations

1. **Row Level Security**: The schema includes RLS policies - customize them for your needs
2. **Authentication**: Integrate with your existing Supabase auth
3. **Validation**: Add input validation before database operations
4. **Error Handling**: Implement proper error boundaries in React
5. **Performance**: Consider adding indexes for frequently queried fields

## 📝 Scripts Available

```bash
npm run db:test      # Test database connection and setup
npm run db:setup     # Same as db:test
npm run db:push      # Push Prisma schema (when connection works)
npm run db:generate  # Generate Prisma client
npm run db:studio    # Open Prisma Studio
```

## ✅ Success Checklist

- [ ] SQL schema executed in Supabase Dashboard
- [ ] `npm run db:test` passes successfully
- [ ] Sample data created
- [ ] Can import and use `DatabaseService`
- [ ] React hooks work in components
- [ ] Example component renders without errors

Your database backend is now ready for production use! 🎉
