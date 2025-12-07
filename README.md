# speedlist.gr

Minimal AI-powered classifieds built with Node.js, Express, SQLite, and vanilla JS.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file based on `.env.example` and set `OPENAI_API_KEY`.

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
