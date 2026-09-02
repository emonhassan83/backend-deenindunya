# Deenindunya Nodemailer Service

Standalone SMTP mail service for the Deenindunya platform.

---

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Update `.env` with your Gmail credentials:
- `NODEMAILLER_HOST_MAIL` - Your Gmail address
- `NODEMAILLER_HOST_PASS` - Gmail App Password (not your regular password)

> **Note:** You need to generate an App Password from Google Account settings. Regular Gmail passwords won't work.

### 3. Start Service

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm start
```

Service runs at `http://localhost:3000`

---

## API Endpoints

### Health Check

```http
GET /
```

**Response:**
```
Deenindunya Nodemailer Service is running!
```

---

### Send Email

```http
POST /
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<h1>Hello!</h1><p>This is the email body.</p>",
  "text": "Optional plain text version"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email sent successfully."
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Failed to send email.",
  "error": "Error description",
  "stack": "..."
}
```

---

## Scripts

| Script | Description |
| --- | --- |
| `pnpm run start:dev` | Start with hot-reload |
| `pnpm run build` | Compile TypeScript |
| `pnpm start` | Start production server |
| `pnpm run lint` | Run ESLint |

---

## Project Structure

```
nodemailer/
├── src/
│   ├── app.ts              # Express app setup
│   ├── index.ts            # HTTP entrypoint
│   └── app/
│       ├── @types/         # TypeScript types
│       ├── configs/        # Env & transporter config
│       └── utils/          # Helpers
├── scripts/                # Build/runtime scripts
├── dist/                   # Compiled output
├── .env.example
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```

---

## Gmail Setup Guide

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate a new App Password for "Mail"
5. Use this password in `NODEMAILLER_HOST_PASS`
