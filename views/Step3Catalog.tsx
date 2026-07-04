import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, Save, FolderOpen, Layers, Box, File } from 'lucide-react';
import { getMajorTypes, getSubTypes, getDetailTypes, hasChildren, findById, formatTypePath } from '../data/archiveTypes';

type NodeType = 'PROJECT' | 'UNIT' | 'VOLUME' | 'FILE';

interface MetadataNode {
  id: string;
  type: NodeType;
  label: string;
  expanded?: boolean;
  data: Record<string, string>;
  children?: MetadataNode[];
}

interface Step3CatalogProps {
  treeData: MetadataNode;
  selectedNode: MetadataNode;
  onSelectNode: (node: MetadataNode) => void;
  onComplete: () => void;
  onGoToArchive: () => void;
  onCancel: () => void;
}

// ─── Field definitions parsed from data/*.txt ───

interface FieldDef { label: string; key: string; span?: string; isTextarea?: boolean; }
interface CategoryDef { name: string; fields: FieldDef[]; }

const PROJECT_FIELDS: CategoryDef[] = [
  { name: '基本信息', fields: [
    { label: '工程名称', key: 'projectName', span: 'col-span-3' },
    { label: '工程地点', key: 'address', span: 'col-span-3' },
  ]},
  { name: '责任者', fields: [
    { label: '建设单位', key: 'constructionUnit', span: 'col-span-2' },
    { label: '立项批准单位', key: 'approvalUnit', span: 'col-span-2' },
    { label: '设计单位', key: 'designUnit', span: 'col-span-2' },
    { label: '勘察单位', key: 'surveyUnit', span: 'col-span-3' },
    { label: '监理单位', key: 'supervisionUnit', span: 'col-span-3' },
  ]},
  { name: '文件项目', fields: [
    { label: '立项批准文号', key: 'approvalNo', span: 'col-span-2' },
    { label: '工程规划许可证号', key: 'planPermitNo', span: 'col-span-2' },
    { label: '用地规划许可证号', key: 'landPlanPermitNo', span: 'col-span-2' },
    { label: '用地许可证号', key: 'landUsePermitNo', span: 'col-span-3' },
    { label: '施工许可证号', key: 'workPermitNo', span: 'col-span-3' },
  ]},
  { name: '专业记载（单位工程）', fields: [
    { label: '单位工程名称', key: 'unitProjectName', span: 'col-span-6' },
    { label: '施工单位', key: 'constructionOrg', span: 'col-span-3' },
    { label: '建筑面积(m²)', key: 'area', span: 'col-span-1' },
    { label: '高度(m)', key: 'height', span: 'col-span-1' },
    { label: '地下层数', key: 'layerUnder', span: 'col-span-1' },
    { label: '地上层数', key: 'layerAbove', span: 'col-span-1' },
    { label: '结构类型', key: 'structure', span: 'col-span-2' },
    { label: '开工时间', key: 'startDate', span: 'col-span-3' },
    { label: '竣工时间', key: 'endDate', span: 'col-span-3' },
  ]},
  { name: '财务信息', fields: [
    { label: '总用地面积', key: 'totalLandArea', span: 'col-span-2' },
    { label: '总建筑面积', key: 'totalBuildingArea', span: 'col-span-2' },
    { label: '幢数', key: 'buildingCount', span: 'col-span-2' },
    { label: '工程造价', key: 'budget', span: 'col-span-3' },
    { label: '工程结算', key: 'settlement', span: 'col-span-3' },
  ]},
  { name: '档案状况', fields: [
    { label: '总卷数', key: 'volCount', span: 'col-span-2' },
    { label: '文字(卷)', key: 'textVol', span: 'col-span-2' },
    { label: '图纸(卷)', key: 'drawingVol', span: 'col-span-2' },
    { label: '底图(张)', key: 'statDrawing', span: 'col-span-2' },
    { label: '竣工图(张)', key: 'statFinishedDrawing', span: 'col-span-2' },
    { label: '照片(张)', key: 'statPhoto', span: 'col-span-2' },
    { label: '底片(张)', key: 'statNegative', span: 'col-span-2' },
    { label: '录音带(盒)', key: 'statAudio', span: 'col-span-2' },
    { label: '录像带(盒)', key: 'statVideo', span: 'col-span-2' },
    { label: '光盘(张)', key: 'statDisk', span: 'col-span-2' },
    { label: '计算机磁带(盒)', key: 'statComputerTape', span: 'col-span-2' },
    { label: '计算机磁盘(盒)', key: 'statFloppyDisk', span: 'col-span-2' },
    { label: '缩微片', key: 'statMicro', span: 'col-span-2' },
    { label: '盘张', key: 'diskSheets', span: 'col-span-2' },
    { label: '其他', key: 'statOther', span: 'col-span-2' },
  ]},
  { name: '保管信息', fields: [
    { label: '保管期限', key: 'retention', span: 'col-span-2' },
    { label: '密级', key: 'security', span: 'col-span-2' },
    { label: '进馆日期', key: 'entryDate', span: 'col-span-2' },
    { label: '移交单位', key: 'handoverUnit', span: 'col-span-6' },
  ]},
  { name: '排检与编号', fields: [
    { label: '档号', key: 'archiveCode', span: 'col-span-2' },
    { label: '质监号', key: 'qualitySupervisionNo', span: 'col-span-2' },
    { label: '存放位置起始号', key: 'storageStartNo', span: 'col-span-2' },
  ]},
  { name: '附注与录入', fields: [
    { label: '附注', key: 'notes', span: 'col-span-6', isTextarea: true },
    { label: '录入人', key: 'inputPerson', span: 'col-span-3' },
    { label: '录入时间', key: 'inputTime', span: 'col-span-3' },
  ]},
];

