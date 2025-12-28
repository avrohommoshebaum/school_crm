# School Management System - Database Schema

## Overview
This document describes the complete database schema for the school management system, including all entities and their relationships.

## Core Entities

### 1. Users & Authentication
- **users** - User accounts (admin, principals, teachers, parents, students)
- **roles** - Role definitions with permissions
- **invitations** - User invitation system
- **user_settings** - User-specific settings
- **sessions** - Express session storage

### 2. Communication
- **communication_groups** - Groups for messaging (existing)
- **group_members** - Members of communication groups (existing)

### 3. School Structure
- **grades** - Grade levels (Kindergarten, Grade 1, Grade 2, etc.)
- **classes** - Individual classes within grades (e.g., "2B", "6A")
- **families** - Family units

### 4. People
- **students** - Student records
- **parents** - Parent/guardian records
- **staff** - Staff members (teachers, principals, etc.)
- **tutors** - External tutors
- **therapists** - External therapists (OT, Speech, PT, etc.)

### 5. Academic Records
- **report_cards** - Report cards per term/year
- **tests** - Tests, quizzes, assignments, grades

### 6. Relationships (Many-to-Many)
- **student_siblings** - Student sibling relationships
- **student_parents** - Students to parents/guardians
- **student_classes** - Students enrolled in classes
- **student_principals** - Students assigned to principals
- **student_tutors** - Students with tutors
- **student_therapists** - Students with therapists
- **staff_positions** - Staff positions (e.g., "Teacher Grade 6", "Curriculum Director")
- **staff_grades** - Staff assigned to grades
- **staff_classes** - Staff teaching classes
- **staff_tutors** - Staff-tutor communication links

## Key Relationships

### User Relationships
- **users** → **roles** (many-to-many via UUID array in users table)
- **users** → **parents** (one-to-one: parent user account)
- **users** → **students** (one-to-one: student user account)
- **users** → **staff** (one-to-one: staff user account)

### Family Structure
- **families** → **students** (one-to-many)
- **families** → **parents** (one-to-many)
- **students** ↔ **students** (many-to-many via `student_siblings`)

### Student Relationships
- **students** → **grades** (many-to-one)
- **students** ↔ **parents** (many-to-many via `student_parents`)
- **students** ↔ **classes** (many-to-many via `student_classes`)
- **students** ↔ **principals** (many-to-many via `student_principals` - principals are staff)
- **students** ↔ **tutors** (many-to-many via `student_tutors`)
- **students** ↔ **therapists** (many-to-many via `student_therapists`)
- **students** → **report_cards** (one-to-many)
- **students** → **tests** (one-to-many)

### Staff Relationships
- **staff** ↔ **grades** (many-to-many via `staff_grades`)
- **staff** ↔ **classes** (many-to-many via `staff_classes`)
- **staff** → **positions** (one-to-many via `staff_positions` - a staff member can have multiple positions)
- **staff** ↔ **tutors** (many-to-many via `staff_tutors` - for communication about specific students)

### Class Structure
- **classes** → **grades** (many-to-one)
- **classes** ↔ **students** (many-to-many via `student_classes`)
- **classes** ↔ **staff** (many-to-many via `staff_classes`)

## Permission Model

Access control is handled through the **roles** table with a permissions JSONB field:

```json
{
  "students": { "view": true, "create": true, "edit": true, "delete": true },
  "classes": { "view": true, "create": true, "edit": true, "delete": true },
  // ... etc
}
```

### Permission Scenarios:
1. **Admin** - Full access to all entities
2. **Principal** - View their assigned grade(s), staff, students, classes
3. **Teacher** - View their assigned classes and students
4. **Parent** - View their own children's information
5. **Student** - View their own information

## Notes on Design Decisions

1. **Users vs People Tables**: 
   - `users` table handles authentication/login
   - `students`, `parents`, `staff` tables store detailed person information
   - Linked via `user_id` foreign key (nullable, since not all people need accounts)

2. **Family Structure**:
   - Supports divorced parents (separate user accounts, same family or different families)
   - Supports married parents (shared user account or separate accounts)
   - Flexible parent-student relationships

3. **Multiple Positions**:
   - Staff can have multiple positions via `staff_positions` table
   - Example: Teacher in morning, Curriculum Director in afternoon

4. **Time-based Relationships**:
   - Many relationship tables include `start_date` and `end_date` for historical tracking
   - Supports changes over time (student moves grades, staff changes positions, etc.)

5. **Academic Year Support**:
   - Classes, report cards, and tests include `academic_year` field
   - Supports historical data and year-over-year comparisons

