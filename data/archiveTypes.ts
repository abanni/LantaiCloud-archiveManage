// 昆山市城建档案馆 - 项目类型树（来自昆山项目类型树.txt）
// 三级结构：大类（A~R）→ 小类 → 子类

export interface ArchiveTypeNode {
  id: number;
  typeCode: string;   // 如 'A', '1', '91'
  name: string;
  parentId: number;
  classCode: string;  // 分类号，如 'A', 'A1', 'A1-1'
  level: number;      // 0=大类, 1=小类, 2=子类
}

// 原始 TSV 数据解析后的完整列表
const ALL_TYPES: ArchiveTypeNode[] = [
  // ============ 大类（Level 0） ============
  { id: 1, typeCode: 'A', name: '综合类', parentId: 0, classCode: 'A', level: 0 },
  { id: 2, typeCode: 'B', name: '城市勘察类', parentId: 0, classCode: 'B', level: 0 },
  { id: 3, typeCode: 'C', name: '城市规划类', parentId: 0, classCode: 'C', level: 0 },
  { id: 4, typeCode: 'D', name: '城市建设管理类', parentId: 0, classCode: 'D', level: 0 },
  { id: 5, typeCode: 'E', name: '市政工程类', parentId: 0, classCode: 'E', level: 0 },
  { id: 6, typeCode: 'F', name: '公用设施类', parentId: 0, classCode: 'F', level: 0 },
  { id: 7, typeCode: 'G', name: '交通运输工程类', parentId: 0, classCode: 'G', level: 0 },
  { id: 8, typeCode: 'H', name: '工业建筑类', parentId: 0, classCode: 'H', level: 0 },
  { id: 9, typeCode: 'I', name: '民用建筑类', parentId: 0, classCode: 'I', level: 0 },
  { id: 10, typeCode: 'J', name: '名胜古迹、园林绿地', parentId: 0, classCode: 'J', level: 0 },
  { id: 11, typeCode: 'K', name: '环保保护类', parentId: 0, classCode: 'K', level: 0 },
  { id: 12, typeCode: 'L', name: '城市建设科研类', parentId: 0, classCode: 'L', level: 0 },
  { id: 13, typeCode: 'M', name: '县（村）镇建设类', parentId: 0, classCode: 'M', level: 0 },
  { id: 14, typeCode: 'N', name: '人防、军事工程类', parentId: 0, classCode: 'N', level: 0 },
  { id: 15, typeCode: 'O', name: '水利防灾类', parentId: 0, classCode: 'O', level: 0 },
  { id: 16, typeCode: 'P', name: '工程设计类', parentId: 0, classCode: 'P', level: 0 },
  { id: 17, typeCode: 'Q', name: '地下管线类', parentId: 0, classCode: 'Q', level: 0 },
  { id: 18, typeCode: 'R', name: '声像类', parentId: 0, classCode: 'R', level: 0 },

  // ============ A 综合类 - 小类（Level 1） ============
  { id: 19, typeCode: '1', name: '政策、法规', parentId: 1, classCode: 'A1', level: 1 },
  { id: 20, typeCode: '2', name: '会议', parentId: 1, classCode: 'A2', level: 1 },
  { id: 21, typeCode: '3', name: '计划、统计', parentId: 1, classCode: 'A3', level: 1 },
  { id: 22, typeCode: '4', name: '外事', parentId: 1, classCode: 'A4', level: 1 },
  { id: 23, typeCode: '5', name: '城建档案工作', parentId: 1, classCode: 'A5', level: 1 },

  // ============ B 城市勘察类 - 小类 ============
  { id: 24, typeCode: '1', name: '工程地质', parentId: 2, classCode: 'B1', level: 1 },
  { id: 25, typeCode: '2', name: '水文地质', parentId: 2, classCode: 'B2', level: 1 },
  { id: 26, typeCode: '3', name: '控制测量', parentId: 2, classCode: 'B3', level: 1 },
  { id: 27, typeCode: '4', name: '地形测量（地形图）', parentId: 2, classCode: 'B4', level: 1 },
  { id: 28, typeCode: '5', name: '摄影测量', parentId: 2, classCode: 'B5', level: 1 },
  { id: 29, typeCode: '6', name: '地图', parentId: 2, classCode: 'B6', level: 1 },

  // ============ C 城市规划类 - 小类 ============
  { id: 30, typeCode: '1', name: '国土规划', parentId: 3, classCode: 'C1', level: 1 },
  { id: 31, typeCode: '2', name: '总体规划', parentId: 3, classCode: 'C2', level: 1 },
  { id: 32, typeCode: '3', name: '分区规划', parentId: 3, classCode: 'C3', level: 1 },
  { id: 33, typeCode: '4', name: '详细规划', parentId: 3, classCode: 'C4', level: 1 },
  { id: 34, typeCode: '5', name: '县镇规划', parentId: 3, classCode: 'C5', level: 1 },
  { id: 35, typeCode: '6', name: '规划基础材料', parentId: 3, classCode: 'C6', level: 1 },
  { id: 36, typeCode: '7', name: '专业规划', parentId: 3, classCode: 'C7', level: 1 },

  // ============ D 城市建设管理类 - 小类 ============
  { id: 37, typeCode: '1', name: '土地管理', parentId: 4, classCode: 'D1', level: 1 },
  { id: 38, typeCode: '2', name: '规划管理', parentId: 4, classCode: 'D2', level: 1 },
  { id: 39, typeCode: '3', name: '建设工程管理', parentId: 4, classCode: 'D3', level: 1 },
  { id: 40, typeCode: '4', name: '房地产管理', parentId: 4, classCode: 'D4', level: 1 },
  { id: 41, typeCode: '5', name: '地名管理', parentId: 4, classCode: 'D5', level: 1 },
  { id: 42, typeCode: '6', name: '征收管理（含拆迁）', parentId: 4, classCode: 'D6', level: 1 },

  // ============ E 市政工程类 - 小类 ============
  { id: 43, typeCode: '1', name: '道路、广场', parentId: 5, classCode: 'E1', level: 1 },
  { id: 44, typeCode: '2', name: '桥梁', parentId: 5, classCode: 'E2', level: 1 },
  { id: 45, typeCode: '3', name: '涵洞', parentId: 5, classCode: 'E3', level: 1 },
  { id: 46, typeCode: '4', name: '隧道', parentId: 5, classCode: 'E4', level: 1 },
  { id: 47, typeCode: '5', name: '排水', parentId: 5, classCode: 'E5', level: 1 },
  { id: 48, typeCode: '6', name: '环境卫生', parentId: 5, classCode: 'E6', level: 1 },
  { id: 49, typeCode: '7', name: '城市照明', parentId: 5, classCode: 'E7', level: 1 },

  // ============ F 公用设施类 - 小类 ============
  { id: 50, typeCode: '1', name: '给水', parentId: 6, classCode: 'F1', level: 1 },
  { id: 51, typeCode: '2', name: '供气', parentId: 6, classCode: 'F2', level: 1 },
  { id: 52, typeCode: '3', name: '供热', parentId: 6, classCode: 'F3', level: 1 },
  { id: 53, typeCode: '4', name: '公共交通（含地铁）', parentId: 6, classCode: 'F4', level: 1 },
  { id: 54, typeCode: '5', name: '供电', parentId: 6, classCode: 'F5', level: 1 },
  { id: 55, typeCode: '6', name: '电讯', parentId: 6, classCode: 'F6', level: 1 },
  { id: 56, typeCode: '7', name: '广播、电视', parentId: 6, classCode: 'F7', level: 1 },

  // ============ G 交通运输工程类 - 小类 ============
  { id: 57, typeCode: '1', name: '铁路', parentId: 7, classCode: 'G1', level: 1 },
  { id: 58, typeCode: '2', name: '公路', parentId: 7, classCode: 'G2', level: 1 },
  { id: 59, typeCode: '3', name: '水运', parentId: 7, classCode: 'G3', level: 1 },
  { id: 60, typeCode: '4', name: '航空', parentId: 7, classCode: 'G4', level: 1 },

  // ============ H 工业建筑类 - 小类 ============
  { id: 61, typeCode: '1', name: '动力', parentId: 8, classCode: 'H1', level: 1 },
  { id: 62, typeCode: '2', name: '矿业', parentId: 8, classCode: 'H2', level: 1 },
  { id: 63, typeCode: '3', name: '冶金', parentId: 8, classCode: 'H3', level: 1 },
  { id: 64, typeCode: '4', name: '机械', parentId: 8, classCode: 'H4', level: 1 },
  { id: 65, typeCode: '5', name: '电子（含仪表）', parentId: 8, classCode: 'H5', level: 1 },
  { id: 66, typeCode: '6', name: '石油', parentId: 8, classCode: 'H6', level: 1 },
  { id: 67, typeCode: '7', name: '化工', parentId: 8, classCode: 'H7', level: 1 },
  { id: 68, typeCode: '8', name: '轻工', parentId: 8, classCode: 'H8', level: 1 },
  { id: 69, typeCode: '91', name: '纺织', parentId: 8, classCode: 'H91', level: 1 },
  { id: 70, typeCode: '92', name: '建材', parentId: 8, classCode: 'H92', level: 1 },
  { id: 71, typeCode: '93', name: '医药', parentId: 8, classCode: 'H93', level: 1 },
  { id: 72, typeCode: '94', name: '食品', parentId: 8, classCode: 'H94', level: 1 },
  { id: 73, typeCode: '95', name: '工艺', parentId: 8, classCode: 'H95', level: 1 },
  { id: 74, typeCode: '96', name: '其它', parentId: 8, classCode: 'H96', level: 1 },

  // ============ I 民用建筑类 - 小类 ============
  { id: 75, typeCode: '1', name: '住宅', parentId: 9, classCode: 'I1', level: 1 },
  { id: 76, typeCode: '2', name: '办公', parentId: 9, classCode: 'I2', level: 1 },
  { id: 77, typeCode: '3', name: '文化', parentId: 9, classCode: 'I3', level: 1 },
  { id: 78, typeCode: '4', name: '教育', parentId: 9, classCode: 'I4', level: 1 },
  { id: 79, typeCode: '5', name: '卫生', parentId: 9, classCode: 'I5', level: 1 },
  { id: 80, typeCode: '6', name: '体育', parentId: 9, classCode: 'I6', level: 1 },
  { id: 81, typeCode: '7', name: '商业、金融、保险', parentId: 9, classCode: 'I7', level: 1 },
  { id: 82, typeCode: '8', name: '其它', parentId: 9, classCode: 'I8', level: 1 },

  // ============ J 名胜古迹、园林绿地 - 小类 ============
  { id: 83, typeCode: '1', name: '公园', parentId: 10, classCode: 'J1', level: 1 },
  { id: 84, typeCode: '2', name: '绿化、苗圃', parentId: 10, classCode: 'J2', level: 1 },
  { id: 85, typeCode: '3', name: '名木古树', parentId: 10, classCode: 'J3', level: 1 },
  { id: 86, typeCode: '4', name: '纪念性建筑', parentId: 10, classCode: 'J4', level: 1 },
  { id: 87, typeCode: '5', name: '名人故居', parentId: 10, classCode: 'J5', level: 1 },
  { id: 88, typeCode: '6', name: '名胜古迹', parentId: 10, classCode: 'J6', level: 1 },
  { id: 89, typeCode: '7', name: '城市雕塑', parentId: 10, classCode: 'J7', level: 1 },

  // ============ K 环保保护类 - 小类 ============
  { id: 90, typeCode: '1', name: '环境管理', parentId: 11, classCode: 'K1', level: 1 },
  { id: 91, typeCode: '2', name: '环境监测', parentId: 11, classCode: 'K2', level: 1 },
  { id: 92, typeCode: '3', name: '环境治理', parentId: 11, classCode: 'K3', level: 1 },
  { id: 93, typeCode: '4', name: '自然保护', parentId: 11, classCode: 'K4', level: 1 },

  // ============ L 城市建设科研类 - 小类 ============
  { id: 94, typeCode: '1', name: '部级及以上项目', parentId: 12, classCode: 'L1', level: 1 },
  { id: 95, typeCode: '2', name: '省级', parentId: 12, classCode: 'L2', level: 1 },
  { id: 96, typeCode: '3', name: '市级', parentId: 12, classCode: 'L3', level: 1 },
  { id: 97, typeCode: '4', name: '其它', parentId: 12, classCode: 'L4', level: 1 },

  // ============ M 县（村）镇建设类 - 小类 ============
  { id: 98, typeCode: '1', name: '县区', parentId: 13, classCode: 'M1', level: 1 },
  { id: 99, typeCode: '2', name: '乡镇', parentId: 13, classCode: 'M2', level: 1 },
  { id: 100, typeCode: '3', name: '村庄', parentId: 13, classCode: 'M3', level: 1 },

  // ============ N 人防、军事工程类 - 小类 ============
  { id: 101, typeCode: '1', name: '人防工程', parentId: 14, classCode: 'N1', level: 1 },
  { id: 102, typeCode: '2', name: '军事工程', parentId: 14, classCode: 'N2', level: 1 },

  // ============ O 水利防灾类 - 小类 ============
  { id: 103, typeCode: '1', name: '水利', parentId: 15, classCode: 'O1', level: 1 },
  { id: 104, typeCode: '2', name: '防洪、防汛', parentId: 15, classCode: 'O2', level: 1 },
  { id: 105, typeCode: '3', name: '防灾、抗震', parentId: 15, classCode: 'O3', level: 1 },

  // ============ P 工程设计类 - 小类 ============
  { id: 106, typeCode: '1', name: '建筑设计单位', parentId: 16, classCode: 'P1', level: 1 },
  { id: 107, typeCode: '2', name: '市政设计单位', parentId: 16, classCode: 'P2', level: 1 },
  { id: 108, typeCode: '3', name: '其它设计单位', parentId: 16, classCode: 'P3', level: 1 },
  { id: 109, typeCode: '4', name: '施工单位', parentId: 16, classCode: 'P4', level: 1 },
  { id: 110, typeCode: '5', name: '其他', parentId: 16, classCode: 'P5', level: 1 },

  // ============ Q 地下管线类 - 小类 ============
  { id: 111, typeCode: '1', name: '管线综合', parentId: 17, classCode: 'Q1', level: 1 },
  { id: 112, typeCode: '2', name: '给水管线', parentId: 17, classCode: 'Q2', level: 1 },
  { id: 113, typeCode: '3', name: '排水', parentId: 17, classCode: 'Q3', level: 1 },
  { id: 114, typeCode: '4', name: '供气', parentId: 17, classCode: 'Q4', level: 1 },
  { id: 115, typeCode: '5', name: '供热', parentId: 17, classCode: 'Q5', level: 1 },
  { id: 116, typeCode: '6', name: '供电', parentId: 17, classCode: 'Q6', level: 1 },
  { id: 117, typeCode: '7', name: '电信', parentId: 17, classCode: 'Q7', level: 1 },
  { id: 118, typeCode: '8', name: '军事', parentId: 17, classCode: 'Q8', level: 1 },
  { id: 119, typeCode: '9', name: '工业输送', parentId: 17, classCode: 'Q9', level: 1 },

  // ============ R 声像类 - 小类 ============
  { id: 120, typeCode: '1', name: '照片（含底片）', parentId: 18, classCode: 'R1', level: 1 },
  { id: 121, typeCode: '2', name: '缩微片（卷）', parentId: 18, classCode: 'R2', level: 1 },
  { id: 122, typeCode: '3', name: '录像带', parentId: 18, classCode: 'R3', level: 1 },
  { id: 123, typeCode: '4', name: '录音带', parentId: 18, classCode: 'R4', level: 1 },
  { id: 124, typeCode: '5', name: '光盘与磁盘', parentId: 18, classCode: 'R5', level: 1 },
  { id: 125, typeCode: '6', name: '工程声像档案', parentId: 18, classCode: 'R6', level: 1 },

  // ============ 子类（Level 2） ============
  // A1 政策、法规
  { id: 126, typeCode: '1', name: '部级及以上机构颁布', parentId: 19, classCode: 'A1-1', level: 2 },
  { id: 127, typeCode: '2', name: '省级机构颁布', parentId: 19, classCode: 'A1-2', level: 2 },
  { id: 128, typeCode: '3', name: '市级机构颁布', parentId: 19, classCode: 'A1-3', level: 2 },
  { id: 129, typeCode: '4', name: '县（市）级机构颁布', parentId: 19, classCode: 'A1-4', level: 2 },

  // A2 会议
  { id: 130, typeCode: '1', name: '国家、部级', parentId: 20, classCode: 'A2-1', level: 2 },
  { id: 131, typeCode: '2', name: '省级', parentId: 20, classCode: 'A2-2', level: 2 },
  { id: 132, typeCode: '3', name: '市级', parentId: 20, classCode: 'A2-3', level: 2 },
  { id: 133, typeCode: '4', name: '县（市）级', parentId: 20, classCode: 'A2-4', level: 2 },

  // A3 计划、统计
  { id: 134, typeCode: '1', name: '工作计划', parentId: 21, classCode: 'A3-1', level: 2 },
  { id: 135, typeCode: '2', name: '综合性统计', parentId: 21, classCode: 'A3-2', level: 2 },
  { id: 136, typeCode: '3', name: '专业性统计', parentId: 21, classCode: 'A3-3', level: 2 },

  // A4 外事
  { id: 137, typeCode: '1', name: '来访', parentId: 22, classCode: 'A4-1', level: 2 },
  { id: 138, typeCode: '2', name: '出访', parentId: 22, classCode: 'A4-2', level: 2 },

  // A5 城建档案工作
  { id: 139, typeCode: '1', name: '城建档案工作', parentId: 23, classCode: 'A5-1', level: 2 },
  { id: 140, typeCode: '2', name: '城建档案馆工作', parentId: 23, classCode: 'A5-2', level: 2 },
  { id: 141, typeCode: '3', name: '城建档案学会工作', parentId: 23, classCode: 'A5-3', level: 2 },

  // B3 控制测量
  { id: 142, typeCode: '1', name: '平面控制', parentId: 26, classCode: 'B3-1', level: 2 },
  { id: 143, typeCode: '2', name: '高程控制', parentId: 26, classCode: 'B3-2', level: 2 },

  // B4 地形测量
  { id: 144, typeCode: '1', name: '文字材料', parentId: 27, classCode: 'B4-1', level: 2 },
  { id: 145, typeCode: '2', name: '1：500地形图', parentId: 27, classCode: 'B4-2', level: 2 },
  { id: 146, typeCode: '3', name: '1：1000地形图', parentId: 27, classCode: 'B4-3', level: 2 },
  { id: 147, typeCode: '4', name: '其它比例尺地形图', parentId: 27, classCode: 'B4-4', level: 2 },

  // B5 摄影测量
  { id: 148, typeCode: '1', name: '文字材料', parentId: 28, classCode: 'B5-1', level: 2 },
  { id: 149, typeCode: '2', name: '底片', parentId: 28, classCode: 'B5-2', level: 2 },
  { id: 150, typeCode: '3', name: '相片', parentId: 28, classCode: 'B5-3', level: 2 },

  // B6 地图
  { id: 151, typeCode: '1', name: '行政地图', parentId: 29, classCode: 'B6-1', level: 2 },
  { id: 152, typeCode: '2', name: '专业地图', parentId: 29, classCode: 'B6-2', level: 2 },
  { id: 153, typeCode: '3', name: '图集', parentId: 29, classCode: 'B6-3', level: 2 },

  // C1 国土规划
  { id: 154, typeCode: '1', name: '市域国土总体规划', parentId: 30, classCode: 'C1-1', level: 2 },
  { id: 155, typeCode: '2', name: '城区土地开发规划', parentId: 30, classCode: 'C1-2', level: 2 },
  { id: 156, typeCode: '3', name: '村镇土地规划', parentId: 30, classCode: 'C1-3', level: 2 },

  // C4 详细规划
  { id: 157, typeCode: '1', name: '旧城改造规划', parentId: 33, classCode: 'C4-1', level: 2 },
  { id: 158, typeCode: '2', name: '小区规划', parentId: 33, classCode: 'C4-2', level: 2 },
  { id: 159, typeCode: '3', name: '单项工程规划', parentId: 33, classCode: 'C4-3', level: 2 },

  // C5 县镇规划
  { id: 160, typeCode: '1', name: '城区规划', parentId: 34, classCode: 'C5-1', level: 2 },
  { id: 161, typeCode: '2', name: '镇域规划', parentId: 34, classCode: 'C5-2', level: 2 },
  { id: 162, typeCode: '3', name: '村域规划', parentId: 34, classCode: 'C5-3', level: 2 },

  // C6 规划基础材料
  { id: 163, typeCode: '1', name: '城市社会经济材料', parentId: 35, classCode: 'C6-1', level: 2 },
  { id: 164, typeCode: '2', name: '城市自然条件材料', parentId: 35, classCode: 'C6-2', level: 2 },
  { id: 165, typeCode: '3', name: '城市历史沿革', parentId: 35, classCode: 'C6-3', level: 2 },

  // D2 规划管理
  { id: 166, typeCode: '1', name: '用地规划管理', parentId: 38, classCode: 'D2-1', level: 2 },
  { id: 167, typeCode: '2', name: '规划设计管理', parentId: 38, classCode: 'D2-2', level: 2 },
  { id: 168, typeCode: '3', name: '单位建设工程规划管理', parentId: 38, classCode: 'D2-3', level: 2 },
  { id: 169, typeCode: '4', name: '私人建设工程规划管理', parentId: 38, classCode: 'D2-4', level: 2 },
  { id: 170, typeCode: '5', name: '管线工程规划管理', parentId: 38, classCode: 'D2-5', level: 2 },
  { id: 171, typeCode: '6', name: '规划监察', parentId: 38, classCode: 'D2-6', level: 2 },

  // D3 建设工程管理
  { id: 172, typeCode: '1', name: '工程管理', parentId: 39, classCode: 'D3-1', level: 2 },
  { id: 173, typeCode: '2', name: '行业管理', parentId: 39, classCode: 'D3-2', level: 2 },
  { id: 174, typeCode: '3', name: '图审管理', parentId: 39, classCode: 'D3-3', level: 2 },

  // D4 房地产管理
  { id: 175, typeCode: '1', name: '地籍图', parentId: 40, classCode: 'D4-1', level: 2 },
  { id: 176, typeCode: '2', name: '产权、产证', parentId: 40, classCode: 'D4-2', level: 2 },
  { id: 177, typeCode: '3', name: '房屋普查成果', parentId: 40, classCode: 'D4-3', level: 2 },

  // D5 地名管理
  { id: 178, typeCode: '1', name: '地名沿革', parentId: 41, classCode: 'D5-1', level: 2 },
  { id: 179, typeCode: '2', name: '命名，更名', parentId: 41, classCode: 'D5-2', level: 2 },
  { id: 180, typeCode: '3', name: '地名成果', parentId: 41, classCode: 'D5-3', level: 2 },

  // D6 征收管理
  { id: 181, typeCode: '1', name: '征收（拆迁）审批', parentId: 42, classCode: 'D6-1', level: 2 },
  { id: 182, typeCode: '2', name: '征收（拆迁）项目', parentId: 42, classCode: 'D6-2', level: 2 },
  { id: 183, typeCode: '3', name: '其他', parentId: 42, classCode: 'D6-3', level: 2 },

  // E1 道路、广场
  { id: 184, typeCode: '1', name: '主干道', parentId: 43, classCode: 'E1-1', level: 2 },
  { id: 185, typeCode: '2', name: '次干道', parentId: 43, classCode: 'E1-2', level: 2 },
  { id: 186, typeCode: '3', name: '生活区道路', parentId: 43, classCode: 'E1-3', level: 2 },
  { id: 187, typeCode: '4', name: '广场', parentId: 43, classCode: 'E1-4', level: 2 },

  // E2 桥梁
  { id: 188, typeCode: '1', name: '一般桥', parentId: 44, classCode: 'E2-1', level: 2 },
  { id: 189, typeCode: '2', name: '立交桥', parentId: 44, classCode: 'E2-2', level: 2 },

  // E5 排水
  { id: 190, typeCode: '1', name: '河道', parentId: 47, classCode: 'E5-1', level: 2 },
  { id: 191, typeCode: '2', name: '排水管线', parentId: 47, classCode: 'E5-2', level: 2 },
  { id: 192, typeCode: '3', name: '排水泵站', parentId: 47, classCode: 'E5-3', level: 2 },
  { id: 193, typeCode: '4', name: '污水处理厂', parentId: 47, classCode: 'E5-4', level: 2 },
  { id: 194, typeCode: '5', name: '综合性资料', parentId: 47, classCode: 'E5-5', level: 2 },

  // E6 环境卫生
  { id: 195, typeCode: '1', name: '公厕', parentId: 48, classCode: 'E6-1', level: 2 },
  { id: 196, typeCode: '2', name: '垃圾处理站、场', parentId: 48, classCode: 'E6-2', level: 2 },
  { id: 197, typeCode: '3', name: '环卫综合性资料', parentId: 48, classCode: 'E6-3', level: 2 },

  // F1 给水
  { id: 198, typeCode: '1', name: '水厂（含取水口工程）', parentId: 50, classCode: 'F1-1', level: 2 },
  { id: 199, typeCode: '2', name: '增压站', parentId: 50, classCode: 'F1-2', level: 2 },
  { id: 200, typeCode: '3', name: '给水管线', parentId: 50, classCode: 'F1-3', level: 2 },
  { id: 201, typeCode: '4', name: '地下水井工程', parentId: 50, classCode: 'F1-4', level: 2 },
  { id: 202, typeCode: '5', name: '综合性资料', parentId: 50, classCode: 'F1-5', level: 2 },

  // F2 供气
  { id: 203, typeCode: '1', name: '煤气厂', parentId: 51, classCode: 'F2-1', level: 2 },
  { id: 204, typeCode: '2', name: '煤气管线', parentId: 51, classCode: 'F2-2', level: 2 },
  { id: 205, typeCode: '3', name: '石油液化气工程', parentId: 51, classCode: 'F2-3', level: 2 },
  { id: 206, typeCode: '4', name: '调压站', parentId: 51, classCode: 'F2-4', level: 2 },
  { id: 207, typeCode: '5', name: '储气罐', parentId: 51, classCode: 'F2-5', level: 2 },
  { id: 208, typeCode: '6', name: '其它', parentId: 51, classCode: 'F2-6', level: 2 },

  // F3 供热
  { id: 209, typeCode: '1', name: '供热工程', parentId: 52, classCode: 'F3-1', level: 2 },
  { id: 210, typeCode: '2', name: '供热管线', parentId: 52, classCode: 'F3-2', level: 2 },
  { id: 211, typeCode: '3', name: '其它', parentId: 52, classCode: 'F3-3', level: 2 },

  // F4 公共交通（含地铁）
  { id: 212, typeCode: '1', name: '公交场、站', parentId: 53, classCode: 'F4-1', level: 2 },
  { id: 213, typeCode: '2', name: '地铁', parentId: 53, classCode: 'F4-2', level: 2 },
  { id: 214, typeCode: '3', name: '综合性材料', parentId: 53, classCode: 'F4-3', level: 2 },

  // F5 供电
  { id: 215, typeCode: '1', name: '发电厂', parentId: 54, classCode: 'F5-1', level: 2 },
  { id: 216, typeCode: '2', name: '供电管线', parentId: 54, classCode: 'F5-2', level: 2 },
  { id: 217, typeCode: '3', name: '变电所、站', parentId: 54, classCode: 'F5-3', level: 2 },
  { id: 218, typeCode: '4', name: '其它', parentId: 54, classCode: 'F5-4', level: 2 },

  // F6 电讯
  { id: 219, typeCode: '1', name: '电讯工程', parentId: 55, classCode: 'F6-1', level: 2 },
  { id: 220, typeCode: '2', name: '微波、载波工程', parentId: 55, classCode: 'F6-2', level: 2 },
  { id: 221, typeCode: '3', name: '电讯管线', parentId: 55, classCode: 'F6-3', level: 2 },
  { id: 222, typeCode: '4', name: '邮政工程', parentId: 55, classCode: 'F6-4', level: 2 },

  // F7 广播、电视
  { id: 223, typeCode: '1', name: '电视台、塔', parentId: 56, classCode: 'F7-1', level: 2 },
  { id: 224, typeCode: '2', name: '有线电视', parentId: 56, classCode: 'F7-2', level: 2 },
  { id: 225, typeCode: '3', name: '线路工程', parentId: 56, classCode: 'F7-3', level: 2 },

  // G1 铁路
  { id: 226, typeCode: '1', name: '客、货运站', parentId: 57, classCode: 'G1-1', level: 2 },
  { id: 227, typeCode: '2', name: '桥、涵、隧道', parentId: 57, classCode: 'G1-2', level: 2 },

  // G2 公路
  { id: 228, typeCode: '1', name: '站、场', parentId: 58, classCode: 'G2-1', level: 2 },
  { id: 229, typeCode: '2', name: '公路工程', parentId: 58, classCode: 'G2-2', level: 2 },
  { id: 230, typeCode: '3', name: '桥、涵、隧道', parentId: 58, classCode: 'G2-3', level: 2 },

  // G3 水运
  { id: 231, typeCode: '1', name: '港口、码头', parentId: 59, classCode: 'G3-1', level: 2 },
  { id: 232, typeCode: '2', name: '船闸', parentId: 59, classCode: 'G3-2', level: 2 },
  { id: 233, typeCode: '3', name: '航道工程', parentId: 59, classCode: 'G3-3', level: 2 },

  // G4 航空
  { id: 234, typeCode: '1', name: '机场建设工程', parentId: 60, classCode: 'G4-1', level: 2 },
  { id: 235, typeCode: '2', name: '通讯、导航设施', parentId: 60, classCode: 'G4-2', level: 2 },
  { id: 236, typeCode: '3', name: '综合材料', parentId: 60, classCode: 'G4-3', level: 2 },

  // I1 住宅
  { id: 237, typeCode: '1', name: '住宅小区', parentId: 75, classCode: 'I1-1', level: 2 },
  { id: 238, typeCode: '2', name: '单位住宅（宿舍）', parentId: 75, classCode: 'I1-2', level: 2 },
  { id: 239, typeCode: '3', name: '其他住宅', parentId: 75, classCode: 'I1-3', level: 2 },
  { id: 240, typeCode: '4', name: '通用图集', parentId: 75, classCode: 'I1-4', level: 2 },

  // I2 办公
  { id: 241, typeCode: '1', name: '政府机关', parentId: 76, classCode: 'I2-1', level: 2 },
  { id: 242, typeCode: '2', name: '事业单位', parentId: 76, classCode: 'I2-2', level: 2 },
  { id: 243, typeCode: '3', name: '企业单位', parentId: 76, classCode: 'I2-3', level: 2 },
  { id: 244, typeCode: '4', name: '涉外单位', parentId: 76, classCode: 'I2-4', level: 2 },

  // I3 文化
  { id: 245, typeCode: '1', name: '文化设施', parentId: 77, classCode: 'I3-1', level: 2 },
  { id: 246, typeCode: '2', name: '娱乐设施', parentId: 77, classCode: 'I3-2', level: 2 },
  { id: 247, typeCode: '3', name: '其它设施', parentId: 77, classCode: 'I3-3', level: 2 },

  // I4 教育
  { id: 248, typeCode: '1', name: '大专院校', parentId: 78, classCode: 'I4-1', level: 2 },
  { id: 249, typeCode: '2', name: '中专、中学、技校', parentId: 78, classCode: 'I4-2', level: 2 },
  { id: 250, typeCode: '3', name: '小学、幼儿园、托儿所', parentId: 78, classCode: 'I4-3', level: 2 },
  { id: 251, typeCode: '4', name: '其它教育机构', parentId: 78, classCode: 'I4-4', level: 2 },

  // I5 卫生
  { id: 252, typeCode: '1', name: '医院，防疫站', parentId: 79, classCode: 'I5-1', level: 2 },
  { id: 253, typeCode: '2', name: '疗养院', parentId: 79, classCode: 'I5-2', level: 2 },
  { id: 254, typeCode: '3', name: '其它', parentId: 79, classCode: 'I5-3', level: 2 },

  // I6 体育
  { id: 255, typeCode: '1', name: '体育场、馆', parentId: 80, classCode: 'I6-1', level: 2 },
  { id: 256, typeCode: '2', name: '其它体育设施', parentId: 80, classCode: 'I6-2', level: 2 },

  // I7 商业、金融、保险
  { id: 257, typeCode: '1', name: '商业', parentId: 81, classCode: 'I7-1', level: 2 },
  { id: 258, typeCode: '2', name: '饮服', parentId: 81, classCode: 'I7-2', level: 2 },
  { id: 259, typeCode: '3', name: '宾馆、招待所', parentId: 81, classCode: 'I7-3', level: 2 },
  { id: 260, typeCode: '4', name: '金融、保险', parentId: 81, classCode: 'I7-4', level: 2 },

  // I8 其它
  { id: 261, typeCode: '1', name: '社会福利，殡葬', parentId: 82, classCode: 'I8-1', level: 2 },
  { id: 262, typeCode: '2', name: '消防、监狱', parentId: 82, classCode: 'I8-2', level: 2 },
  { id: 263, typeCode: '3', name: '专业仓库，加油站', parentId: 82, classCode: 'I8-3', level: 2 },

  // J1 公园
  { id: 264, typeCode: '1', name: '古典园林', parentId: 83, classCode: 'J1-1', level: 2 },
  { id: 265, typeCode: '2', name: '公园', parentId: 83, classCode: 'J1-2', level: 2 },

  // J2 绿化、苗圃
  { id: 266, typeCode: '1', name: '公共绿地', parentId: 84, classCode: 'J2-1', level: 2 },
  { id: 267, typeCode: '2', name: '苗圃', parentId: 84, classCode: 'J2-2', level: 2 },

  // J4 纪念性建筑
  { id: 268, typeCode: '1', name: '烈士陵园', parentId: 86, classCode: 'J4-1', level: 2 },
  { id: 269, typeCode: '2', name: '名人墓地', parentId: 86, classCode: 'J4-2', level: 2 },
  { id: 270, typeCode: '3', name: '纪念馆', parentId: 86, classCode: 'J4-3', level: 2 },

  // J6 名胜古迹
  { id: 271, typeCode: '1', name: '城墙、门楼', parentId: 88, classCode: 'J6-1', level: 2 },
  { id: 272, typeCode: '2', name: '寺庙', parentId: 88, classCode: 'J6-2', level: 2 },
  { id: 273, typeCode: '3', name: '亭塔', parentId: 88, classCode: 'J6-3', level: 2 },
  { id: 274, typeCode: '4', name: '碑、坊、石雕、石刻', parentId: 88, classCode: 'J6-4', level: 2 },
  { id: 275, typeCode: '5', name: '其他', parentId: 88, classCode: 'J6-5', level: 2 },

  // K2 环境监测
  { id: 276, typeCode: '1', name: '大气监测', parentId: 91, classCode: 'K2-1', level: 2 },
  { id: 277, typeCode: '2', name: '水源监测', parentId: 91, classCode: 'K2-2', level: 2 },
  { id: 278, typeCode: '3', name: '噪声监测', parentId: 91, classCode: 'K2-3', level: 2 },

  // K3 环境治理
  { id: 279, typeCode: '1', name: '污染治理工程', parentId: 92, classCode: 'K3-1', level: 2 },
  { id: 280, typeCode: '2', name: '违章处理', parentId: 92, classCode: 'K3-2', level: 2 },

  // R1 照片
  { id: 281, typeCode: '1', name: '城市综合风貌', parentId: 120, classCode: 'R1-1', level: 2 },
  { id: 282, typeCode: '2', name: '城市管理', parentId: 120, classCode: 'R1-2', level: 2 },
  { id: 283, typeCode: '3', name: '市政公用设施', parentId: 120, classCode: 'R1-3', level: 2 },
  { id: 284, typeCode: '4', name: '工业、民用建筑', parentId: 120, classCode: 'R1-4', level: 2 },
  { id: 285, typeCode: '5', name: '文化、体育设施', parentId: 120, classCode: 'R1-5', level: 2 },
  { id: 286, typeCode: '6', name: '园林绿化、名胜古迹', parentId: 120, classCode: 'R1-6', level: 2 },
  { id: 287, typeCode: '7', name: '会议（活动）材料', parentId: 120, classCode: 'R1-7', level: 2 },
  { id: 288, typeCode: '8', name: '其它', parentId: 120, classCode: 'R1-8', level: 2 },
  { id: 289, typeCode: '9', name: '乡镇', parentId: 120, classCode: 'R1-9', level: 2 },

  // R3 录像带
  { id: 290, typeCode: '1', name: '大1/2录像带', parentId: 122, classCode: 'R3-1', level: 2 },
  { id: 291, typeCode: '2', name: '3/4录像带', parentId: 122, classCode: 'R3-2', level: 2 },
  { id: 292, typeCode: '3', name: '其它规格录像带', parentId: 122, classCode: 'R3-3', level: 2 },

  // R6 工程声像档案
  { id: 293, typeCode: '1', name: '工程照片档案', parentId: 125, classCode: 'R6-1', level: 2 },
  { id: 294, typeCode: '2', name: '工程录像档案', parentId: 125, classCode: 'R6-2', level: 2 },
];

