import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, X, CheckSquare, Square, Eye, Briefcase, FolderOpen, Layers, Box, File, Save } from 'lucide-react';
import { SelectionItem } from '../types';
import archiveData from '../data/archiveData.json';

const LEVEL_CONFIG = [
  { key: 'PROJECT', label: '项目级', icon: FolderOpen, color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  { key: 'UNIT', label: '工程级', icon: Layers, color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-200' },
  { key: 'VOLUME', label: '案卷级', icon: Box, color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  { key: 'FILE', label: '文件级', icon: File, color: 'bg-slate-100 text-slate-700', border: 'border-slate-200' },
];

const OPERATORS = [
  { label: '包含', value: 'includes' },
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'notEquals' },
  { label: '开始于', value: 'startsWith' },
  { label: '结束于', value: 'endsWith' },
];

interface SearchCondition {
  id: string;
  level: string;
  field: string;
  operator: string;
  value: string;
}

interface ComprehensiveSearchProps {
  basket: SelectionItem[];
  setBasket: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
}

function buildSearchIndex() {
  const items = archiveData as any[];
  const flat: any[] = [];

  // Build parent lookup for ancestry
  const parentMap = new Map<string, string>();
  items.forEach((i: any) => parentMap.set(i.file_id, i.parent_id));

  const getData = (item: any) => ({
    name: item.file_name || '',
    constructionCompany: item.construction_company || '',
    supervisorCompany: item.supervisor_company || '',
    compilationCompany: item.compilation_company || '',
    storagePeriod: item.storage_period || '',
    secrecyLevel: item.secrecy_level || '',
    builtArea: item.built_area || '',
    height: item.height || '',
    structureType: item.structure_type || '',
    underFloor: item.under_floor || '',
    upFloor: item.up_floor || '',
    startTime: item.start_time || '',
    endTime: item.end_time || '',
    docNo: item.doc_no || '',
    licenseNo: item.license_no || '',
    carrierType: item.carrier_type || '',
    archiveCode: item.archive_code || '',
    url: `/DemoFile1.pdf`,
  });

  // Project
  const proj = items.find((i: any) => i.tag === 'zj' && i.parent_id === '0');
  if (proj) flat.push({ id: proj.file_id, type: 'PROJECT', label: proj.file_name, data: getData(proj) });

  // Units
  items.filter((i: any) => i.tag === 'zj_item').forEach((u: any) => {
    flat.push({ id: u.file_id, type: 'UNIT', label: u.file_name, data: getData(u) });
    // Volumes
    items.filter((i: any) => i.tag === 'zj_volume' && i.parent_id === u.file_id).forEach((v: any) => {
      flat.push({ id: v.file_id, type: 'VOLUME', label: v.file_name, data: getData(v) });
      // Files
      items.filter((i: any) => i.file_type === 'file' && i.parent_id === v.file_id).forEach((f: any) => {
        flat.push({ id: f.file_id, type: 'FILE', label: f.file_name, data: getData(f) });
      });
    });
  });

  return flat;
}

const fieldMap: Record<string, { label: string; value: string }[]> = {
  PROJECT: [
    { label: '项目名称', value: 'name' },
    { label: '建设单位', value: 'constructionCompany' },
    { label: '监理单位', value: 'supervisorCompany' },
    { label: '设计单位', value: 'compilationCompany' },
    { label: '立项文号', value: 'docNo' },
    { label: '规划许可证号', value: 'licenseNo' },
  ],
  UNIT: [
    { label: '单位工程名称', value: 'name' },
    { label: '施工单位', value: 'constructionCompany' },
    { label: '质量监督单位', value: 'supervisorCompany' },
    { label: '建筑面积', value: 'builtArea' },
    { label: '结构类型', value: 'structureType' },
    { label: '开工时间', value: 'startTime' },
    { label: '竣工时间', value: 'endTime' },
  ],
  VOLUME: [
    { label: '案卷题名', value: 'name' },
    { label: '编制单位', value: 'compilationCompany' },
    { label: '保管期限', value: 'storagePeriod' },
    { label: '密级', value: 'secrecyLevel' },
    { label: '载体类型', value: 'carrierType' },
    { label: '卷内起始时间', value: 'startTime' },
    { label: '卷内终止时间', value: 'endTime' },
  ],
  FILE: [
    { label: '文件题名', value: 'name' },
    { label: '责任者', value: 'compilationCompany' },
    { label: '保管期限', value: 'storagePeriod' },
    { label: '密级', value: 'secrecyLevel' },
  ],
};

interface ComprehensiveSearchProps {
  basket: SelectionItem[];
  setBasket: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
}

export const ComprehensiveSearch: React.FC<ComprehensiveSearchProps> = ({ basket, setBasket }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['PROJECT', 'UNIT', 'VOLUME', 'FILE']);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [previewTab, setPreviewTab] = useState<'meta' | 'preview'>('meta');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [conditions, setConditions] = useState<SearchCondition[]>([]);
  const [advLevel, setAdvLevel] = useState('PROJECT');
  const [advField, setAdvField] = useState('name');
  const [advOperator, setAdvOperator] = useState('includes');
  const [advValue, setAdvValue] = useState('');
  const [previewWidth, setPreviewWidth] = useState(560);
  const [isDragging, setIsDragging] = useState(false);

  const flatItems = useMemo(() => buildSearchIndex(), []);

  const matchesSearch = (item: any): boolean => {
    if (!selectedLevels.includes(item.type)) return false;
    if (conditions.length > 0) {
      return conditions.every(cond => {
        if (cond.level !== item.type) return true;
        const val = (item.data[cond.field] || '').toString().toLowerCase();
        const sv = cond.value.toLowerCase();
        switch (cond.operator) {
          case 'includes': return val.includes(sv);
          case 'equals': return val === sv;
          case 'notEquals': return val !== sv;
          case 'startsWith': return val.startsWith(sv);
          case 'endsWith': return val.endsWith(sv);
          default: return true;
        }
      });
    }
    if (!searchTerm.trim()) return true;
    const kw = searchTerm.toLowerCase();
    return Object.values(item.data).some((v: any) => String(v).toLowerCase().includes(kw));
  };

  const filteredResults = useMemo(() => flatItems.filter(matchesSearch), [searchTerm, selectedLevels, conditions, flatItems]);

  // Preview drag resize
  React.useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const newW = window.innerWidth - e.clientX;
      setPreviewWidth(Math.max(300, Math.min(800, newW)));
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging]);

  const toggleLevel = (key: string) => setSelectedLevels(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const isInBasket = (id: string, type: string) => basket.some(item => item.id === id && item.type === type);

  const toggleBasket = (item: any) => {
    if (isInBasket(item.id, item.type)) {
      setBasket(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } else {
      setBasket(prev => [...prev, { id: item.id, type: item.type, title: item.label, code: item.data.archiveCode || item.data.docNo || '' }]);
    }
  };

  const addCondition = () => {
    if (!advValue.trim()) return;
    setConditions([...conditions, { id: Date.now().toString(), level: advLevel, field: advField, operator: advOperator, value: advValue }]);
    setAdvValue('');
  };

  const removeCondition = (id: string) => setConditions(conditions.filter(c => c.id !== id));

  const getFieldLabel = (level: string, field: string) => (fieldMap[level] || []).find(f => f.value === field)?.label || field;
  const getLevelConfig = (type: string) => LEVEL_CONFIG.find(l => l.key === type) || LEVEL_CONFIG[3];
  const getOperatorLabel = (val: string) => OPERATORS.find(op => op.value === val)?.label || val;

  const renderMetaPreview = (item: any) => {
    const level = getLevelConfig(item.type);
    const fields = fieldMap[item.type] || [];
    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className={`px-2 py-0.5 text-xs font-bold text-slate-700 text-center ${level.color}`}>
          {level.label} — {item.label}
        </div>
        <div className="divide-y divide-slate-200">
          {fields.map(f => (
            <div key={f.value} className="flex">
              <div className="w-[110px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">{f.label}</div>
              <div className="flex-1 px-1.5 py-1 bg-white text-xs text-slate-800">{item.data[f.value] || '-'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col relative h-full">
      {/* Header */}
      <div className="mb-4 space-y-3 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800">综合查询</h2>
          <p className="text-[11px] text-slate-500">跨4级联合检索 · 支持多条件高级筛选</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="输入关键词跨级检索..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} disabled={conditions.length > 0} />
            </div>
            <button onClick={() => setIsAdvancedOpen(true)}
              className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors ${conditions.length > 0 || isAdvancedOpen ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              <Filter size={15} className="mr-1.5" />高级筛选
              {conditions.length > 0 && <span className="ml-1.5 bg-white text-blue-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{conditions.length}</span>}
            </button>
          </div>
          <div className="flex items-center gap-3">
            {LEVEL_CONFIG.map(lc => {
              const checked = selectedLevels.includes(lc.key);
              return (
                <label key={lc.key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${checked ? lc.color + ' ' + lc.border : 'text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleLevel(lc.key)} className="sr-only" />
                  {React.createElement(lc.icon, { size: 13 })} {lc.label}
                </label>
              );
            })}
            <span className="text-[10px] text-slate-400 ml-auto">检索结果: {filteredResults.length} 条</span>
          </div>
        </div>
        {conditions.length > 0 && !isAdvancedOpen && (
          <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <span className="font-medium text-slate-700 mr-1">已应用条件:</span>
            {conditions.map(cond => (
              <div key={cond.id} className="bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded flex items-center shadow-sm">
                <span className="text-[10px] opacity-60 mr-1">{getLevelConfig(cond.level).label}</span>
                <span>{getFieldLabel(cond.level, cond.field)} {getOperatorLabel(cond.operator)} "{cond.value}"</span>
                <button onClick={() => removeCondition(cond.id)} className="ml-1.5 hover:text-red-500"><X size={11} /></button>
              </div>
            ))}
            <button onClick={() => setConditions([])} className="ml-auto text-slate-400 hover:text-slate-600 underline text-[10px]">清除所有</button>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Results */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-700">检索结果 ({filteredResults.length})</div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredResults.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Search size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs">未找到符合条件的档案</p>
              </div>
            ) : (
              filteredResults.map(item => {
                const lc = getLevelConfig(item.type);
                const Icon = lc.icon;
                const sel = selectedResult?.id === item.id;
                return (
                  <div key={item.id} className={`flex items-center p-2.5 rounded-lg border transition-colors cursor-pointer ${sel ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => { setSelectedResult(item); setPreviewTab('meta'); }}>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${lc.color}`}>
                        <Icon size={11} className="mr-0.5" />{lc.label}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs truncate ${sel ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>{item.label}</p>
                        {item.data.archiveCode && <p className="text-[10px] text-slate-400 font-mono truncate">{item.data.archiveCode}</p>}
                      </div>
                    </div>
                    <button onClick={() => toggleBasket(item)} className="text-[10px] shrink-0 mr-2">
                      {isInBasket(item.id, item.type) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} className="text-slate-300 hover:text-slate-400" />}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Drag handle */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className={`w-[5px] shrink-0 cursor-col-resize transition-colors ${isDragging ? 'bg-blue-400' : 'hover:bg-slate-200'} rounded`}
        />

        {/* Preview */}
        <div style={{ width: previewWidth }} className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden hidden md:flex">
          {selectedResult ? (
            <>
              <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  {React.createElement(getLevelConfig(selectedResult.type).icon, { size: 14, className: 'text-white shrink-0' })}
                  <h3 className="text-xs font-semibold text-white truncate">{selectedResult.label}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setPreviewTab('meta')} className={`px-2 py-1 text-[10px] rounded ${previewTab === 'meta' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Save size={11} className="inline mr-1" />元数据
                  </button>
                  {selectedResult.type === 'FILE' && (
                    <button onClick={() => setPreviewTab('preview')} className={`px-2 py-1 text-[10px] rounded ${previewTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                      <Eye size={11} className="inline mr-1" />预览
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-white overflow-y-auto p-3">
                {previewTab === 'meta' ? renderMetaPreview(selectedResult) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    {selectedResult.data.url ? <embed src={selectedResult.data.url} type="application/pdf" className="w-full" style={{ height: '50vh' }} /> : <div className="text-center py-12 text-slate-400 text-xs">暂无文件预览</div>}
                  </div>
                )}
              </div>
              <div className="p-2 bg-slate-900 border-t border-slate-700 flex gap-2">
                <button onClick={() => toggleBasket(selectedResult)} className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${isInBasket(selectedResult.id, selectedResult.type) ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                  {isInBasket(selectedResult.id, selectedResult.type) ? '✓ 已加入利用清单' : '+ 加入利用清单'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Eye size={36} className="mb-3 opacity-20" />
              <p className="text-xs">选择检索结果查看详情</p>
            </div>
          )}
        </div>
      </div>

      {/* Basket FAB */}
      {basket.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-slate-800 text-white pr-2 rounded-full shadow-2xl flex items-center gap-3 z-30 border border-slate-700">
          <div className="bg-blue-600 rounded-full w-9 h-9 flex items-center justify-center font-bold text-xs">{basket.length}</div>
          <div className="text-[11px]">
            <div className="font-bold">待利用清单</div>
            <div className="text-[9px] text-slate-400">{basket.filter(i => i.type === 'FILE').length} 文件 · {basket.filter(i => i.type === 'VOLUME').length} 案卷</div>
          </div>
        </div>
      )}

      {/* Advanced Search */}
      {isAdvancedOpen && (
        <div className="absolute inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" onClick={() => setIsAdvancedOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[520px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center"><Filter className="text-blue-600 mr-2" size={18} /><h3 className="font-bold text-sm text-slate-800">高级筛选</h3></div>
              <button onClick={() => setIsAdvancedOpen(false)}><X size={18} className="text-slate-400 hover:text-slate-600" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">添加条件</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">层级</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg text-xs" value={advLevel} onChange={e => { setAdvLevel(e.target.value); setAdvField('name'); }}>
                      {LEVEL_CONFIG.map(lc => <option key={lc.key} value={lc.key}>{lc.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">字段</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg text-xs" value={advField} onChange={e => setAdvField(e.target.value)}>
                      {(fieldMap[advLevel] || []).map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">操作符</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg text-xs" value={advOperator} onChange={e => setAdvOperator(e.target.value)}>
                      {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] font-medium text-slate-600 mb-1">值</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg text-xs" placeholder="输入关键词..." value={advValue} onChange={e => setAdvValue(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addCondition} disabled={!advValue.trim()} className="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg flex justify-center items-center"><Plus size={18} /></button>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {conditions.map(cond => (
                  <div key={cond.id} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getLevelConfig(cond.level).color}`}>{getLevelConfig(cond.level).label}</span>
                      <span className="font-medium text-slate-700">{getFieldLabel(cond.level, cond.field)}</span>
                      <span className="text-blue-600">{getOperatorLabel(cond.operator)}</span>
                      <span className="text-slate-800">"{cond.value}"</span>
                    </div>
                    <button onClick={() => removeCondition(cond.id)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setIsAdvancedOpen(false)} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow">应用筛选</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};