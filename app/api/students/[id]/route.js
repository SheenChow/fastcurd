import { NextResponse } from "next/server";
import { deleteStudent, getStudentById, updateStudent } from "@/lib/db";

function parseId(params) {
  const id = Number(params?.id);
  if (Number.isNaN(id) || id <= 0) {
    return null;
  }
  return id;
}

function validatePayload(body) {
  const name = String(body?.name || "").trim();
  const age = Number(body?.age);
  const className = String(body?.class_name || "").trim();
  const email = String(body?.email || "").trim();

  if (!name || !className || !email || Number.isNaN(age) || age <= 0) {
    return { valid: false, message: "参数不合法，请检查姓名、年龄、班级和邮箱" };
  }

  return {
    valid: true,
    data: { name, age, class_name: className, email }
  };
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
    const row = await getStudentById(id);
    if (!row) {
      return NextResponse.json(
        { success: false, message: "学生不存在" },
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
    const body = await request.json();
    const validated = validatePayload(body);
    if (!validated.valid) {
      return NextResponse.json(
        { success: false, message: validated.message },
        { status: 400 }
      );
    }

    const existing = await getStudentById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "学生不存在" },
        { status: 404 }
      );
    }

    const updated = await updateStudent(id, validated.data);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const status = error.message.includes("UNIQUE") ? 409 : 500;
    const message =
      status === 409 ? "邮箱已存在，请使用其他邮箱" : error.message;
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
    const deleted = await deleteStudent(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "学生不存在" },
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
