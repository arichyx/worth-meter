# theming Specification

## Purpose
TBD - created by archiving change premium-visual-reskin. Update Purpose after archive.
## Requirements
### Requirement: System preference as default
When no theme preference has been explicitly chosen by the user, the application SHALL select the theme by following the user's `prefers-color-scheme` media query.

#### Scenario: User prefers dark and has no stored preference
- **WHEN** a visitor with `prefers-color-scheme: dark` loads the app with no theme cookie
- **THEN** the app renders in dark mode on first paint

#### Scenario: User prefers light and has no stored preference
- **WHEN** a visitor with `prefers-color-scheme: light` loads the app with no stored preference
- **THEN** the app renders in light mode on first paint

#### Scenario: No detectable system preference
- **WHEN** a visitor with no resolvable `prefers-color-scheme` and no stored preference loads the app
- **THEN** the app renders in dark mode (the fallback default for first-impression impact)

### Requirement: Theme persistence
A user's explicit theme choice MUST persist across sessions and page reloads via a cookie readable on the server, consistent with the existing locale/currency cookie architecture.

#### Scenario: Choice persists after reload
- **WHEN** a user selects a theme and reloads the page
- **THEN** the same theme is applied without reverting to the default

#### Scenario: Choice travels in the request
- **WHEN** the server renders any route
- **THEN** the theme cookie is read server-side so the correct theme is known before client hydration

### Requirement: No flash of wrong theme
The correct theme MUST be applied in the initial server-rendered HTML. The application MUST NOT exhibit a flash of the wrong theme (FOUC) during hydration.

#### Scenario: Server-rendered HTML has correct theme class
- **WHEN** the server renders the document for a dark-preferring user
- **THEN** the `<html>` element already carries the dark theme class (e.g. `class="dark"`) in the initial HTML, before any client JavaScript runs

### Requirement: Theme toggle
The application SHALL expose a user control to switch the active theme (at minimum between light and dark; optionally a system-following option). Toggling MUST update the active theme immediately and persist the choice.

#### Scenario: User toggles from light to dark
- **WHEN** the user activates the theme toggle while in light mode
- **THEN** the app switches to dark mode immediately and the choice is persisted

#### Scenario: Toggle is reachable
- **WHEN** the user views any main page
- **THEN** a theme toggle control is present in the persistent header

### Requirement: Both modes fully styled
Every user-facing surface (pages, cards, dialogs, forms, charts, tooltips, empty states) MUST have a defined, intentional appearance in both light and dark themes. The pre-existing `.dark` token block MUST become reachable and is no longer dead code.

#### Scenario: Every surface works in dark
- **WHEN** the user switches the entire app to dark mode
- **THEN** no surface renders with broken contrast, unstyled backgrounds, or leftover light-only assumptions

#### Scenario: Dark tokens are reachable
- **WHEN** the codebase is inspected for theme wiring
- **THEN** the `.dark` class is applied to the document root based on theme selection, and the dark token block is exercised at runtime

#### Scenario: Reduced motion in dark mode
- **WHEN** the user is in dark mode and has reduced motion enabled
- **THEN** all surfaces remain fully styled while animations are suppressed

### Requirement: The theme system SHALL respect prefers-reduced-motion
When the user enables `prefers-reduced-motion: reduce`, the app SHALL disable or significantly shorten all non-essential transitions and animations.

#### Scenario: System reduced motion enabled
- **WHEN** the user's operating system is set to reduce motion
- **THEN** theme switching, card hover, and toast entrance animations are suppressed

#### Scenario: Reduced motion not enabled
- **WHEN** the user has not enabled reduced motion
- **THEN** the app shows transitions and animations controlled by motion tokens normally

### Requirement: Motion tokens SHALL respond to reduced-motion preference
All transitions based on `--duration-*` tokens SHALL map to near-zero duration under `prefers-reduced-motion: reduce`.

#### Scenario: Card hover with reduced motion
- **WHEN** the user hovers over a card while the system has reduced motion enabled
- **THEN** the card shadow and lift change instantly without a smooth transition

