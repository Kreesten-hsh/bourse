# To The World Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the first production-ready MVP of `to the world`, a private opportunity command center for collecting, scoring, reading, tracking, and applying to international opportunities.

**Architecture:** Use a clean split between a Next.js frontend and a FastAPI backend. The frontend owns product experience, filtering, detail reading, and workflow status. The backend owns source collection, normalization, scoring, persistence, and notifications.

**Tech Stack:** Next.js, TypeScript strict, Tailwind CSS, Radix UI, Phosphor Icons, Motion, TanStack Query, TanStack Table, FastAPI, PostgreSQL, Pydantic, SQLAlchemy or SQLModel, APScheduler, httpx, BeautifulSoup, feedparser, Telegram Bot API.

---

## Implementation Rules

- No `any` in TypeScript.
- No placeholder UI or placeholder backend endpoints.
- No fake funding claims.
- No spinner-only loading states.
- No generic dashboard card mosaic.
- Every opportunity score must include a human-readable explanation.
- Application links must always point to official source pages when known.

## Target Repository Layout

```text
to-the-world/
  PRODUCT.md
  DESIGN.md
  README.md
  frontend/
    app/
    styles/
    package.json
  backend/
    app/
    tests/
    pyproject.toml
  docs/
    plans/
```

## Current Foundation

Created:

- `frontend/` with Next.js, TypeScript, Tailwind, Phosphor Icons, and a first premium cockpit screen.
- `backend/` with FastAPI health endpoint and test skeleton.
- `PRODUCT.md`, `DESIGN.md`, MVP spec, and implementation plan.

Verified:

- `npm.cmd run build` passes.
- `npm.cmd run typecheck` passes.
- `GET http://127.0.0.1:3000` returns `200`.

Blocked:

- Backend tests cannot run until Python is available in PATH.

## Next Phase: Domain Model and Scoring

### Task 1: Backend Domain Types

Create:

- `backend/app/models/opportunity.py`
- `backend/app/models/source.py`
- `backend/app/models/application.py`
- `backend/app/models/profile.py`

Define:

- Opportunity status.
- Opportunity type.
- Funding status.
- Deadline confidence.
- Funding confidence.
- Source type.

### Task 2: Backend API Schemas

Create:

- `backend/app/schemas/opportunity.py`
- `backend/app/schemas/source.py`
- `backend/app/schemas/application.py`
- `backend/app/schemas/profile.py`

Rules:

- Use Pydantic.
- Keep response schemas explicit.
- Make unknown and ambiguous values first-class.

### Task 3: Frontend Types

Create:

- `frontend/types/opportunity.ts`
- `frontend/types/source.ts`
- `frontend/types/application.ts`
- `frontend/types/profile.ts`

Rules:

- Use strict TypeScript unions.
- No `any`.
- Mirror API contracts.

### Task 4: Scoring Service

Create:

- `backend/app/services/scoring.py`
- `backend/tests/services/test_scoring.py`

Responsibilities:

- Calculate numeric score.
- Produce priority band.
- Produce explanation.
- Identify blockers.
- Identify matched profile strengths.

### Task 5: Opportunity Inbox MVP Data

Create:

- `frontend/features/opportunities/sample-opportunities.ts`
- `frontend/features/opportunities/opportunity-table.tsx`
- `frontend/features/opportunities/opportunity-inspector.tsx`

Responsibilities:

- Show realistic opportunity rows.
- Select an opportunity.
- Display benefits, conditions, documents, blockers, deadline, score, and direct application link.

## First Usable Milestone

The first usable version is complete when:

- A source sync creates opportunities.
- Opportunities appear in the inbox.
- Selecting a row opens a clear inspector.
- The detail page shows benefits, conditions, documents, blockers, and official apply link.
- Status can be changed.
- A high-priority opportunity triggers a Telegram notification.
