# FastCurd - 通用 CRUD 管理系统脚手架

基于 `Next.js 15`、`React 19`、`SQLite3` 的通用 CRUD 管理系统，只需定义一个 JSON 配置文件，即可自动生成完整的数据库表、API 接口和前端管理页面。

## 核心特性

- **零代码生成**：只需编写一个 Schema 配置文件
- **自动建表**：首次访问时自动创建数据库表
- **完整 CRUD**：包含列表、新增、编辑、删除全功能
- **动态路由**：无需重启服务，添加新模块无需修改代码
- **类型支持**：支持多种数据类型（字符串、数字、布尔、日期等）

## 技术栈

- Next.js 15（App Router）
- React 19
- SQLite3
- 零额外依赖

## 安装与启动

```bash
npm install
npm run dev
```

启动后访问：`http://localhost:3000`

## 快速开始

### 方式一：手动创建 Schema

在 `schemas/` 目录下创建一个新的 `.schema.json` 文件，例如 `products.schema.json`：

```json
{
  "tableName": "products",
  "displayName": "产品",
  "description": "产品信息管理",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "label": "产品名称",
      "required": true,
      "unique": false,
      "default": null,
      "description": "产品的名称"
    },
    {
      "name": "price",
      "type": "number",
      "label": "价格",
      "required": true,
      "unique": false,
      "default": 0,
      "description": "产品价格（元）"
    },
    {
      "name": "stock",
      "type": "number",
      "label": "库存",
      "required": false,
      "unique": false,
      "default": 0,
      "description": "库存数量"
    },
    {
      "name": "is_active",
      "type": "boolean",
      "label": "是否上架",
      "required": false,
      "unique": false,
      "default": true,
      "description": "产品是否上架销售"
    },
    {
      "name": "publish_date",
      "type": "date",
      "label": "上架日期",
      "required": false,
      "unique": false,
      "default": null,
      "description": "产品上架日期"
    }
  ]
}
```

保存后，访问 `http://localhost:3000/products` 即可看到完整的产品管理界面！

### 方式二：使用命令行生成 Schema

命令行工具提供了多种方式来创建和管理 Schema。

#### 1. 查看现有 Schema

首先，查看已存在的 Schema：

```bash
node scripts/generate-schema.js list
```

输出示例：
```
已存在的 schema 文件:

  📄 laptop
     显示名称: 笔记本电脑
     描述: 笔记本电脑信息管理
     字段数: 5

  📄 server
     显示名称: 服务器电脑
     描述: 服务器电脑信息管理
     字段数: 6
```

#### 2. 复制现有 Schema（推荐）

如果你想基于已有的 Schema 创建新的 Schema，使用 `copy` 命令：

```bash
# 格式：node scripts/generate-schema.js copy <源名称> <新名称>
node scripts/generate-schema.js copy server laptop
```

这会复制 `server` 的配置创建一个新的 `laptop` Schema，并自动更新表名、显示名称等信息。

#### 3. 从 JSON 数据文件生成 Schema

⚠️ **重要说明**：这个命令用于从**包含实际数据的 JSON 文件**推断字段类型，不是从已有的 Schema 文件复制。

数据文件示例（`data.json`）：
```json
{
  "uuid": "sjxjwljxkjk",
  "desc": "这是一个笔记本品牌",
  "name": "dell",
  "cpu_num": 4,
  "memory": 16
}
```

生成 Schema：
```bash
# 格式：node scripts/generate-schema.js from-data <数据文件路径> <新名称>
node scripts/generate-schema.js from-data ./data.json laptop
```

工具会自动推断每个字段的类型（string、number 等），并生成相应的 Schema 配置。

#### 4. 手动创建 Schema

完全从零开始创建新的 Schema：

```bash
# 格式：node scripts/generate-schema.js create <名称> [--fields=<字段列表>]
node scripts/generate-schema.js create products --fields=name:string:产品名称:true,price:number:价格:true:false:0
```

**字段格式**：`字段名:类型:标签:必填:唯一:默认值`

- 字段名：数据库列名
- 类型：string、number、boolean、date、datetime
- 标签：显示在界面上的中文名称
- 必填：true 或 false（可选）
- 唯一：true 或 false（可选）
- 默认值：字段默认值（可选）

示例：
```bash
# 必填的产品名称
name:string:产品名称:true

# 可选的价格，默认值为 0
price:number:价格:false:false:0

# 必填且唯一的邮箱
email:string:邮箱:true:true
```

#### 查看完整帮助

```bash
node scripts/generate-schema.js help
```

### 方式三：从示例 Schema

项目已内置了一个笔记本电脑的示例 Schema，位于 `schemas/laptop.schema.json`，启动后访问 `http://localhost:3000/laptop` 即可预览效果。

## Schema 配置说明

