# Planty-Mono

A monorepo for the **Planty** application consisting of a Next.js frontend and a Go backend.

## Structure

```
Planty-Mono/
├── frontend/        # Next.js 16 + React + TypeScript
└── backend/         # Go REST API
```

## Frontend

Located in `frontend/`, built with:

- **Next.js 16** (App Router, TypeScript)
- **FluentUI** (`@fluentui/react-components`) – Microsoft's design system components
- **TailwindCSS v4** – utility-first CSS framework
- **SweetAlert2** – beautiful, accessible alert dialogs

### Running the frontend

```bash
cd frontend
npm install
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

## Backend

Located in `backend/`, written in **Go** using only the standard library.

Endpoints:

| Method | Path      | Description  |
| ------ | --------- | ------------ |
| GET    | `/health` | Health check |

### Running the backend

```bash
cd backend
go run main.go    # starts on :8080
```

## Monorepo scripts (root)

```bash
npm run dev       # starts the frontend dev server
npm run build     # builds the frontend
npm run lint      # lints the frontend
```

---

## Database Setup

### Prerequisites

- PostgreSQL installed and running on `localhost:5432`
- Default credentials: user `postgres`, password `postgres`
- Copy the env file: `cp backend/.env.example backend/.env`

### Automated setup (PowerShell)

```powershell
.\setup.ps1
```

### Manual setup (cmd / any terminal)

If `psql` is not in your PATH, use the full binary path (adjust the version number):

```cmd
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U postgres -c "CREATE DATABASE planty;"
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U postgres -d planty -f backend\init.sql
set PGPASSWORD=
```

Running `init.sql` creates:

| Object            | Name                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tables            | `roles`, `users`, `plants`, `sensor_readings`, `device_keys`                                                                                                             |
| Seed data         | Default roles: `admin`, `user`, `viewer`                                                                                                                                 |
| Stored procedures | `sp_register_user`, `sp_authenticate_user`, `sp_create_plant`, `sp_toggle_pump`, `sp_insert_reading`, `sp_get_plant_dashboard`, `sp_assign_role`, `sp_soft_delete_plant` |

The backend also runs GORM auto-migrations on startup (`go run main.go`).

---

## Arduino + Postman Integration Guide

This section explains how to wire up a physical Arduino device to the API and how to replicate the same flow in Postman for testing.

### Overview of authentication

| Client        | Auth mechanism                    | Header                          |
| ------------- | --------------------------------- | ------------------------------- |
| Web / mobile  | JWT (72 h expiry)                 | `Authorization: Bearer {token}` |
| Arduino / IoT | Device Key (no expiry, revocable) | `X-Device-Key: {key}`           |

### Step 1 – Register a user and log in

```
POST /api/auth/register
Content-Type: application/json

{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "yourpassword"
}
```

Save the `token` from the response — you will need it for all subsequent requests.

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "you@example.com",
  "password": "yourpassword"
}
```

### Step 2 – Create a plant

```
POST /api/plants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Living Room Fern",
  "species": "Boston Fern"
}
```

Save the `id` field from the response as `{plantId}`.

### Step 3 – Generate a Device Key for the Arduino

```
POST /api/device-keys
Authorization: Bearer {token}
Content-Type: application/json

{
  "plant_id": "{plantId}",
  "label": "Living Room Arduino"
}
```

**Response:**

```json
{
  "id": "...",
  "plant_id": "...",
  "key": "a1b2c3d4...64-char-hex-string",
  "label": "Living Room Arduino",
  "active": true
}
```

Save the `key` value — this is your `{deviceKey}`. It is shown only once.

### Step 4 – Configure the Arduino sketch

Open `backend/arduino/main_direct.ino` and fill in the constants at the top:

```cpp
const char WIFI_SSID[]   = "YOUR_WIFI_SSID";
const char WIFI_PASS[]   = "YOUR_WIFI_PASSWORD";
const char SERVER_HOST[] = "192.168.1.100";   // IP of the machine running the backend
const int  SERVER_PORT   = 8080;
const char DEVICE_KEY[]  = "a1b2c3d4...";     // The key from Step 3
```

Flash the sketch. The Arduino will now:

- **Every 10 s** — POST a sensor reading to `POST /api/device/readings`
- **Every 5 s** — Poll pump state from `GET /api/device/pump`

### Step 5 – Simulate the Arduino in Postman

#### Send a sensor reading

```
POST /api/device/readings
X-Device-Key: {deviceKey}
Content-Type: application/json

{
  "moisture": 72.5,
  "pump_on": false,
  "plant_mood": "happy"
}
```

`plant_mood` is optional — if omitted, the API derives it automatically:

| Moisture        | Mood     |
| --------------- | -------- |
| ≥ 66.66 %       | `happy`  |
| 33.33 – 66.65 % | `normal` |
| < 33.33 %       | `sad`    |

#### Poll the pump state

```
GET /api/device/pump
X-Device-Key: {deviceKey}
```

**Response:**

```json
{
  "plant_id": "...",
  "pump_status": false,
  "name": "Living Room Fern"
}
```

### Step 6 – Control the pump from the web app / Postman

```
PATCH /api/plants/{plantId}/pump
Authorization: Bearer {token}
```

This toggles `pump_status`. The next time the Arduino polls `GET /api/device/pump` (within 5 s), it will receive the new value and switch the relay accordingly.

### Managing Device Keys

| Action       | Request                                          |
| ------------ | ------------------------------------------------ |
| List keys    | `GET /api/device-keys` + Bearer token            |
| Revoke a key | `DELETE /api/device-keys/{keyId}` + Bearer token |

Revoking a key immediately blocks any Arduino using it.

### Postman variables (recommended)

Set these as collection variables to avoid copy-pasting:

| Variable    | Where to get it                             |
| ----------- | ------------------------------------------- |
| `baseUrl`   | `http://localhost:8080/api`                 |
| `token`     | Response of `/auth/login` → `token`         |
| `plantId`   | Response of `POST /api/plants` → `id`       |
| `deviceKey` | Response of `POST /api/device-keys` → `key` |
