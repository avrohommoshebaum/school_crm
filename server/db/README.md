# Database Directory

This directory contains all database-related code for the PostgreSQL database.

## Structure

```
db/
├── migrations/          # Database migration scripts
│   ├── migrateFromFirestore.js    # Migration from Firestore to PostgreSQL
│   ├── firestoreconnect.js        # Firestore connection (for migration only)
│   └── MIGRATION_README.md        # Migration documentation
├── scripts/            # Database setup and utility scripts
│   ├── setupDatabase.js           # Initial schema setup
│   ├── setupExtendedSchema.js     # Extended schema (students, parents, etc.)
│   ├── createDatabase.js          # Create database if it doesn't exist
│   ├── addIdMappingTable.js       # Add ID mapping table
│   └── createIdMappingTable.js    # Alternative ID mapping table creation
├── services/           # Database service layer (business logic)
│   ├── userService.js
│   ├── roleService.js
│   ├── invitationService.js
│   ├── userSettingsService.js
│   ├── groupService.js
│   └── groupMemberService.js
├── schema.sql          # Base database schema
├── schema_extended.sql # Extended schema for school management system
└── postgresConnect.js  # PostgreSQL connection pool and utilities
```

## Services

All database operations go through the service layer. Services use PostgreSQL and provide a clean API for controllers.

### Usage Example

```javascript
import { userService } from "./db/services/userService.js";

// Find user by email
const user = await userService.findByEmail("user@example.com");

// Create user
const newUser = await userService.create({
  email: "newuser@example.com",
  name: "New User",
  password: "securepassword"
});
```

## Setup

### Initial Database Setup

1. **Create the database** (if it doesn't exist):
   ```bash
   node db/scripts/createDatabase.js
   ```

2. **Create the base schema**:
   ```bash
   node db/scripts/setupDatabase.js
   ```

3. **Create the extended schema** (for full school management system):
   ```bash
   node db/scripts/setupExtendedSchema.js
   ```

### Migrations

If migrating from Firestore:
```bash
node db/migrations/migrateFromFirestore.js
```

See `db/migrations/MIGRATION_README.md` for detailed migration instructions.

## Connection

The PostgreSQL connection is handled by `postgresConnect.js`, which:
- Initializes a connection pool
- Loads credentials from environment variables or Google Secret Manager
- Provides `query()` and `getClient()` utilities

## Notes

- All services use parameterized queries to prevent SQL injection
- UUIDs are used for all primary keys
- The `id_mapping` table helps with session migration from Firestore IDs to PostgreSQL UUIDs

