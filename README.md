# 兰台云-数智馆藏

> 建筑工程档案全生命周期管理 SaaS 系统，覆盖档案入库、著录、查询、检索、利用全流程。

---

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 🏠 **首页** | `#/dashboard` | 统计概览：档案总数、入库趋势、按类型/密级分布 |
| 📦 **入库** | `#/ingest` | 4步流程：**上传 → 检测 → 著录 → 入库确认** |
| 🔍 **综合查询** | `#/search` | 多条件组合检索（类型、密级、日期、状态） |
| 📖 **全文检索** | `#/fulltext` | 关键词全文搜索 |
| 📋 **利用** | `#/utilize` | 档案借阅管理、利用记录查询、利用统计 |
| 📊 **统计** | `#/stats` | 图表分析（柱状图、折线图、饼图） |
| 🏛 **档案馆管理** | `#/archive-mgmt` | 机构管理入口（底部侧栏） |

---

## 技术栈

| 层 | 技术 |
|---|------|
| **框架** | React 19 |
| **语言** | TypeScript 5.8 |
| **构建** | Vite 6 |
| **UI** | Tailwind CSS 4（CDN Play） |
| **图标** | Lucide React |
| **图表** | Recharts |
| **路由** | Hash 路由（`window.location.hash`） |

---

## 启动方式

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 默认端口: 5173，自动打开 http://localhost:5173
```

---

## 核心数据模型

### 档案层级（4级树）

```
项目级 (PROJECT)  ──  tag='zj'
  └─ 工程级 (UNIT)  ──  tag='zj_item'
       └─ 案卷级 (VOLUME)  ──  tag='zj_volume'
            └─ 文件级 (FILE)  ──  file_type='file'
```

数据源：`data/archiveData.json`（约 54,000+ 条记录），通过 `parent_id` + `ancestors` 字段递归构建树。

### 档案分类（一类/二类/三类）

由 `data/archiveTypes.ts` 定义，共 295 条分类树：
- **一类**（大类）：如 I 综合类、J 工业建筑
- **二类**（小类）：如 I1 综合类通用文件
- **三类**（子类）：如 I1-1 综合管理

### 档号规则

```
I1-1-{项目流水号}-{工程流水号}-{案卷流水号}-{文件流水号}
```

| 层级 | 档号示例 | 专属字段 |
|------|---------|---------|
| 项目级 | `I1-1-029605` | — |
| 工程级 | `I1-1-029605-001` | — |
| 案卷级 | `I1-1-029605-001-001` | 总登记号 / 大类流水号 / 案卷档号 |
| 文件级 | `I1-1-029605-001-001-001` | — |

### 档案著录单（4级）

| 层级 | 分类数 | 总字段数 | 字段定义 |
|------|-------|---------|---------|
| 项目级著录 | 9 类 | 51 字段 | `data/项目级著录单字段.txt` |
| 工程级著录 | 6 类 | 40 字段 | `data/工程级著录单字段.txt` |
| 案卷级著录 | 2 类 | 15 字段 | `data/案卷级著录单字段.txt` |
| 文件级著录 | 6 类 | 24 字段 | `data/文件级著录单字段.txt` |

---

## 角色体系

| 角色 | 部门 | 权限 |
|------|------|------|
| **黄晶晶**（hjj） | 管理科·科长 | 全部模块 |
| **李进**（lj） | 编研利用科·科员 | 首页、查询、全文检索、利用、统计、档案馆管理 |
| **高兴全**（gxq） | 业务科·科长 | 首页、查询、全文检索、统计、档案馆管理 |
| **黄晓红**（hxh） | 馆长室·馆长 | 首页、查询、全文检索、统计、档案馆管理 |

用户数据定义在 `constants.ts`，支持在顶部 UserSwitcher 下拉切换角色。

---

## 目录结构

```
src/
├── App.tsx                    # 应用入口 + 路由分发
├── index.tsx                  # React 挂载点
├── types.ts                   # 全局类型定义
├── types/archive.ts           # 档案核心类型
├── constants.ts               # 模拟数据、用户、权限
├── components/
│   ├── Navigation.tsx         # 侧栏导航 (ViewState 枚举)
│   ├── Login.tsx              # 登录页
│   └── UserSwitcher.tsx       # 用户切换下拉
├── views/
│   ├── Dashboard.tsx          # 首页统计
│   ├── IngestModule.tsx       # 入库主模块（4步流程编排）
│   ├── Step1Upload.tsx        # 步骤1：上传
│   ├── Step2Inspection.tsx    # 步骤2：检测
│   ├── Step3Catalog.tsx       # 步骤3：著录
│   ├── Step4Confirm.tsx       # 步骤4：入库确认
│   ├── ComprehensiveSearch.tsx # 综合查询
│   ├── FullTextSearch.tsx     # 全文检索
│   ├── UtilizationModule.tsx  # 档案利用
│   ├── StatisticsModule.tsx   # 统计图表
│   ├── ArchiveManagement.tsx  # 档案馆管理
│   └── SearchModule.tsx       # 查询模块（备用）
├── data/
│   ├── archiveData.json       # 档案原始数据（约54K条）
│   ├── archiveLoader.ts       # 树构建逻辑
│   ├── archiveTypes.ts        # 295条类型树
│   ├── dashboardData.ts       # 首页统计模拟数据
│   └── *.txt                  # 四级著录单字段定义
├── public/css/
│   ├── global.css             # 全局基础样式
│   └── components.css         # 组件样式
├── index.html                 # HTML 入口
├── vite.config.ts             # Vite 配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 依赖管理
```
