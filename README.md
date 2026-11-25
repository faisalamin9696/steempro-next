This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Operations: request analytics and IP blocking

`/dashboard/traffic` shows incoming requests aggregated by minute (top
addresses, top routes, recently rejected junk URLs) and lets an operator block
an address or a range. Requests from a blocked address get `403` from the proxy
before the app renders; malformed `/@handle` and `/community/<tag>` URLs get
`404` there without touching SDS.

Access is limited to the accounts listed in `MODERATORS` (already used by the
boost route) or `ANALYTICS_ADMINS` (JSON array of usernames). With neither set,
nobody can open the page.

| Variable | Default | Purpose |
| --- | --- | --- |
| `ANALYTICS_ADMINS` | — | Extra usernames allowed into `/dashboard/traffic` |
| `ANALYTICS_DB_PATH` | `.data/analytics.db` | SQLite file; falls back to the OS temp dir when unwritable |
| `ANALYTICS_RETENTION_DAYS` | `7` | How long per-minute counters are kept |
| `ANALYTICS_IP_HEADER` | auto | Header carrying the real client IP (`x-forwarded-for`, `cf-connecting-ip`, `x-real-ip` are detected) |
| `ANALYTICS_ENABLED` | `true` | Set to `false` to record nothing and ignore the blocklist |

The store uses Node's built-in `node:sqlite` (Node 22.5+). On an older runtime
the feature disables itself with a single log line and the rest of the site
keeps working. Counters are per-machine: on more than one instance each keeps
its own view, so move the two tables to a shared store before scaling out.
