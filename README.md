# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment variables (Supabase)

This app reads Supabase credentials from Vite env vars.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Create a local env file:

```sh
cp .env.example .env.local
```

Then fill in your values in `.env.local` and restart `npm run dev`.

## Database Setup (Supabase)

### Option 1: Fresh Setup (Recommended)

If you're starting fresh or want to reset everything:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. **First, run `supabase-reset.sql`** to clean up any existing data (optional, only if you want to start fresh)
4. **Then, run `supabase-setup.sql`** to create everything from scratch

### Option 2: Quick Setup (If tables don't exist)

If you just need to create the tables:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-setup.sql` in this repository
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute the script

### What gets created:

- **Tables:**
  - `entries` table for storing entry metadata
  - `blocks` table for storing text, image, PDF, and link blocks
- **Security:**
  - Row Level Security (RLS) enabled with public access policies
- **Storage:**
  - `media` bucket (public, 20MB limit) for file uploads
  - Storage policies for uploads, reads, and deletes
- **Performance:**
  - Indexes on foreign keys and frequently queried columns

**Note:** If you get "could not create entry" errors, it's likely because the database tables don't exist yet. Run the SQL setup script first!

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