const UNIT_FIELDS: CategoryDef[] = [
  { name: '基本信息', fields: [
    { label: '单位工程名称', key: 'unitName', span: 'col-span-3' },
    { label: '施工单位', key: 'constructionUnit', span: 'col-span-3' },
    { label: '质量安全监督单位', key: 'supervisionUnit', span: 'col-span-3' },
    { label: '规划许可证号', key: 'planPermitNo', span: 'col-span-3' },
  ]},
  { name: '专业记载', fields: [
    { label: '建筑面积(m²)', key: 'area', span: 'col-span-2' },
    { label: '高度(m)', key: 'height', span: 'col-span-1' },
    { label: '地下层数', key: 'layerUnder', span: 'col-span-1' },
    { label: '地上层数', key: 'layerAbove', span: 'col-span-1' },
    { label: '结构类型', key: 'structure', span: 'col-span-1' },
    { label: '栋数', key: 'buildingCount', span: 'col-span-1' },
    { label: '开工时间', key: 'startDate', span: 'col-span-2' },
    { label: '竣工时间', key: 'endDate', span: 'col-span-2' },
  ]},
  { name: '档案状况', fields: [
    { label: '案卷数', key: 'volCount', span: 'col-span-2' },
    { label: '文字(卷)', key: 'textVol', span: 'col-span-2' },
    { label: '图纸(卷)', key: 'drawingVol', span: 'col-span-2' },
  ]},
  { name: '保管信息', fields: [
    { label: '保管期限', key: 'retention', span: 'col-span-2' },
    { label: '密级', key: 'secretLevel', span: 'col-span-2' },
    { label: '进馆日期', key: 'entryDate', span: 'col-span-2' },
    { label: '移交单位', key: 'handoverUnit', span: 'col-span-3' },
    { label: '档案状态', key: 'archiveStatus', span: 'col-span-3' },
  ]},
  { name: '排检与编号', fields: [
    { label: '档号', key: 'archiveCode', span: 'col-span-3' },
    { label: '缩微号', key: 'microNo', span: 'col-span-3' },
    { label: '存放位置起始号', key: 'storageStartNo', span: 'col-span-3' },
    { label: '附注', key: 'notes', span: 'col-span-3', isTextarea: true },
  ]},
];

const VOLUME_FIELDS: CategoryDef[] = [
  { name: '案卷信息', fields: [
    { label: '案卷题名', key: 'title', span: 'col-span-6', isTextarea: true },
    { label: '档号', key: 'archiveCode', span: 'col-span-3' },
    { label: '编制单位', key: 'preparationUnit', span: 'col-span-3' },
    { label: '进馆日期', key: 'entryDate', span: 'col-span-2' },
    { label: '保管期限', key: 'retention', span: 'col-span-2' },
    { label: '密级', key: 'secretLevel', span: 'col-span-2' },
    { label: '文字(张)', key: 'textPage', span: 'col-span-2' },
    { label: '图纸(张)', key: 'drawingNum', span: 'col-span-2' },
    { label: '录入人', key: 'inputPerson', span: 'col-span-2' },
  ]},
  { name: '备注', fields: [
    { label: '备注', key: 'notes', span: 'col-span-6', isTextarea: true },
  ]},
];

const FILE_FIELDS: CategoryDef[] = [
  { name: '文件基本信息', fields: [
    { label: '文件题名', key: 'fileTitle', span: 'col-span-6', isTextarea: true },
    { label: '档号', key: 'docNo', span: 'col-span-3' },
    { label: '文(图)号', key: 'archiveNo', span: 'col-span-3' },
    { label: '责任者', key: 'responsible', span: 'col-span-3' },
    { label: '缩微号', key: 'microNo', span: 'col-span-3' },
  ]},
  { name: '保管信息', fields: [
    { label: '保管期限', key: 'retention', span: 'col-span-2' },
    { label: '密级', key: 'secretLevel', span: 'col-span-2' },
    { label: '形成时间', key: 'date', span: 'col-span-2' },
  ]},
  { name: '物理形态', fields: [
    { label: '页次', key: 'pages', span: 'col-span-2' },
    { label: '文件格式', key: 'fileType', span: 'col-span-2' },
    { label: '文件大小', key: 'bitSize', span: 'col-span-2' },
  ]},
  { name: '附注', fields: [
    { label: '附注', key: 'notes', span: 'col-span-6', isTextarea: true },
  ]},
];

