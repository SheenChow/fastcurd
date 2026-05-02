import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

sqlite3.verbose();

const dbFile = path.join(process.cwd(), "fastcurd.db");
const db = new sqlite3.Database(dbFile);

const initializedTables = new Set();

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function getSqliteType(field) {
  switch (field.type) {
    case "number":
      return "INTEGER";
    case "boolean":
      return "INTEGER";
    case "date":
    case "datetime":
      return "DATETIME";
    case "string":
    default:
      return "TEXT";
  }
}

function generateCreateTableSql(schema) {
  const fieldDefinitions = schema.fields.map((field) => {
    let def = `\`${field.name}\` ${getSqliteType(field)}`;
    if (field.required) {
      def += " NOT NULL";
    }
    if (field.unique) {
      def += " UNIQUE";
    }
    if (field.default !== null && field.default !== undefined) {
      if (typeof field.default === "string") {
        def += ` DEFAULT '${field.default}'`;
      } else {
        def += ` DEFAULT ${field.default}`;
      }
    }
    return def;
  });

  fieldDefinitions.unshift("`id` INTEGER PRIMARY KEY AUTOINCREMENT");
  fieldDefinitions.push("`created_at` DATETIME DEFAULT CURRENT_TIMESTAMP");

  return `
    CREATE TABLE IF NOT EXISTS \`${schema.tableName}\` (
      ${fieldDefinitions.join(",\n      ")}
    )
  `;
}

export async function initTable(schema) {
  if (initializedTables.has(schema.tableName)) {
    return;
  }

  const sql = generateCreateTableSql(schema);
  await run(sql);
  initializedTables.add(schema.tableName);
}

export async function listAll(schema) {
  await initTable(schema);
  const fieldNames = ["id", ...schema.fields.map((f) => f.name), "created_at"];
  const selectFields = fieldNames.map((name) => `\`${name}\``).join(", ");
  return all(`SELECT ${selectFields} FROM \`${schema.tableName}\` ORDER BY id DESC`);
}

export async function search(schema, searchParams = {}) {
  await initTable(schema);

  const fieldNames = ["id", ...schema.fields.map((f) => f.name), "created_at"];
  const selectFields = fieldNames.map((name) => `\`${name}\``).join(", ");

  const searchableFields = schema.fields.filter((f) => f.search_able === true);

  const conditions = [];
  const params = [];

  searchableFields.forEach((field) => {
    const paramValue = searchParams[field.name];

    if (paramValue === undefined || paramValue === null || paramValue === "") {
      return;
    }

    switch (field.type) {
      case "string":
        conditions.push(`\`${field.name}\` LIKE ?`);
        params.push(`%${paramValue}%`);
        break;

      case "number": {
        const minParam = searchParams[`${field.name}_min`];
        const maxParam = searchParams[`${field.name}_max`];

        if (minParam !== undefined && minParam !== null && minParam !== "") {
          conditions.push(`\`${field.name}\` >= ?`);
          params.push(Number(minParam));
        }
        if (maxParam !== undefined && maxParam !== null && maxParam !== "") {
          conditions.push(`\`${field.name}\` <= ?`);
          params.push(Number(maxParam));
        }
        if (minParam === undefined && maxParam === undefined) {
          conditions.push(`\`${field.name}\` = ?`);
          params.push(Number(paramValue));
        }
        break;
      }

      case "date":
      case "datetime": {
        const startParam = searchParams[`${field.name}_start`];
        const endParam = searchParams[`${field.name}_end`];

        if (startParam !== undefined && startParam !== null && startParam !== "") {
          conditions.push(`\`${field.name}\` >= ?`);
          params.push(startParam);
        }
        if (endParam !== undefined && endParam !== null && endParam !== "") {
          conditions.push(`\`${field.name}\` <= ?`);
          params.push(endParam + " 23:59:59");
        }
        break;
      }

      case "boolean":
        conditions.push(`\`${field.name}\` = ?`);
        params.push(paramValue === "true" || paramValue === true ? 1 : 0);
        break;

      default:
        conditions.push(`\`${field.name}\` = ?`);
        params.push(paramValue);
        break;
    }
  });

  let sql = `SELECT ${selectFields} FROM \`${schema.tableName}\``;

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += ` ORDER BY id DESC`;

  return all(sql, params);
}

export function getSearchableFields(schema) {
  return schema.fields.filter((f) => f.search_able === true);
}

export async function getById(schema, id) {
  await initTable(schema);
  const fieldNames = ["id", ...schema.fields.map((f) => f.name), "created_at"];
  const selectFields = fieldNames.map((name) => `\`${name}\``).join(", ");
  return get(
    `SELECT ${selectFields} FROM \`${schema.tableName}\` WHERE id = ?`,
    [id]
  );
}

export async function create(schema, data) {
  await initTable(schema);

  const insertFields = [];
  const insertValues = [];
  const placeholders = [];

  schema.fields.forEach((field) => {
    const value = data[field.name] !== undefined ? data[field.name] : field.default;
    if (value !== undefined && value !== null) {
      insertFields.push(`\`${field.name}\``);
      insertValues.push(value);
      placeholders.push("?");
    }
  });

  if (insertFields.length === 0) {
    throw new Error("没有有效的字段可插入");
  }

  const sql = `
    INSERT INTO \`${schema.tableName}\` (${insertFields.join(", ")})
    VALUES (${placeholders.join(", ")})
  `;

  const result = await run(sql, insertValues);
  return getById(schema, result.lastID);
}

export async function update(schema, id, data) {
  await initTable(schema);

  const updateFields = [];
  const updateValues = [];

  schema.fields.forEach((field) => {
    if (data[field.name] !== undefined) {
      updateFields.push(`\`${field.name}\` = ?`);
      updateValues.push(data[field.name]);
    }
  });

  if (updateFields.length === 0) {
    return getById(schema, id);
  }

  updateValues.push(id);

  const sql = `
    UPDATE \`${schema.tableName}\`
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `;

  await run(sql, updateValues);
  return getById(schema, id);
}

export async function remove(schema, id) {
  await initTable(schema);
  const result = await run(`DELETE FROM \`${schema.tableName}\` WHERE id = ?`, [id]);
  return result.changes > 0;
}

export async function loadSchema(schemaName) {
  const schemaPath = path.join(process.cwd(), "schemas", `${schemaName}.schema.json`);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema not found: ${schemaName}`);
  }
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  return JSON.parse(schemaContent);
}

export { run, get, all };
