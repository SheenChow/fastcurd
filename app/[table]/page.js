"use client";

import GenericCRUD from "@/components/GenericCRUD";
import { useParams } from "next/navigation";

export default function TablePage() {
  const params = useParams();
  const tableName = params.table;

  if (!tableName) {
    return (
      <main className="container">
        <section className="card">
          <h1>错误</h1>
          <p>未指定表名</p>
        </section>
      </main>
    );
  }

  return <GenericCRUD tableName={tableName} />;
}
