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

### 方式二：使用命令行生成 Schema（简单方式）

命令行工具已简化，只需记住一个命令模式。

#### 1. 查看现有 Schema

```bash
node scripts/generate-schema.js list
```

输出示例：
```
现有 Schema:

  📄 class
     显示名称: class
     字段数: 6

  📄 drink
     显示名称: 饮料
     字段数: 5

  📄 laptop
     显示名称: 笔记本电脑
     字段数: 5

  📄 server
     显示名称: 服务器电脑
     字段数: 6
```

#### 2. 创建新的 Schema 模板

创建一个空的 Schema 模板，然后手动编辑字段：

```bash
# 格式：node scripts/generate-schema.js <新名称>
node scripts/generate-schema.js products
```

这会创建 `schemas/products.schema.json` 文件，包含一个默认的 `name` 字段。你可以编辑该文件添加更多字段。

#### 3. 复制现有 Schema（推荐）

基于已有的 Schema 创建新的 Schema：

```bash
# 格式：node scripts/generate-schema.js <新名称> <源名称>
node scripts/generate-schema.js laptop server
```

这会从 `server` 复制创建 `laptop`，并自动更新表名、显示名称等信息。

#### 查看帮助

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
| search_able | boolean | 否 | 是否可搜索（默认 false） |

### 支持的数据类型

| 类型 | 说明 | SQLite 映射 |
|------|------|-------------|
| string | 字符串 | TEXT |
| number | 数字 | INTEGER |
| boolean | 布尔值 | INTEGER (0/1) |
| date | 日期 | DATETIME |
| datetime | 日期时间 | DATETIME |

## 搜索功能

系统支持根据字段类型实现不同的搜索效果。只需在字段定义中添加 `"search_able": true` 即可启用搜索功能。

### 搜索功能类型

根据字段类型的不同，搜索功能会有不同的表现：

| 字段类型 | 搜索方式 | 前端控件 |
|----------|----------|----------|
| string | 模糊搜索 (LIKE %keyword%) | 文本输入框 |
| number | 范围搜索 (>= min, <= max) | 两个数字输入框（最小值 ~ 最大值） |
| date/datetime | 范围搜索 (>= start, <= end) | 两个日期选择器（开始日期 ~ 结束日期） |
| boolean | 精确搜索 | 下拉选择（全部/是/否） |

### 示例配置

```json
{
  "tableName": "drink",
  "displayName": "饮料",
  "description": "饮料信息",
  "fields": [
    {
      "name": "uuid",
      "type": "string",
      "label": "唯一标识",
      "required": false,
      "search_able": true,
      "description": "系统生成的唯一标识"
    },
    {
      "name": "name",
      "type": "string",
      "label": "品牌名称",
      "required": true,
      "search_able": true,
      "description": "饮料品牌名称"
    },
    {
      "name": "价格",
      "type": "number",
      "label": "价格",
      "required": false,
      "search_able": true,
      "default": 4,
      "description": "价格"
    }
  ]
}
```

### API 搜索参数

搜索功能通过 URL 查询参数实现：

| 参数格式 | 说明 | 示例 |
|----------|------|------|
| `?fieldName=value` | 字符串模糊搜索，数字精确搜索 | `?name=可口可乐` |
| `?fieldName_min=value` | 数字最小值 | `?价格_min=5` |
| `?fieldName_max=value` | 数字最大值 | `?价格_max=10` |
| `?fieldName_start=value` | 日期开始值 | `?created_at_start=2024-01-01` |
| `?fieldName_end=value` | 日期结束值 | `?created_at_end=2024-12-31` |

**示例请求**：
```
# 搜索品牌名称包含"可口"的饮料
GET /api/drink?name=可口

# 搜索价格在 5 到 10 之间的饮料
GET /api/drink?价格_min=5&价格_max=10

# 组合搜索：品牌名称包含"可口"且价格在 5 到 10 之间
GET /api/drink?name=可口&价格_min=5&价格_max=10
```

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

### Q1: 命令行工具怎么用？

**简化后的命令**：

| 命令 | 说明 | 示例 |
|------|------|------|
| `node scripts/generate-schema.js list` | 查看所有现有 Schema | `node scripts/generate-schema.js list` |
| `node scripts/generate-schema.js <新名称>` | 创建新的 Schema 模板 | `node scripts/generate-schema.js products` |
| `node scripts/generate-schema.js <新名称> <源名称>` | 复制现有 Schema 创建新的 | `node scripts/generate-schema.js laptop server` |

**关键提示**：
- 复制命令的格式是：`<新名称> <源名称>`（新的在前，源的在后）
- 例如：`node scripts/generate-schema.js laptop server` 意思是从 `server` 复制创建 `laptop`

### Q2: 如何快速开始？

**最简单的流程**：

1. **查看现有 Schema**：
   ```bash
   node scripts/generate-schema.js list
   ```

