import { NextResponse } from "next/server";
import { getById, update, remove, loadSchema } from "@/lib/genericDb";

function parseId(params) {
  const id = Number(params?.id);
  if (Number.isNaN(id) || id <= 0) {
    return null;
  }
  return id;
}

function validatePayload(schema, body) {
  const data = {};
  const errors = [];

  schema.fields.forEach((field) => {
    const value = body?.[field.name];

    if (value !== undefined && value !== null) {
      if (value === "" && field.required) {
        errors.push(`${field.label} 不能为空`);
        return;
      }

      if (value !== "") {
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
  const id = parseId(params);
  if (!id) {
    return NextResponse.json(
      { success: false, message: "无效的 ID" },
      { status: 400 }
    );
  }

  try {
    const schema = await getSchema(params);
    if (!schema) {
      return NextResponse.json(
        { success: false, message: "无效的资源类型" },
        { status: 400 }
      );
    }

    const row = await getById(schema, id);
    if (!row) {
      return NextResponse.json(
        { success: false, message: "数据不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const id = parseId(params);
  if (!id) {
    return NextResponse.json(
      { success: false, message: "无效的 ID" },
      { status: 400 }
    );
  }

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

    const existing = await getById(schema, id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "数据不存在" },
        { status: 404 }
      );
    }

    const updated = await update(schema, id, validated.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const status = error.message.includes("UNIQUE") ? 409 : 500;
    const message =
      status === 409 ? "数据已存在，请检查唯一字段" : error.message;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(_, { params }) {
  const id = parseId(params);
  if (!id) {
    return NextResponse.json(
      { success: false, message: "无效的 ID" },
      { status: 400 }
    );
  }

  try {
    const schema = await getSchema(params);
    if (!schema) {
      return NextResponse.json(
        { success: false, message: "无效的资源类型" },
        { status: 400 }
      );
    }

    const deleted = await remove(schema, id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "数据不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "删除成功" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