### 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tableName | string | 是 | 数据库表名 |
| displayName | string | 是 | 显示名称，用于页面标题 |
| description | string | 否 | 描述信息 |
| fields | array | 是 | 字段定义数组 |

### 字段定义 (fields)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 字段名（数据库列名） |
| type | string | 是 | 数据类型 |
| label | string | 是 | 显示标签 |
| required | boolean | 否 | 是否必填（默认 false） |
| unique | boolean | 否 | 是否唯一（默认 false） |
| default | any | 否 | 默认值 |
| description | string | 否 | 字段描述 |

### 支持的数据类型

| 类型 | 说明 | SQLite 映射 |
|------|------|-------------|
| string | 字符串 | TEXT |
| number | 数字 | INTEGER |
| boolean | 布尔值 | INTEGER (0/1) |
| date | 日期 | DATETIME |
| datetime | 日期时间 | DATETIME |

## 项目结构

```text
fastcurd/
├── app/
│   ├── api/
│   │   ├── [table]/
│   │   │   ├── route.js          # 列表查询 + 新增
│   │   │   └── [id]/
│   │   │       └── route.js      # 单条查询 + 更新 + 删除
│   │   └── schemas/
│   │       └── route.js           # 获取所有可用 Schema 列表
│   ├── [table]/
│   │   └── page.js                # 动态路由页面
│   ├── globals.css
│   ├── layout.js
│   └── page.js                      # 首页（Schema 导航）
├── components/
│   └── GenericCRUD.js              # 通用 CRUD 组件
├── lib/
│   ├── db.js                      # 原有的学生管理数据库操作
│   └── genericDb.js               # 通用数据库操作层
├── schemas/
│   └── laptop.schema.json        # 示例 Schema 配置
├── scripts/
│   └── generate-schema.js       # Schema 生成工具
├── package.json
└── README.md
```

## API 文档

### 通用 API 接口

所有 Schema 配置的 API 接口自动生成，格式为 `:table` 对应 Schema 文件名（不含 `.schema.json` 后缀）。

#### 获取列表
```
GET /api/:table
```

响应示例：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Dell XPS 15",
      "cpu_num": 8,
      "memory": 32,
      "created_at": "2024-01-01T12:00:00"
    }
  ],
  "schema": {
    "tableName": "laptops",
    "displayName": "笔记本电脑",
    ...
  }
}
```

#### 新增记录
```
POST /api/:table
Content-Type: application/json

{
  "name": "MacBook Pro",
  "cpu_num": 10,
  "memory": 32
}
```

#### 获取单条
```
GET /api/:table/:id
```

#### 更新记录
```
PUT /api/:table/:id
Content-Type: application/json

{
  "name": "MacBook Pro M3",
  "memory": 64
}
```

#### 删除记录
```
DELETE /api/:table/:id
```

### Schema 列表 API
```
GET /api/schemas
```

## 数据库

数据库文件为 `fastcurd.db`，首次访问 API 时自动创建表结构。

- 每张表自动包含以下字段：
- `id`：自增主键
- `created_at`：创建时间（自动生成）

## 示例：使用用户提供的 JSON

假设你提供的 JSON 示例：
```json
{ 
  "uuid": "sjxjwljxkjk", 
  "desc": "这是一个笔记本品牌", 
  "name": "dell", 
  "cpu_num": 4, 
  "memory": 16 
}
```

### 步骤 1：创建 Schema 文件

在 `schemas/` 目录下创建 `laptop.schema.json`（已存在）：

```json
{
  "tableName": "laptops",
  "displayName": "笔记本电脑",
  "description": "笔记本电脑信息管理",
  "fields": [
    {
      "name": "uuid",
      "type": "string",
      "label": "唯一标识",
      "required": false,
      "unique": false,
      "default": null,
      "description": "系统生成的唯一标识"
    },
    {
      "name": "name",
      "type": "string",
      "label": "品牌名称",
      "required": true,
      "unique": false,
      "default": null,
      "description": "笔记本品牌名称"
    },
    {
      "name": "cpu_num",
      "type": "number",
      "label": "CPU核心数",
      "required": false,
      "unique": false,
      "default": 4,
      "description": "处理器核心数量"
    },
    {
      "name": "memory",
      "type": "number",
      "label": "内存大小(GB)",
      "required": false,
      "unique": false,
      "default": 16,
      "description": "内存大小，单位GB"
    },
    {
      "name": "desc",
      "type": "string",
      "label": "描述",
      "required": false,
      "unique": false,
      "default": null,
      "description": "产品描述信息"
    }
  ]
}
```

### 步骤 2：启动服务

```bash
npm run dev
```

### 步骤 3：访问管理页面

打开浏览器访问：`http://localhost:3000/laptop`

即可看到完整的笔记本电脑管理界面，支持：
- 查看列表
- 新增记录
- 编辑记录
- 删除记录

## 自定义开发

### 添加新字段

