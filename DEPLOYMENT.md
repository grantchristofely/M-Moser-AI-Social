# Vercel Deployment Guide: M Moser AI Hub

This guide provides steps to deploy the M Moser AI Hub to Vercel.

## 1. Prerequisites

- A [Vercel](https://vercel.com/) account.
- The project code pushed to a [GitHub](https://github.com/) repository.
- A [Supabase](https://supabase.com/) project with the database schema applied.

## 2. Environment Variables

During the Vercel deployment setup, you must configure the following environment variables in the **Environment Variables** section:

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Project Anon Key. |
| `GEMINI_API_KEY` | Your Google Gemini API Key. |
| `LEAPTER_API_KEY` | Your Leapter API Key (for gamification). |
| `LEAPTER_MCP_URL` | The Leapter MCP Endpoint URL. |

> [!IMPORTANT]
> Ensure all keys are copied exactly as they appear in your service providers.

## 3. Deployment Steps

1.  **Import to Vercel**: Connect your GitHub account and import the repository.
2.  **Configure Project**:
    - Framework Preset: **Next.js**
    - Root Directory: `./` (Current directory)
3.  **Add Environment Variables**: Input the keys listed in the table above.
4.  **Deploy**: Click **Deploy**. Vercel will automatically build and serve your application.

## 4. Post-Deployment: Seeding Data

If you are starting with a fresh Supabase database and need to populate the initial data (Roles, Platforms, Ecosystems, etc.), run the seed script from your local machine:

```bash
# Ensure your .env.local has the correct Supabase credentials
npx tsx scripts/seed_dynamic_data.ts
```

---

## 5. Troubleshooting Build Errors

If the build fails on Vercel:
- **Lint Errors**: Build errors due to linting are currently ignored in `next.config.ts`, but it's recommended to fix them for better code quality.
- **Missing Env Vars**: Double-check that all environment variables are correctly spelled and included in the Vercel dashboard.
