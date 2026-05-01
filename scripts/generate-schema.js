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
FastCurd Schema 生成器

用法:
  node scripts/generate-schema.js [命令] [选项]

命令:
  list                                                列出所有已存在的 schema 文件
  create <名称> [--fields=<字段列表>]                 创建新的 schema 文件
  copy <源名称> <新名称>                              复制现有的 schema 文件创建新的
  from-data <JSON数据文件> <新名称>                   从 JSON 数据文件推断并生成 schema
  help                                                显示此帮助信息

示例:
  # 查看所有已存在的 schema
  node scripts/generate-schema.js list

  # 创建一个简单的 schema
  node scripts/generate-schema.js create products --fields=name:string:产品名称,price:number:价格

  # 复制现有的 schema 创建新的
  node scripts/generate-schema.js copy server laptop

  # 从 JSON 数据文件生成 schema（注意：是数据文件，不是 schema 文件）
  node scripts/generate-schema.js from-data ./data.json laptop

字段格式说明:
  字段名:类型:标签[:必填][:唯一][:默认值]
  
  类型: string, number, boolean, date, datetime
  
  示例:
    name:string:产品名称:true          # 必填字段
    price:number:价格:false:false:0    # 可选字段，默认值为0
    email:string:邮箱:true:true         # 必填且唯一

重要说明:
  - schema 文件位于 schemas/ 目录下，命名格式为: <名称>.schema.json
  - from-data 命令用于从包含实际数据的 JSON 文件推断字段类型
  - 如果想复制已有的 schema，请使用 copy 命令
`);
}

function listSchemas() {
  if (!fs.existsSync(schemasDir)) {
    console.log("schemas/ 目录不存在");
    return;
  }

  const files = fs.readdirSync(schemasDir);
  const schemaFiles = files.filter((f) => f.endsWith(".schema.json"));

  if (schemaFiles.length === 0) {
    console.log("暂无 schema 文件");
    return;
  }

  console.log("已存在的 schema 文件:");
  console.log("");

  schemaFiles.forEach((file) => {
    const name = file.replace(".schema.json", "");
    const filePath = path.join(schemasDir, file);
    
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const schema = JSON.parse(content);
      console.log(`  📄 ${name}`);
      console.log(`     显示名称: ${schema.displayName || name}`);
      console.log(`     描述: ${schema.description || "无"}`);
      console.log(`     字段数: ${schema.fields?.length || 0}`);
      console.log("");
    } catch {
      console.log(`  📄 ${name} (解析失败)`);
      console.log("");
    }
  });
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
  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
  }

  const filePath = path.join(schemasDir, `${name}.schema.json`);
  const content = JSON.stringify(schema, null, 2);

  if (fs.existsSync(filePath)) {
    console.error(`❌ 错误: 文件已存在: ${filePath}`);
    console.error("");
    console.error("提示:");
    console.error("  - 如果想查看现有 schema，请运行: node scripts/generate-schema.js list");
    console.error("  - 如果想覆盖文件，请先手动删除: rm schemas/${name}.schema.json");
    process.exit(1);
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Schema 文件已创建: ${filePath}`);
  console.log(`📍 访问地址: http://localhost:3000/${name}`);
}

function copySchema(sourceName, targetName) {
  const sourcePath = path.join(schemasDir, `${sourceName}.schema.json`);
  const targetPath = path.join(schemasDir, `${targetName}.schema.json`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ 错误: 源 schema 不存在: ${sourcePath}`);
    console.error("");
    console.error("提示: 运行以下命令查看所有可用的 schema:");
    console.error("  node scripts/generate-schema.js list");
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    console.error(`❌ 错误: 目标 schema 已存在: ${targetPath}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(sourcePath, "utf-8");
    const schema = JSON.parse(content);

    schema.tableName = targetName;
    schema.displayName = targetName;
    schema.description = `${targetName}信息管理`;

    const newContent = JSON.stringify(schema, null, 2);
    fs.writeFileSync(targetPath, newContent, "utf-8");

    console.log(`✅ 已从 '${sourceName}' 复制创建 '${targetName}'`);
    console.log(`📍 文件路径: ${targetPath}`);
    console.log(`📍 访问地址: http://localhost:3000/${targetName}`);
    console.log("");
    console.log("提示: 你可以编辑该文件自定义字段配置。");
  } catch (error) {
    console.error(`❌ 复制失败: ${error.message}`);
    process.exit(1);
  }
}