const FIELD_MAP: Record<NodeType, CategoryDef[]> = {
  PROJECT: PROJECT_FIELDS,
  UNIT: UNIT_FIELDS,
  VOLUME: VOLUME_FIELDS,
  FILE: FILE_FIELDS,
};

// ─── Helpers ───

function collectExpandedIds(node: MetadataNode): string[] {
  const ids: string[] = [];
  if (node.expanded) ids.push(node.id);
  if (node.children) node.children.forEach(c => ids.push(...collectExpandedIds(c)));
  return ids;
}

// ─── Component ───

export const Step3Catalog: React.FC<Step3CatalogProps> = ({ treeData, selectedNode, onSelectNode, onComplete, onGoToArchive, onCancel }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(() => collectExpandedIds(treeData));

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const isExpanded = useCallback((id: string) => expandedIds.includes(id), [expandedIds]);

  const renderTree = (node: MetadataNode, level = 0) => {
    const sel = selectedNode.id === node.id;
    const hasCh = !!node.children?.length;
    const exp = isExpanded(node.id);
    const Icon = node.type === 'PROJECT' ? FolderOpen : node.type === 'UNIT' ? Layers : node.type === 'VOLUME' ? Box : File;
    const colorClass = node.type === 'PROJECT' ? 'text-blue-600' : node.type === 'UNIT' ? 'text-indigo-600' : node.type === 'VOLUME' ? 'text-amber-600' : 'text-slate-500';
    return (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-3 cursor-pointer transition-colors text-xs ${sel ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasCh ? (
            <button onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              className="mr-1 text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer">
              <ChevronRight size={13} className={`transition-transform ${exp ? 'rotate-90' : ''}`} />
            </button>
          ) : (
            <span className="w-[13px] mr-1 shrink-0" />
          )}
          <Icon size={14} className={`mr-2 shrink-0 ${colorClass}`} />
          <span className="truncate flex-1" onClick={() => onSelectNode(node)}>{node.label}</span>
        </div>
        {hasCh && exp && <div>{node.children!.map(child => renderTree(child, level + 1))}</div>}
      </div>
    );
  };

  const categories = FIELD_MAP[selectedNode.type] || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 160px)' }}>
      <div className="flex justify-between items-center px-6 py-3 border-b border-slate-200 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">档案著录</h3>
          <p className="text-[11px] text-slate-500">请完善各层级元数据信息</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-xs">返回</button>
          <button onClick={onComplete} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center shadow">
            <Save size={14} className="mr-1.5" />保存
          </button>
          <button onClick={onGoToArchive} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center shadow">
            <Save size={14} className="mr-1.5" />入库
          </button>
        </div>
      </div>
      <div className="flex" style={{ height: 'calc(100% - 46px)' }}>
        <div className="w-72 border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0">
          <div className="p-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 sticky top-0">档案目录结构</div>
          <div className="py-1">{renderTree(treeData)}</div>
        </div>
        <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                selectedNode.type === 'PROJECT' ? 'bg-blue-100 text-blue-700' :
                selectedNode.type === 'UNIT' ? 'bg-indigo-100 text-indigo-700' :
                selectedNode.type === 'VOLUME' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedNode.type === 'PROJECT' ? '项目级著录' :
                 selectedNode.type === 'UNIT' ? '工程级著录' :
                 selectedNode.type === 'VOLUME' ? '案卷级著录' : '文件级著录'}
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-1">{selectedNode.label}</h3>
            </div>

            {categories.map((cat, ci) => (
              <div key={ci} className="border border-slate-300 rounded-lg overflow-hidden">
                <div className={`px-3 py-1.5 text-xs font-bold tracking-wider text-slate-800 ${
                  selectedNode.type === 'PROJECT' ? 'bg-sky-100' :
                  selectedNode.type === 'UNIT' ? 'bg-emerald-100' :
                  selectedNode.type === 'VOLUME' ? 'bg-orange-100' :
                  'bg-slate-500 text-white'
                }`}>
                  {cat.name}
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-200 bg-blue-50/40">
                  {cat.fields.map((f, fi) => (
                    <div key={f.key} className={`flex border-b border-slate-200 ${fi % 2 === 1 ? '' : ''}`}>
                      <div className="w-[120px] shrink-0 bg-blue-50/80 px-2.5 py-2 text-[11px] font-semibold text-slate-700 border-r border-slate-200 flex items-center">
                        {f.label}
                      </div>
                      <div className="flex-1 px-2.5 py-1.5 bg-white">
                        {f.isTextarea ? (
                          <textarea defaultValue={selectedNode.data[f.key] || ''} rows={2}
                            className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" />
                        ) : (
                          <input type="text" defaultValue={selectedNode.data[f.key] || ''}
                            className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" />
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Fill empty cell if odd number of fields */}
                  {cat.fields.length % 2 === 1 && (
                    <div className="border-b border-slate-200" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
