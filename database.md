# Database Schema

This project supports SQLite with a JSON fallback. The structures below list every stored variable/column for each collection and the top-level JSON snapshot.

## Tables and Columns

### `ads`
- `id`
- `title`
- `description`
- `category`
- `subcategory`
- `location`
- `price`
- `contact_phone`
- `contact_email`
- `visits`
- `tags`
- `created_at`
- `title_en`
- `title_el`
- `description_en`
- `description_el`
- `category_en`
- `category_el`
- `subcategory_en`
- `subcategory_el`
- `location_en`
- `location_el`
- `subcategory_fields`
- `source_language`
- `approved`
- `user_id`
- `remaining_edits`
- `active`
- `images`

### `reports`
- `id`
- `ad_id`
- `reason`
- `created_at`

### `users`
- `id`
- `email`
- `password_hash`
- `salt`
- `verified`
- `verification_token`
- `disabled`
- `created_at`
- `nickname`
- `phone`

## JSON Fallback Structure

The JSON store mirrors the tables above with the following top-level keys:
- `ads`: array of ad objects using the `ads` fields listed above.
- `users`: array of user objects using the `users` fields listed above plus sanitized flags (e.g., `verified`, `disabled`).
- `reports`: array of report objects using the `reports` fields listed above.
