
import React, { useState } from 'react';
import { Search, Download, Filter, Plus, X, CheckSquare, Square, FolderDown, FileDown, Eye, Briefcase, ShoppingCart } from 'lucide-react';
import { MOCK_ARCHIVES } from '../constants';
import { ArchiveItem, SecurityLevel, SelectionItem } from '../types';

// --- Field Definitions ---
const FIELD_GROUPS = {
  BASIC: {
    label: '基础信息',
    fields: [
      { label: '案卷题名', value: 'title' },
      { label: '档号', value: 'archiveCode' },
      { label: '原档号', value: 'originalCode' },
      { label: '编制单位', value: 'project' },
      { label: '载体类型', value: 'type' },
      { label: '密级', value: 'securityLevel' },
      { label: '主题词', value: 'keywords' },
    ]
  },
  LOCATION: {
    label: '库房位置',
    fields: [
      { label: '存放位置', value: 'location' },
      { label: '存放地址列(箱)号', value: 'colNo' },
      { label: '存放地址节(柜)号', value: 'cabNo' },
      { label: '存放地址层号', value: 'layerNo' },
    ]
  },
  TIME: {
    label: '时间信息',
    fields: [
      { label: '进馆日期', value: 'date' },
      { label: '卷内文件起始时间', value: 'startTime' },
      { label: '卷内文件终止时间', value: 'endTime' },
      { label: '录入时间', value: 'entryTime' },
    ]
  },
  OTHER: {
    label: '其他属性',
    fields: [
      { label: '页数', value: 'pageCount' },
      { label: '备注', value: 'notes' },
      { label: '上传人员', value: 'uploader' }
    ]
  }
};

const ALL_FIELDS = Object.values(FIELD_GROUPS).flatMap(group => group.fields);

const OPERATORS = [
  { label: '包含', value: 'includes' },
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'notEquals' },
  { label: '大于', value: 'gt' },
  { label: '小于', value: 'lt' },
  { label: '开始于', value: 'startsWith' },
  { label: '结束于', value: 'endsWith' }
];

interface SearchCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: 'AND' | 'OR';
}

interface SearchModuleProps {
  basket: SelectionItem[];
  setBasket: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
  onNavigateToUtilize: () => void;
}

