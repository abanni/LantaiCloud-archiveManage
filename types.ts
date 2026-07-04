
// Archive Types
export enum ArchiveType {
  PROJECT = '工程档案',
  BIDDING = '招投标档案',
  AUDIO_VISUAL = '音像档案',
  VILLAGE = '村镇档案',
  DOCUMENT = '文书档案'
}

export enum SecurityLevel {
  PUBLIC = '普通',
  CONFIDENTIAL = '秘密',
  SECRET = '机密',
  TOP_SECRET = '绝密'
}

export interface ArchiveItem {
  id: string;
  archiveCode: string; // 档案编号
  title: string;
  project: string; // Formation unit/Project name
  type: ArchiveType;
  date: string;
  securityLevel: SecurityLevel;
  location: string; // Physical location (Room-Shelf-Box)
  status: 'indexed' | 'quarantined' | 'checked-out';
  fileSize: string;
  pageCount: number;
}

// Ingestion Types
export interface IngestTask {
  id: string;
  taskId: string;          // 任务ID (MD5 hash)
  fileName: string;        // 项目名称
  fingerprint: string;     // 文件指纹 (MD5)
  fileSize: string;        // 文件大小 (e.g. "156.5 MB")
  createdAt: string;       // 创建时间
  creator: string;         // 创建人
  completedAt: string;     // 完成时间
  unitCount: number;       // 单体数量
  volumeCount: number;     // 案卷数量
  // Updated status workflow
  status: 'uploading' | 'parsing' | 'shelving' | 'cataloging' | 'archiving' | 'ingesting' | 'completed' | 'failed' | 'parse_error';
  result: string;          // 结果描述 (e.g. "入库成功", "正在解析 xml...")
  validationResults: {
    authenticity: boolean;
    integrity: boolean;
    usability: boolean;
    safety: boolean;
  };
}

// Utilization Types
export interface UtilizationRecord {
  id: string;
  archiveId: string;
  archiveTitle: string;
  userName: string;
  userType: 'Internal' | 'External' | 'Researcher';
  idCard: string;
  purpose: string;
  accessTime: string;
  type: 'View' | 'Download' | 'Print';
  result: 'Success' | 'Denied';
  watermarkContent: string;
}

// Stats Types
export interface StatMetric {
  name: string;
  value: number;
  color?: string;
}

// User & Role Types
export type DepartmentType = '管理科' | '编研利用科' | '业务科' | '馆长室';
export type RoleType = '科长' | '科员' | '馆长';

export interface User {
  id: string;
  username: string; // Login username (e.g., hjj)
  name: string;
  department: DepartmentType;
  role: RoleType;
  avatarColor: string;
  // List of ViewStates this user is allowed to access
  permissions: string[]; 
}

// Global Selection Basket
export interface SelectionItem {
  id: string; // Archive ID or Volume ID
  type: 'FILE' | 'VOLUME';
  title: string;
  code: string;
}
