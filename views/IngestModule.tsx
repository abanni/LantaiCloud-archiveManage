import React, { useState, useMemo } from 'react';
import { IngestTask } from '../types';
import { Step1Upload } from './Step1Upload';
import { Step2Inspection } from './Step2Inspection';
import { Step3Catalog, Step3CatalogProps } from './Step3Catalog';
import { Step4Confirm } from './Step4Confirm';
import archiveData from '../data/archiveData.json';

const LOCAL_FILE_KEY = 'lantai_file_changes';

// localStorage file operations
function getLocalChanges(): Record<string, any> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_FILE_KEY) || '{}');
  } catch { return {}; }
}

function saveLocalChanges(changes: Record<string, any>) {
  localStorage.setItem(LOCAL_FILE_KEY, JSON.stringify(changes));
}

// 生成唯一ID
function genId(): string {
  return 'file_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

// 模拟数据
const MOCK_TASKS: IngestTask[] = [
  {
    id: 'task-1',
    taskId: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    fileName: '昆山市白莲湖低空飞行试验场项目',
    fingerprint: 'b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6',
    fileSize: '256.5 MB',
    createdAt: '2026-07-04 10:30:15',
    creator: 'admin',
    completedAt: '',
    unitCount: 6,
    volumeCount: 42,
    status: 'cataloging',
    result: '著录中',
    validationResults: {
      authenticity: true,
      integrity: true,
      usability: true,
      safety: true
    }
  },
  {
    id: 'task-2',
    taskId: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8',
    fileName: '城市广场地下主体地下二层（14~22轴 交 D~G轴区域）局部装修工程',
    fingerprint: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9',
    fileSize: '178.3 MB',
    createdAt: '2026-07-04 11:15:30',
    creator: 'admin',
    completedAt: '',
    unitCount: 1,
    volumeCount: 8,
    status: 'shelving',
    result: '待上架',
    validationResults: {
      authenticity: true,
      integrity: true,
      usability: true,
      safety: true
    }
  },
  {
    id: 'task-3',
    taskId: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    fileName: '智能仓储机器人组装、生产项目',
    fingerprint: 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
    fileSize: '312.8 MB',
    createdAt: '2026-07-04 14:20:45',
    creator: 'admin',
    completedAt: '',
    unitCount: 2,
    volumeCount: 12,
    status: 'cataloging',
    result: '著录中',
    validationResults: {
      authenticity: true,
      integrity: true,
      usability: true,
      safety: true
    }
  },
  {
    id: 'task-4',
    taskId: 'g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
    fileName: '厂房（华海清科定制）新建项目一生产厂房，化学品库（桩基工程）',
    fingerprint: 'h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3',
    fileSize: '445.2 MB',
    createdAt: '2026-07-03 16:45:20',
    creator: 'admin',
    completedAt: '2026-07-03 16:48:10',
    unitCount: 3,
    volumeCount: 15,
    status: 'completed',
    result: '入库成功',
    validationResults: {
      authenticity: true,
      integrity: true,
      usability: true,
      safety: true
    }
  },
  {
    id: 'task-5',
    taskId: 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4',
    fileName: '昆山经济技术开发区金桂路1号1#厂房3层局部改造',
    fingerprint: 'j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5',
    fileSize: '89.6 MB',
    createdAt: '2026-07-03 09:30:00',
    creator: 'admin',
    completedAt: '',
    unitCount: 1,
    volumeCount: 6,
    status: 'parse_error',
    result: '数据包解析失败',
    validationResults: {
      authenticity: false,
      integrity: false,
      usability: false,
      safety: false
    }
  },
  {
    id: 'task-6',
    taskId: 'k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    fileName: '昆山市开发区云雀路半幅新建工程（桂花路-黄浦江路段）',
    fingerprint: 'l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7',
    fileSize: '156.4 MB',
    createdAt: '2026-07-02 15:20:00',
    creator: 'admin',
    completedAt: '',
    unitCount: 1,
    volumeCount: 8,
    status: 'shelving',
    result: '待上架',
    validationResults: {
      authenticity: true,
      integrity: true,
      usability: true,
      safety: true
    }
  },
  {
    id: 'task-7',
    taskId: 'm3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8',
    fileName: '周市镇萧林路南侧、横泾路东侧地块配套道路新建工程',
    fingerprint: 'n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9',
    fileSize: '203.7 MB',
    createdAt: '2026-07-02 10:45:30',
    creator: 'admin',
    completedAt: '',
    unitCount: 1,
    volumeCount: 10,
    status: 'shelving',
    result: '待上架',
    validationResults: {
      authenticity: true,
      integrity: true,
      usability: true,
      safety: true
    }
  }
];

// 从JSON数据构建树结构（合并localStorage增量）
function buildTreeFromJson() {
  const items = archiveData as any[];
  const changes = getLocalChanges();
  const addedFiles = (changes.added || []) as any[];
  const deletedFileIds = new Set<string>(changes.deleted || []);
  const updatedFiles = (changes.updated || {}) as Record<string, any>;
  const sortOrder = (changes.sortOrder || {}) as Record<string, string[]>;
  
  // 找到项目级节点
  const projectNode = items.find(item => item.tag === 'zj' && item.parent_id === '0');
  if (!projectNode) return null;

  // 找到工程级节点
  const engineeringNodes = items.filter(item => item.tag === 'zj_item' && item.parent_id === projectNode.file_id)
    .sort((a: any, b: any) => (parseInt(a.order_no) || 0) - (parseInt(b.order_no) || 0));

  const buildNode = (item: any, level: number): any => {
    const typeMap: Record<string, string> = {
      'zj': 'PROJECT',
      'zj_item': 'UNIT',
      'zj_volume': 'VOLUME',
    };

    let children: any[] = [];
    
    if (level === 0) {
      // 项目级 - 添加工程级子节点
      children = engineeringNodes.map(eng => buildNode(eng, 1));
    } else if (level === 1) {
      // 工程级 - 添加案卷级子节点
      const volumeNodes = items.filter(i => i.tag === 'zj_volume' && i.parent_id === item.file_id)
        .sort((a: any, b: any) => (parseInt(a.order_no) || 0) - (parseInt(b.order_no) || 0));
      children = volumeNodes.map(vol => buildNode(vol, 2));
    } else if (level === 2) {
      // 案卷级 - 添加文件级子节点（原始数据 + localStorage新增）
      const fileNodes = items
        .filter(i => i.tag === '' && i.file_type === 'file' && i.parent_id === item.file_id)
        .filter(i => !deletedFileIds.has(i.file_id))
        .map(file => {
          const upd = updatedFiles[file.file_id] || {};
          return {
            id: file.file_id,
            type: 'FILE' as const,
            label: file.file_name,
            data: {
              docNo: upd.docNo || file.doc_no || '',
              archiveNo: upd.archiveNo || file.archive_no || '',
              fileTitle: upd.fileTitle || file.file_name,
              responsible: upd.responsible || file.compilation_company || '',
              microNo: upd.microNo || '',
              text: upd.text || '',
              storageRoom: upd.storageRoom || '',
              storageColumn: upd.storageColumn || '',
              storageSection: upd.storageSection || '',
              storageLevel: upd.storageLevel || '',
              retention: upd.retention || file.storage_period || '',
              secretLevel: upd.secretLevel || file.secrecy_level || '',
              date: upd.date || file.input_time || '',
              carrierType: upd.carrierType || '',
              quantity: upd.quantity || '',
              unit: upd.unit || '',
              specs: upd.specs || '',
              startPage: upd.startPage || '',
              endPage: upd.endPage || '',
              pages: upd.pages || file.text_page || '',
              summary: upd.summary || '',
              keywords: upd.keywords || '',
              notes: upd.notes || '',
              url: window.location.origin + '/DemoFile1.pdf',
            }
          };
        })
        .sort((a: any, b: any) => (parseInt(a.order_no) || 0) - (parseInt(b.order_no) || 0));

      // 合并新增文件
      const volumeAdded = addedFiles
        .filter((f: any) => f.parentId === item.file_id)
        .map((f: any) => ({
          id: f.id,
          type: 'FILE' as const,
          label: f.data.fileTitle || '未命名文件',
          data: { ...f.data },
          _isNew: true,
        }));

      children = [...fileNodes, ...volumeAdded];

      // 如果有自定义排序顺序，按排序顺序排列
      const orderKey = item.file_id;
      if (sortOrder[orderKey]) {
        const orderMap = new Map(children.map(c => [c.id, c]));
        const sorted: any[] = [];
        for (const id of sortOrder[orderKey]) {
          if (orderMap.has(id)) {
            sorted.push(orderMap.get(id));
            orderMap.delete(id);
          }
        }
        // 把剩余未在排序列表中的追加到末尾
        for (const c of orderMap.values()) sorted.push(c);
        children = sorted;
      }
    }

    return {
      id: item.file_id,
      type: typeMap[item.tag] || 'FILE',
      label: item.file_name,
      expanded: level <= 1,
      data: {
        // 通用字段
        projectName: item.file_name,
        address: item.address || '',
        constructionUnit: item.construction_company || '',
        supervisionUnit: item.supervisor_company || '',
        designUnit: item.compilation_company || '',
        approvalNo: item.doc_no || '',
        planPermitNo: item.license_no || '',
        area: item.built_area || '',
        height: item.height || '',
        structure: item.structure_type || '',
        layerUnder: item.under_floor || '',
        layerAbove: item.up_floor || '',
        startDate: item.start_time || '',
        endDate: item.end_time || '',
        unitName: item.file_name,
        volCount: item.total_volume || '',
        textVol: item.text_volume || '',
        drawingVol: item.drawing_volume || '',
        title: item.file_name,
        volumeTitle: item.volume_title || '',
        preparationUnit: item.compilation_company || '',
        entryDate: item.input_time || '',
        textPage: item.text_page || '',
        drawingNum: item.drawing_num || '',
        retention: item.storage_period || '',
        secretLevel: item.secrecy_level || '',
        inputPerson: item.input_by || '',
        inputTime: item.input_time || '',
        archiveCode: item.archive_code || '',
        fileType: item.ext_name || '',
        bitSize: item.bit_size || '',
        url: item.url || '',
        // 文件级字段
        docNo: item.doc_no || '',
        archiveNo: item.archive_no || '',
        fileTitle: item.file_name,
        responsible: item.compilation_company || '',
        date: item.input_time || '',
        pages: item.text_page || '',
        // 原始数据
        raw: item,
      },
      children: children.length > 0 ? children : undefined,
    };
  };

  return buildNode(projectNode, 0);
}

const INITIAL_TREE_DATA = buildTreeFromJson() || {
  id: 'default',
  type: 'PROJECT' as const,
  label: '默认项目',
  expanded: true,
  data: {},
  children: []
};

export const IngestModule: React.FC = () => {
  const [tasks, setTasks] = useState<IngestTask[]>(MOCK_TASKS);
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3 | 4>(1);
  const [currentTask, setCurrentTask] = useState<IngestTask | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [treeData, setTreeData] = useState(INITIAL_TREE_DATA);
  const [selectedNode, setSelectedNode] = useState(INITIAL_TREE_DATA);

  // ─── File management ───
  const rebuildTree = () => {
    setTreeData(buildTreeFromJson() || INITIAL_TREE_DATA);
  };

  const handleDeleteFile = (fileId: string) => {
    const changes = getLocalChanges();
    const deleted = changes.deleted || [];
    if (!deleted.includes(fileId)) {
      deleted.push(fileId);
    }
    changes.deleted = deleted;
    saveLocalChanges(changes);
    rebuildTree();
    // 如果删除的是当前选中节点，清空选中
    if (selectedNode.id === fileId) {
      setSelectedNode(treeData);
    }
  };

  const handleReplacePdf = (fileId: string, dataUrl: string) => {
    const changes = getLocalChanges();
    const updated = changes.updated || {};
    updated[fileId] = { ...(updated[fileId] || {}), url: dataUrl };
    changes.updated = updated;
    saveLocalChanges(changes);
    rebuildTree();
  };

  const handleUpdateFileMeta = (fileId: string, meta: Record<string, string>) => {
    const changes = getLocalChanges();
    const updated = changes.updated || {};
    updated[fileId] = { ...(updated[fileId] || {}), ...meta };
    changes.updated = updated;
    saveLocalChanges(changes);
    rebuildTree();
  };

  const handleAddFile = (parentVolumeId: string, meta: Record<string, string>, dataUrl: string) => {
    const changes = getLocalChanges();
    const added = changes.added || [];
    const newId = genId();
    added.push({
      id: newId,
      parentId: parentVolumeId,
      data: { ...meta, url: dataUrl },
    });
    changes.added = added;
    saveLocalChanges(changes);
    rebuildTree();
    // 选中新文件
    setTimeout(() => {
      const newTree = buildTreeFromJson();
      if (newTree) {
        const findNode = (node: any): any => {
          if (node.id === newId) return node;
          if (node.children) {
            for (const c of node.children) {
              const found = findNode(c);
              if (found) return found;
            }
          }
          return null;
        };
        const newNode = findNode(newTree);
        if (newNode) {
          setSelectedNode(newNode);
          setTreeData(newTree);
        }
      }
    }, 0);
  };

  const handleMoveFile = (fileId: string, direction: 'up' | 'down') => {
    // 找到当前文件的父案卷ID
    const findParentId = (): string | null => {
      const walk = (nodes: any[], parentId: string | null): string | null => {
        for (const n of nodes) {
          if (n.id === fileId) return parentId;
          if (n.children) {
            const found = walk(n.children, n.id);
            if (found) return found;
          }
        }
        return null;
      };
      return walk(treeData.children || [], treeData.id);
    };

    const parentId = findParentId();
    if (!parentId) return;

    const changes = getLocalChanges();
    const sortOrder = changes.sortOrder || {};
    const orderKey = parentId;

    // 构建当前文件列表顺序
    const allFiles: string[] = [];
    const walkFiles = (nodes: any[]) => {
      for (const n of nodes) {
        if (n.type === 'FILE') {
          if (n._isNew || !changes.deleted?.includes(n.id)) {
            allFiles.push(n.id);
          }
        }
        if (n.children) walkFiles(n.children);
      }
    };
    if (treeData.children) walkFiles(treeData.children);

    const idx = allFiles.indexOf(fileId);
    if (direction === 'up' && idx > 0) {
      [allFiles[idx], allFiles[idx - 1]] = [allFiles[idx - 1], allFiles[idx]];
    } else if (direction === 'down' && idx < allFiles.length - 1) {
      [allFiles[idx], allFiles[idx + 1]] = [allFiles[idx + 1], allFiles[idx]];
    } else {
      return; // 已经到边界
    }

    sortOrder[orderKey] = allFiles;
    changes.sortOrder = sortOrder;
    saveLocalChanges(changes);
    rebuildTree();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').substring(0, 19);
    const newTasks: IngestTask[] = Array.from(files).map((file, index) => {
      const sizeMB = ((file as File).size / (1024*1024)).toFixed(1);
      return {
        id: `task-${Date.now()}-${index}`,
        taskId: Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        fileName: (file as File).name.replace(/\.[^/.]+$/, ''), // 移除文件扩展名
        fingerprint: Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        fileSize: `${sizeMB} MB`,
        createdAt: ts,
        creator: 'admin',
        completedAt: '',
        unitCount: Math.floor(Math.random() * 3) + 1, // 1-3 个单体
        volumeCount: Math.floor(Math.random() * 10) + 5, // 5-14 卷
        status: 'parsing' as const,
        result: '正在解析 xml...',
        validationResults: {
          authenticity: false,
          integrity: false,
          usability: false,
          safety: false,
        }
      };
    });

    setTasks(prev => [...newTasks, ...prev]);
    setTimeout(() => {
      newTasks.forEach(task => {
        updateTask(task.id, {
          status: 'shelving',
          result: '待上架',
          validationResults: { authenticity: true, integrity: true, usability: true, safety: true }
        });
      });
    }, 1500);
  };

  const handleViewInspection = (task: IngestTask) => {
    setCurrentTask(task);
    setActiveTaskId(task.id);
    setWorkflowStep(2);
  };

  const handleProceedToCatalog = () => {
    setWorkflowStep(3);
  };

  const handleBackToUpload = () => {
    setWorkflowStep(1);
  };

  const handleCatalogComplete = () => {
    setWorkflowStep(4);
  };

  const handleReturnToCatalog = () => {
    setWorkflowStep(3);
  };

  const handleConfirmArchive = () => {
    if (activeTaskId) {
      const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
      updateTask(activeTaskId, { status: 'completed', result: '入库成功', completedAt: ts });
      setWorkflowStep(1);
      setCurrentTask(null);
    }
  };

  const updateTask = (id: string, updates: Partial<IngestTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <>
      {workflowStep === 1 && (
          <Step1Upload
            tasks={tasks}
            onFileUpload={handleFileUpload}
            onViewInspection={handleViewInspection}
            onCatalog={(task) => {
              setCurrentTask(task);
              setActiveTaskId(task.id);
              setWorkflowStep(3);
            }}
            onIngest={(task) => {
              setCurrentTask(task);
              setActiveTaskId(task.id);
              setWorkflowStep(4);
            }}
            onReupload={(task) => {
              updateTask(task.id, { status: 'parsing', result: '正在重新解析...' });
              setTimeout(() => {
                updateTask(task.id, {
                  status: 'shelving',
                  result: '待上架',
                  validationResults: { authenticity: true, integrity: true, usability: true, safety: true }
                });
              }, 1500);
            }}
          />
        )}

        {workflowStep === 2 && currentTask && (
          <Step2Inspection
            task={currentTask}
            onBack={handleBackToUpload}
            onProceed={handleProceedToCatalog}
          />
        )}

        {workflowStep === 3 && currentTask && (
          <Step3Catalog
            treeData={treeData}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onComplete={handleCatalogComplete}
            onGoToArchive={handleCatalogComplete}
            onCancel={handleBackToUpload}
            onDeleteFile={handleDeleteFile}
            onReplacePdf={handleReplacePdf}
            onUpdateFileMeta={handleUpdateFileMeta}
            onAddFile={handleAddFile}
            onMoveFile={handleMoveFile}
          />
        )}

        {workflowStep === 4 && currentTask && (
          <Step4Confirm
            taskName={currentTask.fileName}
            onReturn={handleReturnToCatalog}
            onConfirm={handleConfirmArchive}
          />
        )}
    </>
  );
};
