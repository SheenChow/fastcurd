import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const schemasDir = path.join(process.cwd(), "schemas");
    
    if (!fs.existsSync(schemasDir)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(schemasDir);
    const schemaFiles = files.filter((file) => file.endsWith(".schema.json"));

    const schemas = [];
    for (const file of schemaFiles) {
      const tableName = file.replace(".schema.json", "");
      const filePath = path.join(schemasDir, file);
      
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const schema = JSON.parse(content);
        schemas.push({
          tableName: schema.tableName || tableName,
          displayName: schema.displayName || tableName,
          description: schema.description || "",
          fileName: file,
        });
      } catch (error) {
        console.error(`Failed to parse schema file: ${file}`, error);
      }
    }

    return NextResponse.json({ success: true, data: schemas });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
