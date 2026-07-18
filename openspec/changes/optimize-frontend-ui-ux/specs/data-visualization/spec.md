## ADDED Requirements

### Requirement: Charts SHALL show an empty state when there is no data or only a single data point
When chart data is empty or contains only one data point, `AssetChart` SHALL render an empty-state placeholder instead of a meaningless trend chart.

#### Scenario: No usage records
- **WHEN** an asset has no usage records
- **THEN** the chart area shows a "No data" empty state and does not render axes

#### Scenario: Single record only
- **WHEN** an asset has only one usage record
- **THEN** the chart area shows an explanatory message that more data is needed to show a trend

### Requirement: Chart containers SHALL maintain a minimum height
Chart containers SHALL maintain a minimum height of 288px (`h-72`) in responsive layouts to prevent collapse.

#### Scenario: Viewing chart on mobile
- **WHEN** the user views the chart on a narrow viewport
- **THEN** the chart container height is at least 288px and its width adapts

### Requirement: Chart tooltips SHALL use theme tokens
`ChartTooltip` SHALL use theme tokens such as `bg-popover`, `text-popover-foreground`, and `border-border` to ensure good contrast in both light and dark themes.

#### Scenario: Tooltip in dark mode
- **WHEN** the user hovers over a chart in dark mode
- **THEN** the tooltip background is dark, text is light, and it matches the active theme

## MODIFIED Requirements

### Requirement: Gradient area fill
Line charts SHALL render a translucent gradient area fill beneath the series line, fading the series color toward transparent, to add depth.

#### Scenario: Line chart has area fill
- **WHEN** a line chart (e.g. daily-cost or cost-per-use trend) renders
- **THEN** a gradient fill extends from the line down to the axis, fading to transparent

#### Scenario: Empty chart does not render area fill
- **WHEN** a chart has no data points
- **THEN** the chart renders an empty state instead of an empty gradient area
