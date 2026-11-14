# SnapArt MySQL database

Use MySQL 8.4. For local development, create an empty database named `snapart` first. On a managed service, use the database provisioned by that service. Run the following from the repository root and substitute the host, account, and database name as needed.

```sh
mysql -h localhost -u snapart -p snapart < docs/sql/001_core.sql
mysql -h localhost -u snapart -p snapart < docs/sql/002_gallery.sql
mysql -h localhost -u snapart -p snapart < docs/sql/seed_workshops.sql
```

Apply the two schema files in order to an empty database. Each schema file is a one-time migration. The workshop seed is optional and can be rerun without overwriting edits. Its IDs match the current Workshop form. For remote MySQL, use the provider's TLS connection settings.

| Table | Purpose |
| --- | --- |
| `workshops` | Workshop catalogue and active status |
| `booking_requests` | Guest contact details, preferred date, group size, and confirmed start time |
| `admin_users` | Internal admin accounts and password hashes |
| `admin_sessions` | Session token hashes, expiry, and owning admin |
| `email_outbox` | Admin notifications, delivery attempts, and retry schedule |
| `gallery_upload_links` | Expiring, revocable upload links tied to a booking |
| `gallery` | Image metadata, storage keys, moderation, and book placement |

## Backend integration

- Create the first admin through an internal setup command that hashes the password. For admin sessions and gallery upload links, generate random tokens and store their SHA-256 digests as 32-byte buffers. Check expiry, revocation where applicable, and admin active status when resolving tokens.
- Create the booking and its email outbox record in one transaction. Use the same `request_key` for retries of the same submission. If it already exists, return the original `public_code` for a matching payload. Reject a reused key with different details.
- Preserve `preferred_date` as a calendar date in `Asia/Ho_Chi_Minh`. Store `confirmed_start_at` as UTC and configure the database connection to use UTC for timestamps. Validate the preferred date and that the workshop is active in the API.
- Have the email worker claim due jobs in a short transaction with `FOR UPDATE SKIP LOCKED`. Record a unique claim token and lease expiry, then commit before calling SMTP. Mark the outcome only if the claim token still matches. Reclaim expired leases and schedule retries for temporary failures. A worker that stops after SMTP accepts a message can cause a repeat delivery on retry.
- Check upload link expiry and revocation before accepting files. Keep pending images private in R2. Publish only after admin review and customer consent, then expose the approved image URLs through the API. The gallery book reads published rows ordered by `featured_order` from 1 to 5. The archive reads all published rows ordered by `published_at DESC, id DESC` with pagination.
