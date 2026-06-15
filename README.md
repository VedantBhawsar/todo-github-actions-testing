# Todo App — Testing Demo

A production-style monorepo demonstrating full-stack testing from unit tests to E2E and CI/CD.

## Prerequisites

- Node.js 20+
- npm 10+

## Install

```bash
npm install
```

## Run in Dev Mode

```bash
npm run dev
```

Starts both the API (port 3001) and web app (port 3000) via Turborepo.

## Testing Layers

### Unit/Component Tests (Vitest + React Testing Library)

```bash
npm run test
```

Tests React components in isolation using Vitest with jsdom environment. MSW mocks API calls, providing fast feedback during development. Located in `apps/web/__tests__/`.

### Integration/API Tests (Jest + Supertest)

```bash
npm run test
```

Tests Express API routes with real HTTP calls against the running app — no mocking needed. Resets in-memory store before each test. Located in `apps/api/__tests__/`.

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

Tests the full app as a real user would with both servers running. Playwright automatically starts the API and web servers.

## GitHub Actions CI Pipeline

```
┌─────────────────────────────────────┐
│            Install & Build          │
└────────────┬────────┬───────────────┘
             │        │
    ┌─────────▼──┐  ┌─▼──────────┐  ┌──────────────┐
    │ Frontend   │  │  Backend   │  │     E2E      │
    │   Tests    │  │   Tests    │  │   Tests      │
    │  (vitest)  │  │  (jest)    │  │ (playwright) │
    └────────────┘  └────────────┘  └──────────────┘
```

The pipeline runs three parallel test jobs after setup:
- **Frontend Tests** — Vitest + RTL with MSW mocking
- **Backend Tests** — Jest + Supertest integration tests
- **E2E Tests** — Playwright with both servers auto-started

## Project Structure

```
todo-app/
├── apps/
│   ├── web/           # Next.js 14 frontend
│   └── api/           # Express.js backend
├── packages/
│   └── types/         # Shared TypeScript types
├── .github/
│   └── workflows/
│       └── ci.yml     # GitHub Actions pipeline
├── turbo.json
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all packages |
| `npm run test` | Run vitest + jest tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run lint` | Lint all apps |