export const SearchModule: React.FC<SearchModuleProps> = ({ basket, setBasket, onNavigateToUtilize }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<ArchiveItem | null>(null);
  
  // Advanced Search State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [conditions, setConditions] = useState<SearchCondition[]>([]);
  const [currentField, setCurrentField] = useState(FIELD_GROUPS.BASIC.fields[0].value);
  const [currentOperator, setCurrentOperator] = useState(OPERATORS[0].value);
  const [currentValue, setCurrentValue] = useState('');

  // --- Filtering Logic ---
  const filteredArchives = MOCK_ARCHIVES.filter(archive => {
    const basicMatch = 
      archive.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      archive.archiveCode.toLowerCase().includes(searchTerm.toLowerCase());

    if (!isAdvancedOpen && conditions.length === 0) return basicMatch;

    if (conditions.length > 0) {
      return conditions.every(cond => {
        const dataValue = (archive as any)[cond.field]?.toString().toLowerCase() || '';
        const searchVal = cond.value.toLowerCase();
        switch (cond.operator) {
          case 'includes': return dataValue.includes(searchVal);
          case 'equals': return dataValue === searchVal;
          case 'notEquals': return dataValue !== searchVal;
          case 'startsWith': return dataValue.startsWith(searchVal);
          case 'endsWith': return dataValue.endsWith(searchVal);
          case 'gt': return dataValue > searchVal;
          case 'lt': return dataValue < searchVal;
          default: return true;
        }
      });
    }
    return basicMatch;
  });

  // --- Search Actions ---
  const addCondition = () => {
    if (!currentValue.trim()) return;
    setConditions([...conditions, {
      id: Date.now().toString(),
      field: currentField,
      operator: currentOperator,
      value: currentValue,
      logic: 'AND'
    }]);
    setCurrentValue('');
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  // --- Basket Logic ---
  const isInBasket = (id: string, type: 'FILE' | 'VOLUME' = 'FILE') => {
    return basket.some(item => item.id === id && item.type === type);
  };

  const toggleBasketItem = (archive: ArchiveItem, type: 'FILE' | 'VOLUME' = 'FILE') => {
    if (isInBasket(archive.id, type)) {
      setBasket(prev => prev.filter(item => !(item.id === archive.id && item.type === type)));
    } else {
      setBasket(prev => [...prev, {
        id: archive.id,
        type: type,
        title: archive.title,
        code: archive.archiveCode
      }]);
    }
  };

  const getFieldLabel = (val: string) => ALL_FIELDS.find(f => f.value === val)?.label || val;
  const getOperatorLabel = (val: string) => OPERATORS.find(op => op.value === val)?.label || val;

  return (
    <div className="flex flex-col relative">
      
      {/* Header & Search */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">档案查询检索</h2>
            <p className="text-slate-500">基于 Lucene/Elasticsearch 的全文检索引擎</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="快速检索：请输入关键词、档号或全文内容..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={conditions.length > 0} 
            />
          </div>
          
          <button 
            onClick={() => setIsAdvancedOpen(true)}
            className={`flex items-center px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors
              ${conditions.length > 0 || isAdvancedOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter size={18} className="mr-2" />
            高级筛选
            {conditions.length > 0 && (
              <span className="ml-2 bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {conditions.length}
              </span>
            )}
          </button>
        </div>
        
        {conditions.length > 0 && !isAdvancedOpen && (
          <div className="flex flex-wrap gap-2 items-center text-sm text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <span className="font-medium text-slate-700 mr-2">已应用条件:</span>
            {conditions.map((cond) => (
              <div key={cond.id} className="bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded flex items-center shadow-sm">
                <span>{getFieldLabel(cond.field)} {getOperatorLabel(cond.operator)} "{cond.value}"</span>
                <button onClick={() => removeCondition(cond.id)} className="ml-2 hover:text-red-500"><X size={12}/></button>
              </div>
            ))}
            <button onClick={() => setConditions([])} className="ml-auto text-slate-400 hover:text-slate-600 underline text-xs">清除所有</button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden relative">
        
        {/* Results List */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden transition-all duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <span className="font-semibold text-slate-700 text-sm">检索结果 ({filteredArchives.length})</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
               <span>排序: 相关度</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredArchives.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>未找到符合条件的档案</p>
              </div>
            ) : (
              filteredArchives.map(archive => (
                <div 
                  key={archive.id}
                  className={`p-4 rounded-lg border transition-all group hover:shadow-md flex items-start space-x-4
                    ${selectedArchive?.id === archive.id 
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                      : 'bg-white border-slate-100 hover:border-blue-100'}`}
                >
                  <div className="pt-1">
                    <button onClick={() => toggleBasketItem(archive, 'FILE')} title="加入利用清单">
                      {isInBasket(archive.id, 'FILE') 
                        ? <CheckSquare size={18} className="text-blue-600" /> 
                        : <Square size={18} className="text-slate-300 group-hover:text-slate-400" />}
                    </button>
                  </div>
                  
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedArchive(archive)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold text-sm ${selectedArchive?.id === archive.id ? 'text-blue-700' : 'text-slate-800'}`}>
                        {archive.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border
                        ${archive.securityLevel === SecurityLevel.SECRET || archive.securityLevel === SecurityLevel.TOP_SECRET
                          ? 'bg-red-50 text-red-600 border-red-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {archive.securityLevel}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-500">
                      <div className="flex items-center">
                        <span className="w-16 text-slate-400">档号:</span> 
                        <span className="font-mono">{archive.archiveCode}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-16 text-slate-400">位置:</span> 
                        <span>{archive.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/3 bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden relative hidden md:flex">
          {selectedArchive ? (
            <>
              <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center text-white">
                <div className="truncate pr-4">
                  <h3 className="font-semibold text-sm truncate">{selectedArchive.title}</h3>
                  <p className="text-xs text-slate-400">{selectedArchive.archiveCode}</p>
                </div>
              </div>

              {/* Document Preview */}
              <div className="flex-1 bg-white relative overflow-hidden flex flex-col items-center p-8 group">
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-10 select-none overflow-hidden" 
                     style={{ transform: 'rotate(-45deg) scale(1.5)' }}>
                  <div className="text-4xl font-black text-slate-900 whitespace-nowrap">
                    机密档案 • 仅供利用 • 兰台云-数智馆藏 • 
                  </div>
                </div>
                <div className="w-full h-full bg-white shadow-2xl border border-slate-200 p-8 text-[10px] text-slate-800 leading-relaxed overflow-hidden">
                  <h1 className="text-lg font-bold text-center mb-8 uppercase tracking-widest border-b-2 border-black pb-4">
                    {selectedArchive.project} <br/> 档案数字化副本
                  </h1>
                  <p className="mb-4 text-justify indent-8">
                    本文档内容为 {selectedArchive.title} 的电子映像。根据档案利用规定，下载或打印本件需经过严格的利用登记和授权流程。
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-slate-900 border-t border-slate-700 grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => toggleBasketItem(selectedArchive, 'VOLUME')}
                   className={`flex items-center justify-center p-2 rounded text-xs transition-colors
                     ${isInBasket(selectedArchive.id, 'VOLUME') ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                 >
                   {isInBasket(selectedArchive.id, 'VOLUME') ? <CheckSquare size={14} className="mr-2"/> : <FolderDown size={14} className="mr-2" />}
                   {isInBasket(selectedArchive.id, 'VOLUME') ? '已加入整卷' : '加入整卷'}
                 </button>
                 <button 
                   onClick={() => toggleBasketItem(selectedArchive, 'FILE')}
                   className={`flex items-center justify-center p-2 rounded text-xs transition-colors
                     ${isInBasket(selectedArchive.id, 'FILE') ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
                 >
                   {isInBasket(selectedArchive.id, 'FILE') ? <CheckSquare size={14} className="mr-2"/> : <FileDown size={14} className="mr-2" />}
                   {isInBasket(selectedArchive.id, 'FILE') ? '已加入文件' : '加入文件'}
                 </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Eye size={48} className="mb-4 opacity-20" />
              <p className="text-sm">请选择档案以查看详情</p>
            </div>
          )}
        </div>

        {/* Floating Shopping Cart / Basket */}
        {basket.length > 0 && (
          <div className="absolute bottom-6 right-6 bg-slate-800 text-white p-1 pr-2 rounded-full shadow-2xl flex items-center gap-4 z-30 animate-in slide-in-from-bottom-6 border border-slate-700">
            <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg shadow-blue-600/30">
              {basket.length}
            </div>
            <div className="text-sm">
               <div className="font-bold">档案待利用清单</div>
               <div className="text-[10px] text-slate-400">
                 {basket.filter(i => i.type === 'FILE').length} 文件, {basket.filter(i => i.type === 'VOLUME').length} 案卷
               </div>
            </div>
            <div className="h-8 w-px bg-slate-600 mx-2"></div>
            <button 
              onClick={onNavigateToUtilize}
              className="flex items-center bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full text-sm font-bold transition-colors mr-1"
            >
              <Briefcase size={16} className="mr-2" />
              去利用登记
            </button>
          </div>
        )}

        {/* Advanced Search Drawer */}
        {isAdvancedOpen && (
           <div className="absolute inset-0 z-40 overflow-hidden">
             <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px]" onClick={() => setIsAdvancedOpen(false)} />
             <div className="absolute inset-y-0 right-0 w-[600px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center">
                    <Filter className="text-blue-600 mr-2" size={20}/>
                    <h3 className="font-bold text-slate-800">高级筛选</h3>
                  </div>
                  <button onClick={() => setIsAdvancedOpen(false)}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                   <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 shadow-sm">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">添加条件</h4>
                     <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">字段</label>
                          <select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={currentField} onChange={(e) => setCurrentField(e.target.value)}>
                            {Object.values(FIELD_GROUPS).map(group => (
                              <optgroup key={group.label} label={group.label}>
                                {group.fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-1">
                           <label className="block text-xs font-medium text-slate-600 mb-1">逻辑</label>
                           <select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={currentOperator} onChange={(e) => setCurrentOperator(e.target.value)}>
                              {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                           </select>
                        </div>
                        <div className="col-span-1 flex items-end">
                            <button onClick={addCondition} disabled={!currentValue.trim()} className="w-full p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg flex justify-center items-center"><Plus size={20}/></button>
                        </div>
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-slate-600 mb-1">值</label>
                            <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="输入关键词..." value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />
                        </div>
                     </div>
                   </div>

                   <div className="space-y-2">
                    {conditions.map((cond, idx) => (
                      <div key={cond.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{getFieldLabel(cond.field)}</span>
                          <span className="text-blue-600 font-medium">{getOperatorLabel(cond.operator)}</span>
                          <span className="text-slate-800">"{cond.value}"</span>
                        </div>
                        <button onClick={() => removeCondition(cond.id)} className="text-slate-300 hover:text-red-500"><X size={16}/></button>
                      </div>
                    ))}
                   </div>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                   <button onClick={() => setIsAdvancedOpen(false)} className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">应用筛选</button>
                </div>
             </div>
           </div>
        )}
      </div>

    </div>
  );
};
