

## Fix: Batch relationship queries for large family trees

The tree at `/family-tree?viewTreeId=...` shows no links because the `.or()` filter with 120+ UUIDs exceeds the HTTP URL length limit (~10KB), causing the queries for `family_parent_child` and `family_unions` to silently fail.

### What will change

**File: `src/hooks/useFamilyTree.tsx`** -- `fetchTree` function

Replace the single `.or()` query for relationships and unions with batched queries:

1. Split `personIds` into chunks of 40 IDs
2. For each chunk, run the `.or()` query (keeps URL under ~4KB)
3. Run chunks in parallel with `Promise.all`
4. Merge and deduplicate results across batches
5. Apply existing `personIdSet` filter to keep only valid relationships

No database changes needed. No new RPC functions. Existing RLS policies remain intact.

