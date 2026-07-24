# Cloudflare setup (Studio Stonehewer)

## Workers

| Worker | Role | Domain |
|--------|------|--------|
| `studiostonehewer` | Public Eleventy site + contact form | `studiostonehewer.co.uk` |
| `studiostonehewer-cms` | Payload CMS (OpenNext) | `admin.studiostonehewer.co.uk` |

The CMS worker was renamed from `my-app` → `studiostonehewer-cms`.

**After the first successful deploy of `studiostonehewer-cms`:**

1. Confirm `admin.studiostonehewer.co.uk` points at the new Worker (custom domain in `wrangler.jsonc`).
2. Re-set secrets that only lived on `my-app` (cannot be read back):

```bash
# Required for CMS content → GitHub rebuild hooks
echo "$GITHUB_TOKEN" | npx wrangler secret put GITHUB_TOKEN --name studiostonehewer-cms

# PAYLOAD_SECRET is seeded from local cms/.env when setup ran; re-set if login fails:
# echo "$PAYLOAD_SECRET" | npx wrangler secret put PAYLOAD_SECRET --name studiostonehewer-cms
```

3. Delete the unused `my-app` Worker in the dashboard once admin works on the new name.

## Secrets (public Worker)

```bash
# Turnstile secret (already set if setup ran)
echo "$TURNSTILE_SECRET" | npx wrangler secret put TURNSTILE_SECRET_KEY --name studiostonehewer
```

Sitekey (public, embedded in the contact form): `0x4AAAAAAD8rfmjtRjNqTJQ6`

## R2 media

- Bucket: `payload-media`
- Custom domain: `https://media.studiostonehewer.co.uk`
- Object keys match Payload filenames (e.g. `oud-west-bedroom-pink-1.jpg`)
- Build rewrites `/api/media/file/<file>` → `https://media.studiostonehewer.co.uk/<file>` via `MEDIA_PUBLIC_URL`

SSL on the custom domain may show **pending** for a few minutes after connect.

## Image resizing

Public site uses Worker path `/_img/width=…,quality=…/<source-url>` which applies `cf.image` transforms (no separate Image Resizing product toggle required for the Worker path).

Optional: also enable **Images → Transformations** for the zone in the dashboard if you want `/cdn-cgi/image/` URLs later.

## Rate limiting

`CONTACT_RATE_LIMITER` binding: **5 requests / 60 seconds** per `contact:<ip>` key (per colo).

## Observability

Enabled on both Workers (`observability.enabled = true`).
