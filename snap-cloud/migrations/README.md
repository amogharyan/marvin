# Legacy Migrations Directory (Do Not Use)

This directory (`snap-cloud/migrations/`) contains legacy migration scripts that are **NOT** executed by CI/CD or deployment pipelines.

## Migration Policy

- All active migrations are now managed in `snap-cloud/supabase/migrations/`.
- This directory is retained for historical reference only.
- Do **NOT** add, modify, or execute migrations from this directory.

## Why?

Parallel/conflicting migration sets cause schema drift and deployment failures. Only the Supabase migrations directory is authoritative.

## Next Steps

- If you are updating schema, use `snap-cloud/supabase/migrations/` only.
- Contact Dev 3 for migration strategy questions.
