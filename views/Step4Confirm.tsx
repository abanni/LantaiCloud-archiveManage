import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, FolderOpen, Check, X, Layers, Box, File } from 'lucide-react';
import archiveData from '../data/archiveData.json';
import { getMajorTypes, getSubTypes, getDetailTypes, hasChildren, findById, formatTypePath } from '../data/archiveTypes';

interface Step4ConfirmProps {
  taskName: string;
  onReturn: () => void;
  onConfirm: () => void;
}

interface TreeItem {
  id: string;
  title: string;
  level: string;
  archiveCode: string;
  totalRegNo: string;
  classSerialNo: string;
  volumeCode: string;
  children?: TreeItem[];
  expanded?: boolean;
}

function pad(n: string, w = 3): string {
  return String(n).padStart(w, '0');
}

// Build full tree from JSON with 4 levels (codes initially empty)
function buildArchiveTree(): TreeItem[] {
  const items = archiveData as any[];
  const projectNode = items.find((item: any) => item.tag === 'zj' && item.parent_id === '0');
  if (!projectNode) return [];

  const projSerial = '029605';
  const projCode = `I1-1-${projSerial}`;

  // Project level
  const projectItem: TreeItem = {
    id: projectNode.file_id,
    title: projectNode.file_name,
    level: '项目级',
    archiveCode: '-',
    totalRegNo: '-',
    classSerialNo: '-',
    volumeCode: '-',
    expanded: true,
    children: [],
  };

  // Unit level
  const units = items.filter((item: any) => item.tag === 'zj_item' && item.parent_id === projectNode.file_id);
  units.sort((a: any, b: any) => (parseInt(a.order_no) || 0) - (parseInt(b.order_no) || 0));

  units.forEach((unit: any) => {
    const uOrder = pad(unit.order_no || '1');
    const unitCode = `${projCode}-${uOrder}`;

    const unitItem: TreeItem = {
      id: unit.file_id,
      title: unit.file_name,
      level: '工程级',
      archiveCode: '-',
      totalRegNo: '-',
      classSerialNo: '-',
      volumeCode: '-',
      expanded: true,
      children: [],
    };

    // Volume level
    const volumes = items.filter((item: any) => item.tag === 'zj_volume' && item.parent_id === unit.file_id);
    volumes.sort((a: any, b: any) => (parseInt(a.order_no) || 0) - (parseInt(b.order_no) || 0));

    volumes.forEach((vol: any) => {
      const vOrder = pad(vol.order_no || '1');
      const volCode = `${projCode}-${uOrder}-${vOrder}`;

      const volItem: TreeItem = {
        id: vol.file_id,
        title: vol.file_name,
        level: '案卷级',
        archiveCode: '-',
        totalRegNo: '-',
        classSerialNo: '-',
        volumeCode: '-',
        expanded: false,
        children: [],
      };

      // File level
      const files = items.filter((item: any) => item.file_type === 'file' && item.parent_id === vol.file_id);
      files.sort((a: any, b: any) => (parseInt(a.order_no) || 0) - (parseInt(b.order_no) || 0));

      files.forEach((file: any, fi: number) => {
        const fOrder = pad(String(fi + 1), 3);
        volItem.children!.push({
          id: file.file_id,
          title: file.file_name || file.original_name || '未命名文件',
          level: '文件级',
          archiveCode: '-',
          totalRegNo: '-',
          classSerialNo: '-',
          volumeCode: '-',
        });
      });

      unitItem.children!.push(volItem);
    });

    projectItem.children!.push(unitItem);
  });

  return [projectItem];
}

// Generate codes for all nodes in the tree (returns a new tree)
function generateCodes(tree: TreeItem[]): TreeItem[] {
  const projSerial = '029605';
  const projCode = `I1-1-${projSerial}`;
  let regNoCounter = 507575;
  let classSerialCounter = 281607;
  let volCodeCounter = 193607;

  const walk = (nodes: TreeItem[], parentCode: string): TreeItem[] => {
    return nodes.map((node, idx) => {
      if (node.level === '项目级') {
        return { ...node, archiveCode: projCode, children: walk(node.children || [], projCode) };
      }
      if (node.level === '工程级') {
        const order = (idx + 1).toString().padStart(3, '0');
        const code = `${parentCode}-${order}`;
        return { ...node, archiveCode: code, children: walk(node.children || [], code) };
      }
      if (node.level === '案卷级') {
        const order = (idx + 1).toString().padStart(3, '0');
        const code = `${parentCode}-${order}`;
        return {
          ...node,
          archiveCode: code,
          totalRegNo: String(regNoCounter++),
          classSerialNo: `I-${classSerialCounter++}`,
          volumeCode: `I1-1-${volCodeCounter++}`,
          children: walk(node.children || [], code),
        };
      }
      if (node.level === '文件级') {
        const order = (idx + 1).toString().padStart(3, '0');
        return { ...node, archiveCode: `${parentCode}-${order}` };
      }
      return node;
    });
  };

  return walk(tree, '');
}

