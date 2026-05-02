import { NextResponse } from "next/server";
import { listAll, create, loadSchema } from "@/lib/genericDb";

function validatePayload(schema, body) {
  const data = {};
  const errors = [];

  schema.fields.forEach((field) => {
    const value = body?.[field.name];

    if (field.required) {
      if (value === undefined || value === null || value === "") {
        errors.push(`${field.label} 是必填字段`);
        return;
      }
    }

    if (value !== undefined && value !== null && value !== "") {
      switch (field.type) {
        case "number":
          const numValue = Number(value);
          if (Number.isNaN(numValue)) {
            errors.push(`${field.label} 必须是数字`);
            return;
          }
          data[field.name] = numValue;
          break;
        case "boolean":
          data[field.name] = Boolean(value);
          break;
        case "date":
        case "datetime":
          data[field.name] = String(value);
          break;
        case "string":
        default:
          data[field.name] = String(value).trim();
          break;
      }
    }
  });

  if (errors.length > 0) {
    return { valid: false, message: errors.join("; ") };
  }

  return { valid: true, data };
}

async function getSchema(params) {
  const tableName = params?.table;
  if (!tableName) {
    return null;
  }

  try {
    return await loadSchema(tableName);
  } catch {
    return null;
  }
}

export async function GET(_, { params }) {
  try {
    const schema = await getSchema(params);
    if (!schema) {
      return NextResponse.json(
        { success: false, message: "无效的资源类型" },
        { status: 400 }
      );
    }

    const rows = await listAll(schema);
    return NextResponse.json({ success: true, data: rows, schema });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const schema = await getSchema(params);
    if (!schema) {
      return NextResponse.json(
        { success: false, message: "无效的资源类型" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = validatePayload(schema, body);

    if (!validated.valid) {
      return NextResponse.json(
        { success: false, message: validated.message },
        { status: 400 }
      );
    }

    const created = await create(schema, validated.data);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    const status = error.message.includes("UNIQUE") ? 409 : 500;
    const message =
      status === 409 ? "数据已存在，请检查唯一字段" : error.message;
    return NextResponse.json({ success: false, message }, { status });
  }
}
