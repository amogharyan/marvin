# Supabase Migrations Directory

This directory (`snap-cloud/supabase/migrations/`) is the **authoritative source** for all database migrations for Marvin AR Morning Assistant.

## Migration Strategy
- Only migrations in this directory are executed during CI/CD and deployment.
- The legacy `snap-cloud/migrations/` directory has been removed to prevent parallel/conflicting migration sets and deployment failures.
- All new migration scripts must be added here and follow the established naming convention.
- If you see any other migration directories, do NOT use them—move them out of the repo or archive them.

## Why?
Parallel migration sets cause schema drift, deployment errors, and data loss. This directory is the single source of truth for all schema changes.

## How to Add Migrations
1. Create new migration scripts here (e.g., `002_add_object_interactions.sql`).
2. Test locally with Supabase CLI before pushing.
3. Update documentation if schema changes affect API or Edge Functions.

## Contact
For migration strategy questions, contact Dev 3 (Supabase Integration lead).
