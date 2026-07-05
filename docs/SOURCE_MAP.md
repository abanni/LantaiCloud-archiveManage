# 源码文件功能映射

> 建筑工程档案全生命周期管理 SaaS 系统。源码文件功能映射。

---

## 根目录

| 文件 | 功能 |
|------|------|
| `index.html` | HTML 入口，引入 Tailwind CDN、设置 importmap、挂载点 `<div id="root">` |
| `index.tsx` | React 入口，`ReactDOM.createRoot` 挂载 App |
| `App.tsx` | 应用核心：ViewState 路由分发、Hash 路由同步、权限校验、用户状态管理、全局选择篮 |
| `types.ts` | 全局类型：`ArchiveItem`, `IngestTask`, `UtilizationRecord`, `User`, `SelectionItem`, 枚举 |
| `constants.ts` | 模拟数据：`MOCK_ARCHIVES`（5条档案）、`MOCK_LOGS`（3条利用记录）、`MOCK_USERS`（4个角色/权限定义） |
| `package.json` | 依赖管理：React 19, Recharts, Lucide, Vite 6, TypeScript 5.8 |
| `vite.config.ts` | Vite 配置：`@` 别名、React 插件、Gemini API Key 环境变量注入 |
| `tsconfig.json` | TypeScript 编译配置 |
| `README.md` | 项目总览文档 |

---

## `types/` — 类型定义

| 文件 | 功能 |
|------|------|
| `archive.ts` | 档案核心类型：`ArchiveRecord`（45个字段，对应 JSON 数据结构）、`ArchiveTreeNode`（4级树节点） |

---

## `components/` — 通用组件

| 文件 | 功能 |
|------|------|
| `Navigation.tsx` | 侧栏导航组件。定义 `ViewState` 枚举（7个视图），渲染左侧菜单栏，底部包含档案馆管理入口 + 机构信息 |
| `Login.tsx` | 登录页。4个角色卡片选择，点击后触发 `onLogin` 回调 |
| `UserSwitcher.tsx` | 顶部用户切换下拉。显示当前角色信息、支持角色切换、退出登录 |

---

## `views/` — 页面视图

### 首页

| 文件 | 功能 |
|------|------|
| `Dashboard.tsx` | 统计看板。包含：档案总数卡片（5种类型）、近6个月入库趋势折线图、档案类型分布饼图、密级分布柱状图。支持周期筛选（近7天/30天/12个月） |

### 入库模块

| 文件 | 功能 |
|------|------|
| `IngestModule.tsx` | **入库主模块**。4步流程状态机编排：步骤指示器、`buildTreeFromJson()` 构建 4 级档案树、7 条模拟任务数据 |
| `Step1Upload.tsx` | **步骤1：上传**。任务列表表格，根据状态显示不同操作按钮（检测/著录/入库/重新上传），状态徽章 |
| `Step2Inspection.tsx` | **步骤2：检测**。档案检测结果展示：文件信息概览、4项检测指标（真实性/完整性/可用性/安全性）可折叠 |
| `Step3Catalog.tsx` | **步骤3：著录**。左侧可折叠 4 级目录树（项目→工程→案卷→文件）、右侧著录单（方案C公文表格风格、双列网格布局、浅蓝底色）。4 级著录单字段定义硬编码在组件内，对应 `data/*.txt` |
| `Step4Confirm.tsx` | **步骤4：入库确认**。档案类型确认（一类/二类/三类级联选择）、待入库档案列表（4 级树表，展开到案卷级，三个案卷级字段自然递增） |

### 查询模块

| 文件 | 功能 |
|------|------|
| `ComprehensiveSearch.tsx` | **综合查询**。多条件检索：档案类型、密级、日期范围、状态筛选。结果列表 + 加入选择篮功能 |
| `FullTextSearch.tsx` | **全文检索**。关键词搜索 + 类型/密级筛选 |
| `SearchModule.tsx` | 查询模块备用组件 |

### 利用模块

| 文件 | 功能 |
|------|------|
| `UtilizationModule.tsx` | **档案利用**。Tab 切换：利用申请（选择篮档案列表+提交）、利用记录查询（按用户/档案/日期筛选+导出）、利用统计（月度趋势/类型分布图表） |

### 统计与档案馆管理

| 文件 | 功能 |
|------|------|
| `StatisticsModule.tsx` | **统计图表**。柱状图/折线图/饼图分析 |
| `ArchiveManagement.tsx` | **档案馆管理入口**。显示当前机构信息 |

---

## `data/` — 数据层

| 文件 | 功能 |
|------|------|
| `archiveData.json` | **档案原始数据**。约 54,853 行、150 万字符。包含项目级→工程级→案卷级→文件级 4 级结构，通过 `parent_id` 和 `ancestors` 建立层级。字段含 `tag`（zj/zj_item/zj_volume/空）、`file_type`（folder/file） |
| `archiveLoader.ts` | 档案数据加载器。`buildArchiveTree()` 从扁平 JSON 递归构建 `ArchiveTreeNode` 树，提取唯一的工程级/案卷级数据 |
| `archiveTypes.ts` | **295 条档案分类树**。`getMajorTypes()` / `getSubTypes()` / `getDetailTypes()` / `formatTypePath()` 等函数。三级分类（一类→二类→三类），含 `classCode`（如 I1-1） |
| `dashboardData.ts` | 首页统计模拟数据 |
| `项目级著录单字段.txt` | 项目级著录字段定义：9 类 51 字段 |
| `工程级著录单字段.txt` | 工程级著录字段定义：6 类 40 字段 |
| `案卷级著录单字段.txt` | 案卷级著录字段定义：2 类 15 字段 |
| `文件级著录单字段.txt` | 文件级著录字段定义：6 类 24 字段 |

---

## `public/css/` — 样式

| 文件 | 功能 |
|------|------|
| `global.css` | 全局基础样式：滚动条美化、文字选中色、链接样式、快捷键提示 |
| `components.css` | 组件样式类：卡片、模态框、按钮、徽章、表格、表单输入框 |
