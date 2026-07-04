import React, { useState, useMemo } from 'react';
import {
  Database, TrendingUp, RefreshCw, CalendarRange
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
  BarChart, Bar, Treemap
} from 'recharts';
import { User } from '../types';
import { ViewState } from '../components/Navigation';
import {
  Period, getFilteredData,
  calcCarrierStats, calcIngestTrend, calcMethodTrend,
  calcUserIdentity, calcPurposeStats, calcHotArchive,
  calcSecurityTreemap, calcSummary
} from '../data/dashboardData';

interface DashboardProps {
  currentUser: User;
  onChangeView: (view: ViewState) => void;
}

const TREEMAP_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#64748b', '#ef4444'];

const TreemapContent = (props: any) => {
  const { x, y, width, height, index, name, value } = props;
  const color = TREEMAP_COLORS[index % TREEMAP_COLORS.length];
  if (width < 60 || height < 50) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} rx={6} ry={6} />
      <text x={x + width / 2} y={y + height / 2 - 8} textAnchor="middle" fill="#fff" fontSize={14} fontWeight="bold" style={{textShadow:'0 1px 3px rgba(0,0,0,0.5)'}}>{name}</text>
      <text x={x + width / 2} y={y + height / 2 + 14} textAnchor="middle" fill="#fff" fontSize={12} fillOpacity={0.95}>{value}卷</text>
    </g>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onChangeView }) => {
  const [period, setPeriod] = useState<Period>('month');
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [refreshKey, setRefreshKey] = useState(0);

  const { ingest, utilization, from, to } = useMemo(
    () => getFilteredData(period, startDate, endDate),
    [period, startDate, endDate, refreshKey]
  );

  const summary = useMemo(() => calcSummary(ingest, utilization), [ingest, utilization]);
  const carrierStats = useMemo(() => calcCarrierStats(ingest), [ingest]);
  const ingestTrend = useMemo(() => calcIngestTrend(ingest, period === 'year' ? from.getFullYear() : undefined), [ingest, period, from]);
  const methodTrend = useMemo(() => calcMethodTrend(utilization, period === 'year' ? from.getFullYear() : undefined), [utilization, period, from]);
  const userIdentity = useMemo(() => calcUserIdentity(utilization), [utilization]);
  const purposeData = useMemo(() => calcPurposeStats(utilization), [utilization]);
  const hotArchive = useMemo(() => calcHotArchive(ingest), [ingest]);
  const securityTreemap = useMemo(() => calcSecurityTreemap(ingest), [ingest]);

  const periodLabel = period === 'month'
    ? `${from.getFullYear()}年${from.getMonth() + 1}月`
    : period === 'year'
      ? `${from.getFullYear()}年`
      : `${from.toISOString().split('T')[0]} ~ ${to.toISOString().split('T')[0]}`;

  return (
    <div className="-mt-6 -mx-6 flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 统计周期筛选 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <CalendarRange size={14} />
            <span className="font-medium">统计周期</span>
          </div>
          <div className="flex items-center gap-2">
            {(['month', 'year', 'custom'] as const).map((p) => (
              <button key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${period === p ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {p === 'month' ? '本月' : p === 'year' ? '本年' : '自定义'}
              </button>
            ))}
            {period === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none" />
                <span className="text-slate-400">至</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none" />
              </div>
            )}
            <button onClick={() => setRefreshKey(k => k + 1)} className="ml-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="刷新">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ===== 馆藏概况 + 利用概况 ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 馆藏数据统计 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">馆藏数据统计</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 mb-1">入库总卷数</p>
                <p className="text-2xl font-extrabold text-blue-600">{summary.totalVolumes.toLocaleString()} 卷</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 mb-1">入库批次</p>
                <p className="text-2xl font-extrabold text-emerald-600">{ingest.length.toLocaleString()} 批</p>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-slate-700 mb-2">馆藏载体类型占比</h4>
              <div className="flex items-center gap-4">
                <div className="w-[140px] h-[140px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={carrierStats} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={2}>
                        {carrierStats.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {carrierStats.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor: item.color}} />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 mb-2">入库趋势</h4>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ingestTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="入库" stroke="#22c55e" strokeWidth={2} dot={{r:3,fill:'#22c55e'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
              <span>统计周期: {periodLabel}</span>
              <span className="text-emerald-600">区块链分布式同步</span>
            </div>
          </div>

          {/* 档案利用统计 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">档案利用统计</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 mb-1">利用总量</p>
                <p className="text-2xl font-extrabold text-blue-600">{summary.totalUtilization.toLocaleString()} 人次</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] text-slate-500 mb-1">无纸化出证率</p>
                <p className="text-2xl font-extrabold text-amber-500">{summary.paperlessRate} %</p>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="text-[11px] font-bold text-slate-700 mb-2">近期利用服务趋势</h4>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={methodTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="download" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="print" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 mb-3">服务利用人结构占比</h4>
              <div className="space-y-2.5">
                {userIdentity.slice(0, 4).map((item, i) => {
                  const maxVal = Math.max(...userIdentity.map(u => u.value), 1);
                  const pct = (item.value / maxVal) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-600">{item.name}</span>
                        <span className="font-bold text-slate-800">{item.value} 人</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${pct}%`, backgroundColor:item.color}} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
              <span>统计周期: {periodLabel}</span>
              <span className="text-emerald-600">已连兰台链</span>
            </div>
          </div>
        </div>

        {/* ===== 详细统计图表 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 利用方式趋势 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">利用方式趋势 (下载 vs 打印)</h3>
              <span className="text-[10px] text-slate-400">{periodLabel}</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={methodTrend}>
                  <defs>
                    <linearGradient id="dl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                    <linearGradient id="pr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/><stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#64748b'}} />
                  <Tooltip contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} itemStyle={{fontSize:'12px'}} />
                  <Legend iconType="circle" wrapperStyle={{paddingTop:'10px'}} />
                  <Area type="monotone" dataKey="download" name="下载" stroke="#3b82f6" strokeWidth={2} fill="url(#dl)" />
                  <Area type="monotone" dataKey="print" name="打印" stroke="#f59e0b" strokeWidth={2} fill="url(#pr)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 利用人身份构成 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">利用人身份构成</h3>
              <span className="text-[10px] text-slate-400">{periodLabel}</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userIdentity} layout="vertical" margin={{left:20}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} tick={{fontSize:12,fill:'#475569'}} />
                  <Tooltip cursor={{fill:'#f8fafc'}} contentStyle={{borderRadius:'8px',border:'none',boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" name="人次" radius={[0,4,4,0]} barSize={24}>
                    {userIdentity.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 利用目的分析 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">利用目的分析</h3>
              <span className="text-[10px] text-slate-400">{periodLabel}</span>
            </div>
            <div className="h-64 flex items-center">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={purposeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {purposeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3 pl-4">
                {purposeData.map((e, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor:e.color}} />
                      <span className="text-slate-600">{e.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 热门馆藏分类 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">热门馆藏分类</h3>
              <span className="text-[10px] text-slate-400">{periodLabel}</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hotArchive}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:11,fill:'#64748b'}} />
                  <Tooltip cursor={{fill:'#f8fafc'}} />
                  <Bar dataKey="value" name="卷数" radius={[4,4,0,0]} barSize={40}>
                    {hotArchive.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Treemap */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-sm">馆藏密级与类型分布</h3>
              <span className="text-[10px] text-slate-400">{periodLabel} · 矩形面积代表卷数</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap data={securityTreemap} dataKey="size" aspectRatio={4/3} stroke="#fff" content={<TreemapContent />} />
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
