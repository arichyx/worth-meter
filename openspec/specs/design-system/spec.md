# design-system Specification

## Purpose
TBD - created by archiving change premium-visual-reskin. Update Purpose after archive.
## Requirements
### Requirement: Color resolves through tokens only
The visual system MUST treat CSS custom properties (design tokens) as the single source of truth for all color. Application code and components MUST NOT hardcode theme colors via raw Tailwind palette utilities (e.g. `from-blue-100`, `text-amber-500`, `bg-emerald-100`) or `hsl()`/`rgb()`/hex literals. Asset-type identity colors and the brand accent MUST be consumed as tokens.

#### Scenario: Asset-type identity color is token-driven
- **WHEN** a component renders an accent for the `time` asset type
- **THEN** the color resolves through a token (e.g. `--type-time`) rather than a hardcoded utility

#### Scenario: No standalone chart blue
- **WHEN** the codebase is grepped for the previously-hardcoded `hsl(221, 83%, 53%)` chart color
- **THEN** zero occurrences remain in application/chart code

### Requirement: Three-scope token architecture
Design tokens SHALL be organized in [globals.css](src/app/globals.css) so that the asset-type identity hues (`--type-time`/`--type-count`/`--type-quota`), semantic colors, the chart palette, and the radius/spacing/type scale are consistent, while surface/background/shadow tokens switch per mode via `:root` and `.dark`.

#### Scenario: Type identity is mode-invariant
- **WHEN** the user switches between light and dark mode
- **THEN** the `time`, `count`, and `quota` identity hues remain the same hue family in both modes

#### Scenario: Brand accent is mode-invariant in hue
- **WHEN** the user switches between light and dark mode
- **THEN** the primary/brand accent remains violet/indigo (hue 270) in both modes

### Requirement: Violet/indigo primary accent
The primary color (`--primary`), used for primary CTAs and brand emphasis, MUST be violet/indigo (hue 270) — deep in light mode, brighter in dark mode — in both themes.

#### Scenario: Primary CTA in light mode
- **WHEN** a primary button renders in light mode
- **THEN** its background is deep violet with readable foreground text

#### Scenario: Primary CTA in dark mode
- **WHEN** a primary button renders in dark mode
- **THEN** its background is brighter violet with readable foreground text and a soft violet glow

### Requirement: Cool-toned in both modes
Both themes SHALL be cool violet-toned. The LIGHT background MUST be a cool light-gray (not warm cream, not pure white). The DARK background MUST be a cool near-black (not pure black). There is no warm mode.

#### Scenario: Light background is cool
- **WHEN** light mode is active
- **THEN** the background token is a cool light-gray (hue 270, low chroma) rather than a warm cream or pure white

#### Scenario: Dark background is cool
- **WHEN** dark mode is active
- **THEN** the background token is a cool near-black (hue 270, low chroma) rather than pure black

### Requirement: Layered shadow system
Elevation MUST be expressed through a defined multi-tier shadow scale exposed as tokens (small, medium, large, card, glow), mode-tuned (soft cool drops in light, deeper in dark). The card tier SHALL include a subtle top-edge inset highlight ("lit edge") for surface dimensionality.

#### Scenario: Cards carry a lit top edge and soft float
- **WHEN** a card renders in either mode
- **THEN** it has a subtle inset top highlight plus a soft, multi-layer drop shadow (not a single tight outline)

#### Scenario: Shadow tokens are defined in globals.css
- **WHEN** a developer inspects `src/app/globals.css`
- **THEN** they find `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, and `--shadow-glow` mapped to mode-aware values

### Requirement: Solid surfaces (not glass)
Surfaces (cards, popovers, dialogs) MUST render as **solid** tokens (`bg-card` opaque) — NOT semi-transparent/blur glass. The sticky header is the ONLY glass surface (blurred + saturated). There SHALL be no ambient color mesh.

#### Scenario: Cards are solid, not frosted
- **WHEN** a card renders
- **THEN** its background is an opaque token with a subtle gradient and a hairline border, with no `backdrop-blur` translucency

#### Scenario: No ambient mesh
- **WHEN** any page renders
- **THEN** there is no multi-color ambient gradient mesh; depth is provided by at most a single restrained top spotlight

### Requirement: Restrained top spotlight
The page MAY provide depth via a single soft violet radial anchored at the top-center (`bg-spotlight`), tuned stronger in light mode (where violet reads weaker) than in dark. It MUST NOT become a multi-hue mesh or dominate the content.

#### Scenario: Spotlight is a single restrained light
- **WHEN** the dashboard renders in light mode
- **THEN** a single soft violet glow sits at the top of the page, behind the hero, without competing colored blobs

### Requirement: Theme contrast accessibility
Both the light and dark themes MUST meet WCAG AA contrast ratios for body text against its background and for primary text on the brand accent.

#### Scenario: Body text contrast in each mode
- **WHEN** foreground text renders on the background in either light or dark mode
- **THEN** the contrast ratio is at least 4.5:1

#### Scenario: Brand-on-text contrast
- **WHEN** primary-foreground text renders on the violet primary in either mode
- **THEN** the contrast ratio is at least 4.5:1

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

