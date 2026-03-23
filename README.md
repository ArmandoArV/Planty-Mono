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

| Method | Path      | Description   |
| ------ | --------- | ------------- |
| GET    | `/health` | Health check  |

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
