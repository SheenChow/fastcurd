"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchSchemas() {
    setLoading(true);
    try {
      const res = await fetch("/api/schemas", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "获取 Schema 列表失败");
      }
      setSchemas(data.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSchemas();
  }, []);

  return (
    <main className="container">
      <section className="card">
        <h1>FastCurd 通用 CRUD 管理系统</h1>
        <p>基于 Schema 配置的快速开发脚手架</p>
      </section>

      <section className="card">
        <h2>可用的管理模块</h2>
        {message ? (
          <p style={{ color: "red" }}>{message}</p>
        ) : loading ? (
          <p>加载中...</p>
        ) : schemas.length === 0 ? (
          <div>
            <p>暂无可用的管理模块。</p>
            <p>请在 <code>schemas/</code> 目录下创建 <code>.schema.json</code> 文件来定义新的管理模块。</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {schemas.map((schema) => (
              <Link
                key={schema.tableName}
                href={`/${schema.tableName}`}
                style={{
                  display: "block",
                  padding: "16px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <h3 style={{ margin: "0 0 8px 0" }}>{schema.displayName}</h3>
                {schema.description && (
                  <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                    {schema.description}
                  </p>
                )}
                <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#999" }}>
                  表名: {schema.tableName}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>快速开始</h2>
        <ol>
          <li>在 <code>schemas/</code> 目录下创建一个新的 <code>.schema.json</code> 文件</li>
          <li>按照以下格式定义你的数据模型：</li>
        </ol>
        <pre style={{ background: "#f5f5f5", padding: "12px", borderRadius: "4px", overflow: "auto" }}>
{`{
  "tableName": "products",
  "displayName": "产品",
  "description": "产品信息管理",
  "fields": [
    {
      "name": "name",
      "type": "string",
      "label": "产品名称",
      "required": true,
      "unique": false,
      "default": null,
      "description": "产品的名称"
    },
    {
      "name": "price",
      "type": "number",
      "label": "价格",
      "required": true,
      "unique": false,
      "default": 0,
      "description": "产品价格"
    }
  ]
}`}
        </pre>
        <p>支持的字段类型：<code>string</code>、<code>number</code>、<code>boolean</code>、<code>date</code>、<code>datetime</code></p>
      </section>
    </main>
  );
}
