import React, { useState, useMemo, useCallback } from 'react';
import { Search, Sparkles, X, CheckSquare, Square, FileText, Eye, Save, Brain, FolderOpen, Layers, Box, File, Clock } from 'lucide-react';
import { SelectionItem } from '../types';
import fullTextIndex from '../data/fullTextIndex.json';
import archiveData from '../data/archiveData.json';

// Build 4-level items (same as ComprehensiveSearch)
function buildSearchIndex() {
  const items = archiveData as any[];
  const flat: any[] = [];
  const proj = items.find((i: any) => i.tag === 'zj' && i.parent_id === '0');
  if (proj) flat.push({ id: proj.file_id, type: 'PROJECT', label: proj.file_name, data: {} });
  items.filter((i: any) => i.tag === 'zj_item').forEach((u: any) => {
    flat.push({ id: u.file_id, type: 'UNIT', label: u.file_name, data: {} });
    items.filter((i: any) => i.tag === 'zj_volume' && i.parent_id === u.file_id).forEach((v: any) => {
      flat.push({ id: v.file_id, type: 'VOLUME', label: v.file_name, data: {} });
      items.filter((i: any) => i.file_type === 'file' && i.parent_id === v.file_id).forEach((f: any) => {
        flat.push({ id: f.file_id, type: 'FILE', label: f.file_name, data: {} });
      });
    });
  });
  return flat;
}

const LEVELS = [
  { key: 'PROJECT', label: '项目级', icon: FolderOpen, color: 'bg-blue-100 text-blue-700' },
  { key: 'UNIT', label: '工程级', icon: Layers, color: 'bg-indigo-100 text-indigo-700' },
  { key: 'VOLUME', label: '案卷级', icon: Box, color: 'bg-amber-100 text-amber-700' },
  { key: 'FILE', label: '文件级', icon: File, color: 'bg-slate-100 text-slate-700' },
];

// Simulate AI search process steps
const AI_STEPS = [
  { icon: Brain, text: 'AI 正在分析检索意图...' },
  { icon: Search, text: '正在提取关键词...' },
  { icon: FileText, text: '正在匹配元数据字段...' },
  { icon: Sparkles, text: '正在搜索档案正文内容...' },
  { icon: Clock, text: 'AI 正在生成摘要并计算相关度...' },
];

interface FullTextSearchProps {
  basket: SelectionItem[];
  setBasket: React.Dispatch<React.SetStateAction<SelectionItem[]>>;
}

