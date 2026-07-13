import { getFilteredData, calcSummary, calcNewCounts, calcCarrierDetail, calcUserIdentity, calcPurposeStats, Period } from './dashboardData';
import archiveData from './archiveData.json';

/**
 * 生成CSV内容
 * @param period 统计周期类型
 * @param startDate 自定义开始日期 (YYYY-MM-DD)
 * @param endDate 自定义结束日期 (YYYY-MM-DD)
 * @returns CSV字符串
 */
export function generateCSV(period: Period, startDate?: string, endDate?: string): string {
  const { ingest, utilization, from, to } = getFilteredData(period, startDate, endDate);
  const summary = calcSummary(ingest, utilization);
  const newCounts = calcNewCounts(archiveData as any[]);
  const carrierDetail = calcCarrierDetail();
  const userIdentity = calcUserIdentity(utilization);
  const purposeData = calcPurposeStats(utilization);

  const periodLabel = period === 'month'
    ? `${from.getFullYear()}年${from.getMonth() + 1}月`
    : period === 'year'
      ? `${from.getFullYear()}年`
      : `${from.toISOString().split('T')[0]} ~ ${to.toISOString().split('T')[0]}`;

  const rows: string[][] = [
    ['指标', '值'],
    ['统计周期', periodLabel],
    ['入库总卷数', String(summary.totalVolumes)],
    ['入库批次', String(ingest.length)],
    ['新增项目', String(newCounts.projects)],
    ['新增工程', String(newCounts.units)],
    ['新增案卷', String(newCounts.volumes)],
    ['新增文件', String(newCounts.files)],
    ['利用总量', String(summary.totalUtilization)],
    ['无纸化出证率', `${summary.paperlessRate}%`],
    [],
    ['载体类型统计'],
    ['类型', '卷数'],
    ...carrierDetail.map(c => [c.name, String(c.卷数)]),
    [],
    ['利用人身份统计'],
    ['身份', '人次'],
    ...userIdentity.map(u => [u.name, String(u.value)]),
    [],
    ['利用目的统计'],
    ['目的', '占比(%)'],
    ...purposeData.map(p => [p.name, String(p.value)]),
  ];

  return rows.map(r => r.join(',')).join('\n');
}

/**
 * 导出CSV文件（浏览器环境）
 */
export function exportCSVFile(period: Period, startDate?: string, endDate?: string): void {
  const csv = generateCSV(period, startDate, endDate);
  const now = new Date();
  const periodLabel = period === 'month'
    ? `${now.getFullYear()}年${now.getMonth() + 1}月`
    : period === 'year'
      ? `${now.getFullYear()}年`
      : '自定义';
  const fileName = `统计报表_${periodLabel}.csv`;
  
  // 添加BOM头以支持中文在Excel中正确显示
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
