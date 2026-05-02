#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemasDir = path.join(__dirname, "..", "schemas");

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
FastCurd 一键生成工具

用法:
  node scripts/gen.js <JSON文件路径>

说明:
  - 提供一个包含数据模型定义的 JSON 文件
  - 工具会自动验证并复制到 schemas/ 目录
  - 启动服务后即可访问完整的 CURD 管理页面

示例:
  # 从 JSON 文件生成 CURD 管理模块
  node scripts/gen.js ./my-model.json

JSON 文件格式示例:
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

字段说明:
  - name: 字段名（数据库列名）
  - type: 数据类型 (string, number, boolean, date, datetime)
  - label: 显示标签
  - required: 是否必填 (true/false)
  - search_able: 是否可搜索 (true/false) - 启用后可在页面搜索
  - default: 默认值
  - description: 字段描述
`);
}

function validateSchema(schema) {
  const errors = [];

  if (!schema.tableName) {
    errors.push("缺少必需字段: tableName (表名)");
  }

  if (!schema.displayName) {
    errors.push("缺少必需字段: displayName (显示名称)");
  }

  if (!schema.fields || !Array.isArray(schema.fields)) {
    errors.push("缺少必需字段: fields (字段定义数组)");
  } else if (schema.fields.length === 0) {
    errors.push("fields 数组不能为空");
  } else {
    schema.fields.forEach((field, index) => {
      const prefix = `字段[${index}]`;
      
      if (!field.name) {
        errors.push(`${prefix}: 缺少 name (字段名)`);
      }
      
      if (!field.type) {
        errors.push(`${prefix} (${field.name || "未知"}): 缺少 type (数据类型)`);
      } else if (!["string", "number", "boolean", "date", "datetime"].includes(field.type)) {
        errors.push(`${prefix} (${field.name || "未知"}): 无效的 type 值，必须是: string, number, boolean, date, datetime`);
      }
      
      if (!field.label) {
        errors.push(`${prefix} (${field.name || "未知"}): 缺少 label (显示标签)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

function findJsonFile(jsonPath) {
  const possiblePaths = [];

  if (path.isAbsolute(jsonPath)) {
    possiblePaths.push(jsonPath);
  } else {
    possiblePaths.push(path.join(process.cwd(), jsonPath));
    if (!jsonPath.endsWith(".json")) {
      possiblePaths.push(path.join(process.cwd(), `${jsonPath}.json`));
    }
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

async function main() {
  if (args.length === 0 || args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    return;
  }

  const jsonPath = args[0];

  console.log("📋 正在处理文件...");
  console.log("");

  const fullPath = findJsonFile(jsonPath);

  if (!fullPath) {
    console.error("❌ 错误: 找不到文件");
    console.error("");
    console.error("尝试的路径:");
    const possiblePaths = [];
    if (path.isAbsolute(jsonPath)) {
      possiblePaths.push(jsonPath);
    } else {
      possiblePaths.push(path.join(process.cwd(), jsonPath));
      if (!jsonPath.endsWith(".json")) {
        possiblePaths.push(path.join(process.cwd(), `${jsonPath}.json`));
      }
    }
    possiblePaths.forEach((p) => console.error(`  - ${p}`));
    console.error("");
    console.error("提示: 确保 JSON 文件路径正确");
    console.error("查看帮助: node scripts/gen.js help");
    process.exit(1);
  }

  console.log(`📍 找到文件: ${fullPath}`);
  console.log("");

  let schema;
  try {
    const content = fs.readFileSync(fullPath, "utf-8");
    schema = JSON.parse(content);
  } catch (error) {
    console.error("❌ 错误: 解析 JSON 文件失败");
    console.error(`   ${error.message}`);
    console.error("");
    console.error("提示: 检查 JSON 格式是否正确");
    process.exit(1);
  }

  console.log("🔍 验证 Schema 格式...");
  const validation = validateSchema(schema);

  if (!validation.valid) {
    console.error("❌ 错误: Schema 格式验证失败");
    console.error("");
    validation.errors.forEach((err) => console.error(`   - ${err}`));
    console.error("");
    console.error("提示: 查看帮助了解正确的格式: node scripts/gen.js help");
    process.exit(1);
  }

  console.log("✅ Schema 格式验证通过");
  console.log("");

  const tableName = schema.tableName;

  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
  }

  const targetPath = path.join(schemasDir, `${tableName}.schema.json`);

  if (fs.existsSync(targetPath)) {
    console.error(`❌ 错误: Schema 已存在: ${targetPath}`);
    console.error("");
    console.error("提示:");
    console.error(`  - 如果想覆盖，请先删除: rm schemas/${tableName}.schema.json`);
    console.error(`  - 或者修改 tableName 字段使用其他名称`);
    process.exit(1);
  }

  try {
    const content = JSON.stringify(schema, null, 2);
    fs.writeFileSync(targetPath, content, "utf-8");
  } catch (error) {
    console.error("❌ 错误: 写入文件失败");
    console.error(`   ${error.message}`);
    process.exit(1);
  }

  console.log("✅ 处理完成!");
  console.log("");
  console.log("📁 生成的文件:");
  console.log(`   ${targetPath}`);
  console.log("");
  console.log("🚀 下一步:");
  console.log("");
  console.log("   1. 启动服务:");
  console.log("      npm run dev");
  console.log("");
  console.log("   2. 访问页面:");
  console.log(`      首页: http://localhost:3000`);
  console.log(`      管理页面: http://localhost:3000/${tableName}`);
  console.log("");
  console.log("💡 功能说明:");
  console.log("   - 自动创建数据库表");
  console.log("   - 完整的 CURD 功能 (增删改查)");
  
  const hasSearchable = schema.fields.some((f) => f.search_able === true);
  if (hasSearchable) {
    console.log("   - 搜索功能 (根据 search_able 字段自动启用)");
  }
  
  console.log("");
}

main().catch((error) => {
  console.error("❌ 执行失败:", error);
  process.exit(1);
});
