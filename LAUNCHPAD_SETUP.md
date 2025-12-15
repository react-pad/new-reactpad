# Launchpad Presales Setup Guide

This guide explains how to set up and use the Supabase-powered launchpad presales system.

## Database Setup

### 1. Apply the Schema

Run the SQL schema in your Supabase SQL Editor:

```bash
# The schema file is located at:
supabase-presales-schema.sql
```

This will create:
- `launchpad_presales` table - stores all presale data
- `active_presales` view - filtered view of live/upcoming presales
- Indexes for optimal query performance
- Row Level Security (RLS) policies
- Auto-update triggers for timestamps and status

### 2. Configure Supabase Connection

Your Supabase connection is already configured in `src/lib/supabase.ts`.

**Current configuration:**
```typescript
const supabaseUrl = "https://iqdiauoqpvajwozbutux.supabase.co";
const supabaseAnonKey = "sb_publishable_zfMOHkOwLnYi8wwaROpbKg_LnfYNpYn";
```

**⚠️ Important:** Move these to environment variables for production:
```bash
VITE_SUPABASE_URL=https://iqdiauoqpvajwozbutux.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## How It Works

### Creating a Presale

1. **User creates presale** via `/dashboard/create/presale`
2. **Smart contract deployed** on blockchain
3. **Transaction confirmed** and presale address obtained
4. **Automatically saved to Supabase** with:
   - Presale contract address
   - Token information (name, symbol, decimals)
   - Configuration (caps, rates, timing)
   - Owner address
   - Transaction hash

### Viewing Presales

1. **Navigate to** `/projects`
2. **Filter by status:**
   - **All** - Show all presales
   - **Live** - Currently active presales (between start and end time)
   - **Upcoming** - Not started yet
   - **Ended** - Past end time
3. **Search** by token name, symbol, or project description

## Database Schema Overview

### Table: `launchpad_presales`

```sql
| Column                  | Type      | Description                          |
|------------------------|-----------|--------------------------------------|
| id                     | UUID      | Primary key                          |
| presale_address        | VARCHAR   | Presale contract address             |
| sale_token_address     | VARCHAR   | Token being sold                     |
| payment_token_address  | VARCHAR   | Payment token (null = ETH)           |
| token_name             | VARCHAR   | Token name                           |
| token_symbol           | VARCHAR   | Token symbol                         |
| token_decimals         | INTEGER   | Token decimals                       |
| rate                   | NUMERIC   | Tokens per payment token (x100)      |
| soft_cap               | NUMERIC   | Minimum raise target                 |
| hard_cap               | NUMERIC   | Maximum raise target                 |
| min_contribution       | NUMERIC   | Minimum buy amount                   |
| max_contribution       | NUMERIC   | Maximum buy amount                   |
| start_time             | TIMESTAMPTZ | When presale starts                |
| end_time               | TIMESTAMPTZ | When presale ends                  |
| owner_address          | VARCHAR   | Creator/owner address                |
| total_raised           | NUMERIC   | Current amount raised                |
| tokens_sold            | NUMERIC   | Total tokens sold                    |
| total_contributors     | INTEGER   | Number of participants               |
| status                 | VARCHAR   | pending/live/ended/cancelled         |
| is_verified            | BOOLEAN   | Project verified badge               |
| is_featured            | BOOLEAN   | Featured on homepage                 |
| creation_tx_hash       | VARCHAR   | Creation transaction hash            |
```

### Status Management

Status is automatically updated by a SQL function:
- **pending** → **live** when `start_time` is reached
- **live** → **ended** when `end_time` is reached

You can manually trigger status updates:
```sql
SELECT update_launchpad_presale_status();
```

## API Reference

### Service: `LaunchpadService`

Located in `src/lib/services/launchpad-service.ts`

#### Create Presale
```typescript
await LaunchpadService.createPresale({
  presale_address: '0x...',
  sale_token_address: '0x...',
  token_name: 'My Token',
  token_symbol: 'MTK',
  token_decimals: 18,
  rate: '100000', // 1000 tokens per ETH (scaled by 100)
  soft_cap: parseEther('10').toString(),
  hard_cap: parseEther('100').toString(),
  min_contribution: parseEther('0.1').toString(),
  max_contribution: parseEther('10').toString(),
  start_time: new Date('2025-01-01').toISOString(),
  end_time: new Date('2025-01-31').toISOString(),
  owner_address: '0x...',
  creation_tx_hash: '0x...',
});
```

#### Get Presales by Status
```typescript
// Get all presales
const all = await LaunchpadService.getAllPresales();

