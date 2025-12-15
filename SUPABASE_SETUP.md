# Supabase Setup Guide

This guide will help you set up Supabase for your presale management system.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: Your project name
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Set Up the Database Schema

1. In your Supabase project dashboard, go to the "SQL Editor" tab
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file in the root of this project
4. Paste it into the SQL Editor
5. Click "Run" to execute the SQL

This will create:
- The `presales` table with all necessary columns
- Indexes for optimized queries
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- A function to update presale status based on time
- A public view for approved presales

## Step 3: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to "Settings" > "API"
2. Find your:
   - **Project URL** (under "Project URL")
   - **Anon/Public Key** (under "Project API keys" > "anon public")

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ADMIN_ADDRESSES=0xYourAdminAddress1,0xYourAdminAddress2
   ```

   Replace:
   - `your-project-id` with your actual Supabase project ID
   - `your-anon-key-here` with your anon/public key
   - `0xYourAdminAddress1` with your actual admin wallet addresses (comma-separated)

## Step 5: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The application should now connect to Supabase

## Database Structure

### Presales Table

The `presales` table stores all presale information:

**Token Information:**
- `token_address`: The token's contract address
- `token_name`: Token name
- `token_symbol`: Token symbol
- `token_decimals`: Token decimals (default: 18)
- `token_logo_url`: URL to token logo

**Presale Details:**
- `presale_address`: The presale contract address
- `total_supply`: Total token supply
- `presale_amount`: Amount of tokens for presale
- `soft_cap`: Soft cap for fundraising
- `hard_cap`: Hard cap for fundraising
- `min_contribution`: Minimum contribution amount
- `max_contribution`: Maximum contribution amount
- `price_per_token`: Token price

**Time Details:**
- `start_time`: Presale start time
- `end_time`: Presale end time

**Status:**
- `status`: Can be 'pending', 'live', 'ongoing', 'ended', or 'cancelled'

**Owner Information:**
- `owner_address`: Wallet address of the presale creator
- `owner_email`: Contact email
- `owner_telegram`: Telegram handle
- `owner_twitter`: Twitter handle
- `owner_website`: Project website

**Project Description:**
- `project_description`: Detailed project description
- `whitepaper_url`: Link to whitepaper

**Fundraising Progress:**
- `total_raised`: Total amount raised
- `total_contributors`: Number of contributors

**Admin Controls:**
- `is_approved`: Whether the presale is approved by admin
- `is_featured`: Whether to feature this presale
- `is_verified`: Whether the project is verified
- `admin_notes`: Internal admin notes

## Using the Presale System

### For Developers Submitting Presales

Use the `createPresale` function from the presale store:

```typescript
import { usePresaleStore } from '@/lib/store/presale-store';

const { createPresale } = usePresaleStore();

await createPresale({
  token_address: '0x...',
  token_name: 'My Token',
  token_symbol: 'MTK',
  token_decimals: 18,
  presale_address: '0x...',
  total_supply: '1000000000000000000000000', // 1M tokens (in wei)
  presale_amount: '500000000000000000000000', // 500K tokens
  start_time: new Date('2025-01-01').toISOString(),
  end_time: new Date('2025-02-01').toISOString(),
  owner_address: '0x...',
  // ... other fields
});
```

### For Admins

Admin functions are available in the presale store:

```typescript
import { usePresaleStore } from '@/lib/store/presale-store';
import { isAdmin } from '@/lib/utils/admin';
import { useAccount } from 'wagmi';

const { address } = useAccount();
const {
  fetchPendingPresalesAdmin,
  approvePresale,
  rejectPresale,
  toggleFeatured,
  deletePresale
} = usePresaleStore();

// Check if user is admin
if (isAdmin(address)) {
  // Fetch pending presales
  await fetchPendingPresalesAdmin();

  // Approve a presale
  await approvePresale('presale-id', address);

  // Reject a presale
  await rejectPresale('presale-id', 'Does not meet requirements');

  // Feature a presale
  await toggleFeatured('presale-id', true);

  // Delete a presale
  await deletePresale('presale-id');
}
```

### Fetching Presales

```typescript
import { usePresaleStore } from '@/lib/store/presale-store';

const {
  fetchLivePresales,
  fetchUpcomingPresales,
  fetchEndedPresales,
  fetchFeaturedPresales,
  livePresales,
  upcomingPresales,
  endedPresales,
  featuredPresales
} = usePresaleStore();

// Fetch live presales
await fetchLivePresales();

// Use the data
console.log(livePresales);
```

## Row Level Security (RLS)

The database is secured with Row Level Security policies:

1. **Public Read**: Anyone can view approved presales
2. **Insert**: Anyone can create presales (subject to approval)
3. **Update**: Owners can update their own presales (before approval)
4. **Admin Access**: Admins can perform all operations

## Automatic Status Updates

The database includes a function `update_presale_status()` that can be called periodically to update presale statuses based on time:

- Presales with `start_time <= NOW()` and `end_time > NOW()` are marked as 'live'
- Presales with `end_time <= NOW()` are marked as 'ended'

You can set up a cron job in Supabase to run this function periodically:

1. Go to "Database" > "Cron Jobs" in your Supabase dashboard
2. Create a new cron job:
   ```sql
   SELECT update_presale_status();
   ```
3. Set it to run every hour (or your preferred interval)

## Troubleshooting

### Connection Issues

If you get connection errors:
1. Check that your `.env` file has the correct credentials
2. Verify that your Supabase project is running
3. Check the browser console for detailed error messages

### Permission Errors

If you get permission errors:
1. Verify that RLS policies are set up correctly
2. Check that the admin addresses in `.env` are correct
3. Ensure wallet addresses are in lowercase

### Missing Data

If presales aren't showing up:
1. Check that `is_approved` is set to `true` for the presales
2. Verify that the presales exist in the database using the Supabase dashboard
3. Check the browser console for errors

## Next Steps

1. Create UI components for:
   - Presale submission form
   - Presale listing pages (live, upcoming, ended)
   - Admin dashboard for approving presales
2. Implement real-time updates using Supabase subscriptions
3. Add form validation for presale submissions
4. Create email notifications for presale status changes
