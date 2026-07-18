## ADDED Requirements

### Requirement: The design system SHALL provide motion tokens
The design system SHALL define motion tokens in `globals.css` such as `--duration-fast`, `--duration-normal`, `--duration-slow`, `--ease-default`, and `--ease-emphasized`, to be used by all components for transitions.

#### Scenario: Components use motion tokens
- **WHEN** a developer implements a new hover or focus transition
- **THEN** they use `--duration-normal` and `--ease-default` instead of hard-coded `duration-200`

#### Scenario: Motion tokens are theme-agnostic
- **WHEN** the user switches between light and dark themes
- **THEN** transition durations and easings remain consistent; only color tokens change

### Requirement: The shadow scale SHALL be expanded into a full scale
The design system SHALL define five shadow levels: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, and `--shadow-glow`, for buttons, cards, overlays, modals, and glow emphasis respectively.

#### Scenario: Card hover shadow
- **WHEN** the user hovers over an asset card
- **THEN** the card shadow transitions from `--shadow-sm` to `--shadow-md` instead of using a hard-coded shadow utility

#### Scenario: Primary button glow in dark mode
- **WHEN** the user views a primary button in dark mode
- **THEN** the button may use `--shadow-glow` to render a soft violet glow

### Requirement: Components SHALL support prefers-reduced-motion
All components using motion tokens SHALL disable non-essential animations or set their duration near zero when `prefers-reduced-motion: reduce` is active.

#### Scenario: User enables reduced motion
- **WHEN** the user's system is set to reduce motion
- **THEN** hover lift, toast entrance, and progress animations are suppressed

## MODIFIED Requirements

### Requirement: Layered shadow system
Elevation MUST be expressed through a defined multi-tier shadow scale exposed as tokens (small, medium, large, card, glow), mode-tuned (soft cool drops in light, deeper in dark). The card tier SHALL include a subtle top-edge inset highlight ("lit edge") for surface dimensionality.

#### Scenario: Cards carry a lit top edge and soft float
- **WHEN** a card renders in either mode
- **THEN** it has a subtle inset top highlight plus a soft, multi-layer drop shadow (not a single tight outline)

#### Scenario: Shadow tokens are defined in globals.css
- **WHEN** a developer inspects `src/app/globals.css`
- **THEN** they find `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, and `--shadow-glow` mapped to mode-aware values
