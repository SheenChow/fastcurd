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
  node scripts/generate-schema.js list                    查看所有现有 Schema
  node scripts/generate-schema.js <新名称>               创建新的 Schema 模板
  node scripts/generate-schema.js <新名称> <源名称>      复制现有 Schema 创建新的

示例:
  # 查看所有 Schema
  node scripts/generate-schema.js list

  # 创建一个新的 Schema 模板（空模板，需要手动编辑字段）
  node scripts/generate-schema.js products

  # 复制现有 Schema 创建新的
  node scripts/generate-schema.js laptop server

说明:
  - Schema 文件位于 schemas/ 目录下，命名格式为: <名称>.schema.json
  - 创建后编辑该文件自定义字段配置
  - 然后启动服务访问: http://localhost:3000/<名称>
`);
}

function listSchemas() {
  if (!fs.existsSync(schemasDir)) {
    console.log("暂无 Schema 文件");
    return;
  }

  const files = fs.readdirSync(schemasDir);
  const schemaFiles = files.filter((f) => f.endsWith(".schema.json"));

  if (schemaFiles.length === 0) {
    console.log("暂无 Schema 文件");
    return;
  }

  console.log("现有 Schema:");
  console.log("");

  schemaFiles.forEach((file) => {
    const name = file.replace(".schema.json", "");
    const filePath = path.join(schemasDir, file);
    
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const schema = JSON.parse(content);
      console.log(`  📄 ${name}`);
      console.log(`     显示名称: ${schema.displayName || name}`);
      console.log(`     字段数: ${schema.fields?.length || 0}`);
      console.log("");
    } catch {
      console.log(`  📄 ${name} (解析失败)`);
      console.log("");
    }
  });
}

function createEmptySchema(name) {
  if (!fs.existsSync(schemasDir)) {
    fs.mkdirSync(schemasDir, { recursive: true });
  }

  const filePath = path.join(schemasDir, `${name}.schema.json`);

  if (fs.existsSync(filePath)) {
    console.error(`❌ 错误: Schema 已存在: ${filePath}`);
    console.error("");
    console.error("提示:");
    console.error("  - 查看现有 Schema: node scripts/generate-schema.js list");
    console.error(`  - 删除后重新创建: rm schemas/${name}.schema.json`);
    process.exit(1);
  }

  const schema = {
    tableName: name,
    displayName: name,
    description: `${name}信息管理`,
    fields: [
      {
        name: "name",
        type: "string",
        label: "名称",
        required: true,
        unique: false,
        default: null,
        description: "名称"
      }
    ]
  };

  const content = JSON.stringify(schema, null, 2);
  fs.writeFileSync(filePath, content, "utf-8");

  console.log(`✅ 已创建 Schema: ${filePath}`);
  console.log("");
  console.log("下一步:");
  console.log(`  1. 编辑文件自定义字段: schemas/${name}.schema.json`);
  console.log(`  2. 启动服务: npm run dev`);
  console.log(`  3. 访问页面: http://localhost:3000/${name}`);
}

function copySchema(sourceName, targetName) {
  const sourcePath = path.join(schemasDir, `${sourceName}.schema.json`);
  const targetPath = path.join(schemasDir, `${targetName}.schema.json`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ 错误: 源 Schema 不存在: ${sourcePath}`);
    console.error("");
    console.error("提示: 查看现有 Schema: node scripts/generate-schema.js list");
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    console.error(`❌ 错误: 目标 Schema 已存在: ${targetPath}`);
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
    console.log("");
    console.log("下一步:");
    console.log(`  1. 编辑文件自定义字段: schemas/${targetName}.schema.json`);
    console.log(`  2. 启动服务: npm run dev`);
    console.log(`  3. 访问页面: http://localhost:3000/${targetName}`);
  } catch (error) {
    console.error(`❌ 复制失败: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  if (args.length === 0 || args[0] === "help" || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    return;
  }

  const firstArg = args[0];
  const secondArg = args[1];

  if (firstArg === "list" || firstArg === "ls") {
    listSchemas();
    return;
  }

  if (firstArg && !secondArg) {
    createEmptySchema(firstArg);
    return;
  }

  if (firstArg && secondArg) {
    copySchema(secondArg, firstArg);
    return;
  }

  showHelp();
}

main().catch((error) => {
  console.error("执行失败:", error);
  process.exit(1);
});
