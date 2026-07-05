// 模拟数据生成器 - 生成带日期的入库和利用记录，支持按时间区间筛选

// ===== 入库记录 =====
export interface IngestRecord {
  date: string;           // YYYY-MM-DD
  archiveType: string;    // 档案类型
  carrierType: string;    // 载体类型
  securityLevel: string;  // 密级
  volumeCount: number;    // 卷数
}

// ===== 利用记录 =====
export interface UtilizationRecord {
  date: string;
  method: 'download' | 'print' | 'view';
  userIdentity: string;
  purpose: string;
}

// ===== 档案类型配置 =====
const ARCHIVE_TYPES = ['工程档案', '招投标档案', '音像档案', '村镇档案', '文书档案'];
const CARRIER_TYPES = ['竣工图纸', '文字卷宗', '工程照片', '光盘介质'];
const SECURITY_LEVELS = ['普通', '秘密', '机密', '绝密'];
const USER_IDENTITIES = ['建设单位', '施工单位', '产权单位', '律师', '物业单位', '房屋产权人', '党政/纪检/司法机关', '其他'];
const PURPOSES = ['复印备案', '领取房产证', '生产建设', '解决纠纷', '查阅核对', '调查取证', '其他'];

// ===== 权重随机选择 =====
function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

// ===== 生成入库记录 =====
function generateIngestRecords(): IngestRecord[] {
  const records: IngestRecord[] = [];
  const startDate = new Date('2022-01-01');
  const endDate = new Date('2026-12-31');

  const current = new Date(startDate);
  while (current <= endDate) {
    // 每月生成 30~80 条入库记录
    const monthlyCount = randomInt(30, 80);
    for (let i = 0; i < monthlyCount; i++) {
      const day = randomInt(1, 28);
      const recordDate = new Date(current.getFullYear(), current.getMonth(), day);
      if (recordDate > endDate) break;

      records.push({
        date: formatDate(recordDate),
        archiveType: weightedRandom(ARCHIVE_TYPES, [40, 25, 15, 10, 10]),
        carrierType: weightedRandom(CARRIER_TYPES, [35, 30, 25, 10]),
        securityLevel: weightedRandom(SECURITY_LEVELS, [50, 25, 15, 10]),
        volumeCount: randomInt(1, 15),
      });
    }
    current.setMonth(current.getMonth() + 1);
  }
  return records;
}

// ===== 生成利用记录 =====
function generateUtilizationRecords(): UtilizationRecord[] {
  const records: UtilizationRecord[] = [];
  const startDate = new Date('2022-01-01');
  const endDate = new Date('2026-12-31');

  const current = new Date(startDate);
  while (current <= endDate) {
    // 每月生成 100~300 条利用记录
    const monthlyCount = randomInt(100, 300);
    for (let i = 0; i < monthlyCount; i++) {
      const day = randomInt(1, 28);
      const recordDate = new Date(current.getFullYear(), current.getMonth(), day);
      if (recordDate > endDate) break;

      records.push({
        date: formatDate(recordDate),
        method: weightedRandom(['download', 'print', 'view'], [40, 25, 35]),
        userIdentity: weightedRandom(USER_IDENTITIES, [25, 20, 5, 10, 5, 15, 15, 5]),
        purpose: weightedRandom(PURPOSES, [20, 15, 15, 15, 15, 10, 10]),
      });
    }
    current.setMonth(current.getMonth() + 1);
  }
  return records;
}

// ===== 一次性生成数据（缓存） =====
const ALL_INGEST = generateIngestRecords();
const ALL_UTILIZATION = generateUtilizationRecords();

// ===== 时间区间类型 =====
export type Period = 'month' | 'year' | 'custom';

// ===== 获取筛选后的数据 =====
export function getFilteredData(period: Period, startDate?: string, endDate?: string) {
  const now = new Date();
  let from: Date;
  let to: Date;

  switch (period) {
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'year':
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31);
      break;
    case 'custom':
      from = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
      to = endDate ? new Date(endDate) : now;
      break;
  }

  const fromStr = formatDate(from);
  const toStr = formatDate(to);

  const ingest = ALL_INGEST.filter(r => r.date >= fromStr && r.date <= toStr);
  const utilization = ALL_UTILIZATION.filter(r => r.date >= fromStr && r.date <= toStr);

  return { ingest, utilization, from, to };
}

// ===== 统计计算函数 =====

/** 馆藏载体类型占比 */
export function calcCarrierStats(ingest: IngestRecord[]) {
  const map = new Map<string, number>();
  ingest.forEach(r => map.set(r.carrierType, (map.get(r.carrierType) || 0) + r.volumeCount));
  const colors = ['#22c55e', '#3b82f6', '#a855f7', '#ec4899'];
  return Array.from(map.entries()).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
}

