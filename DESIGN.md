# to the world Design System

## Design Thesis

A calm, precise mobility command center: spacious enough to read opportunities clearly, dense enough to process many leads, and visually distinct without becoming decorative.

## Visual Scene

The user reviews international opportunities at a desk in the evening on a laptop, focused and slightly time-sensitive, needing confidence rather than spectacle.

## Color Strategy

Royal product palette with one primary action color and one atmospheric surface color.

- Primary action: royal blue `#3447AA`.
- Atmospheric surface: powder pink `#FBEAEB`.
- Surface: white rose, soft enough to sit on powder pink.
- Secondary surface: pale royal blue or white rose.
- Text: blue-black ink, never pure black.
- Muted text: cool slate with royal undertone.
- Success: restrained green.
- Warning: amber.
- Danger: muted red.
- Info: royal blue tint.

Use royal blue for command surfaces, selection, primary action, score emphasis, direct application links, and focus states. Use powder pink as the atmospheric base, not as a decorative accent.

## Typography

- UI font: Geist or Satoshi.
- Numeric font: Geist Mono or JetBrains Mono.
- No serif fonts in the product UI.
- No fluid viewport-based type scaling.
- Headings stay compact and work-focused.
- Body line length for prose is capped around 65 to 75 characters.

## Layout Principles

- App shell with a strong top command bar, central workspace, and right inspector.
- Lists and detail sections use spacing, dividers, and alignment before cards.
- Cards are only used when they are interactive objects or persistent records.
- Opportunity detail pages are airy, with sections that help comprehension.
- Financial benefits and application links are visually easy to find.
- The interface should feel like a mobility console, not a generic admin dashboard.

## Motion Principles

- Motion explains state and feedback.
- Use 150 to 250 ms transitions for routine UI.
- Use transform and opacity only.
- Button press feedback uses subtle scale or translate.
- Skeleton loading replaces central spinners.
- No decorative page-load choreography.

## Iconography

Use Phosphor Icons with one consistent weight. Icons must improve scanning: source, deadline, funding, location, documents, status, apply, alert, archive, sync.

## Component Vocabulary

- Buttons: primary, secondary, ghost, danger.
- Inputs: label above field, helper text optional, error below field.
- Filters: compact removable chips.
- Tables: dense rows, stable columns, keyboard-friendly selection.
- Inspector: sticky context panel with readable sections.
- Status: plain text plus restrained color marker.
- Alerts: inline, source-specific, never global unless the whole system fails.

## Banned Patterns

- Gradient text.
- Purple-blue AI gradients.
- Heavy glassmorphism.
- Hero section inside the app.
- Three-card feature row.
- Overuse of badges.
- Fake metrics.
- Spinner-only loading states.
- Decorative icons that do not clarify content.
