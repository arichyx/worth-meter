# data-visualization Specification

## Purpose
TBD - created by archiving change premium-visual-reskin. Update Purpose after archive.
## Requirements
### Requirement: No harsh grid
Charts MUST NOT render the library's default dashed grid (`strokeDasharray="3 3"`). Any reference lines or baselines SHALL be ultra-faint or omitted so the data, not the grid, dominates.

#### Scenario: Default dashed grid is removed
- **WHEN** a line or bar chart renders
- **THEN** no prominent `3 3` dashed gridlines are visible; baselines, if present, are near-imperceptible

### Requirement: Gradient area fill
Line charts SHALL render a translucent gradient area fill beneath the series line, fading the series color toward transparent, to add depth.

#### Scenario: Line chart has area fill
- **WHEN** a line chart (e.g. daily-cost or cost-per-use trend) renders
- **THEN** a gradient fill extends from the line down to the axis, fading to transparent

### Requirement: Token-derived chart palette
Chart series colors (strokes, fills, bars) MUST derive from the design-token palette (the asset-type identity hues and brand). Charts MUST NOT use hardcoded color literals such as `hsl(221, 83%, 53%)`.

#### Scenario: Series color follows the asset type
- **WHEN** a chart renders for a `time`-type asset
- **THEN** the series color resolves from the blue type token, not a hardcoded value

#### Scenario: No hardcoded stroke literals
- **WHEN** chart component code is inspected
- **THEN** no `hsl()`/`rgb()`/hex stroke or fill literals are present

### Requirement: Clean strokes, no decorative glow
Chart lines and bars SHALL render as crisp solid strokes/fills in **both** modes. There MUST be no decorative line/bar glow (the cold aesthetic is glow-free on data).

#### Scenario: Lines are solid in both modes
- **WHEN** a line chart renders in either light or dark mode
- **THEN** the line is a clean solid stroke with no `drop-shadow`/glow filter

### Requirement: Themed solid tooltip
Chart tooltips MUST match the active theme as a solid surface (opaque `bg-popover` + hairline border + shadow) and use theme tokens for text and background, rather than the library's default white tooltip.

#### Scenario: Tooltip matches dark theme
- **WHEN** a user hovers a chart in dark mode
- **THEN** the tooltip renders as a solid dark surface with readable theme-token text

#### Scenario: Tooltip matches light theme
- **WHEN** a user hovers a chart in light mode
- **THEN** the tooltip renders as a solid light surface with readable theme-token text