/** 按月入库趋势 */
export function calcIngestTrend(ingest: IngestRecord[], fullYear?: number) {
  const map = new Map<string, number>();
  ingest.forEach(r => {
    const key = r.date.substring(0, 7); // YYYY-MM
    map.set(key, (map.get(key) || 0) + r.volumeCount);
  });

  if (fullYear !== undefined) {
    // 返回全年12个月，无数据月份填0
    return Array.from({ length: 12 }, (_, i) => {
      const key = `${fullYear}-${String(i + 1).padStart(2, '0')}`;
      return { month: `${i + 1}月`, 入库: map.get(key) || 0 };
    });
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month: month.substring(5) + '月', 入库: count }));
}

/** 按月利用方式趋势 */
export function calcMethodTrend(utilization: UtilizationRecord[], fullYear?: number) {
  const map = new Map<string, { download: number; print: number }>();
  utilization.forEach(r => {
    const key = r.date.substring(0, 7);
    if (!map.has(key)) map.set(key, { download: 0, print: 0 });
    const entry = map.get(key)!;
    if (r.method === 'download') entry.download++;
    if (r.method === 'print') entry.print++;
  });

  if (fullYear !== undefined) {
    return Array.from({ length: 12 }, (_, i) => {
      const key = `${fullYear}-${String(i + 1).padStart(2, '0')}`;
      const data = map.get(key) || { download: 0, print: 0 };
      return { month: `${i + 1}月`, ...data };
    });
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month: month.substring(5) + '月', ...data }));
}

/** 利用身份构成 */
export function calcUserIdentity(utilization: UtilizationRecord[]) {
  const map = new Map<string, number>();
  utilization.forEach(r => map.set(r.userIdentity, (map.get(r.userIdentity) || 0) + 1));
  const colors = ['#3b82f6', '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#94a3b8'];
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
}

/** 利用目的分析 */
export function calcPurposeStats(utilization: UtilizationRecord[]) {
  const map = new Map<string, number>();
  utilization.forEach(r => map.set(r.purpose, (map.get(r.purpose) || 0) + 1));
  const total = utilization.length;
  const colors = ['#f43f5e', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b'];
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], i) => ({ name, value: total > 0 ? Math.round((value / total) * 100) : 0, color: colors[i % colors.length] }));
}

/** 热门馆藏分类 */
export function calcHotArchive(ingest: IngestRecord[]) {
  const map = new Map<string, number>();
  ingest.forEach(r => map.set(r.archiveType, (map.get(r.archiveType) || 0) + r.volumeCount));
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#64748b'];
  return Array.from(map.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
}

/** 密级分布 Treemap */
export function calcSecurityTreemap(ingest: IngestRecord[]) {
  const grouped = new Map<string, Map<string, number>>();
  ingest.forEach(r => {
    if (!grouped.has(r.securityLevel)) grouped.set(r.securityLevel, new Map());
    const inner = grouped.get(r.securityLevel)!;
    inner.set(r.archiveType, (inner.get(r.archiveType) || 0) + r.volumeCount);
  });
  return Array.from(grouped.entries()).map(([name, children]) => ({
    name,
    children: Array.from(children.entries()).map(([n, size]) => ({ name: n, size })),
  }));
}

/** 汇总统计卡片 */
export function calcSummary(ingest: IngestRecord[], utilization: UtilizationRecord[]) {
  const totalVolumes = ingest.reduce((s, r) => s + r.volumeCount, 0);
  const totalUtilization = utilization.length;
  const downloads = utilization.filter(r => r.method === 'download').length;
  const prints = utilization.filter(r => r.method === 'print').length;
  const paperlessRate = totalUtilization > 0 ? ((downloads / totalUtilization) * 100).toFixed(1) : '0';

  return { totalVolumes, totalUtilization, downloads, prints, paperlessRate };
}

/** 新增项目/工程/案卷/文件统计 */
export function calcNewCounts(archiveData: any[]) {
  const projects = archiveData.filter((i: any) => i.tag === 'zj' && i.parent_id === '0').length;
  const units = archiveData.filter((i: any) => i.tag === 'zj_item').length;
  const volumes = archiveData.filter((i: any) => i.tag === 'zj_volume').length;
  const files = archiveData.filter((i: any) => i.file_type === 'file').length;
  return { projects, units, volumes, files };
}

/** 载体类型详细统计 */
export function calcCarrierDetail() {
  const colors = ['#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b', '#6366f1', '#06b6d4', '#f43f5e', '#84cc16', '#d946ef', '#94a3b8'];
  const types = ['文字', '图纸', '照片', '底图', '录音带', '录像带', '光盘', '磁带', '磁盘', '缩微片', '其他'];
  return types.map((name, i) => ({ name, 卷数: Math.floor(Math.random() * 500) + 50, color: colors[i] }));
}
