#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

function showHelp() {
  console.log(`
FastCurd Schema 生成器

用法:
  node scripts/generate-schema.js [命令] [选项]

命令:
  create <名称> [--fields=<字段列表>]  创建新的 schema 文件
  from-json <JSON文件> <名称>           从 JSON 文件生成 schema
  help                                    显示此帮助信息

示例:
  # 创建一个简单的 schema
  node scripts/generate-schema.js create products --fields=name:string:产品名称,price:number:价格

  # 从 JSON 文件生成 schema
  node scripts/generate-schema.js from-json ./data.json laptop

字段格式说明:
  字段名:类型:标签[:必填][:唯一][:默认值]
  
  类型: string, number, boolean, date, datetime
  
  示例:
    name:string:产品名称:true          # 必填字段
    price:number:价格:false:false:0    # 可选字段，默认值为0
    email:string:邮箱:true:true         # 必填且唯一
`);
}

function inferType(value) {
  if (typeof value === "number") {
    return "number";
  }
  if (typeof value === "boolean") {
    return "boolean";
  }
  if (typeof value === "string") {
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return "date";
    }
    if (value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
      return "datetime";
    }
    return "string";
  }
  return "string";
}

function generateLabel(name) {
  const labels = {
    name: "名称",
    title: "标题",
    desc: "描述",
    description: "描述",
    price: "价格",
    count: "数量",
    num: "数量",
    total: "总计",
    id: "ID",
    uuid: "唯一标识",
    email: "邮箱",
    age: "年龄",
    date: "日期",
    time: "时间",
    created: "创建时间",
    updated: "更新时间",
    status: "状态",
    type: "类型",
    category: "分类",
    memory: "内存",
    cpu: "CPU",
  };

  return labels[name.toLowerCase()] || name;
}

function inferSchemaFromJSON(data, tableName, displayName) {
  const fields = [];
  const processedFields = new Set();

  const items = Array.isArray(data) ? data : [data];

  items.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      if (processedFields.has(key)) return;

      const field = {
        name: key,
        type: inferType(value),
        label: generateLabel(key),
        required: false,
        unique: false,
        default: null,
        description: "",
      };

      fields.push(field);
      processedFields.add(key);
    });
  });

  return {
    tableName: tableName,
    displayName: displayName || tableName,
    description: `${displayName || tableName}信息管理`,
    fields: fields,
  };
}

function parseFieldDefinition(fieldStr) {
  const parts = fieldStr.split(":");
  const [name, type, label, requiredStr, uniqueStr, defaultStr] = parts;

  return {
    name: name,
    type: type || "string",
    label: label || name,
    required: requiredStr === "true",
    unique: uniqueStr === "true",
    default: defaultStr !== undefined ? parseDefaultValue(defaultStr, type) : null,
    description: "",
  };
}

function parseDefaultValue(value, type) {
  if (value === "null") return null;
  if (type === "number") {
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
  }
  if (type === "boolean") {
    return value === "true";
  }
  return value;
}

function createSchemaFile(schema, name) {
  const schemasDir = path.join(__dirname, "..", "schemas");
  
  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
  }

  const filePath = path.join(schemasDir, `${name}.schema.json`);
  const content = JSON.stringify(schema, null, 2);

  if (fs.existsSync(filePath)) {
    console.log(`警告: 文件已存在: ${filePath}`);
    console.log("内容预览:");
    console.log(content);
    return;
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Schema 文件已创建: ${filePath}`);
  console.log(`📍 访问地址: http://localhost:3000/${name}`);
}

async function main() {
  if (args.length === 0 || args[0] === "help") {
    showHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case "create": {
      const name = args[1];
      if (!name) {
        console.error("错误: 请指定 schema 名称");
        showHelp();
        process.exit(1);
      }

      const fieldsArg = args.find((arg) => arg.startsWith("--fields="));
      let fields = [];

      if (fieldsArg) {
        const fieldsStr = fieldsArg.replace("--fields=", "");
        const fieldDefs = fieldsStr.split(",");
        fields = fieldDefs.map(parseFieldDefinition);
      }

      const schema = {
        tableName: name,
        displayName: name,
        description: `${name}信息管理`,
        fields: fields,
      };

      createSchemaFile(schema, name);
      break;
    }

    case "from-json": {
      const jsonPath = args[1];
      const name = args[2];

      if (!jsonPath || !name) {
        console.error("错误: 请指定 JSON 文件路径和 schema 名称");
        showHelp();
        process.exit(1);
      }

      const fullPath = path.isAbsolute(jsonPath)
        ? jsonPath
        : path.join(process.cwd(), jsonPath);

      if (!fs.existsSync(fullPath)) {
        console.error(`错误: 文件不存在: ${fullPath}`);
        process.exit(1);
      }

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const data = JSON.parse(content);
        const schema = inferSchemaFromJSON(data, name, name);
        createSchemaFile(schema, name);
      } catch (error) {
        console.error(`错误: 解析 JSON 文件失败: ${error.message}`);
        process.exit(1);
      }
      break;
    }

    default:
      console.error(`未知命令: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("执行失败:", error);
  process.exit(1);
});
