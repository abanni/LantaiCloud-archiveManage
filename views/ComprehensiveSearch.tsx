import React, { useState } from 'react';
import {
  Search, Layers, SlidersHorizontal, Plus, Eye,
  Building, HardHat, FileText, CheckSquare, Square
} from 'lucide-react';
import { MOCK_ARCHIVES } from '../constants';
import { SelectionItem } from '../types';

type Level = 'PROJECT' | 'UNIT' | 'VOLUME' | 'FILE';

const LEVEL_CONFIG: Record<Level, { label: string; icon: React.ReactNode }> = {
  PROJECT: { label: '项目级', icon: <Building className="w-3.5 h-3.5" /> },
  UNIT: { label: '工程级', icon: <HardHat className="w-3.5 h-3.5" /> },
  VOLUME: { label: '案卷级', icon: <Layers className="w-3.5 h-3.5" /> },
  FILE: { label: '文件级', icon: <FileText className="w-3.5 h-3.5" /> },
};

const LOGIC_OPERATORS = [
  { label: '包含', value: 'includes' },
  { label: '等于', value: 'equals' },
  { label: '不包含', value: 'excludes' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
];

interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  level: Level;
}

const PROJECT_FIELDS = [
  { label: '项目名称', value: 'title' },
  { label: '编制单位', value: 'project' },
  { label: '档号', value: 'archiveCode' },
  { label: '档案类型', value: 'type' },
];

const VOLUME_FIELDS = [
  { label: '案卷题名', value: 'title' },
  { label: '档号', value: 'archiveCode' },
  { label: '编制单位', value: 'project' },
  { label: '密级', value: 'securityLevel' },
  { label: '存放位置', value: 'location' },
  { label: '进馆日期', value: 'date' },
];

const COMBINED_FIELDS = [
  ...PROJECT_FIELDS.map(f => ({ ...f, level: 'PROJECT' as const, label: `[项目] ${f.label}` })),
  ...VOLUME_FIELDS.map(f => ({ ...f, level: 'VOLUME' as const, label: `[案卷] ${f.label}` })),
];

interface ComprehensiveSearchProps {
  basket: SelectionItem[];
  setBasket: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
}

export const ComprehensiveSearch: React.FC<ComprehensiveSearchProps> = ({ basket, setBasket }) => {
  const [activeLevels, setActiveLevels] = useState<Level[]>(['PROJECT', 'VOLUME']);
  const [queryConditions, setQueryConditions] = useState<QueryCondition[]>([
    { id: '1', field: 'title', operator: 'includes', value: '', level: 'VOLUME' }
  ]);

  const toggleLevel = (level: Level) => {
    setActiveLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const isSelectedInBasket = (id: string) => basket.some(b => b.id === id);

  const handleToggleBasket = (item: any) => {
    if (isSelectedInBasket(item.id)) {
      setBasket(prev => prev.filter(b => b.id !== item.id));
    } else {
      setBasket(prev => [...prev, { id: item.id, title: item.title, type: 'VOLUME', code: item.archiveCode }]);
    }
  };

  const applyFilters = () => {
    const activeConditions = queryConditions.filter(c => c.value.trim());
    if (activeConditions.length === 0) return MOCK_ARCHIVES;

    return MOCK_ARCHIVES.filter(item => {
      return activeConditions.every(cond => {
        const recordValue = (item as any)[cond.field]?.toString().toLowerCase() || '';
        const searchVal = cond.value.toLowerCase();
        switch (cond.operator) {
          case 'equals': return recordValue === searchVal;
          case 'excludes': return !recordValue.includes(searchVal);
          case 'gt': return parseFloat(recordValue) > parseFloat(searchVal);
          case 'lt': return parseFloat(recordValue) < parseFloat(searchVal);
          case 'includes': default: return recordValue.includes(searchVal);
        }
      });
    });
  };

  const results = applyFilters();

  return (
    <div className="space-y-6">
      {/* Conditions Console */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">智能检索</span>
        </div>

        {/* Level Toggles */}
        <div className="flex flex-wrap gap-2">
          {(['PROJECT', 'VOLUME'] as Level[]).map(level => {
            const cfg = LEVEL_CONFIG[level];
            const isActive = activeLevels.includes(level);
            return (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                    : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50 opacity-60'
                }`}
              >
                {cfg.icon}
                {cfg.label}查询
              </button>
            );
          })}
        </div>

        {/* Condition Editor */}
        <div className="space-y-3 pt-1">
          {queryConditions.map((cond, index) => (
            <div key={cond.id} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="w-full sm:w-[200px]">
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-700"
                  value={cond.field}
                  title="查询字段"
                  onChange={(e) => {
                    const next = [...queryConditions];
                    next[index].field = e.target.value;
                    next[index].value = '';
                    setQueryConditions(next);
                  }}
                >
                  {COMBINED_FIELDS.map(f => (
                    <option key={`${f.level}-${f.value}`} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-[120px]">
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-700"
                  value={cond.operator}
                  title="逻辑运算符"
                  onChange={(e) => {
                    const next = [...queryConditions];
                    next[index].operator = e.target.value;
                    setQueryConditions(next);
                  }}
                >
                  {LOGIC_OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="输入检索值..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                  value={cond.value}
                  onChange={(e) => {
                    const next = [...queryConditions];
                    next[index].value = e.target.value;
                    setQueryConditions(next);
                  }}
                />
              </div>

              {queryConditions.length > 1 && (
                <button
                  onClick={() => setQueryConditions(queryConditions.filter(c => c.id !== cond.id))}
                  className="p-1 px-2.5 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                >
                  删除
                </button>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                const firstField = COMBINED_FIELDS[0];
                setQueryConditions([...queryConditions, {
                  id: Date.now().toString(),
                  field: firstField.value,
                  operator: 'includes',
                  value: '',
                  level: firstField.level
                }]);
              }}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 hover:border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加条件</span>
            </button>

            <button
              onClick={() => setQueryConditions([{ id: '1', field: 'title', operator: 'includes', value: '', level: 'VOLUME' }])}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold cursor-pointer"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">检索结果 ({results.length} 条)</span>
          <span className="text-[10px] text-slate-400">勾选加入利用清单</span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.length > 0 ? results.map(item => {
            const inBasket = isSelectedInBasket(item.id);
            return (
              <div key={item.id} className={`p-4 rounded-xl border transition hover:shadow-sm flex gap-3 ${inBasket ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
                <div className="pt-0.5 shrink-0">
                  <button onClick={() => handleToggleBasket(item)} className="p-1 hover:bg-slate-100 rounded" title={inBasket ? '移除' : '加入利用清单'}>
                    {inBasket ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300" />}
                  </button>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 truncate">{item.title}</h4>
                    <span className={`px-1.5 py-0.5 border rounded text-[9px] font-bold shrink-0 ${
                      item.securityLevel === '普通' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>{item.securityLevel}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[10px] text-slate-500">
                    <span className="truncate">档号: {item.archiveCode}</span>
                    <span className="truncate">类型: {item.type}</span>
                    <span className="truncate">编制单位: {item.project}</span>
                    <span className="truncate">位置: {item.location}</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-2 py-16 text-center text-slate-400 text-xs">
              <Layers className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p>未检索到匹配的档案</p>
              <p className="text-[10px] mt-1">请调整查询条件后重试</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
