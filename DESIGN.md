# to the world Design System

## Design Thesis

A calm, precise mobility command center: spacious enough to read opportunities clearly, dense enough to process many leads, and visually distinct without becoming decorative.

## Visual Scene

The user reviews international opportunities at a desk in the evening on a laptop, focused and slightly time-sensitive, needing confidence rather than spectacle.

## Color Strategy

Restrained product palette with one primary accent.

- Surface: off-white with a cool tint.
- Secondary surface: very light zinc.
- Text: charcoal, never pure black.
- Muted text: cool gray.
- Primary accent: deep petrol or forest green.
- Success: restrained green.
- Warning: amber.
- Danger: muted red.
- Info: desaturated blue.

Use accent only for selection, primary action, score emphasis, and important states.

## Typography

- UI font: Geist or Satoshi.
- Numeric font: Geist Mono or JetBrains Mono.
- No serif fonts in the product UI.
- No fluid viewport-based type scaling.
- Headings stay compact and work-focused.
- Body line length for prose is capped around 65 to 75 characters.

## Layout Principles

- App shell with a minimal left rail, functional top bar, central workspace, and right inspector.
- Lists and detail sections use spacing, dividers, and alignment before cards.
- Cards are only used when they are interactive objects or persistent records.
- Opportunity detail pages are airy, with sections that help comprehension.
- Financial benefits and application links are visually easy to find.

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
