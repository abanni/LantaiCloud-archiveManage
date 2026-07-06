import React, { useState, useMemo } from 'react';
import { Search, Download, Filter, Plus, X, CheckSquare, Square, FolderDown, FileDown, Eye, Briefcase, ShoppingCart, FolderOpen, Layers, Box, File, Save } from 'lucide-react';
import archiveData from '../data/archiveData.json';
import { SelectionItem } from '../types';

const LEVEL_CONFIG = [
  { key: 'PROJECT', label: '项目级', icon: FolderOpen, color: 'bg-blue-100 text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-50' },
  { key: 'UNIT', label: '工程级', icon: Layers, color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', hover: 'hover:bg-indigo-50' },
  { key: 'VOLUME', label: '案卷级', icon: Box, color: 'bg-amber-100 text-amber-700', border: 'border-amber-200', hover: 'hover:bg-amber-50' },
  { key: 'FILE', label: '文件级', icon: File, color: 'bg-slate-100 text-slate-700', border: 'border-slate-200', hover: 'hover:bg-slate-50' },
];

const OPERATORS = [
  { label: '包含', value: 'includes' },
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'notEquals' },
  { label: '开始于', value: 'startsWith' },
  { label: '结束于', value: 'endsWith' },
];

// Index all items from archiveData
function buildSearchIndex() {
  const items = archiveData as any[];
  const index: any[] = [];

  const getData = (item: any, type: string) => {
    const base: Record<string, string> = {
      fileId: item.file_id,
      parentId: item.parent_id,
      name: item.file_name || '',
      originalName: item.original_name || '',
      docNo: item.doc_no || '',
      archiveCode: item.archive_code || '',
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
      orderNo: item.order_no || '',
      licenseNo: item.license_no || '',
      carrierType: item.carrier_type || '',
      volumeTitle: item.volume_title || '',
      url: `/DemoFile1.pdf`,
    };
    if (type === 'FILE') {
      base.url = `/DemoFile1.pdf`;
      base.textPage = item.text_page || '';
      base.drawingNum = item.drawing_num || '';
    }
    return base;
  };

  // Project
  const project = items.find((i: any) => i.tag === 'zj' && i.parent_id === '0');
  if (project) {
    index.push({ id: project.file_id, type: 'PROJECT', label: project.file_name, data: getData(project, 'PROJECT'), children: [] });
  }

  // Units
  const units = items.filter((i: any) => i.tag === 'zj_item');
  units.forEach((u: any) => {
    const unitEntry = { id: u.file_id, type: 'UNIT', label: u.file_name, data: getData(u, 'UNIT'), parentId: u.parent_id, children: [] as any[] };
    // Volumes
    const volumes = items.filter((i: any) => i.tag === 'zj_volume' && i.parent_id === u.file_id);
    volumes.forEach((v: any) => {
      const volEntry = { id: v.file_id, type: 'VOLUME', label: v.file_name, data: getData(v, 'VOLUME'), parentId: v.parent_id, children: [] as any[] };
      // Files
      const files = items.filter((i: any) => i.file_type === 'file' && i.parent_id === v.file_id);
      files.forEach((f: any) => {
        volEntry.children.push({ id: f.file_id, type: 'FILE', label: f.file_name, data: getData(f, 'FILE'), parentId: f.parent_id });
      });
      unitEntry.children.push(volEntry);
    });
    index.push(unitEntry);
  });

  return { project: index[0] || null, units: index.slice(1) };
}

// Flatten index for search
function flattenIndex(index: ReturnType<typeof buildSearchIndex>) {
  const flat: any[] = [];
  if (index.project) flat.push(index.project);
  for (const u of index.units) {
    flat.push(u);
    for (const v of u.children) {
      flat.push(v);
      for (const f of v.children) {
        flat.push(f);
      }
    }
  }
  return flat;
}

interface SearchCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  level: string;
}

interface SearchModuleProps {
  basket: SelectionItem[];
  setBasket: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
  onNavigateToUtilize: () => void;
}