// 缓存
const ROOTS = ALL_TYPES.filter(t => t.level === 0);
const CHILDREN_MAP = new Map<number, ArchiveTypeNode[]>();
for (const t of ALL_TYPES) {
  const list = CHILDREN_MAP.get(t.parentId) || [];
  list.push(t);
  CHILDREN_MAP.set(t.parentId, list);
}

/** 获取所有大类（Level 0） */
export function getMajorTypes(): ArchiveTypeNode[] {
  return ROOTS;
}

/** 根据大类 ID 获取小类列表 */
export function getSubTypes(majorId: number): ArchiveTypeNode[] {
  return CHILDREN_MAP.get(majorId) || [];
}

/** 根据小类 ID 获取子类列表 */
export function getDetailTypes(subId: number): ArchiveTypeNode[] {
  return CHILDREN_MAP.get(subId) || [];
}

/** 判断某节点是否有子节点 */
export function hasChildren(id: number): boolean {
  return (CHILDREN_MAP.get(id)?.length ?? 0) > 0;
}

/** 根据节点 ID 查找 */
export function findById(id: number): ArchiveTypeNode | undefined {
  return ALL_TYPES.find(t => t.id === id);
}

/** 格式化显示完整路径 */
export function formatTypePath(majorId: number, subId?: number, detailId?: number): string {
  const parts: string[] = [];
  const major = findById(majorId);
  if (major) parts.push(`${major.classCode} ${major.name}`);
  if (subId) {
    const sub = findById(subId);
    if (sub) parts.push(`${sub.classCode} ${sub.name}`);
  }
  if (detailId) {
    const detail = findById(detailId);
    if (detail) parts.push(`${detail.classCode} ${detail.name}`);
  }
  return parts.join(' → ');
}
