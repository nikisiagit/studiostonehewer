# Agent Instructions

- When changes are done, always push the changes to GitHub to the `main` branch.

## Payload CMS + Cloudflare Worker Best Practices

- **API URL Configurations**: Eleventy static builds rely on the `PAYLOAD_API_URL` environment variable. If the Cloudflare Worker URL is updated (e.g., from a `.workers.dev` subdomain to a custom domain), you MUST update the deployment workflow (e.g., `.github/workflows/deploy.yml`) to point to the new URL. Failing to do so will cause the build step to fail silently and fall back to dummy data.
- **Data Mapping & Casing**: Be extremely careful when mapping raw Payload API data (which uses `snake_case`) into JavaScript objects for templating engines like Nunjucks. If you convert the variable names to `camelCase` in your JavaScript data files (e.g., `featuredImage`), you MUST ensure that all corresponding HTML templates are updated to match. Otherwise, the templates will look for the old `snake_case` variable and render blank strings, causing broken images and missing text.
- **Relational Field Depths**: Remember that Payload's REST API defaults to `depth=1` for relationships (like media uploads). The data will be returned as full objects (e.g., `image.url`) instead of string IDs. Always handle this safely (e.g., `item.image?.url`).
- **Automated Frontend Rebuilds**: Cloudflare Workers do not have native deploy hooks. To trigger automatic Eleventy site rebuilds when content is saved in the Payload CMS Worker, you must use a custom `afterChange` hook attached to all relevant Collections and Globals that hits the GitHub API via a `repository_dispatch` event. This requires a `GITHUB_TOKEN` secret to be present in the Cloudflare Worker environment.
