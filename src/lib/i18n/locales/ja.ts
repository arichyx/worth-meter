import type { TranslationKey } from './en';

export const ja: Record<TranslationKey, string> = {
  appName: 'WorthMeter',
  appSubtitle: '元回しダッシュボード',
  back: '戻る',
  loading: '読み込み中...',
  confirm: '確認',
  cancel: '戻る',
  change: '変更',
  delete: '削除',
  creating: '作成中...',
  notFound: '資産が見つかりません',

  totalInvested: '総投資額',
  assets: '資産数',
  breakEven: '元回し完了',
  avgBreakEvenProgress: '平均元回し進捗',
  noAssets: '資産がまだありません',
  createFirst: '最初の資産を作成',
  newAsset: '新規資産',

  countBased: '回数型',
  quotaBased: 'クォータ型',
  timeBased: '時間型',

  costPerUse: '1回あたりのコスト',
  uses: '使用回数',
  targetUses: '目標回数',
  used: '使用済み',
  times: '回',

  usageRate: '使用率',
  valueRecovered: '回収済み金額',
  expectedWeeks: '予想週数',
  records: '記録数',

  dailyCost: '1日あたりのコスト',
  daysUsed: '使用日数',
  targetDays: '目標日数',

  breakEvenProgress: '元回し進捗',
  breakEvenReached: '元回し完了 ✓',

  newAssetTitle: '新規資産',
  newAssetDescription: '資産タイプを選択して情報を入力',
  chooseType: '資産タイプを選択',

  name: '名前',
  namePlaceholder: '例：スイミングパス',
  totalCost: '総額 (¥)',
  totalCostPlaceholder: '1200',
  purchaseDate: '購入日',
  expiryDate: '有効期限',
  targetUnitCost: '目標単価 (¥)',
  targetUnitCostPlaceholder: '60',
  billingCycleStart: '請求周期開始',
  billingCycleEnd: '請求周期終了',
  targetDailyCost: '目標日額 (¥)',
  targetDailyCostPlaceholder: '50',
  resaleValue: '売却価格 (¥)',
  resaleValuePlaceholder: '5000',

  countDescription: 'スイミングパス、ジム、マッサージチケットなど',
  quotaDescription: 'GPT Plus、APIクォータなど',
  timeDescription: 'PC、スマホ、カメラ、ヘッドフォンなど',

  countFields: '回数型フィールド',
  quotaFields: 'クォータ型フィールド',
  timeFields: '時間型フィールド',

  createAsset: '資産を作成',

  purchasedOn: '購入日',
  logUse: '使用を記録',
  logReset: 'リセットを記録',
  logUseTitle: '使用を1回記録',
  logResetTitle: 'リセット前の残りを記録',
  logUseDescription: '使用記録を1件追加します。',
  logResetDescription: '週次リセット前の残りクォータ率を入力してください。',
  remainingQuota: '残りクォータ %',
  remainingPlaceholder: '例：40 = 40%残り',
  recordOneUse: '1回の使用を記録します。確認をクリックしてください。',
  useDate: '使用日',

  costPerUseTrend: '単価推移',
  costPerUseTrendDesc: '使用回数が増えるほど、1回あたりのコストが下がります',
  usageTrend: '使用率推移',
  usageTrendDesc: '各週のリセット前使用率',
  dailyCostTrend: '日額推移',
  dailyCostTrendDesc: '使用日数が増えるほど、1日あたりのコストが下がります',

  usageRecords: '使用記録',
  oneUse: '1回使用',
  remaining: '残り',

  pickDate: '日付を選択',

  deleteConfirmTitle: '資産を削除',
  deleteConfirmDescription: 'この操作は取り消せません。すべての使用記録が完全に削除されます。',
  submitting: '送信中...',

  edit: '編集',
  editAsset: '資産を編集',
  editAssetDescription: '資産情報を更新します。',
  save: '保存',
  saving: '保存中...',

  // Archive
  inUse: '使用中',
  archived: '廃棄済み',
  archive: '廃棄',
  unarchive: '使用再開',
  archivedOn: '廃棄日',
  archiveConfirmTitle: '資産を廃棄',
  archiveConfirmDescription: '廃棄済みとしてマークします。計算は廃棄日を基準にします。',
  unarchiveConfirmTitle: '資産を復元',
  unarchiveConfirmDescription: '使用中に戻します。計算は今日から再開されます。',
};
