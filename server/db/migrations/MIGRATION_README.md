# Firestore to PostgreSQL Migration Guide

This guide will help you migrate your school management system from Firestore to PostgreSQL (Cloud SQL).

## Prerequisites

1. **Google Cloud SQL Instance**: Create a PostgreSQL instance in Google Cloud SQL
   - Go to Google Cloud Console > SQL
   - Create a PostgreSQL instance
   - Note the connection details (host, port, database name, user, password)

2. **Environment Variables**: Add these to your `.env` file:
   ```env
   # PostgreSQL Configuration
   DB_HOST=your-cloud-sql-instance-ip
   DB_PORT=5432
   DB_NAME=school_app
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_SSL=true  # For Cloud SQL connections
   ```

3. **Secret Manager** (Production): Store these secrets in Google Secret Manager:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

## Migration Steps

### Step 1: Install Dependencies

```bash
cd server
npm install
```

This will install:
- `pg` - PostgreSQL client
- `connect-pg-simple` - PostgreSQL session store
- `uuid` - UUID generation

### Step 2: Create Database Schema

1. Connect to your PostgreSQL database (either via Cloud SQL Proxy or direct connection)
2. Run the schema SQL file:

```bash
# Using psql
psql -h YOUR_DB_HOST -U YOUR_USER -d YOUR_DATABASE -f server/db/schema.sql

# Or via Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE_NAME=tcp:5432
psql -h localhost -U YOUR_USER -d YOUR_DATABASE -f server/db/schema.sql
```

### Step 3: Run Data Migration

This will copy all data from Firestore to PostgreSQL:

```bash
node server/db/migrateFromFirestore.js
```

**Important Notes:**
- This script maintains data integrity and relationships
- It maps Firestore document IDs to PostgreSQL UUIDs
- The script handles conflicts gracefully (upserts)
- **Backup your data before running!**

### Step 4: Update Your Application

After migration, you'll need to:
1. Update all service files to use PostgreSQL
2. Update server.js to use PostgreSQL session store
3. Test all functionality

### Step 5: Verify Migration

Check that all data migrated correctly:

```sql
-- Check record counts
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'invitations', COUNT(*) FROM invitations
UNION ALL
SELECT 'communication_groups', COUNT(*) FROM communication_groups
UNION ALL
SELECT 'group_members', COUNT(*) FROM group_members;
```

## Rollback Plan

If you need to rollback:
1. Keep your Firestore data (don't delete it immediately)
2. Update your `.env` to remove PostgreSQL config
3. Your application will continue using Firestore

## Testing

After migration:
1. Test user authentication
2. Test role management
3. Test group and member management
4. Test invitations
5. Check all API endpoints

## Post-Migration Cleanup

Once you've verified everything works:
1. Update your Cloud Run deployment to use PostgreSQL
2. Monitor for any issues
3. Consider removing Firestore after a grace period (1-2 weeks)

## Support

If you encounter issues:
- Check PostgreSQL connection logs
- Verify all environment variables are set correctly
- Ensure Cloud SQL instance allows connections from your Cloud Run service
- Check that the schema was created correctly