2. **复制现有 Schema**（如果有类似的）：
   ```bash
   # 从 server 复制创建 laptop
   node scripts/generate-schema.js laptop server
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

### Q3: 修改 Schema 后没有生效？

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

## 测试用例

以下是完整的测试流程，你可以按照步骤执行：

### 前置条件

确保依赖已安装：
```bash
npm install
```

### 测试用例 1：创建新的 Schema

**目标**：测试创建新的 Schema 并访问管理页面

**步骤**：
1. 查看现有 Schema：
   ```bash
   node scripts/generate-schema.js list
   ```

2. 创建新的 Schema：
   ```bash
   node scripts/generate-schema.js test_products
   ```

3. 查看生成的文件：
   ```bash
   ls -la schemas/test_products.schema.json
   ```

4. 编辑 Schema，添加搜索字段：
   ```json
   {
     "tableName": "test_products",
     "displayName": "测试产品",
     "description": "测试产品管理",
     "fields": [
       {
         "name": "name",
         "type": "string",
         "label": "产品名称",
         "required": true,
         "search_able": true,
         "default": null,
         "description": "产品名称"
       },
       {
         "name": "price",
         "type": "number",
         "label": "价格",
         "required": false,
         "search_able": true,
         "default": 0,
         "description": "产品价格"
       },
       {
         "name": "is_active",
         "type": "boolean",
         "label": "是否上架",
         "required": false,
         "search_able": true,
         "default": true,
         "description": "是否上架"
       }
     ]
   }
   ```

5. 启动服务：
   ```bash
   npm run dev
   ```

6. 访问页面：
   - 首页：`http://localhost:3000`
   - 测试产品管理：`http://localhost:3000/test_products`

### 测试用例 2：测试搜索功能

**目标**：测试不同类型字段的搜索功能

**前置条件**：已完成测试用例 1，且已添加以下测试数据：

| 产品名称 | 价格 | 是否上架 |
|----------|------|----------|
| iPhone 15 | 6999 | 是 |
| iPhone 14 | 4999 | 是 |
| MacBook Pro | 12999 | 是 |
| iPad | 3999 | 否 |

**测试步骤**：

1. **测试字符串模糊搜索**：
   - 在"产品名称"搜索框输入：`iPhone`
   - 点击"搜索"
   - **预期结果**：显示 iPhone 15 和 iPhone 14 两条记录

2. **测试数字范围搜索**：
   - 在"价格"最小值输入：`4000`
   - 在"价格"最大值输入：`8000`
   - 点击"搜索"
   - **预期结果**：显示 iPhone 15、iPhone 14、iPad 三条记录（价格在 4000-8000 之间）

3. **测试布尔搜索**：
   - 在"是否上架"选择：`否`
   - 点击"搜索"
   - **预期结果**：只显示 iPad 一条记录

4. **测试组合搜索**：
   - 在"产品名称"输入：`iPhone`
   - 在"价格"最小值输入：`5000`
   - 点击"搜索"
   - **预期结果**：只显示 iPhone 15 一条记录

5. **测试重置搜索**：
   - 点击"重置"按钮
   - **预期结果**：显示所有 4 条记录

### 测试用例 3：测试 CRUD 功能

**目标**：测试完整的增删改查功能

**步骤**：

1. **新增记录**：
   - 产品名称：`Test Product`
   - 价格：`100`
   - 是否上架：`是`
   - 点击"新增"
   - **预期结果**：显示"新增成功"，列表中出现新记录

2. **编辑记录**：
   - 点击新增记录的"编辑"按钮
   - 修改产品名称为：`Updated Product`
   - 点击"更新"
   - **预期结果**：显示"更新成功"，列表中记录已更新

3. **删除记录**：
   - 点击编辑后记录的"删除"按钮
   - 确认删除
   - **预期结果**：显示"删除成功"，列表中记录已删除

### 测试用例 4：测试 API 接口

**目标**：测试 API 接口的搜索功能

**步骤**：

1. **获取所有数据**：
   ```bash
   curl -s http://localhost:3000/api/test_products
   ```

2. **字符串搜索**：
   ```bash
   curl -s "http://localhost:3000/api/test_products?name=iPhone"
   ```

3. **数字范围搜索**：
   ```bash
   curl -s "http://localhost:3000/api/test_products?price_min=4000&price_max=8000"
   ```

4. **组合搜索**：
   ```bash
   curl -s "http://localhost:3000/api/test_products?name=iPhone&price_min=5000"
   ```

### 测试清理

测试完成后，可以删除测试数据和 Schema：

```bash
# 删除数据库（可选）
rm fastcurd.db

# 删除测试 Schema
rm schemas/test_products.schema.json
```

## 原有学生管理系统

项目保留了原有的学生管理系统作为参考，位于：
- API：`/api/students`
- 页面：原首页已替换为 Schema 导航

如果需要使用原有的学生管理系统，可以查看：
- API 直接访问 `/api/students` 接口
- 或创建一个 `students.schema.json` 文件来使用新的通用系统

## License

MIT
