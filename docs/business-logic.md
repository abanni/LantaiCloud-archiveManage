# 业务逻辑与流程

> 兰台云-数智馆藏——业务层设计文档。

---

## 整体架构

```mermaid
flowchart TB
    subgraph UI["前端表示层"]
        direction TB
        Login["登录页"]
        Sidebar["侧栏导航"]
        Dashboard["首页统计"]
        Ingest["入库模块"]
        Search["综合查询"]
        Fulltext["全文检索"]
        Utilize["档案利用"]
        Stats["统计图表"]
        ArchiveMgmt["档案馆管理"]
    end

    subgraph Data["数据层"]
        direction TB
        ArchiveJSON["archiveData.json<br/>~54K 条档案记录"]
        ArchiveTypes["archiveTypes.ts<br/>295 条分类树"]
        DashboardData["dashboardData.ts<br/>统计数据"]
        TxtFields["*.txt 文件<br/>4 级著录单字段定义"]
        MockUsers["constants.ts<br/>模拟用户/权限"]
    end

    subgraph Core["核心逻辑"]
        direction TB
        TreeBuilder["buildArchiveTree()<br/>parent_id 递归构建 4 级树"]
        ArchiveLoader["archiveLoader.ts<br/>数据加载+树构建"]
        IngestFlow["入库 4 步流程"]
        CodeGen["档号自动生成"]
        RoleCheck["角色权限校验"]
    end

    UI --> Core
    Core --> Data
```

---

## 角色体系

```mermaid
flowchart LR
    subgraph Roles["角色体系"]
        HJJ["黄晶晶 (hjj)<br/>管理科·科长"]
        LJ["李进 (lj)<br/>编研利用科·科员"]
        GXQ["高兴全 (gxq)<br/>业务科·科长"]
        HXH["黄晓红 (hxh)<br/>馆长室·馆长"]
    end

    subgraph Perms["权限矩阵"]
        HOME["🏠 首页"]
        ING["📦 入库"]
        SRCH["🔍 综合查询"]
        FT["📖 全文检索"]
        UTL["📋 利用"]
        STAT["📊 统计"]
        AM["🏛 档案馆管理"]
    end

    HJJ --> HOME & ING & SRCH & FT & UTL & STAT & AM
    LJ --> HOME & SRCH & FT & UTL & STAT & AM
    GXQ --> HOME & SRCH & FT & STAT & AM
    HXH --> HOME & SRCH & FT & STAT & AM
```

权限校验在 `App.tsx` 中通过 `currentUser.permissions.includes(currentView)` 实现，越权访问显示"访问受限"提示。

---

## 数据模型关系

```mermaid
erDiagram
    ARCHIVE_RECORD ||--o{ ARCHIVE_RECORD : "parent_id → file_id"
    ARCHIVE_RECORD {
        string file_id PK
        string project_id
        string parent_id FK
        string ancestors
        string tag "zj|zj_item|zj_volume|''"
        string file_type "folder|file"
        string file_name
        string order_no
        string construction_company
        string built_area
        string storage_period
        string url
        string bit_size
    }

    ARCHIVE_TREE_NODE {
        string id
        string type "PROJECT|UNIT|VOLUME|FILE"
        string label
        boolean expanded
        ArchiveRecord data
    }

    INGEST_TASK {
        string id
        string taskId
        string fileName
        string status "shelving|cataloging|completed|parse_error"
        int unitCount
        int volumeCount
        object validationResults
    }

    USER {
        string id
        string username
        string name
        string department
        string role
        string[] permissions
    }

    UTILIZATION_RECORD {
        string id
        string archiveId
        string archiveTitle
        string userName
        string purpose
        string type "View|Download|Print"
        string result "Success|Denied"
    }
```

---

## 用户操作流程

### 入库流程（4 步）

```mermaid
flowchart TB
    START([开始]) --> Step1["步骤1：上传<br/>Step1Upload.tsx"]
    Step1 -->|"状态: shelving"| Step2["步骤2：检测<br/>Step2Inspection.tsx"]
    Step2 -->|"点击'去著录'"| Step3["步骤3：著录<br/>Step3Catalog.tsx"]
    Step3 -->|"点击'入库'"| Step4["步骤4：入库确认<br/>Step4Confirm.tsx"]
    Step4 -->|"点击'确认入库'"| DONE([入库完成])

    subgraph Step3_Detail["著录步骤详情"]
        TREE["左侧：档案目录结构<br/>4 级树（可折叠/展开）"]
        FORM["右侧：著录单<br/>按层级显示对应字段"]
        FORM --> |项目级| PROJ_FORM["9 类 51 字段"]
        FORM --> |工程级| UNIT_FORM["6 类 40 字段"]
        FORM --> |案卷级| VOL_FORM["2 类 15 字段"]
        FORM --> |文件级| FILE_FORM["6 类 24 字段"]
    end

    Step1 -->|"状态: cataloging"| Step3
    Step3_Detail -.-> Step3
```

### 查询与利用流程

```mermaid
flowchart LR
    START([用户]) --> Search["综合查询 / 全文检索"]
    Search --> Basket["加入选择篮<br/>SelectionItem[]"]
    Basket --> Utilize["档案利用"]
    Utilize --> Record["生成利用记录<br/>UtilizationRecord"]
    Record --> WATERMARK["水印保护"]
```

---

## 路由总览

### Hash 路由

| Hash | 视图 | 组件 |
|------|------|------|
| `#/dashboard` | 首页统计 | `Dashboard.tsx` |
| `#/ingest` | 入库管理 | `IngestModule.tsx` |
| `#/search` | 综合查询 | `ComprehensiveSearch.tsx` |
| `#/fulltext` | 全文检索 | `FullTextSearch.tsx` |
| `#/utilize` | 档案利用 | `UtilizationModule.tsx` |
| `#/stats` | 统计图表 | `StatisticsModule.tsx` |
| `#/archive-mgmt` | 档案馆管理 | `ArchiveManagement.tsx` |

路由分发在 `App.tsx` 中通过 `ViewState` 枚举 + `window.location.hash` 实现。不支持外部路由框架，使用原生 hashchange 事件监听。

### 侧栏导航（ViewState）

```
ViewState enum:
  HOME = 'home'          → #/dashboard
  INGEST = 'ingest'      → #/ingest
  COMPREHENSIVE = 'search'  → #/search
  FULLTEXT = 'fulltext'  → #/fulltext
  UTILIZE = 'utilize'    → #/utilize
  STATS = 'stats'        → (侧栏不直接暴露，从首页进入)
  ARCHIVE_MGMT = 'archive_mgmt' → #/archive-mgmt
```