export const SearchModule: React.FC<SearchModuleProps> = ({ basket, setBasket, onNavigateToUtilize }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['PROJECT', 'UNIT', 'VOLUME', 'FILE']);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [previewTab, setPreviewTab] = useState<'meta' | 'preview'>('meta');

  // Advanced Search
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [conditions, setConditions] = useState<SearchCondition[]>([]);
  const [advLevel, setAdvLevel] = useState('PROJECT');
  const [advField, setAdvField] = useState('name');
  const [advOperator, setAdvOperator] = useState('includes');
  const [advValue, setAdvValue] = useState('');

  const searchIndex = useMemo(() => buildSearchIndex(), []);
  const flatItems = useMemo(() => flattenIndex(searchIndex), [searchIndex]);

  // All searchable fields by level
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
      { label: '页次', value: 'textPage' },
    ],
  };

  const toggleLevel = (key: string) => {
    setSelectedLevels(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Check if a flat item matches search
  const matchesSearch = (item: any): boolean => {
    if (!selectedLevels.includes(item.type)) return false;

    // If conditions exist, use advanced matching
    if (conditions.length > 0) {
      return conditions.every(cond => {
        if (cond.level !== item.type) return true; // skip conditions for other levels
        const val = (item.data[cond.field] || '').toString().toLowerCase();
        const searchVal = cond.value.toLowerCase();
        switch (cond.operator) {
          case 'includes': return val.includes(searchVal);
          case 'equals': return val === searchVal;
          case 'notEquals': return val !== searchVal;
          case 'startsWith': return val.startsWith(searchVal);
          case 'endsWith': return val.endsWith(searchVal);
          default: return true;
        }
      });
    }

    // Quick search: match keyword across all fields
    if (!searchTerm.trim()) return true;
    const kw = searchTerm.toLowerCase();
    return Object.values(item.data).some((v: any) =>
      String(v).toLowerCase().includes(kw)
    );
  };

  const filteredResults = useMemo(() => flatItems.filter(matchesSearch), [searchTerm, selectedLevels, conditions, flatItems]);

  // Basket
  const isInBasket = (id: string, type: string) => basket.some(item => item.id === id && item.type === type);

  const toggleBasket = (item: any) => {
    if (isInBasket(item.id, item.type)) {
      setBasket(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } else {
      setBasket(prev => [...prev, { id: item.id, type: item.type, title: item.label, code: item.data.archiveCode || item.data.docNo || '' }]);
    }
  };

  // Advanced search helpers
  const addCondition = () => {
    if (!advValue.trim()) return;
    setConditions([...conditions, {
      id: Date.now().toString(),
      level: advLevel,
      field: advField,
      operator: advOperator,
      value: advValue,
    }]);
    setAdvValue('');
  };

  const removeCondition = (id: string) => setConditions(conditions.filter(c => c.id !== id));

  const getFieldLabel = (level: string, field: string) => {
    const fields = fieldMap[level] || [];
    return fields.find(f => f.value === field)?.label || field;
  };

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
    <div className="flex flex-col relative">
      {/* Header */}
      <div className="mb-4 space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">档案查询检索</h2>
          <p className="text-[11px] text-slate-500">跨4级联合检索 · 支持多条件高级筛选</p>
        </div>

        {/* Search bar + Level filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text"
                placeholder="输入关键词跨级检索..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={conditions.length > 0}
              />
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
                <label key={lc.key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${checked ? `${lc.color} ${lc.border}` : 'text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleLevel(lc.key)} className="sr-only" />
                  <lc.icon size={13} />
                  {lc.label}
                </label>
              );
            })}
            <span className="text-[10px] text-slate-400 ml-auto">
              检索结果: {filteredResults.length} 条
            </span>
          </div>
        </div>

        {conditions.length > 0 && !isAdvancedOpen && (
          <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <span className="font-medium text-slate-700 mr-1">已应用条件:</span>
            {conditions.map((cond) => (
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

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Results List */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="font-semibold text-slate-700 text-xs">检索结果 ({filteredResults.length})</span>
          </div>
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
                  <div key={item.id}
                    className={`flex items-center p-2.5 rounded-lg border transition-colors cursor-pointer ${sel ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-blue-100'}`}>
                    <button onClick={() => toggleBasket(item)} className="mr-2 shrink-0" title="加入利用清单">
                      {isInBasket(item.id, item.type)
                        ? <CheckSquare size={16} className="text-blue-600" />
                        : <Square size={16} className="text-slate-300 hover:text-slate-400" />}
                    </button>
                    <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => { setSelectedResult(item); setPreviewTab('meta'); }}>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${lc.color}`}>
                        <Icon size={11} className="mr-0.5" />{lc.label}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs truncate ${sel ? 'text-blue-700 font-medium' : 'text-slate-800'}`}>{item.label}</p>
                        {item.data.archiveCode && <p className="text-[10px] text-slate-400 font-mono truncate">{item.data.archiveCode}</p>}
                      </div>
                    </div>
                    {item.type === 'FILE' && (
                      <button onClick={(e) => { e.stopPropagation(); setSelectedResult(item); setPreviewTab('preview'); }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 shrink-0 ml-2">预览</button>
                    )}
                    <button onClick={() => toggleBasket(item)} className="text-[10px] text-slate-400 hover:text-blue-600 shrink-0 ml-2">
                      {isInBasket(item.id, item.type) ? '已加入' : '加入'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-[360px] bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden hidden md:flex">
          {selectedResult ? (
            <>
              <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2 mb-2">
                  {React.createElement(getLevelConfig(selectedResult.type).icon, { size: 14, className: 'text-white shrink-0' })}
                  <h3 className="text-xs font-semibold text-white truncate">{selectedResult.label}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setPreviewTab('meta')}
                    className={`px-2 py-1 text-[10px] rounded ${previewTab === 'meta' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Save size={11} className="inline mr-1" />元数据
                  </button>
                  {selectedResult.type === 'FILE' && (
                    <button onClick={() => setPreviewTab('preview')}
                      className={`px-2 py-1 text-[10px] rounded ${previewTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                      <Eye size={11} className="inline mr-1" />预览
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-white overflow-y-auto p-3">
                {previewTab === 'meta' ? renderMetaPreview(selectedResult) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    {selectedResult.data.url ? (
                      <embed src={selectedResult.data.url} type="application/pdf" className="w-full" style={{ height: '50vh' }} />
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">暂无文件预览</div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-2 bg-slate-900 border-t border-slate-700 flex gap-2">
                <button onClick={() => toggleBasket(selectedResult)}
                  className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${isInBasket(selectedResult.id, selectedResult.type) ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
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

        {/* Floating Basket */}
        {basket.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-slate-800 text-white p-1 pr-2 rounded-full shadow-2xl flex items-center gap-3 z-30 border border-slate-700">
            <div className="bg-blue-600 rounded-full w-9 h-9 flex items-center justify-center font-bold text-xs">{basket.length}</div>
            <div className="text-[11px]">
              <div className="font-bold">待利用清单</div>
              <div className="text-[9px] text-slate-400">
                {basket.filter(i => i.type === 'FILE').length} 文件 · {basket.filter(i => i.type === 'VOLUME').length} 案卷
              </div>
            </div>
            <button onClick={onNavigateToUtilize}
              className="flex items-center bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors">
              <Briefcase size={14} className="mr-1.5" />去利用登记
            </button>
          </div>
        )}

        {/* Advanced Search Drawer */}
        {isAdvancedOpen && (
          <div className="absolute inset-0 z-40 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" onClick={() => setIsAdvancedOpen(false)} />
            <div className="absolute inset-y-0 right-0 w-[520px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center">
                  <Filter className="text-blue-600 mr-2" size={18} />
                  <h3 className="font-bold text-sm text-slate-800">高级筛选</h3>
                </div>
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
                      <button onClick={addCondition} disabled={!advValue.trim()}
                        className="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg flex justify-center items-center">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {conditions.map((cond) => (
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
    </div>
  );
};