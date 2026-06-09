# CMS Collection Schemas

This folder is the **source of truth** for every Wix CMS collection the app uses.
Each `*.json` file describes one collection: its fields (key, display name, type),
and its read/insert/update/delete permissions.

## Two ways to get these into Wix

### Option A — Automated (recommended)

A backend script creates the collections for you from these schemas.

1. **Set a secret.** In your Wix dashboard → *Settings → Secrets Manager*, add a
   secret named `COLLECTIONS_SETUP_SECRET` with any random value (your password
   for running the setup).
2. **Publish** the site so the backend functions are live.
3. **Dry run** (shows what *would* happen, writes nothing):
   ```
   https://YOUR-SITE/_functions/provisionCollections?secret=YOUR_SECRET
   ```
4. **Apply** (actually creates the collections):
   ```
   https://YOUR-SITE/_functions/provisionCollections?secret=YOUR_SECRET&apply=1
   ```
   The response is a JSON report listing each collection as `created`,
   `skipped-exists`, `fields-added`, or `error`.

The script is **idempotent** — running it again skips collections that already
exist and only appends fields they are missing. It never deletes anything.

Relevant code:
- `src/backend/collectionSchemas.js` — auto-generated from these JSON files.
- `src/backend/provisionCollections.jsw` — the provisioning logic.
- `src/backend/http-functions.js` → `get_provisionCollections` — the guarded trigger.

> After editing any `*.json` here, regenerate the backend schema with:
> ```
> node tools/gen-collection-schemas.mjs
> ```

### Option B — Manual

In the dashboard → *CMS → Create Collection*. Name it exactly as `collectionId`,
then add each field using its `key` as the Field ID and the `type` mapped below.

| JSON type | Wix field type        |
|-----------|-----------------------|
| Text      | Text                  |
| LongText  | Text (long) / Rich Text |
| Number    | Number                |
| Boolean   | Boolean               |
| Date      | Date                  |
| DateTime  | Date and Time         |
| URL       | URL                   |
| Image     | Media / Image         |

## Permissions

Only `VehiclesNew` and `PickupLocations` are readable by **Anyone** (public
booking/vehicles pages). Every other collection is **Admin**-only for all
operations; the app reaches them through backend functions using
`{ suppressAuth: true }`.

> Wix auto-creates `_id`, `_createdDate`, `_updatedDate`, `_owner` — you don't
> add those. Fields described as "Computed / written by backend" still need to
> exist so the code can write to them.
