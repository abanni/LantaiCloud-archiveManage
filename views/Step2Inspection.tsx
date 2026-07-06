import React, { useState, useMemo } from 'react';
import { CheckCircle2, ChevronRight, ChevronDown, FolderOpen, Layers, Box, File } from 'lucide-react';
import { IngestTask } from '../types';
import archiveData from '../data/archiveData.json';

interface Step2InspectionProps {
  task: IngestTask;
  onBack: () => void;
  onProceed: () => void;
}

interface TreeNode {
  id: string;
  title: string;
  type: '项目级' | '工程级' | '案卷级' | '文件级';
  children?: TreeNode[];
  expanded?: boolean;
}

export const Step2Inspection: React.FC<Step2InspectionProps> = ({ task, onBack, onProceed }) => {
  // 从JSON数据构建树结构
  const treeData = useMemo(() => {
    const items = archiveData as any[];
    
    // 找到项目级节点
    const projectNode = items.find(item => item.tag === 'zj' && item.parent_id === '0');
    if (!projectNode) return [];

    // 找到工程级节点（parent_id = 项目级的file_id）
    const engineeringNodes = items.filter(item => item.tag === 'zj_item' && item.parent_id === projectNode.file_id);

    // 为每个工程级节点找到案卷级节点
    const buildTree = (parent: any, level: number): TreeNode => {
      const children: TreeNode[] = [];
      
      if (level === 0) {
        // 项目级
        engineeringNodes.forEach(eng => {
          children.push(buildTree(eng, 1));
        });
      } else if (level === 1) {
        // 工程级 - 找案卷级
        const volumeNodes = items.filter(item => item.tag === 'zj_volume' && item.parent_id === parent.file_id);
        volumeNodes.forEach(vol => {
          children.push(buildTree(vol, 2));
        });
      } else if (level === 2) {
        // 案卷级 - 找文件级
        const fileNodes = items.filter(item => item.tag === '' && item.file_type === 'file' && item.parent_id === parent.file_id);
        fileNodes.forEach(file => {
          children.push({
            id: file.file_id,
            title: file.file_name,
            type: '文件级',
          });
        });
      }

      const typeMap: Record<string, '项目级' | '工程级' | '案卷级' | '文件级'> = {
        'zj': '项目级',
        'zj_item': '工程级',
        'zj_volume': '案卷级',
        '': '文件级',
      };

      return {
        id: parent.file_id,
        title: parent.file_name,
        type: typeMap[parent.tag] || '文件级',
        children: children.length > 0 ? children : undefined,
        // 项目级和工程级默认展开，案卷级默认收拢
        expanded: level <= 1,
      };
    };

    return [buildTree(projectNode, 0)];
  }, []);

  const [expanded, setExpanded] = useState<string[]>(() => {
    // 默认展开项目级和工程级
    const defaultExpanded: string[] = [];
    treeData.forEach(project => {
      defaultExpanded.push(project.id);
      project.children?.forEach(eng => {
        defaultExpanded.push(eng.id);
      });
    });
    return defaultExpanded;
  });

  const [searchText, setSearchText] = useState('');

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filterTree = (nodes: TreeNode[]): TreeNode[] => {
    if (!searchText.trim()) return nodes;
    return nodes
      .map(node => {
        const children = node.children ? filterTree(node.children) : [];
        const match = node.title.toLowerCase().includes(searchText.toLowerCase());
        if (match || children.length > 0) {
          return { ...node, children: children.length > 0 ? children : node.children };
        }
        return null;
      })
      .filter(Boolean) as TreeNode[];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '项目级': return <FolderOpen size={14} className="text-blue-600" />;
      case '工程级': return <Layers size={14} className="text-indigo-600" />;
      case '案卷级': return <Box size={14} className="text-amber-600" />;
      case '文件级': return <File size={14} className="text-slate-500" />;
      default: return <File size={14} className="text-slate-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      '项目级': 'bg-blue-100 text-blue-700',
      '工程级': 'bg-emerald-100 text-emerald-700',
      '案卷级': 'bg-amber-100 text-amber-700',
      '文件级': 'bg-slate-100 text-slate-600',
    };
    return styles[type] || 'bg-slate-100 text-slate-600';
  };

  const renderTreeRow = (node: TreeNode, depth: number) => {
    const isExpanded = expanded.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <React.Fragment key={node.id}>
        <tr className="border-b border-slate-100 hover:bg-slate-50/50">
          <td className="px-4 py-2.5 w-1/2">
            <div className="flex items-center gap-2 truncate" style={{ paddingLeft: `${depth * 20}px` }}>
              {hasChildren ? (
                <button onClick={() => toggleExpand(node.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
              ) : <div className="w-4 shrink-0" />}
              {getTypeIcon(node.type)}
              <span className="text-xs text-slate-700 truncate">{node.title}</span>
            </div>
          </td>
          <td className="px-4 py-2.5 w-24">
            <span className={`text-[11px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${getTypeBadge(node.type)}`}>
              {node.type}
            </span>
          </td>
          <td className="px-4 py-2.5 text-[11px] text-emerald-600 font-medium">通过四性检测</td>
        </tr>
        {isExpanded && hasChildren && node.children!.map(child => renderTreeRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const filteredData = filterTree(treeData);
  const hasFilter = searchText.trim().length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center px-6 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">文件检测</h3>
            <p className="text-[11px] text-slate-500">{task.fileName} - 四性检测结果</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            ['真实性', task.validationResults.authenticity],
            ['完整性', task.validationResults.integrity],
            ['可用性', task.validationResults.usability],
            ['安全性', task.validationResults.safety],
          ].map(([label, passed]) => (
            <div key={label as string} className={`p-4 rounded-xl border ${passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {passed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <div className="w-[18px] h-[18px] rounded-full bg-red-500" />}
                <div>
                  <p className="text-xs font-bold text-slate-700">{label as string}</p>
                  <p className="text-[11px] text-slate-500">{passed ? '通过' : '未通过'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="按题名模糊搜索..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button onClick={() => setSearchText(searchText)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition whitespace-nowrap">
            搜索
          </button>
          <button onClick={() => { setSearchText(''); setExpanded([]); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition whitespace-nowrap">
            重置
          </button>
          {hasFilter && (
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              找到 {filteredData.reduce((n, item) => n + 1 + (item.children?.length || 0), 0)} 条
            </span>
          )}
        </div>

        <table className="w-full text-xs border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/2">题名</th>
              <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-24">种类</th>
              <th className="text-left px-4 py-2.5 font-semibold text-slate-600">检测描述</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400 text-xs">无匹配结果</td></tr>
            ) : (
              filteredData.map(node => renderTreeRow(node, 0))
            )}
          </tbody>
        </table>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button onClick={onBack} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs border border-slate-200">
            退回重新上传
          </button>
          <button onClick={onProceed}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center shadow">
            <CheckCircle2 size={14} className="mr-1.5" /> 进入著录
          </button>
        </div>
      </div>
    </div>
  );
};
