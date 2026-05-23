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

  // Dashboard
  totalInvested: 'Total Invested',
  assets: 'Assets',
  breakEven: 'Break Even',
  avgBreakEvenProgress: 'Average Break-Even Progress',
  noAssets: 'No assets yet',
  createFirst: 'Create Your First Asset',
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
  submitting: 'Submitting...',

  // Charts
  costPerUseTrend: 'Cost per Use Trend',
  costPerUseTrendDesc: 'Cost per use decreases as you use more',
  usageTrend: 'Usage Trend',
  usageTrendDesc: 'Usage percentage before each weekly reset',
  dailyCostTrend: 'Daily Cost Trend',
  dailyCostTrendDesc: 'Daily cost decreases over time',

  // Usage records
  usageRecords: 'Usage Records',
  oneUse: '1 use',
  remaining: 'remaining',

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
} as const;

export type TranslationKey = keyof typeof en;
