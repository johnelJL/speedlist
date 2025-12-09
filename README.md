# speedlist.gr

Minimal AI-powered classifieds built with Node.js, Express, SQLite, and vanilla JS.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example` and set `OPENAI_API_KEY`.

### Creating `.env` in cPanel
- **File Manager:** open **File Manager**, browse to your app root (e.g., `/home/USER/speedlist`), click **+File**, name it `.env`, and paste the contents of `.env.example`, then fill in `OPENAI_API_KEY` (and SMTP settings if needed). Make sure the file sits alongside `server.js`, not inside `public/`.
- **Terminal/Shell:** from the cPanel terminal in the app root, run `cp .env.example .env` then `nano .env` (or use the editor) to add your API key and any SMTP variables.
- **Node.js App environment editor:** if your host provides an **Environment Variables** UI in the Node.js Application panel, you can also enter `OPENAI_API_KEY` and other keys there instead of a file; the app reads them from the process environment.

### cPanel terminal says `npm: command not found`

This happens when the Node.js virtual environment for your app is not activated (or the app is not provisioned yet). Fix:

1. In cPanel, open **Setup Node.js App** and make sure you have created the application for this folder (app root should be something like `/home/USER/speedlist`, startup file `server.js`). If it is not created yet, create/save it first.
2. Click the **Open Terminal** button inside that Node.js App page. Before running `npm`, activate the venv that cPanel created. The command looks like:

```bash
source /home/USER/nodevenv/speedlist/<node_version>/bin/activate
cd /home/USER/speedlist
```

Replace `USER` with your cPanel username and `<node_version>` with the version shown in the Node.js App screen (e.g., `18` or `20`). After activation you should see `(speedlist:18)` (or similar) in your prompt and `npm`/`node` will work:

```bash
npm install
npm start
```

If your host does not provide the Node.js App feature (or does not create `nodevenv/`), contact the host to enable Node.js or run the app on a VPS with Node installed.

### `npm ERR! enoent ENOENT: no such file or directory, open '/path/package.json'`

This happens when `npm install` is executed in the wrong folder (one that does not contain `package.json`). Fix:

1. Confirm the app root: it should be the folder that contains `server.js` and `package.json` (e.g., `/home/USER/speedlist`). In cPanel File Manager you should see those files directly inside that folder—not inside `public/`.
2. If you are in `/public_html/speedlist` or another subfolder, move to the actual app root before running npm:

   ```bash
   cd /home/USER/speedlist   # replace USER with your cPanel username
   ls package.json           # should show the file
   npm install
   npm start
   ```

3. In the **Setup Node.js App** screen, make sure **Application root** points to that same folder. If it points at `public/` or another nested path, edit it and restart the app so Passenger/Node uses the correct working directory.

### Serving the app from a subfolder (e.g., `/speedlist`)

If your domain points to a subpath (like `https://example.com/speedlist`) and you see `Cannot GET /speedlist/`, set a base path so the Express app rewrites requests correctly:

1. In **Setup Node.js App**, add an environment variable named `APP_BASE_PATH` with the value of your subfolder (e.g., `/speedlist`). Leave it empty if the app is served from the root.
2. Restart the Node.js application from the same cPanel screen so the new variable loads.
3. Keep your Apache/Passenger routing pointed at the app root (not `/public`). Requests to `/speedlist` will be rewritten internally to `/`, so `/static/...` and `/api/...` continue to work when the variable is set.

### Email verification (SMTP)

To send verification emails, set the following variables in your `.env` file (or your hosting provider's environment settings):

- `SMTP_HOST`: SMTP server host provided by your email service.
- `SMTP_PORT`: SMTP port (defaults to `587` if omitted).
- `SMTP_SECURE`: Set to `true` if your provider requires TLS/SSL on connect, otherwise leave unset/`false`.
- `SMTP_USER`: SMTP username (often the mailbox address).
- `SMTP_PASS`: SMTP password or app-specific password.
- `SMTP_FROM` (optional): From address shown in the email (defaults to `no-reply@speedlist.gr`).

Common providers (Gmail, Outlook, SendGrid, Mailgun, etc.) expose these values in their dashboard. Once the variables are present, the server automatically picks them up via `dotenv`—no code changes required.

3. Start the server:

```bash
npm start
```

Visit `http://localhost:3000` to use the app.

## Features
- AI-assisted ad creation and search (server-side OpenAI calls)
- SQLite storage for ads
- Responsive layout with sidebar navigation
- Stubbed authentication endpoints and UI