只需修改对应的 `.schema.json` 文件，添加新的字段定义，刷新页面即可生效。**注意**：SQLite 不支持动态添加列到已有表中。如果需要添加新字段到已有表，需要手动执行数据库迁移或删除数据库文件重新创建表。

### 自定义样式

样式文件位于 `app/globals.css`，可以根据需要修改。

### 自定义组件

通用 CRUD 组件位于 `components/GenericCRUD.js`，可以根据需要扩展功能。

## 注意事项

1. **数据库表创建**：首次访问 API 时自动创建表，表结构基于 Schema 定义。

2. **字段修改**：修改 Schema 后，如果表结构不会自动更新。如需修改字段类型或添加新字段，需要手动修改数据库或删除数据库文件重新创建。

3. **数据类型**：SQLite 是动态类型的，但建议严格按照 Schema 定义的类型存储。

4. **并发**：默认使用 SQLite，适合开发和小型应用。生产环境建议迁移到 PostgreSQL 或 MySQL。

## 常见问题与故障排除

### Q1: 命令行工具报错 "文件不存在"

**错误信息**：
```
错误: 文件不存在: /path/to/file.json
```

**可能的原因和解决方案**：

| 场景 | 原因 | 解决方案 |
|------|------|----------|
| 使用 `from-data` 命令时路径错误 | 文件路径不正确，或文件在其他位置 | 1. 确保文件路径正确<br>2. 检查文件是否在 `schemas/` 目录下<br>3. 使用绝对路径 |
| 想复制已有 Schema 却用了 `from-data` 命令 | 混淆了命令用途 | 使用 `copy` 命令代替：<br>`node scripts/generate-schema.js copy <源名称> <新名称>` |

**示例**：

❌ 错误的做法：
```bash
# 这是错误的！server.schema.json 是 Schema 文件，不是数据文件
node scripts/generate-schema.js from-data ./server.schema.json laptop
```

✅ 正确的做法：
```bash
# 方式1：复制现有 Schema（推荐）
node scripts/generate-schema.js copy server laptop

# 方式2：先查看现有 Schema
node scripts/generate-schema.js list

# 方式3：从数据文件生成（数据文件包含实际数据，不是 Schema 配置）
node scripts/generate-schema.js from-data ./data.json laptop
```

### Q2: 命令行工具报错 "检测到这是一个 schema 配置文件，不是数据文件"

**错误信息**：
```
错误: 检测到这是一个 schema 配置文件，不是数据文件
```

**原因**：你使用了 `from-data` 或 `from-json` 命令，但提供的文件是一个 Schema 配置文件（包含 `tableName`、`fields` 等字段），而不是包含实际数据的文件。

**解决方案**：

| 你的意图 | 正确命令 |
|----------|----------|
| 复制现有 Schema 创建新的 | `node scripts/generate-schema.js copy <源名称> <新名称>` |
| 从实际数据推断字段类型 | 准备一个包含实际数据的 JSON 文件，然后使用 `from-data` 命令 |

**数据文件 vs Schema 文件的区别**：

📄 **数据文件**（用于 `from-data` 命令）：
```json
{
  "name": "Dell",
  "cpu_num": 4,
  "memory": 16
}
```

📄 **Schema 文件**（位于 `schemas/` 目录）：
```json
{
  "tableName": "laptops",
  "displayName": "笔记本电脑",
  "fields": [
    {"name": "name", "type": "string", "label": "品牌名称", ...}
  ]
}
```

### Q3: 如何快速开始？

**最简单的流程**：

1. **查看现有 Schema**：
   ```bash
   node scripts/generate-schema.js list
   ```

2. **复制现有 Schema**（如果有类似的）：
   ```bash
   node scripts/generate-schema.js copy server laptop
   ```

3. **编辑生成的 Schema 文件**：
   ```bash
   # 编辑 schemas/laptop.schema.json 自定义字段
   ```

4. **启动服务**：
   ```bash
   npm run dev
   ```

5. **访问管理页面**：
   - 首页：`http://localhost:3000`
   - 具体模块：`http://localhost:3000/laptop`

### Q4: 修改 Schema 后没有生效？

**可能的原因**：
1. 数据库表已创建，SQLite 不支持动态添加列
2. 浏览器缓存

**解决方案**：
1. **开发环境**：删除数据库文件重新创建
   ```bash
   rm fastcurd.db
   ```
2. **清除浏览器缓存**：刷新页面或使用无痕模式
3. **生产环境**：需要手动执行数据库迁移

## 原有学生管理系统

项目保留了原有的学生管理系统作为参考，位于：
- API：`/api/students`
- 页面：原首页已替换为 Schema 导航

如果需要使用原有的学生管理系统，可以查看：
- API 直接访问 `/api/students` 接口
- 或创建一个 `students.schema.json` 文件来使用新的通用系统

## License

MIT
