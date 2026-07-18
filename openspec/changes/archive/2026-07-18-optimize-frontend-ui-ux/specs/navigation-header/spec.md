## ADDED Requirements

### Requirement: The app SHALL provide a unified page header component
The app SHALL provide a reusable `PageHeader` component supporting a left back/icon area, a center title/subtitle area, and a right action area.

#### Scenario: Dashboard header
- **WHEN** the user views the dashboard
- **THEN** the header shows the brand icon and app name on the left, and theme/currency/language toggles plus a "New asset" button on the right

#### Scenario: Detail page header
- **WHEN** the user views an asset detail page
- **THEN** the header shows a back button and asset title on the left, and theme/language toggles plus edit/archive/delete actions on the right

### Requirement: Page headers SHALL stay sticky with a glass effect while scrolling
All page headers SHALL use the unified `glass-header` style, remaining sticky at the top of the viewport while scrolling, with a bottom border and backdrop blur.

#### Scenario: Scrolling the page
- **WHEN** the user scrolls down the page
- **THEN** the header stays at the top of the viewport with a blurred, semi-transparent background

### Requirement: Global control buttons SHALL stay in a consistent position
Theme, language, and currency toggles SHALL appear in the same order and style across all page headers.

#### Scenario: Switching pages
- **WHEN** the user moves from the dashboard to an asset detail page
- **THEN** the theme/language/currency toggles keep the same position and appearance

### Requirement: Primary action buttons SHALL be prominently placed on the right
The primary action for a page (e.g. "New asset") SHALL be located on the right side of the header using primary button styling.

#### Scenario: Dashboard new-asset button
- **WHEN** the user views the dashboard
- **THEN** a prominent "New asset" button appears on the right side of the header
