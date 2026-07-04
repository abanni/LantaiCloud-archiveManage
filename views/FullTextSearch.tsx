import React, { useState } from 'react';
import { Search, Layers, FileText, CheckSquare, Square } from 'lucide-react';
import { MOCK_ARCHIVES } from '../constants';
import { SelectionItem } from '../types';

interface FullTextSearchProps {
  basket: SelectionItem[];
  setBasket: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
}

export const FullTextSearch: React.FC<FullTextSearchProps> = ({ basket, setBasket }) => {
  const [keyword, setKeyword] = useState('');

  const isSelectedInBasket = (id: string) => basket.some(b => b.id === id);

  const handleToggleBasket = (item: any) => {
    if (isSelectedInBasket(item.id)) {
      setBasket(prev => prev.filter(b => b.id !== item.id));
    } else {
      setBasket(prev => [...prev, { id: item.id, title: item.title, type: 'VOLUME', code: item.archiveCode }]);
    }
  };

  const results = keyword.trim()
    ? MOCK_ARCHIVES.filter(item => {
        const key = keyword.toLowerCase();
        return (
          item.title.toLowerCase().includes(key) ||
          item.archiveCode.toLowerCase().includes(key) ||
          item.project.toLowerCase().includes(key) ||
          item.location.toLowerCase().includes(key) ||
          item.type.toLowerCase().includes(key)
        );
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Search Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 pb-3">
          <Search className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">全文检索</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="输入关键字检索（如：档案编号、项目名称、编制单位、存放位置等）..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 border border-transparent rounded-lg px-2.5 py-2.5 flex items-center font-bold"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">
            {keyword.trim() ? `检索结果 (${results.length} 条)` : '请输入关键字开始检索'}
          </span>
          {keyword.trim() && <span className="text-[10px] text-slate-400">勾选加入利用清单</span>}
        </div>

        {keyword.trim() ? (
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
                <FileText className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>未找到匹配「{keyword}」的档案</p>
                <p className="text-[10px] mt-1">请尝试其他关键字</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            <p>输入关键字开始全文检索</p>
            <p className="text-[10px] mt-1">支持档案编号、项目名称、编制单位等字段搜索</p>
          </div>
        )}
      </div>
    </div>
  );
};
