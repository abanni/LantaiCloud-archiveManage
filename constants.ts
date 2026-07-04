import { ArchiveItem, ArchiveType, SecurityLevel, UtilizationRecord, User } from './types';
import { ViewState } from './components/Navigation';

export const MOCK_ARCHIVES: ArchiveItem[] = [
  {
    id: '1',
    archiveCode: 'A-2023-GC-001',
    title: '市中心图书馆建设项目竣工图纸 - 最终版',
    project: '市建设局',
    type: ArchiveType.PROJECT,
    date: '2023-05-15',
    securityLevel: SecurityLevel.CONFIDENTIAL,
    location: '101室 - A架 - 12盒',
    status: 'indexed',
    fileSize: '45.2 MB',
    pageCount: 120
  },
  {
    id: '2',
    archiveCode: 'B-2023-ZB-042',
    title: '地铁4号线信号系统招标投标文件',
    project: '市交通运输厅',
    type: ArchiveType.BIDDING,
    date: '2023-06-20',
    securityLevel: SecurityLevel.SECRET,
    location: '102室 - B架 - 05盒',
    status: 'indexed',
    fileSize: '12.8 MB',
    pageCount: 350
  },
  {
    id: '3',
    archiveCode: 'C-2022-AV-109',
    title: '2022年度城市发展规划会议录音录像',
    project: '市委办公室',
    type: ArchiveType.AUDIO_VISUAL,
    date: '2022-12-10',
    securityLevel: SecurityLevel.PUBLIC,
    location: '服务器集群 A区',
    status: 'indexed',
    fileSize: '1.2 GB',
    pageCount: 0
  },
  {
    id: '4',
    archiveCode: 'D-2024-DOC-003',
    title: '2024年第一季度财务审计报告',
    project: '财政局',
    type: ArchiveType.DOCUMENT,
    date: '2024-04-01',
    securityLevel: SecurityLevel.CONFIDENTIAL,
    location: '101室 - C架 - 01盒',
    status: 'checked-out',
    fileSize: '5.6 MB',
    pageCount: 45
  },
  {
    id: '5',
    archiveCode: 'E-2021-VZ-099',
    title: '古镇历史文化遗存保护修缮方案',
    project: '文物局',
    type: ArchiveType.VILLAGE,
    date: '2021-08-15',
    securityLevel: SecurityLevel.PUBLIC,
    location: '201室 - A架 - 33盒',
    status: 'indexed',
    fileSize: '88.5 MB',
    pageCount: 210
  }
];

export const MOCK_LOGS: UtilizationRecord[] = [
  {
    id: 'L-001',
    archiveId: '1',
    archiveTitle: '市中心图书馆建设项目竣工图纸',
    userName: '张三',
    userType: 'Internal',
    idCard: '310***********1234',
    purpose: '工程验收审查',
    accessTime: '2024-05-20 09:30:00',
    type: 'View',
    result: 'Success',
    watermarkContent: '仅供查阅 - 张三'
  },
  {
    id: 'L-002',
    archiveId: '2',
    archiveTitle: '地铁4号线信号系统招标投标文件',
    userName: '李四',
    userType: 'External',
    idCard: '310***********5678',
    purpose: '法律合规审计',
    accessTime: '2024-05-20 14:15:00',
    type: 'Print',
    result: 'Success',
    watermarkContent: '复印件 - 李四 - 2024'
  },
  {
    id: 'L-003',
    archiveId: '2',
    archiveTitle: '地铁4号线信号系统招标投标文件',
    userName: '王五',
    userType: 'Researcher',
    idCard: '310***********9012',
    purpose: '学术课题研究',
    accessTime: '2024-05-21 10:00:00',
    type: 'Download',
    result: 'Denied',
    watermarkContent: 'N/A'
  }
];

// Define Permissions based on ViewState strings
// 'ingest' | 'search' | 'utilize' | 'stats'

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'hjj',
    name: '黄晶晶',
    department: '管理科',
    role: '科长',
    avatarColor: 'bg-blue-500',
    // 管理科: 全部四个功能
    permissions: ['home', 'ingest', 'comprehensive', 'fulltext', 'utilize', 'stats', 'archive_mgmt']
  },
  {
    id: 'u2',
    username: 'lj',
    name: '李进',
    department: '编研利用科',
    role: '科员',
    avatarColor: 'bg-emerald-500',
    // 编研利用科: 查询、利用、统计
    permissions: ['home', 'comprehensive', 'fulltext', 'utilize', 'stats', 'archive_mgmt']
  },
  {
    id: 'u3',
    username: 'gxq',
    name: '高兴全',
    department: '业务科',
    role: '科长',
    avatarColor: 'bg-indigo-500',
    // 业务科: 查询、统计
    permissions: ['home', 'comprehensive', 'fulltext', 'stats', 'archive_mgmt']
  },
  {
    id: 'u4',
    username: 'hxh',
    name: '黄晓红',
    department: '馆长室',
    role: '馆长',
    avatarColor: 'bg-slate-500',
    // 馆长: 查询、统计 (巡视工作)
    permissions: ['home', 'comprehensive', 'fulltext', 'stats', 'archive_mgmt']
  }
];