function findJsonFile(jsonPath) {
  const possiblePaths = [];

  if (path.isAbsolute(jsonPath)) {
    possiblePaths.push(jsonPath);
  } else {
    possiblePaths.push(path.join(process.cwd(), jsonPath));
    possiblePaths.push(path.join(schemasDir, jsonPath));
    if (!jsonPath.endsWith(".json")) {
      possiblePaths.push(path.join(process.cwd(), `${jsonPath}.json`));
      possiblePaths.push(path.join(schemasDir, `${jsonPath}.json`));
    }
    if (!jsonPath.endsWith(".schema.json")) {
      possiblePaths.push(path.join(schemasDir, `${jsonPath}.schema.json`));
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
  if (args.length === 0 || args[0] === "help") {
    showHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case "list": {
      listSchemas();
      break;
    }

    case "create": {
      const name = args[1];
      if (!name) {
        console.error("❌ 错误: 请指定 schema 名称");
        console.error("");
        console.error("用法: node scripts/generate-schema.js create <名称> [--fields=<字段列表>]");
        console.error("示例: node scripts/generate-schema.js create products --fields=name:string:产品名称,price:number:价格");
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

    case "copy": {
      const sourceName = args[1];
      const targetName = args[2];

      if (!sourceName || !targetName) {
        console.error("❌ 错误: 请指定源 schema 名称和目标名称");
        console.error("");
        console.error("用法: node scripts/generate-schema.js copy <源名称> <新名称>");
        console.error("示例: node scripts/generate-schema.js copy server laptop");
        console.error("");
        console.error("提示: 运行以下命令查看所有可用的 schema:");
        console.error("  node scripts/generate-schema.js list");
        process.exit(1);
      }

      copySchema(sourceName, targetName);
      break;
    }

    case "from-data":
    case "from-json": {
      if (command === "from-json") {
        console.warn("⚠️  警告: 'from-json' 命令已废弃，请使用 'from-data' 代替");
        console.warn("    这个命令用于从 JSON 数据文件推断字段类型生成 schema");
        console.warn("");
      }

      const jsonPath = args[1];
      const name = args[2];

      if (!jsonPath || !name) {
        console.error("❌ 错误: 请指定 JSON 数据文件路径和 schema 名称");
        console.error("");
        console.error("用法: node scripts/generate-schema.js from-data <JSON数据文件> <新名称>");
        console.error("");
        console.error("说明:");
        console.error("  - 这个命令用于从包含实际数据的 JSON 文件推断字段类型");
        console.error("  - 数据文件示例内容:");
        console.error("    { \"name\": \"Dell\", \"cpu_num\": 4, \"memory\": 16 }");
        console.error("");
        console.error("  - 如果想复制已有的 schema 文件，请使用 copy 命令:");
        console.error("    node scripts/generate-schema.js copy <源名称> <新名称>");
        process.exit(1);
      }

      const fullPath = findJsonFile(jsonPath);

      if (!fullPath) {
        console.error(`❌ 错误: 找不到文件: ${jsonPath}`);
        console.error("");
        console.error("尝试的路径:");
        const possiblePaths = [];
        if (path.isAbsolute(jsonPath)) {
          possiblePaths.push(jsonPath);
        } else {
          possiblePaths.push(path.join(process.cwd(), jsonPath));
          possiblePaths.push(path.join(schemasDir, jsonPath));
        }
        possiblePaths.forEach((p) => console.error(`  - ${p}`));
        console.error("");
        console.error("提示:");
        console.error("  - 确保文件路径正确");
        console.error("  - 如果想复制已有的 schema，请使用 copy 命令:");
        console.error("    node scripts/generate-schema.js copy server laptop");
        console.error("  - 查看现有 schema 列表:");
        console.error("    node scripts/generate-schema.js list");
        process.exit(1);
      }

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const data = JSON.parse(content);

        if (data.tableName && data.fields && Array.isArray(data.fields)) {
          console.error("❌ 错误: 检测到这是一个 schema 配置文件，不是数据文件");
          console.error("");
          console.error("说明:");
          console.error("  - from-data 命令用于从包含实际数据的 JSON 文件推断字段类型");
          console.error("  - 数据文件应该包含实际的数据记录，例如:");
          console.error("    { \"name\": \"Dell\", \"cpu_num\": 4, \"memory\": 16 }");
          console.error("");
          console.error("你可能想要:");
          console.error("  1. 复制这个 schema 创建新的:");
          console.error(`     node scripts/generate-schema.js copy <源名称> ${name}`);
          console.error("");
          console.error("  2. 查看现有 schema 列表:");
          console.error("     node scripts/generate-schema.js list");
          process.exit(1);
        }

        const schema = inferSchemaFromJSON(data, name, name);
        createSchemaFile(schema, name);
      } catch (error) {
        if (error.message.includes("Unexpected")) {
          console.error(`❌ 错误: JSON 解析失败，请检查文件格式`);
        } else {
          console.error(`❌ 错误: ${error.message}`);
        }
        process.exit(1);
      }
      break;
    }

    default:
      console.error(`❌ 未知命令: ${command}`);
      console.error("");
      console.error("可用命令:");
      console.error("  list       - 列出所有已存在的 schema 文件");
      console.error("  create     - 创建新的 schema 文件");
      console.error("  copy       - 复制现有的 schema 文件创建新的");
      console.error("  from-data  - 从 JSON 数据文件推断并生成 schema");
      console.error("  help       - 显示帮助信息");
      console.error("");
      console.error("查看详细帮助: node scripts/generate-schema.js help");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("执行失败:", error);
  process.exit(1);
});
