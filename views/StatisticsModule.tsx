
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Treemap
} from 'recharts';

// --- Data: Archive Structure (Existing) ---
const DATA_BY_TYPE = [
  { name: '工程档案', value: 450, color: '#3b82f6' }, // Blue
  { name: '招投标档案', value: 300, color: '#8b5cf6' }, // Purple
  { name: '音像档案', value: 200, color: '#10b981' }, // Emerald
  { name: '村镇档案', value: 150, color: '#f59e0b' }, // Amber
  { name: '文书档案', value: 400, color: '#64748b' }, // Slate
];

// --- Data: Utilization Method Trend (Updated to Download/Print) ---
const DATA_METHOD_TREND = [
  { month: '1月', download: 120, print: 80 },
  { month: '2月', download: 132, print: 90 },
  { month: '3月', download: 301, print: 150 }, // Peak season
  { month: '4月', download: 234, print: 110 },
  { month: '5月', download: 290, print: 130 },
  { month: '6月', download: 330, print: 170 },
];

// --- Data: User Identity Distribution (Matched to Registration Form) ---
const DATA_USER_IDENTITY = [
  { name: '建设/施工单位', value: 350, color: '#3b82f6' },
  { name: '律师/法律工作者', value: 210, color: '#6366f1' },
  { name: '党政/司法机关', value: 180, color: '#ef4444' }, // Red for authority
  { name: '房屋产权人', value: 420, color: '#10b981' }, // High volume
  { name: '物业单位', value: 120, color: '#f59e0b' },
  { name: '其他', value: 80, color: '#94a3b8' },
];

// --- Data: Utilization Purpose (Matched to Registration Form) ---
const DATA_PURPOSE = [
  { name: '解决纠纷', value: 25, color: '#f43f5e' },
  { name: '调查取证', value: 20, color: '#8b5cf6' },
  { name: '领取房产证', value: 30, color: '#10b981' },
  { name: '生产建设', value: 15, color: '#3b82f6' },
  { name: '查阅核对', value: 10, color: '#f59e0b' },
];

// --- Data: Treemap (Security Level -> Type) ---
const DATA_TREEMAP = [
  {
    name: '普通 (Public)',
    children: [
      { name: '文书档案', size: 400 },
      { name: '音像档案', size: 200 },
      { name: '村镇档案', size: 150 },
    ],
  },
  {
    name: '秘密 (Confidential)',
    children: [
      { name: '工程档案', size: 350 },
      { name: '财务审计', size: 100 },
    ],
  },
  {
    name: '机密 (Secret)',
    children: [
      { name: '招投标档案', size: 300 },
      { name: '重大项目', size: 80 },
    ],
  },
  {
    name: '绝密 (Top Secret)',
    children: [
      { name: '核心技术', size: 50 },
    ],
  },
];

const COLORS_TREEMAP = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#64748b', '#ef4444'];

const TreemapContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, name, value } = props;
  
  // Assign color based on the index
  const color = COLORS_TREEMAP[index % COLORS_TREEMAP.length];

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: '#fff',
          strokeWidth: 2,
          strokeOpacity: 1,
        }}
        rx={6}
        ry={6}
      />
      {width > 60 && height > 50 ? (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={14}
            fontWeight="bold"
            className="pointer-events-none select-none"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 14}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fillOpacity={0.95}
            className="pointer-events-none select-none"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {value}卷
          </text>
        </>
      ) : null}
    </g>
  );
};

export const StatisticsModule: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">档案利用统计分析</h2>
          <p className="text-slate-500">基于利用登记数据的多维可视化报表</p>
        </div>
        <div className="space-x-2">
           <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded text-sm hover:bg-slate-50 font-medium shadow-sm">导出年度报表</button>
           <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20">数据大屏模式</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: '本月利用总人次', value: '1,284', change: '环比 +12%', color: 'border-l-4 border-l-blue-500' },
          { label: '本月下载档案(卷)', value: '3,402', change: '环比 +8%', color: 'border-l-4 border-l-indigo-500' },
          { label: '本月打印档案(页)', value: '856', change: '环比 -5%', color: 'border-l-4 border-l-amber-500' },
          { label: '司法查询配合', value: '42 次', change: '本年度累计', color: 'border-l-4 border-l-red-500' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 ${stat.color} hover:shadow-md transition-shadow`}>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
               <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
               <span className={`text-xs px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                 {stat.change}
               </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Usage Trend (Download vs Print) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800">利用方式趋势 (下载 vs 打印)</h3>
             <span className="text-xs text-slate-400">近6个月数据</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA_METHOD_TREND}>
                <defs>
                  <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{fontSize: '12px'}}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '10px'}}/>
                <Area type="monotone" dataKey="download" name="下载(卷)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDownload)" />
                <Area type="monotone" dataKey="print" name="打印(页)" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPrint)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: User Identity Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800">利用人身份构成</h3>
             <span className="text-xs text-slate-400">基于有效身份证件统计</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA_USER_IDENTITY} layout="vertical" margin={{left: 20}}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f1f5f9" />
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#475569'}} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="value" name="人次" radius={[0, 4, 4, 0]} barSize={24}>
                    {DATA_USER_IDENTITY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Utilization Purpose Analysis */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">利用目的分析</h3>
          <div className="h-64 flex items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DATA_PURPOSE}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {DATA_PURPOSE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3 pl-4">
               {DATA_PURPOSE.map((entry, i) => (
                 <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: entry.color}}></div>
                      <span className="text-slate-600">{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{entry.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Chart 4: Archive Type Structure (Existing) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-6">热门馆藏分类</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DATA_BY_TYPE}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                 <Tooltip cursor={{fill: '#f8fafc'}} />
                 <Bar dataKey="value" name="调卷量" radius={[4, 4, 0, 0]} barSize={40} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Security & Type Treemap (NEW) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-bold text-slate-800">馆藏密级与类型分布 (Treemap)</h3>
             <span className="text-xs text-slate-400">矩形面积代表卷数</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={DATA_TREEMAP}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
                content={<TreemapContent />}
              />
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
