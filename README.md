# FastCurd - 一键生成 CURD 管理系统

只需一个 JSON 文件，一键生成完整的 CURD 管理系统（带搜索功能）。

## 核心特性

- **一键生成**：只需一个命令 `node scripts/gen.js <JSON文件>`
- **自动建表**：首次访问时自动创建数据库表
- **完整 CURD**：增删改查全功能
- **智能搜索**：根据字段类型自动生成搜索控件
- **无需重启**：添加新模块无需修改代码，无需重启服务

## 技术栈

- Next.js 15（App Router）
- React 19
- SQLite3

---

## 快速开始

### 第一步：准备环境

```bash
npm install
```

### 第二步：准备 JSON 文件

创建一个包含数据模型定义的 JSON 文件（或使用项目内置的 `example.json`）：

```json
{
  "tableName": "drink",
  "displayName": "饮料",
  "description": "饮料信息管理",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "label": "品牌名称",
      "required": true,
      "search_able": true,
      "description": "饮料品牌名称"
    },
    {
      "name": "price",
      "type": "number",
      "label": "价格",
      "required": false,
      "search_able": true,
      "default": 0,
      "description": "饮料价格"
    }
  ]
}
```

### 第三步：一键生成

```bash
node scripts/gen.js example.json
```

或使用你自己的 JSON 文件：

```bash
node scripts/gen.js ./my-model.json
```

### 第四步：启动服务

```bash
npm run dev
```

### 第五步：访问页面

- **首页**：`http://localhost:3000`
- **管理页面**：`http://localhost:3000/drink`（根据你的 tableName）

---

## 完整示例

### 1. 使用项目内置的示例

项目已内置一个完整的示例文件 `example.json`，包含各种类型的字段和搜索功能。

#### 执行命令：

```bash
node scripts/gen.js example.json
```

#### 输出：

```
📋 正在处理文件...

📍 找到文件: /path/to/fastcurd/example.json

🔍 验证 Schema 格式...
✅ Schema 格式验证通过

✅ 处理完成!

📁 生成的文件:
   /path/to/fastcurd/schemas/drink.schema.json

🚀 下一步:

   1. 启动服务:
      npm run dev

   2. 访问页面:
      首页: http://localhost:3000
      管理页面: http://localhost:3000/drink

💡 功能说明:
   - 自动创建数据库表
   - 完整的 CURD 功能 (增删改查)
   - 搜索功能 (根据 search_able 字段自动启用)
```

### 2. 启动并测试

```bash
npm run dev
```

访问 `http://localhost:3000/drink` 即可看到完整的管理界面，包含：
- 搜索条件区域（根据字段类型自动生成）
- 新增/编辑表单
- 数据列表
- 操作按钮

---

## JSON 文件格式说明

### 顶层字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tableName | string | 是 | 数据库表名（同时也是URL路径） |
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
| default | any | 否 | 默认值 |
| description | string | 否 | 字段描述 |
| search_able | boolean | 否 | **是否可搜索（默认 false）** |

### 数据类型与搜索功能

| 类型 | 搜索方式 | 前端控件 | 示例 |
|------|----------|----------|------|
| string | 模糊搜索 (LIKE %keyword%) | 文本输入框 | `"search_able": true` |
| number | 范围搜索 (>= min, <= max) | 两个数字输入框 | `"search_able": true` |
| boolean | 精确搜索 | 下拉选择（全部/是/否） | `"search_able": true` |
| date/datetime | 范围搜索 (>= start, <= end) | 两个日期选择器 | `"search_able": true` |

### 完整示例

```json
{
  "tableName": "products",
  "displayName": "产品",
  "description": "产品信息管理",
  "fields": [
    {
      "name": "uuid",
      "type": "string",
      "label": "唯一标识",
      "required": false,
      "search_able": true,
      "default": null,
      "description": "系统生成的唯一标识"
    },
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
      "description": "产品价格（元）"
    },
    {
      "name": "stock",
      "type": "number",
      "label": "库存",
      "required": false,
      "search_able": false,
      "default": 0,
      "description": "库存数量"
    },
    {
      "name": "is_active",
      "type": "boolean",
      "label": "是否上架",
      "required": false,
      "search_able": true,
      "default": true,
      "description": "产品是否上架销售"
    },
    {
      "name": "publish_date",
      "type": "date",
      "label": "上架日期",
      "required": false,
      "search_able": true,
      "default": null,
      "description": "产品上架日期"
    },
    {
      "name": "desc",
      "type": "string",
      "label": "描述",
      "required": false,
      "search_able": false,
      "default": null,
      "description": "产品详细描述"
    }
  ]
}
```

---

## 搜索功能详解

### 字符串类型 (string)

- **搜索方式**：模糊搜索（包含关键字即可匹配）
- **SQL**：`WHERE field LIKE '%keyword%'`
- **前端**：文本输入框

### 数字类型 (number)

- **搜索方式**：范围搜索
- **SQL**：`WHERE field >= min AND field <= max`
- **前端**：两个数字输入框（最小值 ~ 最大值）
- **注意**：如果只填最小值或最大值，会自动调整搜索条件

### 布尔类型 (boolean)

- **搜索方式**：精确搜索
- **SQL**：`WHERE field = 1` 或 `WHERE field = 0`
- **前端**：下拉选择（全部/是/否）

### 日期类型 (date/datetime)

- **搜索方式**：范围搜索
- **SQL**：`WHERE field >= start AND field <= end`
- **前端**：两个日期选择器（开始日期 ~ 结束日期）

---

## API 接口

### 列表查询

```
GET /api/:tableName
```

**带搜索参数**：

```
# 字符串模糊搜索
GET /api/products?name=iPhone

# 数字范围搜索
GET /api/products?price_min=1000&price_max=5000

# 布尔搜索
GET /api/products?is_active=true

# 日期范围搜索
GET /api/products?publish_date_start=2024-01-01&publish_date_end=2024-12-31

# 组合搜索
GET /api/products?name=iPhone&price_min=1000&is_active=true
```

### 其他接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/:tableName | 新增记录 |
| GET | /api/:tableName/:id | 查询单条记录 |
| PUT | /api/:tableName/:id | 更新记录 |
| DELETE | /api/:tableName/:id | 删除记录 |

---

## 项目结构

```
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
│   └── page.js                      # 首页
├── components/
│   └── GenericCRUD.js              # 通用 CURD 组件（含搜索）
├── lib/
│   └── genericDb.js               # 通用数据库操作层
├── schemas/                        # Schema 配置目录
├── scripts/
│   └── gen.js                     # 一键生成工具
├── example.json                    # 示例 JSON 文件
├── package.json
└── README.md
```

---

## 注意事项

1. **数据库表创建**：首次访问 API 时自动创建表，表结构基于 JSON 定义。

2. **字段修改**：修改 JSON 后，表结构不会自动更新。如需修改字段类型或添加新字段：
   - 开发环境：删除数据库文件重新创建 `rm fastcurd.db`
   - 生产环境：需要手动执行数据库迁移

3. **并发**：默认使用 SQLite，适合开发和小型应用。生产环境建议迁移到 PostgreSQL 或 MySQL。

---

## 帮助

查看命令行帮助：

```bash
node scripts/gen.js help
```

---

## License

MIT
