export const en = {
  // Common
  appName: 'WorthMeter',
  appSubtitle: 'Break-Even Dashboard',
  back: 'Back',
  loading: 'Loading...',
  confirm: 'Confirm',
  cancel: 'Cancel',
  change: 'Change',
  delete: 'Delete',
  creating: 'Creating...',
  notFound: 'Asset not found',
  notFoundDescription: 'The page you are looking for does not exist or has been moved.',
  backHome: 'Go home',
  errorTitle: 'Something went wrong',
  errorDescription: 'An unexpected error occurred. Please try again.',
  retry: 'Retry',
  next: 'Next',
  requiredField: 'This field is required',
  invalidNumber: 'Please enter a valid number',
  invalidDateRange: 'The end date must be later than the start date',
  noUsageRecords: 'No usage records yet',
  noUsageRecordsDescription: 'Log the first use to start building a usage history.',
  noTimeUsageRecords: 'No manual records needed',
  noTimeUsageRecordsDescription: 'Time-based assets update automatically from their holding time.',
  type: 'Type',
  summary: 'Summary',

  // Dashboard
  totalInvested: 'Total Invested',
  assets: 'Assets',
  breakEven: 'Break Even',
  avgBreakEvenProgress: 'Average Break-Even Progress',
  noAssets: 'No assets yet',
  createFirst: 'Create Your First Asset',
  createFirstDescription: 'Start tracking your assets and see when they break even.',
  assetsReachedBreakEven: 'assets reached break-even',
  noActiveAssets: 'No active assets',
  addAssetOfType: 'Add an asset of this type to get started.',
  newAsset: 'New Asset',

  // Asset types
  countBased: 'Count-based',
  quotaBased: 'Quota-based',
  timeBased: 'Time-based',

  // Count-based
  costPerUse: 'Cost per Use',
  uses: 'Uses',
  targetUses: 'Target Uses',
  used: 'used',
  times: 'times',

  // Quota-based
  usageRate: 'Usage Rate',
  valueRecovered: 'Value Recovered',
  expectedWeeks: 'Expected Weeks',
  records: 'Records',

  // Time-based
  dailyCost: 'Daily Cost',
  daysUsed: 'Days Used',
  targetDays: 'Target Days',

  // Break-even
  breakEvenProgress: 'Break-Even',
  breakEvenReached: 'Break Even ✓',

  // New Asset page
  newAssetTitle: 'New Asset',
  newAssetDescription: 'Choose asset type and fill in details',
  chooseType: 'Choose Asset Type',
  basicInfo: 'Basic Info',
  detailsAndSubmit: 'Details & Submit',
  stepIndicator: 'Step {step} of {total}',

  // Form fields
  name: 'Name',
  timeNamePlaceholder: 'e.g. MacBook Pro',
  countNamePlaceholder: 'e.g. Swimming Pass',
  quotaNamePlaceholder: 'e.g. GPT Plus',
  totalCost: 'Total Cost (¥)',
  totalCostPlaceholder: '1200',
  purchaseDate: 'Purchase Date',
  expiryDate: 'Expiry Date',
  targetUnitCost: 'Target Cost per Use (¥)',
  targetUnitCostPlaceholder: '60',
  billingCycleStart: 'Billing Cycle Start',
  billingCycleEnd: 'Billing Cycle End',
  targetDailyCost: 'Target Daily Cost (¥)',
  targetDailyCostPlaceholder: '50',
  resaleValue: 'Resale Value (¥)',
  resaleValuePlaceholder: '5000',

  // Type descriptions
  countDescription: 'Swimming pass, gym classes, massage cards, etc.',
  quotaDescription: 'GPT Plus, API quotas, etc.',
  timeDescription: 'Laptop, phone, camera, headphones, etc.',

  // Type fields headers
  countFields: 'Count-based Fields',
  quotaFields: 'Quota-based Fields',
  timeFields: 'Time-based Fields',

  // Form actions
  createAsset: 'Create Asset',

  // Toast feedback
  assetCreated: 'Asset created',
  assetCreateFailed: 'Failed to create asset',
  assetUpdated: 'Asset updated',
  assetUpdateFailed: 'Failed to update asset',
  assetDeleted: 'Asset deleted',
  assetDeleteFailed: 'Failed to delete asset',
  assetArchived: 'Asset archived',
  assetUnarchived: 'Asset restored',
  assetArchiveFailed: 'Failed to update archive status',
  useLogged: 'Use logged',
  resetLogged: 'Reset logged',
  useLogFailed: 'Failed to log use',

  // Detail page
  purchasedOn: 'Purchased on',
  logUse: 'Log Use',
  logReset: 'Log Reset',
  logUseTitle: 'Log a Use',
  logResetTitle: 'Log Remaining Before Reset',
  logUseDescription: 'This will add one use to the count.',
  logResetDescription: 'Enter the remaining quota percentage before the weekly reset.',
  remainingQuota: 'Remaining Quota %',
  remainingPlaceholder: 'e.g. 40 means 40% remaining',
  recordOneUse: 'This records 1 use. Click to confirm.',
  useDate: 'Date of Use',
  deleteConfirmTitle: 'Delete Asset',
  deleteConfirmDescription:
    'This action cannot be undone. All usage records will be permanently deleted.',
  deleteUsageRecordTitle: 'Delete Usage Record',
  deleteUsageRecordDescription: 'This action cannot be undone. Delete this usage record?',
  usageRecordDeleted: 'Usage record deleted',
  usageRecordDeleteFailed: 'Failed to delete usage record',
  submitting: 'Submitting...',

  // Charts
  costPerUseTrend: 'Cost per Use Trend',
  costPerUseTrendDesc: 'Cost per use decreases as you use more',
  usageTrend: 'Usage Trend',
  usageTrendDesc: 'Usage percentage before each weekly reset',
  dailyCostTrend: 'Daily Cost Trend',
  dailyCostTrendDesc: 'Daily cost decreases over time',
  noChartData: 'Not enough data',
  noChartDataDescription: 'Log more uses to see the trend here.',
  noTimeChartDataDescription: 'The daily-cost trend will appear after another day has passed.',

  // Detail tabs
  overviewTab: 'Overview',
  trendTab: 'Trend',
  recordsTab: 'Records',

  // Usage records
  usageRecords: 'Usage Records',
  oneUse: '1 use',
  remaining: 'remaining',
  prevPage: 'Previous',
  nextPage: 'Next',
  pageIndicator: 'Page {page} of {totalPages}',

  // DatePicker
  pickDate: 'Pick a date',

  // Edit
  edit: 'Edit',
  editAsset: 'Edit Asset',
  editAssetDescription: 'Update asset information.',
  save: 'Save',
  saving: 'Saving...',

  // Archive
  inUse: 'In Use',
  archived: 'Archived',
  archive: 'Archive',
  unarchive: 'Unarchive',
  archivedOn: 'Archived on',
  archiveConfirmTitle: 'Archive Asset',
  archiveConfirmDescription:
    'This will mark the asset as archived. Calculations will be based on the archive date.',
  unarchiveConfirmTitle: 'Unarchive Asset',
  unarchiveConfirmDescription:
    'This will mark the asset as in use again. Calculations will resume from today.',

  // Simulator
  simulate: 'Simulate',
  simulateTitle: 'Purchase Simulator',
  simulateDescription:
    'Project whether a prospective purchase will break even, using your own track record.',
  expectedUsesPerWeek: 'Expected uses per week',
  expectedUsesPerWeekPlaceholder: '3',
  expectedUsageRatio: 'Expected usage per cycle (%)',
  expectedUsageRatioPlaceholder: '80',
  simProjection: 'Projection',
  simVerdict: 'Verdict',
  simVerdictWorthIt: 'Likely worth it',
  simVerdictOnTheFence: 'On the fence',
  simVerdictUnlikely: 'Unlikely to pay off',
  simNoVerdict: 'Enter a target and your expected pace to see a verdict.',
  simBreakEven: 'Projected break-even',
  simBreakEvenDate: 'Around {date}',
  simBreakEvenDays: 'About {days} days',
  simAt6Months: 'At 6 months',
  simAt12Months: 'At 12 months',
  simTrackRecord: 'Your track record',
  simYourPace: 'Your average pace',
  simPaceUsesPerDay: '{v} uses / day',
  simPaceCostPerDay: '{sym}{v} / day',
  simPaceUsageRatio: '{v}% per cycle',
  simRecentAsset: 'Most recent {type} asset',
  simRecentBreakEven: 'Break-even progress',
  simNoHistory: 'No {type} purchases yet - projection uses your target only.',
  simBasisHistory: 'Based on your actual pace',
  simBasisExpected: 'Based on your target',
  simCreateAsset: 'Create this asset',
  simGapWarning: 'Your target breaks even, but your track record says it will take longer.',

  // Leaderboard
  leaderboard: 'Leaderboard',
  leaderboardTitle: 'Asset Value',
  leaderboardDescription:
    'See what delivers value from actual holding and usage data — no targets required.',
  filterAll: 'All',
  valueOverview: 'Value at a glance',
  valueOverviewDesc: 'Each asset type is evaluated in its own meaningful unit.',
  bestValue: 'Best value',
  needsAttentionValue: 'Worth a look',
  needsAttentionValueDesc: 'Assets whose current activity or cost stands out.',
  viewTypeRanking: 'View type ranking',
  detailedRanking: 'Detailed ranking',
  rankingBasisTime: 'Lower holding cost per day ranks higher.',
  rankingBasisCount: 'Lower cost per recorded use ranks higher.',
  rankingBasisQuota: 'Higher actual utilization ranks higher.',
  holdingCostPerDay: 'Holding cost / day',
  costPerRecordedUse: 'Cost / recorded use',
  actualUtilization: 'Actual utilization',
  highestHoldingCost: 'Highest holding cost per day',
  highestCostPerUse: 'Highest cost per recorded use',
  lowestUtilization: 'Lowest actual utilization',
  waitingForFirstUse: 'Waiting for first use',
  waitingForFirstUseDesc: 'Log one use to include this asset in the ranking.',
  targetProgress: 'Target progress',
  daysHeld: '{count} days held',
  recordedUses: '{count} uses recorded',
  quotaRecords: '{count} quota snapshots',
  noAssetsOfType: 'No assets of this type yet',
  champion: 'Champion',
  championDesc: 'Best-value purchase so far',
  biggestRegret: 'Biggest Regret',
  regretDesc: 'Most unrecovered value',
  rank: 'Rank',
  notMeasurable: 'Not yet measurable',
  notMeasurableDesc: 'Set a target to rank this asset',
  leaderboardEmpty: 'No assets to rank yet',
  primaryMetric: 'Metric',

  // Quick log & nudges
  quickLog: 'Log one use',
  nudgesHeading: 'Needs attention',
  nudgeStale: 'No use logged for {name} in {days} days',

  // Usage heatmap
  usageHeatmap: 'Usage calendar',
  heatmapNoUses: 'No uses on {date}',
  heatmapUses: '{count} uses on {date}',
  heatmapLegendLess: 'Less',
  heatmapLegendMore: 'More',
} as const;

export type TranslationKey = keyof typeof en;
