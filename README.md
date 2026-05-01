# Next.js 15 + React 19 学生管理系统（SQLite3）

这是一个基于 `Next.js 15`、`React 19`、`sqlite3` 的最小可运行项目框架，包含学生表完整 CRUD。

## 功能

- 新增学生
- 查询学生列表
- 按 ID 查询学生
- 更新学生
- 删除学生
- SQLite 自动建表（首次请求 API 时自动初始化）

## 技术栈

- Next.js 15（App Router）
- React 19
- sqlite3

## 安装与启动

```bash
npm install
npm run dev
```

启动后访问：`http://localhost:3000`

## 项目结构

```text
app/
  api/students/route.js        # 列表查询 + 新增
  api/students/[id]/route.js   # 单条查询 + 更新 + 删除
  globals.css
  layout.js
  page.js                      # 前端页面（表单 + 列表）
lib/
  db.js                        # sqlite3 连接和数据访问层
students.db                    # 运行后自动生成
```

## API 简要说明

- `GET /api/students`：获取所有学生
- `POST /api/students`：新增学生
- `GET /api/students/:id`：获取单个学生
- `PUT /api/students/:id`：更新学生
- `DELETE /api/students/:id`：删除学生

### 学生字段

- `name`: 姓名（字符串）
- `age`: 年龄（正整数）
- `class_name`: 班级（字符串）
- `email`: 邮箱（唯一）
