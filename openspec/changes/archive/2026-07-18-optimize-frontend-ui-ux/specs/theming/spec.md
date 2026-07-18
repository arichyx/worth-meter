## ADDED Requirements

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

## MODIFIED Requirements

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
