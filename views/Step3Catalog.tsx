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

export interface Step3CatalogProps {
  treeData: MetadataNode;
  selectedNode: MetadataNode;
  onSelectNode: (node: MetadataNode) => void;
  onComplete: () => void;
  onGoToArchive: () => void;
  onCancel: () => void;
  onDeleteFile?: (fileId: string) => void;
  onReplacePdf?: (fileId: string, dataUrl: string) => void;
  onUpdateFileMeta?: (fileId: string, meta: Record<string, string>) => void;
  onAddFile?: (parentVolumeId: string, meta: Record<string, string>, dataUrl: string) => void;
  onMoveFile?: (fileId: string, direction: 'up' | 'down') => void;
}

// ─── Field definitions ───

interface FieldDef { label: string; key: string; span?: string; isTextarea?: boolean; }
interface CategoryDef { name: string; fields: FieldDef[]; }

const PROJECT_FIELDS: CategoryDef[] = [
  { name: '基本信息', fields: [
    { label: '项目名称', key: 'projectName', span: 'col-span-3' },
    { label: '工程地点', key: 'address', span: 'col-span-3' },
  ]},
  { name: '责任者', fields: [
    { label: '建设单位', key: 'constructionUnit', span: 'col-span-2' },
    { label: '立项批准单位', key: 'approvalUnit', span: 'col-span-2' },
    { label: '设计单位', key: 'designUnit', span: 'col-span-2' },
    { label: '勘察单位', key: 'surveyUnit', span: 'col-span-3' },
    { label: '监理单位', key: 'supervisionUnit', span: 'col-span-3' },
  ]},
  { name: '文号项', fields: [
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

// ─── Shared form field components ───

function FieldRow({ label, value, data, fieldKey, isTextarea }: { label: string; value?: string; data: Record<string, string>; fieldKey: string; isTextarea?: boolean }) {
  return (
    <div className="flex">
      <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">{label}</div>
      <div className="flex-1 px-1.5 py-1 bg-white">
        {isTextarea ? (
          <textarea defaultValue={data[fieldKey] || ''} rows={1}
            className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" />
        ) : (
          <input type="text" defaultValue={data[fieldKey] || ''}
            className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" />
        )}
      </div>
    </div>
  );
}

function FullRow({ label, value, data, fieldKey, isTextarea }: { label: string; value?: string; data: Record<string, string>; fieldKey: string; isTextarea?: boolean }) {
  return (
    <div className="flex">
      <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">{label}</div>
      <div className="flex-1 px-1.5 py-1 bg-white">
        {isTextarea ? (
          <textarea defaultValue={data[fieldKey] || ''} rows={1}
            className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" />
        ) : (
          <input type="text" defaultValue={data[fieldKey] || ''}
            className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" />
        )}
      </div>
    </div>
  );
}

// ─── Project-level form ───

function ProjectForm({ data }: { data: Record<string, string> }) {
  const PCF = (label: string, key: string, disabled?: boolean) => (
    <div className="flex">
      <div className="w-[110px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">{label}</div>
      <div className={`flex-1 px-1.5 py-1 ${disabled ? 'bg-slate-100' : 'bg-white'}`}>
        <input type="text" defaultValue={data[key] || ''} disabled={disabled}
          className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed" />
      </div>
    </div>
  );
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="divide-y divide-slate-200">
        {/* 基本信息 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-blue-200 border-b border-slate-200 text-center">基本信息</div>
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="flex">
              <div className="w-[110px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">项目名称</div>
              <div className="flex-1 px-1.5 py-1 bg-white"><input type="text" defaultValue={data.projectName || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" /></div>
            </div>
            <div className="flex">
              <div className="w-[110px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">项目地点</div>
              <div className="flex-1 px-1.5 py-1 bg-white"><input type="text" defaultValue={data.address || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" /></div>
            </div>
          </div>
          <div className="divide-y divide-slate-200 border-t border-slate-200">
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {PCF('建设单位', 'constructionUnit')}
              {PCF('立项批准文号', 'approvalNo')}
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {PCF('立项批准单位', 'approvalUnit')}
              {PCF('工程规划许可证号', 'planPermitNo')}
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {PCF('设计单位', 'designUnit')}
              {PCF('用地规划许可证号', 'landPlanPermitNo')}
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {PCF('勘察单位', 'surveyUnit')}
              {PCF('用地许可证号', 'landUsePermitNo')}
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              {PCF('监理单位', 'supervisionUnit')}
              {PCF('施工许可证号', 'workPermitNo')}
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              <div className="flex">
                <div className="w-[110px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">移交单位</div>
                <div className="flex-1 px-1.5 py-1 bg-white"><input type="text" defaultValue={data.handoverUnit || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" /></div>
              </div>
              <div className="flex">
                <div className="w-[110px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">质监号</div>
                <div className="flex-1 px-1.5 py-1 bg-white"><input type="text" defaultValue={data.qualitySupervisionNo || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* 专业记载 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-blue-200 border-b border-slate-200 text-center">专业记载</div>
          <div className="flex divide-x divide-slate-200 bg-sky-50">
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">单位工程名称</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">施工单位</div>
            <div className="w-[65px] shrink-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">建筑面积</div>
            <div className="w-[55px] shrink-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">高度(m)</div>
            <div className="w-[50px] shrink-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">地下</div>
            <div className="w-[50px] shrink-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">地上</div>
            <div className="w-[55px] shrink-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">结构</div>
            <div className="w-[75px] shrink-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">开工时间</div>
            <div className="w-[75px] shrink-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">竣工时间</div>
          </div>
          <div className="flex divide-x divide-slate-200">
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.unitProjectName || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.constructionOrg || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="w-[65px] shrink-0 px-1 py-0.5"><input type="text" defaultValue={data.area || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="w-[55px] shrink-0 px-1 py-0.5"><input type="text" defaultValue={data.height || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="w-[50px] shrink-0 px-1 py-0.5"><input type="text" defaultValue={data.layerUnder || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="w-[50px] shrink-0 px-1 py-0.5"><input type="text" defaultValue={data.layerAbove || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="w-[55px] shrink-0 px-1 py-0.5"><input type="text" defaultValue={data.structure || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="w-[75px] shrink-0 px-1 py-0.5"><input type="text" defaultValue={data.startDate || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="w-[75px] shrink-0 px-1 py-0.5"><input type="text" defaultValue={data.endDate || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
          </div>
          <div className="grid grid-cols-5 divide-x divide-slate-200 border-t border-slate-200">
            {PCF('总用地面积', 'totalLandArea')}
            {PCF('总建筑面积', 'totalBuildingArea')}
            {PCF('幢数', 'buildingCount')}
            {PCF('工程造价', 'budget')}
            {PCF('工程结算', 'settlement')}
          </div>
        </div>

        {/* 档案状况 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-blue-200 border-b border-slate-200 text-center">档案状况</div>
          <div className="grid grid-cols-5 divide-x divide-slate-200">
            {PCF('总卷数', 'volCount')}
            {PCF('文字(卷)', 'textVol')}
            {PCF('图纸(卷)', 'drawingVol')}
            {PCF('图纸(张)', 'statFinishedDrawing')}
            {PCF('照片(张)', 'statPhoto')}
          </div>
          <div className="grid grid-cols-5 divide-x divide-slate-200 border-t border-slate-200">
            {PCF('底图(张)', 'statDrawing')}
            {PCF('录音带(盒)', 'statAudio')}
            {PCF('录像带(盒)', 'statVideo')}
            {PCF('光盘(张)', 'statDisk')}
            {PCF('其他', 'statOther')}
          </div>
        </div>

        {/* 保管信息 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-blue-200 border-b border-slate-200 text-center">保管信息</div>
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {PCF('保管期限', 'retention')}
            {PCF('密级', 'security')}
            {PCF('进馆日期', 'entryDate')}
          </div>
        </div>

        {/* 排检与编号 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-blue-200 border-b border-slate-200 text-center">排检与编号</div>
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            {PCF('档号', 'archiveCode', true)}
            {PCF('存放位置起始号', 'storageStartNo')}
          </div>
        </div>

        {/* 附注 */}
        <div className="flex">
          <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">附注</div>
          <div className="flex-1 px-1.5 py-1 bg-white"><textarea defaultValue={data.notes || ''} rows={1} className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" /></div>
        </div>

        {/* 录入 */}
        <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="flex">
              <div className="w-[80px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">录入人</div>
              <div className="flex-1 px-1.5 py-1 bg-white"><input type="text" defaultValue={data.inputPerson || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" /></div>
            </div>
            <div className="flex">
              <div className="w-[80px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">录入时间</div>
              <div className="flex-1 px-1.5 py-1 bg-white"><input type="text" defaultValue={data.inputTime || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" /></div>
            </div>
        </div>
      </div>
    </div>
  );
}

// ─── Engineering-level form ───

function UnitForm({ data }: { data: Record<string, string> }) {
  const UCF = (label: string, key: string, disabled?: boolean) => (
    <div className="flex">
      <div className="w-[120px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center whitespace-nowrap">{label}</div>
      <div className={`flex-1 px-1.5 py-1 ${disabled ? 'bg-slate-100' : 'bg-white'}`}>
        <input type="text" defaultValue={data[key] || ''} disabled={disabled}
          className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed" />
      </div>
    </div>
  );
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="divide-y divide-slate-200">
        {/* 基本信息 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-emerald-100 border-b border-slate-200 text-center">基本信息</div>
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="divide-y divide-slate-200">
              {UCF('单位工程名称', 'unitName')}
              {UCF('质量安全监督单位', 'supervisionUnit')}
            </div>
            <div className="divide-y divide-slate-200">
              {UCF('施工单位', 'constructionUnit')}
              {UCF('规划许可证号', 'planPermitNo')}
            </div>
          </div>
        </div>

        {/* 专业记载 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-emerald-100 border-b border-slate-200 text-center">专业记载</div>
          <div className="flex divide-x divide-slate-200 bg-sky-50">
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">建筑面积(m²)</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">高度(m)</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">地下</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">地上</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">结构</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">栋数</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">开工时间</div>
            <div className="flex-1 min-w-0 px-1 py-0.5 text-xs font-semibold text-slate-600 text-center border-b border-slate-200">竣工时间</div>
          </div>
          <div className="flex divide-x divide-slate-200">
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.area || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.height || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.layerUnder || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.layerAbove || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.structure || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.buildingCount || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.startDate || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
            <div className="flex-1 min-w-0 px-1 py-0.5"><input type="text" defaultValue={data.endDate || ''} className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 text-center" /></div>
          </div>
        </div>

        {/* 档案状况 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-emerald-100 border-b border-slate-200 text-center">档案状况</div>
          <div className="grid grid-cols-5 divide-x divide-slate-200">
            {UCF('总卷数', 'volCount')}
            {UCF('文字(卷)', 'textVol')}
            {UCF('图纸(卷)', 'drawingVol')}
            {UCF('底图(张)', 'statDrawing')}
            {UCF('照片(张)', 'statPhoto')}
          </div>
          <div className="grid grid-cols-5 divide-x divide-slate-200 border-t border-slate-200">
            {UCF('录音带(盒)', 'statAudio')}
            {UCF('录像带(盒)', 'statVideo')}
            {UCF('光盘(张)', 'statDisk')}
            {UCF('计算机磁带(盒)', 'statFloppyDisk')}
            {UCF('其他', 'statOther')}
          </div>
        </div>

        {/* 保管信息 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-emerald-100 border-b border-slate-200 text-center">保管信息</div>
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {UCF('保管期限', 'retention')}
            {UCF('密级', 'secretLevel')}
            {UCF('进馆日期', 'entryDate')}
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200">
            {UCF('移交单位', 'handoverUnit')}
            {UCF('档案状态', 'archiveStatus')}
          </div>
        </div>

        {/* 排检与编号 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-emerald-100 border-b border-slate-200 text-center">排检与编号</div>
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {UCF('档号', 'archiveCode', true)}
            {UCF('缩微号', 'microNo')}
            {UCF('存放位置起始号', 'storageStartNo')}
          </div>
        </div>

        {/* 其他 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-emerald-100 border-b border-slate-200 text-center">其他</div>
          <div className="flex">
            <div className="w-[120px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center whitespace-nowrap">附注</div>
            <div className="flex-1 px-1.5 py-1 bg-white"><textarea defaultValue={data.notes || ''} rows={1} className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Volume-level form ───

function VolumeForm({ data }: { data: Record<string, string> }) {
  const VCF = (label: string, key: string, disabled?: boolean) => (
    <div className="flex">
      <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center whitespace-nowrap">{label}</div>
      <div className={`flex-1 px-1.5 py-1 ${disabled ? 'bg-slate-100' : 'bg-white'}`}>
        <input type="text" defaultValue={data[key] || ''} disabled={disabled}
          className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed" />
      </div>
    </div>
  );
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="divide-y divide-slate-200">
        {/* 专业记载 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-amber-50 border-b border-slate-200 text-center">专业记载</div>
          <div className="flex border-b border-slate-200">
            <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">案卷题名</div>
            <div className="flex-1 px-1.5 py-1 bg-white"><textarea defaultValue={data.title || ''} rows={1} className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" /></div>
          </div>
          <div className="grid grid-cols-4 divide-x divide-slate-200">
            {VCF('编制单位', 'preparationUnit')}
            {VCF('进馆日期', 'entryDate')}
            {VCF('载体类型', 'carrierType')}
            {VCF('规格', 'specs')}
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200">
            {VCF('数量/单位', 'quantityUnit')}
            {VCF('卷内文件起始时间', 'startTime')}
            {VCF('卷内文件终止时间', 'endTime')}
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 border-b border-slate-200">
            {VCF('保管期限', 'retention')}
            {VCF('密级', 'secretLevel')}
            {VCF('主题词', 'keywords')}
          </div>
          <div className="flex">
            <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">附注</div>
            <div className="flex-1 px-1.5 py-1 bg-white"><textarea defaultValue={data.notes || ''} rows={1} className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" /></div>
          </div>
        </div>

        {/* 档号 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-amber-50 border-b border-slate-200 text-center">档号</div>
          <div className="flex border-b border-slate-200">
            <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center whitespace-nowrap">档号</div>
            <div className="flex-1 px-1.5 py-1 bg-slate-100"><input type="text" defaultValue={data.archiveCode || ''} disabled className="w-full border-0 bg-transparent outline-none text-xs text-slate-400 cursor-not-allowed" /></div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {VCF('总登记号', 'totalRegNo', true)}
            {VCF('大类流水号', 'classSerialNo', true)}
            {VCF('案卷档号', 'volumeCode', true)}
          </div>
        </div>

        {/* 工程档案整理记录 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-amber-50 border-b border-slate-200 text-center">工程档案整理记录</div>
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="divide-y divide-slate-200">
              {VCF('案卷整理人', 'organizer')}
              {VCF('审核人', 'auditor')}
            </div>
            <div className="divide-y divide-slate-200">
              {VCF('案卷整理日期', 'organizeDate')}
              {VCF('审核日期', 'auditDate')}
            </div>
          </div>
        </div>

        {/* 档案状况 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-amber-50 border-b border-slate-200 text-center">档案状况</div>
          <div className="grid grid-cols-4 divide-x divide-slate-200">
            {VCF('案卷类型', 'archiveType')}
            {VCF('文字(张)', 'textPage')}
            {VCF('图纸(张)', 'drawingNum')}
            {VCF('底图(张)', 'statDrawingBase')}
          </div>
          <div className="grid grid-cols-4 divide-x divide-slate-200 border-t border-slate-200">
            {VCF('照片(张)', 'statPhoto')}
            {VCF('录音带(盒)', 'statAudio')}
            {VCF('录像带(盒)', 'statVideo')}
            {VCF('光盘(张)', 'statDisk')}
          </div>
          <div className="grid grid-cols-4 divide-x divide-slate-200 border-t border-slate-200">
            {VCF('磁盘(张)', 'statFloppyDisk')}
            {VCF('缩微片', 'statMicro')}
            {VCF('其他', 'statOther')}
            <div />
          </div>
        </div>

        {/* 备注 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-amber-50 border-b border-slate-200 text-center">备注</div>
          <div className="flex">
            <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center">备注</div>
            <div className="flex-1 px-1.5 py-1 bg-white"><textarea defaultValue={data.notes || ''} rows={1} className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── File-level form ───

function FileForm({ data }: { data: Record<string, string> }) {
  const FCF = (label: string, key: string, disabled?: boolean) => (
    <div className="flex">
      <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center whitespace-nowrap">{label}</div>
      <div className={`flex-1 px-1.5 py-1 ${disabled ? 'bg-slate-100' : 'bg-white'}`}>
        <input type="text" defaultValue={data[key] || ''} disabled={disabled}
          className="w-full border-0 bg-transparent outline-none text-xs text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed" />
      </div>
    </div>
  );
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="divide-y divide-slate-200">
        {/* 文件基本信息 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-white bg-slate-500 border-b border-slate-200 text-center">文件基本信息</div>
          <div className="flex border-b border-slate-200">
            <div className="w-[100px] shrink-0 bg-sky-50 px-1.5 py-1 text-xs font-semibold text-slate-700 border-r border-slate-200 flex items-center justify-center text-center whitespace-nowrap">文件题名</div>
            <div className="flex-1 px-1.5 py-1 bg-white"><textarea defaultValue={data.fileTitle || ''} rows={1} className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" /></div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            {FCF('档号', 'docNo', true)}
            {FCF('文(图)号', 'archiveNo')}
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200">
            {FCF('责任者', 'responsible')}
            {FCF('缩微号', 'microNo')}
            {FCF('文本', 'text')}
          </div>
        </div>

        {/* 存放处 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-white bg-slate-500 border-b border-slate-200 text-center">存放处</div>
          <div className="grid grid-cols-4 divide-x divide-slate-200">
            {FCF('库', 'storageRoom')}
            {FCF('列', 'storageColumn')}
            {FCF('节(柜)', 'storageSection')}
            {FCF('层', 'storageLevel')}
          </div>
        </div>

        {/* 保管信息 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-white bg-slate-500 border-b border-slate-200 text-center">保管信息</div>
          <div className="grid grid-cols-4 divide-x divide-slate-200">
            {FCF('保管期限', 'retention')}
            {FCF('密级', 'secretLevel')}
            {FCF('形成时间', 'date')}
            {FCF('载体类型', 'carrierType')}
          </div>
        </div>

        {/* 物理形态 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-white bg-slate-500 border-b border-slate-200 text-center">物理形态</div>
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {FCF('数量', 'quantity')}
            {FCF('单位', 'unit')}
            {FCF('规格', 'specs')}
          </div>
          <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200">
            {FCF('起始页', 'startPage')}
            {FCF('结束页', 'endPage')}
            {FCF('页次', 'pages')}
          </div>
        </div>

        {/* 其他 */}
        <div>
          <div className="px-2 py-0.5 text-xs font-bold text-white bg-slate-500 border-b border-slate-200 text-center">其他</div>
          <div className="grid grid-cols-3 divide-x divide-slate-200">
            {FCF('提要', 'summary')}
            {FCF('主题词', 'keywords')}
            {FCF('附注', 'notes')}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add File Form ───

interface AddFileFormProps {
  parentVolumeId: string;
  meta: Record<string, string>;
  onMetaChange: (meta: Record<string, string>) => void;
  onSave: (meta: Record<string, string>, dataUrl: string) => void;
}

function AddFileForm({ parentVolumeId, meta, onMetaChange, onSave }: AddFileFormProps) {
  const [dataUrl, setDataUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const setMeta = (key: string, value: string) => {
    onMetaChange({ ...meta, [key]: value });
  };

  const handleFilePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      setFileName(file.name.replace(/\.pdf$/i, ''));
      const reader = new FileReader();
      reader.onload = () => setDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const fields = [
    { label: '文件题名', key: 'fileTitle', type: 'textarea' },
    { label: '档号', key: 'docNo' },
    { label: '文(图)号', key: 'archiveNo' },
    { label: '责任者', key: 'responsible' },
    { label: '缩微号', key: 'microNo' },
    { label: '保管期限', key: 'retention' },
    { label: '密级', key: 'secretLevel' },
    { label: '形成时间', key: 'date' },
    { label: '提要', key: 'summary' },
    { label: '主题词', key: 'keywords' },
    { label: '附注', key: 'notes' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button onClick={handleFilePick}
          className="px-3 py-1.5 text-xs bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 border border-sky-200">
          {dataUrl ? `已选择: ${fileName}.pdf` : '选择PDF文件'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map(f => (
          <div key={f.key} className="flex items-center gap-1">
            <label className="text-[10px] text-slate-500 w-[60px] shrink-0 text-right">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea value={meta[f.key] || ''} onChange={e => setMeta(f.key, e.target.value)}
                rows={1} className="flex-1 border border-slate-200 rounded px-1.5 py-1 text-xs outline-none resize-none" />
            ) : (
              <input type="text" value={meta[f.key] || ''} onChange={e => setMeta(f.key, e.target.value)}
                className="flex-1 border border-slate-200 rounded px-1.5 py-1 text-xs outline-none" />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={() => onSave(meta, dataUrl)}
          disabled={!dataUrl}
          className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40">
          保存
        </button>
      </div>
    </div>
  );
}

// ─── Component ───

export const Step3Catalog: React.FC<Step3CatalogProps> = ({ treeData, selectedNode, onSelectNode, onComplete, onGoToArchive, onCancel, onDeleteFile, onReplacePdf, onUpdateFileMeta, onAddFile, onMoveFile }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(() => collectExpandedIds(treeData));
  const [activeFileTab, setActiveFileTab] = useState<'catalog' | 'preview' | 'add'>('catalog');
  const [addFileMeta, setAddFileMeta] = useState<Record<string, string>>({});
  const [treeWidth, setTreeWidth] = useState(224);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: MetadataNode | null } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Close context menu
  React.useEffect(() => {
    const close = () => setContextMenu(null);
    document.addEventListener('click', close);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('scroll', close, true);
    };
  }, []);

  const findParent = (root: MetadataNode, childId: string): MetadataNode | null => {
    if (!root.children) return null;
    for (const c of root.children) {
      if (c.id === childId) return root;
      const found = root.children ? (() => {
        for (const cc of root.children) {
          if (cc.id === childId) return root;
          if (cc.children) {
            const f2 = findParent(cc, childId);
            if (f2) return f2;
          }
        }
        return null;
      })() : null;
      if (found) return found;
    }
    return null;
  };

  const isFirstSibling = (node: MetadataNode): boolean => {
    if (!treeData.children) return true;
    const all: MetadataNode[] = [];
    const collect = (nodes: MetadataNode[]) => {
      for (const n of nodes) {
        if (n.type === node.type) all.push(n);
        if (n.children) collect(n.children);
      }
    };
    collect([treeData]);
    const idx = all.findIndex(n => n.id === node.id);
    return idx <= 0;
  };

  const isLastSibling = (node: MetadataNode): boolean => {
    if (!treeData.children) return true;
    const all: MetadataNode[] = [];
    const collect = (nodes: MetadataNode[]) => {
      for (const n of nodes) {
        if (n.type === node.type) all.push(n);
        if (n.children) collect(n.children);
      }
    };
    collect([treeData]);
    const idx = all.findIndex(n => n.id === node.id);
    return idx === -1 || idx >= all.length - 1;
  };

  const handleSave = () => { setIsDirty(false); };

  const handleContextMenu = (e: React.MouseEvent, node: MetadataNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const execContextAction = (action: string) => {
    const node = contextMenu?.node;
    if (!node) return;
    setContextMenu(null);
    switch (action) {
      case 'up': onMoveFile?.(node.id, 'up'); break;
      case 'down': onMoveFile?.(node.id, 'down'); break;
      case 'expand': if (!isExpanded(node.id)) toggleExpand(node.id); break;
      case 'collapse': if (isExpanded(node.id)) toggleExpand(node.id); break;
      case 'addFile': setActiveFileTab('add'); setAddFileMeta({}); break;
      case 'replaceFile': {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = '.pdf';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (!file) return;
          const r = new FileReader();
          r.onload = () => onReplacePdf?.(node.id, r.result as string);
          r.readAsDataURL(file);
        };
        input.click();
        break;
      }
      case 'deleteFile': if (confirm('确认删除此文件？')) onDeleteFile?.(node.id); break;
    }
  };

  const menuDisabled = (action: string): boolean => {
    const node = contextMenu?.node;
    if (!node) return true;
    const hasCh = !!node.children?.length;
    const exp = isExpanded(node.id);
    switch (action) {
      case 'up': return node.type === 'PROJECT' || isFirstSibling(node);
      case 'down': return node.type === 'PROJECT' || isLastSibling(node);
      case 'expand': return !hasCh || exp;
      case 'collapse': return !hasCh || !exp;
      case 'addFile': return node.type !== 'VOLUME';
      case 'replaceFile': return node.type !== 'FILE';
      case 'deleteFile': return node.type !== 'FILE';
      default: return true;
    }
  };

  // Resize handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startWidth = treeWidth;
    const handleMouseMove = (ev: MouseEvent) => {
      const newWidth = Math.max(120, Math.min(500, startWidth + ev.clientX - startX));
      setTreeWidth(newWidth);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [treeWidth]);

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
          onContextMenu={(e) => handleContextMenu(e, node)}
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
    <>
      <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-6 py-2 border-b border-slate-200 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-bold text-slate-800">档案著录</h3>
          <p className="text-[10px] text-slate-500">请完善各层级元数据信息</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-xs">返回上传列表</button>
          <button onClick={onGoToArchive} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center shadow">
            <Save size={14} className="mr-1.5" />确认入库
          </button>
        </div>
      </div>
      <div className="text-[10px] text-slate-400 px-6 py-1.5 border-b border-slate-200 bg-white flex items-center gap-1">
        <a href="#" onClick={(e) => { e.preventDefault(); onCancel(); }} className="hover:text-blue-600">上传</a>
        <span className="text-slate-300">›</span>
        <a href="#" onClick={(e) => { e.preventDefault(); onCancel(); }} className="hover:text-blue-600">检测</a>
        <span className="text-slate-300">›</span>
        <span className="text-blue-600 font-medium">著录</span>
        <span className="text-slate-300">›</span>
        <a href="#" onClick={(e) => { e.preventDefault(); onGoToArchive(); }} className="hover:text-blue-600">确认入库</a>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0" style={{ width: treeWidth }}>
          <div className="p-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 sticky top-0">档案目录结构</div>
          <div className="py-1">{renderTree(treeData)}</div>
        </div>
        {/* Drag handle */}
        <div
          onMouseDown={handleMouseDown}
          className={`w-1.5 cursor-col-resize flex-shrink-0 transition-colors ${isDragging ? 'bg-blue-400' : 'bg-transparent hover:bg-slate-200'}`}
        />
        <div className="flex-1 bg-slate-50/50 pl-3 py-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                selectedNode.type === 'PROJECT' ? 'bg-blue-100 text-blue-700' :
                selectedNode.type === 'UNIT' ? 'bg-emerald-100 text-emerald-700' :
                selectedNode.type === 'VOLUME' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {selectedNode.type === 'PROJECT' ? '项目级' :
                 selectedNode.type === 'UNIT' ? '工程级' :
                 selectedNode.type === 'VOLUME' ? '案卷级' : '文件级'}
              </span>
              <h3 className="text-sm font-bold text-slate-800 truncate">{selectedNode.label}</h3>
            </div>
            <button onClick={handleSave} disabled={!isDirty}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${isDirty ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              <Save size={12} className="inline mr-1" />保存
            </button>

          </div>

            {selectedNode.type === 'PROJECT' ? (
              <img src="/Meta_project.png" alt="项目级著录单" className="border border-slate-200 rounded-lg max-w-full" />
            ) : selectedNode.type === 'UNIT' ? (
              <img src="/Meta_unit.png" alt="工程级著录单" className="border border-slate-200 rounded-lg max-w-full" />
            ) : selectedNode.type === 'VOLUME' ? (
              <img src="/Meta_volume.png" alt="案卷级著录单" className="border border-slate-200 rounded-lg max-w-full" />
            ) : selectedNode.type === 'FILE' ? (
              <div className="space-y-2">
                {/* Tab buttons */}
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveFileTab('catalog')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium ${activeFileTab === 'catalog' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:bg-slate-100'}`}>著录</button>
                  <button onClick={() => setActiveFileTab('preview')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium ${activeFileTab === 'preview' ? 'bg-sky-100 text-sky-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>预览</button>
                </div>

                {/* 著录 tab */}
                {activeFileTab === 'catalog' && (
                  <img src="/Meta_file.png" alt="文件级著录单" className="border border-slate-200 rounded-lg max-w-full" />
                )}

                {/* 预览 tab */}
                {activeFileTab === 'preview' && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white p-2">
                    {selectedNode.data.url ? (
                      <embed src={selectedNode.data.url} type="application/pdf" className="w-full" style={{ height: '60vh' }} />
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">暂无PDF文件</div>
                    )}
                  </div>
                )}

                {/* +新增文件 tab */}
                {activeFileTab === 'add' && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <div className="px-2 py-0.5 text-xs font-bold text-white bg-slate-500 text-center">新增文件</div>
                    <div className="p-3 space-y-2 max-h-[55vh] overflow-y-auto">
                      <AddFileForm
                        parentVolumeId={selectedNode.id}
                        meta={addFileMeta}
                        onMetaChange={setAddFileMeta}
                        onSave={(meta, dataUrl) => {
                          onAddFile?.(selectedNode.id, meta, dataUrl);
                          setActiveFileTab('catalog');
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              categories.map((cat, ci) => (
                <div key={ci} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className={`px-3 py-1 text-xs font-bold tracking-wider text-slate-800 ${
                    selectedNode.type === 'UNIT' ? 'bg-emerald-100' :
                    selectedNode.type === 'VOLUME' ? 'bg-amber-50' :
                    'bg-slate-500 text-white'
                  }`}>
                    {cat.name}
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200 bg-sky-50/40">
                    {cat.fields.map((f) => (
                      <div key={f.key} className="flex">
                        <div className="w-[100px] shrink-0 bg-sky-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 border-r border-slate-200 flex items-center">
                          {f.label}
                        </div>
                        <div className="flex-1 px-2 py-1 bg-white">
                          {f.isTextarea ? (
                            <textarea defaultValue={selectedNode.data[f.key] || ''} rows={1}
                              className="w-full border-0 bg-transparent outline-none text-xs resize-none text-slate-800" />
                          ) : (
                            <input type="text" defaultValue={selectedNode.data[f.key] || ''}
                              className="w-full border-0 bg-transparent outline-none text-xs text-slate-800" />
                          )}
                        </div>
                      </div>
                    ))}
                    {cat.fields.length % 2 === 1 && (
                      <div className="border-b border-slate-200" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {[
            { label: '上移', action: 'up' },
            { label: '下移', action: 'down' },
            { type: 'divider' },
            { label: '展开子节点', action: 'expand' },
            { label: '收起子节点', action: 'collapse' },
            { type: 'divider' },
            { label: '添加文件', action: 'addFile' },
            { label: '更换文件', action: 'replaceFile' },
            { label: '删除文件', action: 'deleteFile' },
          ].map((item, i) =>
            item.type === 'divider' ? (
              <div key={i} className="border-t border-slate-100 my-1" />
            ) : (
              <button
                key={i}
                disabled={menuDisabled(item.action!)}
                onClick={() => execContextAction(item.action!)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  menuDisabled(item.action!)
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  );
};
