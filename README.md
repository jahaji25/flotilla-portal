# Commander Flotilla West — Free Website Starter

A responsive English-language starter site with a Supabase-backed admin sign-in and homepage section editor.

## Included
- Responsive public homepage and main navigation
- Eight starter menu sections
- Admin sign-in
- Admin create/edit/delete/publish for homepage section cards
- Supabase SQL schema with Row Level Security policies
- Static hosting-ready files

## Important limitations
This is the first milestone, not a complete replica of the reference video. It manages homepage section cards only. Nested dropdown menu management, individual content pages, image uploads, and events/calendar are later milestones.

## Step 1 — Create a Supabase project
1. Visit https://supabase.com/ and create a free project.
2. In Project Settings / API (or Connect), copy the Project URL and publishable key (older projects may call it the anon key).
3. Open `config.js` and replace the two placeholder values.
4. NEVER place a `service_role` key or any secret key in browser files.

## Step 2 — Create the database
1. In the Supabase dashboard, open SQL Editor.
2. Paste the full contents of `schema.sql`.
3. Run it and check that `site_sections` was created.

## Step 3 — Create your admin user
1. In Supabase Dashboard > Authentication > Users, add an admin user with an email/password you control.
2. Disable public sign-ups in Authentication settings if you do not want public account creation.
3. Sign in at `/admin.html`.

Security note: the starter policy lets any authenticated user manage content. Keep public sign-ups disabled and only create accounts you trust. Before adding multiple roles or public sign-up, tighten the policies to a specific admin role.

## Step 4 — Test locally
You can open `index.html` to preview demo content. For Supabase auth, use a local web server (for example VS Code Live Server) or deploy the site to a test URL. Browsers may restrict some auth behavior on `file://`.

## Step 5 — Publish free
1. Create a GitHub repository and upload the files in this folder.
2. In Cloudflare Pages, create a project connected to that repository.
3. Choose the static site option; no build command is needed. Set the output directory to `/` or the repository root, depending on the dashboard's current UI.
4. Deploy. Your project will receive a free `pages.dev` address.
5. In Supabase Authentication URL Configuration, set the Site URL to your deployed website URL and add the website and `/admin.html` callback/origin URLs to allowed redirect URLs if requested.

Free plan quotas and provider dashboards can change; check the providers' current terms before relying on a specific limit.

## Suggested next milestones
1. Manage main menu and nested submenu items from the admin panel.
2. Create real content pages for each section.
3. Add image upload using Supabase Storage.
4. Add Events and forecast views.
5. Add admin roles and audit history.
6. Final responsive/accessibility/security review.

Use only approved public content. Do not publish sensitive operational or location data.
