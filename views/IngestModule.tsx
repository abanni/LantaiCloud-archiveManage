import React, { useState, useMemo } from 'react';
import { IngestTask } from '../types';
import { Step1Upload } from './Step1Upload';
import { Step2Inspection } from './Step2Inspection';
import { Step3Catalog } from './Step3Catalog';
import { Step4Confirm } from './Step4Confirm';
import archiveData from '../data/archiveData.json';

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

// 从JSON数据构建树结构
function buildTreeFromJson() {
  const items = archiveData as any[];
  
  // 找到项目级节点
  const projectNode = items.find(item => item.tag === 'zj' && item.parent_id === '0');
  if (!projectNode) return null;

  // 找到工程级节点
  const engineeringNodes = items.filter(item => item.tag === 'zj_item' && item.parent_id === projectNode.file_id);

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
      const volumeNodes = items.filter(i => i.tag === 'zj_volume' && i.parent_id === item.file_id);
      children = volumeNodes.map(vol => buildNode(vol, 2));
    } else if (level === 2) {
      // 案卷级 - 添加文件级子节点
      const fileNodes = items.filter(i => i.tag === '' && i.file_type === 'file' && i.parent_id === item.file_id);
      children = fileNodes.map(file => ({
        id: file.file_id,
        type: 'FILE',
        label: file.file_name,
        data: {
          docNo: file.doc_no || '',
          archiveNo: file.archive_no || '',
          fileTitle: file.file_name,
          responsible: file.compilation_company || '',
          date: file.input_time || '',
          pages: file.text_page || '',
          url: file.url || '',
        }
      }));
    }

    return {
      id: item.file_id,
      type: typeMap[item.tag] || 'FILE',
      label: item.file_name,
      expanded: level <= 1, // 项目级、工程级展开；案卷级可见不展开，文件级折叠
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