// Get live presales
const live = await LaunchpadService.getLivePresales();

// Get upcoming presales
const upcoming = await LaunchpadService.getUpcomingPresales();

// Get ended presales
const ended = await LaunchpadService.getEndedPresales();
```

#### Update Presale Progress
```typescript
await LaunchpadService.updatePresaleProgress(
  '0xPresaleAddress',
  parseEther('50').toString(), // total raised
  parseEther('50000').toString(), // tokens sold
  25 // contributor count
);
```

### Hook: `useLaunchpadPresales`

Located in `src/lib/hooks/useLaunchpadPresales.ts`

```typescript
import { useLaunchpadPresales } from '@/lib/hooks/useLaunchpadPresales';

function MyComponent() {
  const { presales, isLoading, error, refetch } = useLaunchpadPresales('live');

  // Filter options: 'all' | 'live' | 'upcoming' | 'ended'
}
```

## Security & Permissions

### Row Level Security (RLS)

The table has RLS enabled with these policies:

1. **Anyone can view** - All presales are publicly readable
2. **Anyone can insert** - Permissionless presale creation
3. **Owners can update** - Only presale owners can update their projects

### Data Validation

- All Ethereum addresses are stored in lowercase
- Addresses are validated with CHECK constraints
- Foreign key relationships ensure data integrity
- Timestamps use timezone-aware types

## Updating Presale Data

### From Blockchain

You can sync presale data from the blockchain:

```typescript
import { LaunchpadService } from '@/lib/services/launchpad-service';
import { readContract } from 'wagmi/actions';

async function syncPresaleData(presaleAddress: string) {
  // Read from blockchain
  const totalRaised = await readContract({
    address: presaleAddress,
    abi: presaleAbi,
    functionName: 'totalRaised',
  });

  // Update database
  await LaunchpadService.updatePresaleProgress(
    presaleAddress,
    totalRaised.toString(),
    tokensSold.toString(),
    contributorCount
  );
}
```

### Scheduled Updates

Consider setting up a cron job or Supabase Edge Function to periodically:
1. Update presale statuses based on time
2. Sync fundraising progress from blockchain
3. Update contributor counts

## Monitoring & Maintenance

### Check Presale Status
```sql
SELECT
  presale_address,
  token_name,
  status,
  start_time,
  end_time,
  total_raised,
  hard_cap
FROM launchpad_presales
ORDER BY created_at DESC;
```

### Find Stale Presales
```sql
-- Find presales that should have ended
SELECT * FROM launchpad_presales
WHERE status IN ('pending', 'live')
AND end_time < NOW();

-- Manually update status
SELECT update_launchpad_presale_status();
```

### Performance Monitoring
```sql
-- Check index usage
SELECT * FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND tablename = 'launchpad_presales';
```

## Troubleshooting

### Presale not appearing on projects page
1. Check if it exists in database: `SELECT * FROM launchpad_presales WHERE presale_address = '0x...'`
2. Verify status is correct
3. Check browser console for errors

### Status not updating automatically
1. Run manual status update: `SELECT update_launchpad_presale_status()`
2. Check if times are in correct timezone (UTC)
3. Verify triggers are enabled

### Database connection issues
1. Verify Supabase URL and key
2. Check RLS policies
3. Ensure anon key has correct permissions

## Next Steps

1. **Set up status sync** - Create a cron job to update statuses
2. **Add blockchain sync** - Periodically sync raised amounts from contracts
3. **Implement admin panel** - Build UI for featuring/verifying presales
4. **Add notifications** - Notify users when presales go live
5. **Analytics dashboard** - Track presale performance metrics

## Related Files

- **Schema**: `supabase-presales-schema.sql`
- **Service**: `src/lib/services/launchpad-service.ts`
- **Hook**: `src/lib/hooks/useLaunchpadPresales.ts`
- **Types**: `src/lib/types/database.ts`
- **Create Page**: `src/pages/dashboard/create/presale/page.tsx`
- **Projects Page**: `src/pages/projects/page.tsx`
- **Presale Card**: `src/components/ui/presale-card.tsx`
