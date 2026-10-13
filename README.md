# Certificate portal

Static certificate management and serial-number verification, backed by Supabase and hosted on Vercel.

## Access

No signup or login is required. Every visitor can create, view, edit, delete, and turn ON/OFF every entry. OFF entries remain visible in management so visitors can turn them back ON; serial verification returns only ON entries. Expired ON entries still show their dates and an expiry message. Serial numbers are unique and dates are validated.

## Existing database: remove login

Run `supabase/remove-login.sql` in Supabase SQL Editor. This preserves existing entries, makes ownership optional, and grants management to all visitors. Do not rerun `schema.sql` on an existing database.

## New database

Run `supabase/schema.sql` once in a new Supabase project. Set the project's URL and publishable/legacy anon key in `js/supabase-config.js`. Never use a service-role or secret key in browser code. Supabase Auth setup is not needed.

## Deployment

Repository: https://github.com/Kainat-18/certificate-porta

Import the repository into Vercel with project name `shacpre`. Framework: Other. The tracked `vercel.json` configures build command `npm run build` and output directory `dist`. Optional Vercel variables `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` override the public configuration file. Pushes to main trigger deployment when Git integration is enabled.

Local checks: `npm.cmd run check` and `npm.cmd run build` on Windows. No npm dependencies are needed. Serve the project with existing static hosting. Internet access is needed for Supabase and its CDN SDK.

## Verification

Open the website without signing in. Create an entry, search its serial, edit it, turn OFF and search again (no verification details), turn ON, then delete and search again. Repeat from another browser to confirm shared management access. Check duplicate serial and invalid date messages.

Share a certificate with `https://YOUR-WEBSITE/?id=SERIAL-NUMBER`. Disabling entries prevents future verification results; it does not erase information previously viewed. This self-service portal does not establish official certificate issuance.

The original Firebase page is preserved locally as `index.original.html` and ignored by Git. Existing Firebase records are not automatically migrated.
