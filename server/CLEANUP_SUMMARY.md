# Codebase Cleanup Summary

This document summarizes the cleanup performed after migrating from Firestore to PostgreSQL.

## Files Removed

### Deleted Files
- `server/config/firestoreSessionStore.js` - No longer needed (using PostgreSQL session store via `connect-pg-simple`)
- `server/db/fixRoleIds.js` - Temporary fix script (no longer needed)
- `server/db/fixUserRoleMappings.js` - Temporary fix script (no longer needed)
- `server/db/testRoleLookup.js` - Temporary test script (no longer needed)
- `server/db/updateUserRoles.js` - Temporary fix script (no longer needed)
- `server/db/scripts/addIdMappingTable.js` - Duplicate script (merged into schema.sql)
- `server/db/scripts/createIdMappingTable.js` - Duplicate script (merged into schema.sql)

## Files Reorganized

### New Directory Structure
```
server/db/
├── migrations/          # NEW: Migration scripts
│   ├── migrateFromFirestore.js
│   ├── firestoreconnect.js        # Only needed for migration
│   └── MIGRATION_README.md
├── scripts/            # NEW: Setup and utility scripts
│   ├── setupDatabase.js
│   ├── setupExtendedSchema.js
│   └── createDatabase.js
├── services/           # Database service layer
│   └── (all service files)
├── schema.sql
├── schema_extended.sql
├── postgresConnect.js
└── README.md          # NEW: Documentation
```

### Moved Files
- Migration scripts → `server/db/migrations/`
- Setup scripts → `server/db/scripts/`
- All import paths updated accordingly

## Updated Files

### Import Updates
- `server/db/migrations/migrateFromFirestore.js` - Updated import paths
- `server/db/scripts/*.js` - Updated import paths for new locations
- `server/scripts/createInitialAdmin.js` - Changed from `firestoreConnect()` to `initializePostgres()`
- `server/scripts/updateAdminRole.js` - Changed from `firestoreConnect()` to `initializePostgres()`

### Dependencies
- Removed `@google-cloud/connect-firestore` from package.json (no longer used)
- Kept `firebase-admin` (still needed for migration script to read from Firestore)

## Current State

### Active Database
- **PostgreSQL** via Cloud SQL
- Session store: `connect-pg-simple` (PostgreSQL-based)
- All services use PostgreSQL

### Firestore Usage
- **Only** used in migration script (`server/db/migrations/migrateFromFirestore.js`)
- Not used in production runtime code

## Notes

- All runtime code now uses PostgreSQL
- Firestore is only referenced in the migration script
- `firebase-admin` dependency kept for migration purposes only
- All import paths have been updated to reflect new file locations