export const FullTextSearch: React.FC<FullTextSearchProps> = ({ basket, setBasket }) => {
  const [keyword, setKeyword] = useState('');
  const [aiMode, setAiMode] = useState(true);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['PROJECT', 'UNIT', 'VOLUME', 'FILE']);
  const [isSearching, setIsSearching] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [previewTab, setPreviewTab] = useState<'meta' | 'preview'>('meta');
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const flatItems = useMemo(() => buildSearchIndex(), []);

  const isInBasket = (id: string, type: string) => basket.some(b => b.id === id && b.type === type);

  const toggleBasket = (item: any) => {
    if (isInBasket(item.id, item.type)) {
      setBasket(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } else {
      setBasket(prev => [...prev, { id: item.id, type: item.type, title: item.label, code: '' }]);
    }
  };

  const doSearch = useCallback((kw: string) => {
    if (!kw.trim()) { setResults([]); setHasSearched(false); return; }
    const isAi = aiMode;
    if (isAi) {
      setIsSearching(true);
      setAiStep(0);
      // Animate through AI steps
      const interval = setInterval(() => {
        setAiStep(prev => {
          if (prev >= AI_STEPS.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 400 + Math.random() * 300);

      // Simulate AI processing delay
      setTimeout(() => {
        clearInterval(interval);
        setAiStep(AI_STEPS.length - 1);
        setTimeout(() => {
          const indexData = fullTextIndex as any[];
          const kwl = kw.toLowerCase();

          // Search in full text index
          const fullTextMatches = indexData
            .filter(item => {
              if (!selectedLevels.includes(item.level)) return false;
              return (
                item.title.toLowerCase().includes(kwl) ||
                item.fullText.toLowerCase().includes(kwl) ||
                item.aiSummary.toLowerCase().includes(kwl)
              );
            })
            .map(item => {
              // Find matching paragraph
              const idx = item.fullText.toLowerCase().indexOf(kwl);
              let snippet = '';
              if (idx >= 0) {
                const start = Math.max(0, idx - 20);
                const end = Math.min(item.fullText.length, idx + kwl.length + 40);
                snippet = (start > 0 ? '...' : '') + item.fullText.substring(start, end) + (end < item.fullText.length ? '...' : '');
              }
              const titleMatch = item.title.toLowerCase().includes(kwl);
              return {
                ...item,
                type: 'FILE',
                label: item.title,
                snippet,
                matchType: titleMatch ? 'title' : 'text',
                confidence: item.confidence,
                data: {},
              };
            });

          // Search in metadata (4-level)
          const metaMatches = flatItems
            .filter(item => {
              if (!selectedLevels.includes(item.type)) return false;
              if (item.type === 'FILE') {
                // File-level items are already in fullTextIndex
                const inFT = fullTextMatches.some((f: any) => f.fileId === item.id);
                if (inFT) return false; // avoid duplicates
              }
              return item.label.toLowerCase().includes(kwl);
            })
            .map(item => ({
              ...item,
              snippet: '',
              matchType: 'meta',
              confidence: 0.75 + Math.random() * 0.15,
            }));

          const combined = [...fullTextMatches, ...metaMatches];
          setResults(combined);
          setIsSearching(false);
          setHasSearched(true);
        }, 600 + Math.random() * 400);
      }, 1500 + Math.random() * 800);
    } else {
      // Quick mode - no AI
      const indexData = fullTextIndex as any[];
      const kwl = kw.toLowerCase();
      const textMatches = indexData
        .filter(item => {
          if (!selectedLevels.includes(item.level)) return false;
          return item.title.toLowerCase().includes(kwl) || item.fullText.toLowerCase().includes(kwl);
        })
        .map(item => ({ ...item, type: 'FILE', label: item.title, snippet: item.fullText.substring(0, 80) + '...', matchType: 'text', confidence: 0.85, data: {} }));
      const metaMatches = flatItems
        .filter(item => selectedLevels.includes(item.type) && item.label.toLowerCase().includes(kwl))
        .map(item => ({ ...item, snippet: '', matchType: 'meta', confidence: 0.8, data: {} }));
      setResults([...textMatches, ...metaMatches]);
      setIsSearching(false);
      setHasSearched(true);
    }
  }, [aiMode, selectedLevels, flatItems]);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setResults([]);
    setHasSearched(false);
    setSelectedResult(null);
    doSearch(keyword);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const toggleLevel = (key: string) => setSelectedLevels(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);

  const highlightText = (text: string, kw: string) => {
    if (!kw.trim() || !text) return text;
    const regex = new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</span> : part
    );
  };

  return (
    <div className="flex flex-col relative h-full">
      {/* Header */}
      <div className="mb-4 space-y-3 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-blue-600" size={20} /> 全文检索
            </h2>
            <p className="text-[11px] text-slate-500">AI 智能全文搜索 · 元数据 + 档案正文联合检索</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text"
                placeholder={aiMode ? '✨ AI 全文检索：输入关键词，智能匹配元数据 + 档案正文...' : '输入关键词检索...'}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={keyword} onChange={e => setKeyword(e.target.value)} onKeyDown={handleKeyDown}
              />
            </div>
            <button onClick={handleSearch} disabled={isSearching || !keyword.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow">
              <Search size={14} /> 检索
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {LEVELS.map(lc => {
                const checked = selectedLevels.includes(lc.key);
                return (
                  <label key={lc.key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${checked ? lc.color + ' border-current' : 'text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleLevel(lc.key)} className="sr-only" />
                    {React.createElement(lc.icon, { size: 13 })} {lc.label}
                  </label>
                );
              })}
            </div>
            <label className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${aiMode ? 'bg-purple-100 text-purple-700 border-purple-200' : 'text-slate-400 border-slate-200 hover:bg-slate-50'}`}>
              <input type="checkbox" checked={aiMode} onChange={() => setAiMode(!aiMode)} className="sr-only" />
              <Brain size={13} /> AI 深度搜索
            </label>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Results */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* AI Analysis Animation */}
          {isSearching && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-20" />
                  <div className="relative w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain size={16} className="text-purple-600 animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-700">AI 正在分析</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} />
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {AI_STEPS.slice(0, aiStep + 1).map((step, i) => (
                      <div key={i} className="flex items-center gap-1 text-[10px] text-slate-500">
                        {i > 0 && <span className="text-slate-300 mx-0.5">→</span>}
                        {React.createElement(step.icon, { size: 11, className: 'text-purple-500' })}
                        <span className={i === aiStep ? 'text-purple-600 font-medium' : ''}>{step.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">
              {isSearching ? 'AI 检索中...' : hasSearched ? `检索结果 (${results.length} 条)` : '输入关键词开始检索'}
            </span>
            {hasSearched && aiMode && (
              <span className="text-[10px] text-purple-500 flex items-center gap-1">
                <Sparkles size={11} /> AI 深度搜索 · 含档案正文匹配
              </span>
            )}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!hasSearched && !isSearching ? (
              <div className="text-center py-16 text-slate-400">
                <Sparkles size={48} className="mx-auto mb-3 opacity-20 text-purple-300" />
                <p className="text-xs">输入关键词，AI 将搜索元数据和档案正文内容</p>
              </div>
            ) : results.length === 0 && !isSearching ? (
              <div className="text-center py-16 text-slate-400">
                <FileText size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-xs">未找到匹配「{keyword}」的档案</p>
              </div>
            ) : (
              results.map((item, idx) => {
                const isFile = item.type === 'FILE';
                const levelConf = LEVELS.find(l => l.key === item.type) || LEVELS[3];
                const Icon = levelConf.icon;
                const sel = selectedResult?.id === item.id;
                return (
                  <div key={item.id + '-' + idx} className={`p-3 rounded-lg border transition-colors cursor-pointer ${sel ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-purple-100'}`}
                    onClick={() => { setSelectedResult(item); setPreviewTab('meta'); }}>
                    <div className="flex items-start gap-2">
                      <button onClick={(e) => { e.stopPropagation(); toggleBasket(item); }} className="mt-0.5 shrink-0">
                        {isInBasket(item.id, item.type) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} className="text-slate-300 hover:text-slate-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${levelConf.color}`}>
                            <Icon size={11} className="mr-0.5" />{levelConf.label}
                          </span>
                          <span className="text-xs font-medium text-slate-800 truncate">{item.label}</span>
                          {aiMode && (
                            <span className="ml-auto flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full shrink-0">
                              <Brain size={10} /> {(item.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>

                        {/* AI Summary */}
                        {aiMode && item.aiSummary && (
                          <div className="text-[10px] text-slate-500 bg-purple-50/50 rounded p-1.5 mb-1.5 flex items-start gap-1.5">
                            <Sparkles size={11} className="text-purple-500 mt-0.5 shrink-0" />
                            <span>AI 摘要：{item.aiSummary}</span>
                          </div>
                        )}

                        {/* Ancestry path */}
                        {item.ancestry && item.ancestry.length > 0 && (
                          <div className="text-[9px] text-slate-400 mb-1 truncate">
                            📁 {item.ancestry.join(' → ')}
                          </div>
                        )}

                        {/* Matched snippet with highlight */}
                        {item.snippet ? (
                          <div className="text-[10px] text-slate-600 bg-slate-50 rounded p-1.5 font-mono leading-relaxed">
                            {highlightText(item.snippet, keyword)}
                          </div>
                        ) : item.matchType === 'meta' && (
                          <div className="text-[10px] text-slate-400">
                            <span className="text-blue-500">●</span> 元数据字段匹配
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-[480px] bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden hidden lg:flex">
          {selectedResult ? (
            <>
              <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                <h3 className="text-xs font-semibold text-white truncate">{selectedResult.label}</h3>
                {/* AI Summary Bar */}
                {aiMode && selectedResult.aiSummary && (
                  <div className="mt-2 text-[10px] text-purple-300 bg-purple-900/30 rounded p-1.5">
                    <Sparkles size={11} className="inline mr-1" />{selectedResult.aiSummary}
                  </div>
                )}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => setPreviewTab('meta')} className={`px-2 py-1 text-[10px] rounded ${previewTab === 'meta' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Save size={11} className="inline mr-1" />元数据
                  </button>
                  <button onClick={() => setPreviewTab('preview')} className={`px-2 py-1 text-[10px] rounded ${previewTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <Eye size={11} className="inline mr-1" />预览
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-white overflow-y-auto p-3">
                {previewTab === 'meta' ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-2 py-1 text-xs font-bold text-slate-700 bg-slate-100 text-center">基本信息</div>
                    <div className="divide-y divide-slate-200">
                      <div className="flex"><div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">题名</div><div className="flex-1 px-1.5 py-1 text-xs text-slate-800">{selectedResult.label}</div></div>
                      <div className="flex"><div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">级别</div><div className="flex-1 px-1.5 py-1 text-xs text-slate-800">{selectedResult.type}</div></div>
                      <div className="flex"><div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">相关度</div><div className="flex-1 px-1.5 py-1 text-xs text-slate-800">{(selectedResult.confidence * 100).toFixed(0)}%</div></div>
                      {selectedResult.aiSummary && (
                        <div className="flex"><div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">AI 摘要</div><div className="flex-1 px-1.5 py-1 text-xs text-slate-600">{selectedResult.aiSummary}</div></div>
                      )}
                      {selectedResult.fullText && (
                        <div className="flex"><div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">正文摘要</div><div className="flex-1 px-1.5 py-1 text-xs text-slate-600 leading-relaxed">{selectedResult.fullText}</div></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <embed src="/DemoFile1.pdf" type="application/pdf" className="w-full" style={{ height: '50vh' }} />
                  </div>
                )}
              </div>
              <div className="p-2 bg-slate-900 border-t border-slate-700">
                <button onClick={() => toggleBasket(selectedResult)}
                  className={`w-full py-1.5 rounded text-[10px] font-medium transition-colors ${isInBasket(selectedResult.id, selectedResult.type) ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                  {isInBasket(selectedResult.id, selectedResult.type) ? '✓ 已加入利用清单' : '+ 加入利用清单'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Sparkles size={36} className="mb-3 opacity-20" />
              <p className="text-xs">选择检索结果查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};