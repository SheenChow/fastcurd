import { NextResponse } from "next/server";
import { createStudent, listStudents } from "@/lib/db";

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

export async function GET() {
  try {
    const rows = await listStudents();
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validated = validatePayload(body);
    if (!validated.valid) {
      return NextResponse.json(
        { success: false, message: validated.message },
        { status: 400 }
      );
    }

    const created = await createStudent(validated.data);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    const status = error.message.includes("UNIQUE") ? 409 : 500;
    const message =
      status === 409 ? "邮箱已存在，请使用其他邮箱" : error.message;
    return NextResponse.json({ success: false, message }, { status });
  }
}
