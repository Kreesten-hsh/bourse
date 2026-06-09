# to the world MVP Specification

## Goal

Build a private web application that automatically collects international opportunities, extracts the information needed to evaluate them, scores their relevance for Kreesten-Eddy Agboton, notifies him, and helps him apply.

## Product Scope

The MVP is a private cockpit, not a public blog. Public publishing can be added later after the collection and scoring pipeline is reliable.

## Core Jobs

1. Collect opportunities from trusted sources.
2. Normalize each opportunity into a consistent structure.
3. Score relevance against the user's profile.
4. Display opportunities in a clear, airy interface.
5. Track application progress.
6. Notify the user about high-value matches and urgent deadlines.
7. Preserve official application links.

## Required Opportunity Fields

### Identity

- Title
- Organization
- Program name
- Source name
- Source URL
- Official application URL
- Collected date
- Last updated date

### Classification

- Opportunity type: scholarship, internship, fellowship, training, job, volunteering, exchange, competition.
- Domain: software, cybersecurity, data, AI, digital transformation, ICT, open source, product engineering, DevOps.
- Destination country and city.
- Remote, hybrid, or onsite.
- Duration.
- Level: student, graduate, professional, beginner, advanced.

### Deadline

- Application deadline.
- Deadline confidence: confirmed, inferred, unknown.
- Days remaining.
- Expired flag.

### Funding and Benefits

- Funding status: fully funded, partially funded, paid, unpaid, unknown.
- Monthly allowance.
- Stipend.
- Tuition coverage.
- Round-trip travel coverage.
- Accommodation.
- Visa support.
- Insurance.
- Meals.
- Relocation support.
- Other benefits.
- Funding confidence: confirmed, partial, ambiguous, absent.

### Eligibility Conditions

- Eligible countries or regions.
- Age limits.
- Education level.
- Required field of study.
- Required experience.
- Language requirements.
- Technical requirements.
- Passport requirement.
- Degree requirement.
- Other restrictions.

### Application Requirements

- CV.
- Motivation letter.
- Transcript.
- Diploma or certificate.
- Passport.
- Portfolio.
- GitHub or project links.
- Recommendation letters.
- Essays.
- Forms.
- Other documents.

### Personal Fit

- Fit score.
- Score explanation.
- Matched profile strengths.
- Blocking risks.
- Recommended application angle.
- Suggested priority.

### Workflow

- Status: new, to_analyze, priority, preparing, applied, result, archived.
- User notes.
- Application date.
- Result date.
- Result status: pending, accepted, rejected, waitlisted, unknown.

## Scoring Rules

The first version uses deterministic scoring, not black-box AI.

### Positive Signals

- Fully funded: +30.
- Partially funded: +18.
- Paid internship or job: +20.
- Monthly allowance present: +20.
- Travel support present: +12.
- Accommodation present: +10.
- Open to Benin, Africa, Global South, or global applicants: +20.
- Computer science, cybersecurity, data, AI, software, or ICT: +18.
- Accepts undergraduate students: +14.
- Accepts early-career applicants: +10.
- Deadline is more than 14 days away: +10.
- Official application link present: +8.

### Negative Signals

- Application fee present: -50.
- Nationality excludes Benin: -45.
- Master's or PhD required: -30.
- Funding unknown: -12.
- Deadline unknown: -10.
- Deadline in less than 3 days: -16.
- Requires more than 3 years of professional experience: -18.
- Requires unavailable documents: -15.

### Priority Bands

- 80 and above: priority.
- 60 to 79: analyze.
- 40 to 59: low priority.
- Below 40: archive candidate.

## MVP Screens

### Opportunities Inbox

Purpose: process new opportunities quickly.

- Dense but readable opportunity table.
- Search.
- Filters for type, funding, country, deadline, domain, source, and status.
- Sort by score, deadline, collected date, or funding quality.
- Right inspector updates when a row is selected.

### Opportunity Detail

Purpose: understand everything important about one offer without reading the original site first.

- Title, organization, country, deadline, score.
- Direct `Apply` action.
- Official source link.
- Clear summary.
- Benefits.
- Conditions.
- Documents.
- Fit with profile.
- Blocking risks.
- Recommended application angle.
- User notes.
- Status controls.

### Pipeline

Statuses:

- New.
- To analyze.
- Priority.
- Preparing.
- Applied.
- Result.
- Archived.

The MVP uses click-to-change status. Drag and drop can be added after the data model is stable.

### Sources

Each source shows:

- Name.
- URL.
- Type: API, RSS, scraper, manual.
- Last sync.
- Last result count.
- Error state.
- Enabled flag.

### Documents

Track reusable application assets:

- CV.
- Motivation letter base.
- Passport.
- Transcript.
- Diploma or expected diploma note.
- Certificates.
- Portfolio links.
- GitHub.
- LinkedIn.
- Recommendation contacts.

## Initial Data Sources

- ReliefWeb jobs and training API.
- UN Talent API or RSS.
- UN Volunteers opportunities where accessible.
- UNJobs listings where accessible.
- Opportunities for Youth via RSS or safe HTML extraction.

## Notification Rules

Use Telegram for MVP notifications.

Send notifications when:

- New opportunity score is 80 or higher.
- Opportunity score is 60 or higher and deadline is within 10 days.
- A priority opportunity has no status update after 3 days.
- A source fails 3 times consecutively.

## Technical Architecture

Frontend:

- Next.js.
- TypeScript strict.
- Tailwind CSS.
- Radix UI.
- Phosphor Icons.
- Motion.
- TanStack Query.
- TanStack Table.

Backend:

- FastAPI.
- PostgreSQL.
- SQLAlchemy or SQLModel.
- Pydantic.
- APScheduler or external cron.
- httpx.
- BeautifulSoup.
- feedparser.

Notifications:

- Telegram Bot API.

## Acceptance Criteria

- The app can store opportunities with all critical fields.
- The app can list and filter opportunities.
- The app can display a complete opportunity detail page.
- The app can track application status.
- The app can run at least one automated source collector.
- The app can score opportunities with visible explanations.
- The app can send Telegram notifications for high-priority matches.
- The UI matches the design system in `DESIGN.md`.
