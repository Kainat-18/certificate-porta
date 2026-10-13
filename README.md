# Certificate portal

This existing static website now has a certificate form, per-user saved entries, edit/delete controls, ON/OFF visibility, and public exact serial-number verification. The former page is preserved in index.original.html; it used Firebase. Existing Firebase data is not migrated automatically.

## Supabase setup

1. Create/open your Supabase project. Run `supabase/schema.sql` once in its SQL Editor.
2. In `js/supabase-config.js`, set `url` to your project URL and `key` to the publishable key (or legacy anon key). Never use a service_role or secret key in browser code.
3. Enable Email authentication in Supabase Auth. Set the Site URL to your actual website URL and add it to allowed redirect URLs. New users must confirm their email when email confirmation is enabled.
4. Serve this folder with your existing web hosting, or locally run `npx --yes http-server . -p 8080` and open http://localhost:8080. Internet access is needed for Supabase and its CDN SDK. No frontend build is required.

## Behavior

- Any visitor can create an account, sign in, and submit entries.
- Each account can read/edit/delete/toggle only its own entries, enforced by database RLS.
- ON certificates can be looked up by their exact serial number, case-insensitively. OFF/deleted certificates return no public details. The owner can still see OFF entries in management.
- Share a certificate using `https://YOUR-WEBSITE/?id=SERIAL-NUMBER`.
- Serial numbers are globally unique; expiry must not precede the issue date.
- ON controls visibility, not expiration. Expired ON entries still show dates and an expiry message.
- This is a self-service records portal: account registration does not establish that a certificate was issued by an official authority. If only approved issuers should add records, restrict registration and insertion policies before public use.
- Disabling an entry prevents subsequent lookups; information already viewed cannot be recalled from another visitor's screen.

## Verification checklist after connecting

Create two accounts. With account A, create a certificate, search its serial while logged out, edit it, turn it OFF and search again (no details), turn ON, then delete and search again. Confirm account B cannot see or change A's saved entries. Check duplicate serial and invalid date errors, and mobile layout.

Database rules follow Supabase RLS and database function guidance:
https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/guides/database/functions

Live database operations cannot run until project configuration is supplied and the SQL is applied.

## GitHub + Vercel deployment

1. Supabase dashboard: click **New project**, choose your organization, name it `certificate-portal`, generate/save a database password privately, choose a suitable region, and create the project. If creation is blocked by your plan, follow the dashboard guidance; do not delete existing projects just to make space.
2. Open the new project's **SQL Editor → New query**. Paste the complete contents of `supabase/schema.sql` and click **Run**. This creates the certificates table, ownership rules, and public verification function.
3. Copy the project URL from **Connect** or the project's API settings. In **Settings → API Keys**, copy the **publishable** key (legacy **anon** also works). Do not use a secret/service-role key.
4. Create a GitHub repository named `certificate-portal` under **Kainat-18**. Keep it empty initially (no generated README). Push this local Git repository to it after signing in to the correct GitHub account. `index.original.html` stays local and is ignored by Git.
5. Vercel: **Add New → Project → Import Git Repository** → select `Kainat-18/certificate-portal`. Choose **Other** for Framework. The tracked `vercel.json` uses `npm run build` and output directory `dist`.
6. Before Deploy, add **SUPABASE_URL** and **SUPABASE_PUBLISHABLE_KEY** to Vercel environment variables for Production and Preview. Click **Deploy**. These are public browser connection values; private database credentials are not required.
7. Supabase: **Authentication → URL Configuration**. Set **Site URL** to the returned production Vercel URL and allow that URL in Redirect URLs. Keep email/password signups enabled. If email confirmation is enabled, confirm the signup email before logging in.
8. Run the verification checklist above on the live URL. Future pushes to the connected production branch deploy automatically.

Local build on Windows: set the two environment variables in your terminal, then run `npm.cmd run build`. Alternatively populate the public config file for local use. Builds fail clearly if configuration is missing. No npm dependencies are needed. `dist/` contains only the portal and its required assets.

Official references: https://vercel.com/docs/builds/configure-a-build and https://supabase.com/docs/guides/getting-started/api-keys
