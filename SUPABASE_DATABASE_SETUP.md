# Supabase Database Setup for Lucky Draw Project

## Overview
Since the direct Prisma connection to Supabase is having connectivity issues, we've created an alternative approach using the Supabase client directly. This approach leverages your existing Supabase connection that's already working for authentication.

## Setup Instructions

### 1. Create Database Tables
You need to run the SQL schema in your Supabase dashboard:

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/rnihpvwaugrekmkbvhlk
2. **Navigate to SQL Editor** (in the left sidebar)
3. **Create a new query** and paste the contents of `supabase-schema.sql`
4. **Run the query** to create all tables and relationships

### 2. Verify Tables Created
After running the SQL, you should see these tables in your Database → Tables section:
- `forms`
- `form_responses`
- `admins`
- `admin_activity_log`
- `contests`
- `prizes`
- `participants`
- `draws`
- `winners`
- `messages`

### 3. Use the Supabase Service
Import and use the `SupabaseService` class in your components:

```typescript
import { SupabaseService } from '../lib/supabase-db';
import type { Contest, Participant, Prize } from '../lib/supabase-db';

// Example usage
const contests = await SupabaseService.getAllContests();
const participant = await SupabaseService.addParticipant({
  contest_id: 1,
  name: "John Doe",
  contact: "john@example.com",
  validated: true
});
```

## Available Methods

### Contest Operations
- `SupabaseService.createContest(contestData)` - Create new contest
- `SupabaseService.getAllContests()` - Get all contests with related data
- `SupabaseService.getContestById(id)` - Get contest by ID
- `SupabaseService.updateContest(id, updates)` - Update contest
- `SupabaseService.deleteContest(id)` - Delete contest

### Participant Operations
- `SupabaseService.addParticipant(participantData)` - Add new participant
- `SupabaseService.getParticipantsByContest(contestId)` - Get all participants
- `SupabaseService.getValidatedParticipants(contestId)` - Get validated participants only
- `SupabaseService.updateParticipantValidation(id, validated)` - Update validation status

### Prize Operations
- `SupabaseService.createPrize(prizeData)` - Create new prize
- `SupabaseService.getPrizesByContest(contestId)` - Get prizes for contest
- `SupabaseService.updatePrize(id, updates)` - Update prize
- `SupabaseService.deletePrize(id)` - Delete prize

### Draw Operations
- `SupabaseService.executeRandomDraw(contestId, executedBy, numberOfWinners, prizeIds?)` - Execute random draw
- `SupabaseService.createDraw(drawData)` - Create draw record
- `SupabaseService.getWinnersByContest(contestId)` - Get all winners

### Statistics
- `SupabaseService.getContestStats(contestId)` - Get comprehensive contest statistics

## Example Component Usage

See `src/examples/ContestExample.tsx` for a complete working example that demonstrates:
- Creating contests
- Adding participants
- Executing random draws
- Displaying results

## Row Level Security (RLS)

The schema includes basic RLS policies that:
- Allow authenticated users to read contests, prizes, participants, and winners
- Allow authenticated users to insert participants
- You can customize these policies based on your security requirements

## Data Types

All TypeScript interfaces are provided:
- `Contest` - Contest information
- `Participant` - Participant data
- `Prize` - Prize definitions
- `Draw` - Draw execution records
- `Winner` - Winner information

## Benefits of This Approach

1. **Uses existing connection** - Leverages your working Supabase authentication
2. **No network issues** - Avoids the direct PostgreSQL connection problems
3. **Real-time capabilities** - Can easily add Supabase real-time subscriptions
4. **Built-in security** - Uses Supabase's RLS and authentication
5. **Easier deployment** - No need for additional database connection configuration

## Migration from Prisma

If you later want to switch back to Prisma:
1. The database schema is identical
2. Just change the import statements in your components
3. The method signatures are very similar

## Testing the Setup

1. Run the SQL schema in Supabase
2. Import the example component: `import ContestExample from './examples/ContestExample';`
3. Add it to your app to test the functionality
4. Create sample contests and participants to verify everything works

This approach should work immediately since it uses your existing Supabase connection!
