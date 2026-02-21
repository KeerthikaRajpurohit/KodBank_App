# KodBank App

A full-stack banking application with user registration, login (JWT), and balance check.

## Tech Stack

- **Backend:** Node.js, Express, MySQL (Aiven)
- **Frontend:** React, Vite
- **Auth:** JWT (HS256) in httpOnly cookie
- **Database:** Aiven MySQL

## Prerequisites

- Node.js 18+
- Aiven MySQL service (running with connection details)

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Aiven credentials:

```
DB_HOST=kodbank-mysql-382c63be-rajpurohitkeerthikam-fc54.j.aivencloud.com
DB_PORT=13245
DB_USER=avnadmin
DB_PASSWORD=<your-password-from-service-uri>
DB_NAME=kodbank
JWT_SECRET=<generate-a-32-char-random-string>
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Generate JWT_SECRET (run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Install and initialize database:

```bash
npm install
npm run init-db
```

Start the backend:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Use the App

1. Open http://localhost:5173
2. Register with uid, username, password, email, phone
3. Log in with username and password
4. Click "Check Balance" on the dashboard

## Project Structure

```
KodBank App/
├── backend/
│   ├── src/
│   │   ├── config/      # DB connection, init script
│   │   ├── middleware/  # JWT auth
│   │   ├── routes/      # auth, user
│   │   └── utils/       # bcrypt, jwt
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Database (Aiven MySQL)

- **KodUser:** uid, username, password, email, phone, role, balance (default 100000)
- **UserToken:** tid, token, uid, expiry

If SSL connection fails, download the CA certificate from Aiven and set `DB_SSL_CA` in `.env` to the cert file path.