export const Step4Confirm: React.FC<Step4ConfirmProps> = ({ taskName, onReturn, onConfirm }) => {
  const [majorId, setMajorId] = useState<number>(0);
  const [subId, setSubId] = useState<number>(0);
  const [detailId, setDetailId] = useState<number>(0);
  const [codesGenerated, setCodesGenerated] = useState(false);
  const [treeData, setTreeData] = useState<TreeItem[]>(() => buildArchiveTree());
  const [expandedIds, setExpandedIds] = useState<string[]>(() => {
    // Default: PROJECT(0), UNIT(1), VOLUME(2) expanded; FILE(3) collapsed
    const result: string[] = [];
    const walk = (nodes: TreeItem[], depth: number) => {
      nodes.forEach(n => {
        if (depth <= 1) result.push(n.id);
        if (n.children) walk(n.children, depth + 1);
      });
    };
    const tree = buildArchiveTree();
    walk(tree, 0);
    return result;
  });

  const majorTypes = getMajorTypes();
  const subTypes = majorId > 0 ? getSubTypes(majorId) : [];
  const detailTypes = subId > 0 ? getDetailTypes(subId) : [];

  const selectedMajor = majorId > 0 ? findById(majorId) : null;
  const selectedSub = subId > 0 ? findById(subId) : null;
  const selectedDetail = detailId > 0 ? findById(detailId) : null;

  // Check if enough archive types are selected
  const typesComplete = ((): boolean => {
    if (majorId <= 0) return false;
    if (hasChildren(majorId) && subId <= 0) return false;
    if (subId > 0 && hasChildren(subId) && detailId <= 0) return false;
    return true;
  })();

  const handleMajorChange = (id: number) => { setMajorId(id); setSubId(0); setDetailId(0); setCodesGenerated(false); };
  const handleSubChange = (id: number) => { setSubId(id); setDetailId(0); setCodesGenerated(false); };
  const handleDetailChange = (id: number) => { setDetailId(id); setCodesGenerated(false); };

  const handleGenerateCodes = () => {
    const base = buildArchiveTree();
    const coded = generateCodes(base);
    setTreeData(coded);
    setCodesGenerated(true);
  };

  const handleResetCodes = () => {
    setTreeData(buildArchiveTree());
    setCodesGenerated(false);
  };

  const handleConfirm = () => {
    if (codesGenerated) {
      onConfirm();
    }
  };

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const isExpanded = (id: string) => expandedIds.includes(id);

  const tree = treeData;

  // Count all items (for the badge)
  const totalCount = useMemo(() => {
    let count = 0;
    const countAll = (nodes: TreeItem[]) => {
      nodes.forEach(n => { count++; if (n.children) countAll(n.children); });
    };
    countAll(tree);
    return count;
  }, [tree]);

  // Count by level
  const levelCounts = useMemo(() => {
    let units = 0, volumes = 0, files = 0;
    const walk = (nodes: TreeItem[], depth: number) => {
      nodes.forEach(n => {
        if (depth === 1) units++;
        else if (depth === 2) volumes++;
        else if (depth === 3) files++;
        if (n.children) walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    return { units, volumes, files };
  }, [tree]);

  const levelColor = (lvl: string) => {
    if (lvl === '项目级') return 'bg-blue-100 text-blue-700';
    if (lvl === '工程级') return 'bg-emerald-100 text-emerald-700';
    if (lvl === '案卷级') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  const levelIcon = (lvl: string) => {
    if (lvl === '项目级') return <FolderOpen size={14} className="text-blue-600 shrink-0" />;
    if (lvl === '工程级') return <Layers size={14} className="text-indigo-600 shrink-0" />;
    if (lvl === '案卷级') return <Box size={14} className="text-amber-600 shrink-0" />;
    return <File size={14} className="text-slate-500 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      {/* Archive Type Confirmation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
          <div className="flex items-center mb-3">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 mr-3">
              <FolderOpen size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">档案类型确认</h4>
              <p className="text-[11px] text-slate-500">请选择一、二、三类以确定档案分类号</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">一类</label>
              <select value={majorId} onChange={(e) => handleMajorChange(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500">
                <option value={0}>-- 请选择一类 --</option>
                {majorTypes.map(t => <option key={t.id} value={t.id}>{t.classCode} {t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">二类</label>
              <select value={subId} onChange={(e) => handleSubChange(Number(e.target.value))}
                disabled={subTypes.length === 0}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500">
                <option value={0}>-- 请选择二类 --</option>
                {subTypes.map(t => <option key={t.id} value={t.id}>{t.classCode} {t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">三类</label>
              <select value={detailId} onChange={(e) => handleDetailChange(Number(e.target.value))}
                disabled={detailTypes.length === 0}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500">
                <option value={0}>-- 请选择三类 --</option>
                {detailTypes.map(t => <option key={t.id} value={t.id}>{t.classCode} {t.name}</option>)}
              </select>
            </div>
          </div>
          {selectedMajor && (
            <div className="mt-3 pt-3 border-t border-yellow-200/60 flex items-center justify-between">
              <div className="text-[11px] text-slate-600">
                已选：<span className="bg-white px-2 py-0.5 rounded border border-yellow-200 text-amber-700 font-medium">{formatTypePath(majorId, subId || undefined, detailId || undefined)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleGenerateCodes} disabled={!typesComplete || codesGenerated}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${typesComplete && !codesGenerated ? 'bg-blue-600 text-white hover:bg-blue-700 shadow' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  更新档号
                </button>
                <button onClick={handleResetCodes}
                  disabled={!codesGenerated}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-colors ${codesGenerated ? 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50' : 'border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed'}`}>
                  重置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Archive List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">待入库档案列表</h3>
              <p className="text-[11px] text-slate-500">请确认著录信息无误后，点击"确认入库"完成归档</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{levelCounts.units} 个工程</span>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{levelCounts.volumes} 个案卷</span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{levelCounts.files} 个文件</span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <button onClick={onReturn}
                className="px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
                取消
              </button>
              <button onClick={handleConfirm}
                disabled={!codesGenerated}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow transition-colors ${codesGenerated ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                确认入库
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 min-w-[260px]">题名</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-[80px]">种类</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 min-w-[180px]">档号</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-[100px]">总登记号</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 w-[110px]">大类流水号</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 min-w-[140px]">案卷档号</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(() => {
                const renderRows = (nodes: TreeItem[], depth: number): React.ReactNode[] => {
                  return nodes.flatMap((node) => {
                    const exp = isExpanded(node.id);
                    const hasCh = node.children && node.children.length > 0;
                    const rows: React.ReactNode[] = [
                      <tr key={node.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5" style={{ paddingLeft: `${depth * 20 + 12}px` }}>
                          <div className="flex items-center gap-1.5">
                            {hasCh ? (
                              <button onClick={() => toggleExpand(node.id)}
                                className="text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer">
                                <ChevronRight size={13} className={`transition-transform ${exp ? 'rotate-90' : ''}`} />
                              </button>
                            ) : (
                              <span className="w-[13px] shrink-0" />
                            )}
                            {levelIcon(node.level)}
                            <span className="truncate text-slate-800 font-medium">{node.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${levelColor(node.level)}`}>
                            {node.level}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{node.archiveCode}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{node.totalRegNo}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{node.classSerialNo}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{node.volumeCode}</td>
                      </tr>,
                    ];
                    if (hasCh && exp) {
                      rows.push(...renderRows(node.children!, depth + 1));
                    }
                    return rows;
                  });
                };
                return renderRows(tree, 0);
              })()}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onReturn}
            className="px-5 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <X size={14} /> 取消
          </button>
          <button onClick={handleConfirm}
            disabled={!codesGenerated}
            className={`px-5 py-2 rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-1.5 ${codesGenerated ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            <Check size={14} /> 确认入库
          </button>
        </div>
      </div>
    </div>
  );
};
