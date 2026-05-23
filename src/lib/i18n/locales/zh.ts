import type { TranslationKey } from './en';

export const zh: Record<TranslationKey, string> = {
  // Common
  appName: 'WorthMeter',
  appSubtitle: '回本仪表盘',
  back: '返回',
  loading: '加载中...',
  confirm: '确认',
  cancel: '返回',
  change: '更改类型',
  delete: '删除',
  creating: '创建中...',
  notFound: '资产未找到',

  // Dashboard
  totalInvested: '总投入',
  assets: '资产数量',
  breakEven: '已回本',
  avgBreakEvenProgress: '平均回本进度',
  noAssets: '还没有任何资产',
  createFirst: '创建第一个资产',
  newAsset: '新建资产',

  // Asset types
  countBased: '次数型',
  quotaBased: '配额型',
  timeBased: '时间型',

  // Count-based
  costPerUse: '单次成本',
  uses: '使用次数',
  targetUses: '目标次数',
  used: '已用',
  times: '次',

  // Quota-based
  usageRate: '使用率',
  valueRecovered: '已回本金额',
  expectedWeeks: '预期周数',
  records: '记录次数',

  // Time-based
  dailyCost: '每日成本',
  daysUsed: '使用天数',
  targetDays: '目标天数',

  // Break-even
  breakEvenProgress: '回本进度',
  breakEvenReached: '已回本 ✓',

  // New Asset page
  newAssetTitle: '新建资产',
  newAssetDescription: '选择资产类型并填写信息',
  chooseType: '选择资产类型',

  // Form fields
  name: '名称',
  timeNamePlaceholder: '例如 MacBook Pro',
  countNamePlaceholder: '例如 游泳季卡',
  quotaNamePlaceholder: '例如 GPT Plus',
  totalCost: '总价格 (¥)',
  totalCostPlaceholder: '1200',
  purchaseDate: '购买日期',
  expiryDate: '有效期至',
  targetUnitCost: '目标单次价格 (¥)',
  targetUnitCostPlaceholder: '60',
  billingCycleStart: '账单周期开始',
  billingCycleEnd: '账单周期结束',
  targetDailyCost: '目标每日成本 (¥)',
  targetDailyCostPlaceholder: '50',
  resaleValue: '残值 (¥)',
  resaleValuePlaceholder: '5000',

  // Type descriptions
  countDescription: '游泳卡、健身课、按摩卡等',
  quotaDescription: 'GPT Plus、API 配额等',
  timeDescription: '电脑、手机、相机、耳机等',

  // Type fields headers
  countFields: '次数型专属字段',
  quotaFields: '配额型专属字段',
  timeFields: '时间型专属字段',

  // Form actions
  createAsset: '创建资产',

  // Detail page
  purchasedOn: '购买于',
  logUse: '记录使用',
  logReset: '记录 Reset',
  logUseTitle: '记录一次使用',
  logResetTitle: '记录 Reset 前剩余',
  logUseDescription: '将添加一次使用记录。',
  logResetDescription: '输入 weekly quota 重置前的剩余额度百分比。',
  remainingQuota: '剩余额度 %',
  remainingPlaceholder: '例如 40 表示剩余 40%',
  recordOneUse: '将记录 1 次使用，点击确认。',
  useDate: '使用日期',
  deleteConfirmTitle: '删除资产',
  deleteConfirmDescription: '此操作不可撤销，所有使用记录将被永久删除。',
  submitting: '提交中...',

  // Charts
  costPerUseTrend: '单次成本趋势',
  costPerUseTrendDesc: '随着使用次数增加，单次成本逐渐降低',
  usageTrend: '使用率趋势',
  usageTrendDesc: '每周额度重置前的使用百分比',
  dailyCostTrend: '每日成本趋势',
  dailyCostTrendDesc: '随着使用天数增加，每日成本逐渐降低',

  // Usage records
  usageRecords: '使用记录',
  oneUse: '使用 1 次',
  remaining: '剩余',

  // DatePicker
  pickDate: '选择日期',

  // Edit
  edit: '编辑',
  editAsset: '编辑资产',
  editAssetDescription: '修改资产信息。',
  save: '保存',
  saving: '保存中...',

  // Archive
  inUse: '使用中',
  archived: '已废弃',
  archive: '废弃',
  unarchive: '恢复使用',
  archivedOn: '废弃于',
  archiveConfirmTitle: '废弃资产',
  archiveConfirmDescription: '将标记为已废弃，计算将以废弃日期为准。',
  unarchiveConfirmTitle: '恢复资产',
  unarchiveConfirmDescription: '将恢复为使用中，计算将重新从今天开始。',
};
