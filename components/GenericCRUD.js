"use client";

import { useEffect, useMemo, useState } from "react";

function getEmptyForm(schema) {
  const form = {};
  schema.fields.forEach((field) => {
    form[field.name] =
      field.default !== null && field.default !== undefined
        ? String(field.default)
        : "";
  });
  return form;
}

function getFormField(field, value, onChange) {
  const commonProps = {
    name: field.name,
    value: value,
    onChange,
    placeholder: field.label,
    required: field.required,
  };

  switch (field.type) {
    case "number":
      return (
        <input
          key={field.name}
          type="number"
          min={field.min || 0}
          {...commonProps}
        />
      );
    case "boolean":
      return (
        <select key={field.name} {...commonProps}>
          <option value="">请选择</option>
          <option value="true">是</option>
          <option value="false">否</option>
        </select>
      );
    case "date":
    case "datetime":
      return <input key={field.name} type="date" {...commonProps} />;
    case "string":
    default:
      if (field.description && field.description.length > 50) {
        return <textarea key={field.name} rows={3} {...commonProps} />;
      }
      return <input key={field.name} type="text" {...commonProps} />;
  }
}

export default function GenericCRUD({ tableName }) {
  const [schema, setSchema] = useState(null);
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitText = useMemo(
    () => (editingId ? "更新" : "新增"),
    [editingId]
  );

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/${tableName}`, { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "获取数据失败");
      }
      setSchema(result.schema);
      setData(result.data);
      if (result.schema && Object.keys(form).length === 0) {
        setForm(getEmptyForm(result.schema));
      }
    } catch (err) {
      setError(err.message);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [tableName]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    if (schema) {
      setForm(getEmptyForm(schema));
    }
    setEditingId(null);
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const payload = {};
    schema.fields.forEach((field) => {
      const value = form[field.name];
      if (value !== undefined && value !== null && value !== "") {
        if (field.type === "number") {
          payload[field.name] = Number(value);
        } else if (field.type === "boolean") {
          payload[field.name] = value === "true";
        } else {
          payload[field.name] = value;
        }
      }
    });

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/${tableName}/${editingId}` : `/api/${tableName}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "提交失败");
      }
      setMessage(editingId ? "更新成功" : "新增成功");
      resetForm();
      await fetchData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function handleEdit(row) {
    setEditingId(row.id);
    const newForm = {};
    schema.fields.forEach((field) => {
      const value = row[field.name];
      newForm[field.name] = value !== undefined && value !== null ? String(value) : "";
    });
    setForm(newForm);
    setMessage("");
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("确认删除该记录吗？");
    if (!confirmed) {
      return;
    }

    setMessage("");
    try {
      const res = await fetch(`/api/${tableName}/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "删除失败");
      }
      setMessage("删除成功");
      if (editingId === id) {
        resetForm();
      }
      await fetchData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (error) {
    return (
      <main className="container">
        <section className="card">
          <h1>错误</h1>
          <p style={{ color: "red" }}>{error}</p>
          <p>请检查 Schema 配置是否正确，路径：schemas/{tableName}.schema.json</p>
        </section>
      </main>
    );
  }

  if (!schema) {
    return (
      <main className="container">
        <section className="card">
          <p>加载中...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card">
        <h1>{schema.displayName || tableName}管理</h1>
        {schema.description && <p>{schema.description}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {schema.fields.map((field) => (
              <div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                  {field.label}
                  {field.required && <span style={{ color: "red" }}>*</span>}
                </label>
                {getFormField(field, form[field.name] || "", handleChange)}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button type="submit">{submitText}</button>
            <button
              type="button"
              className="secondary"
              onClick={resetForm}
              disabled={!editingId}
            >
              取消编辑
            </button>
          </div>
          {message ? <div className="message">{message}</div> : null}
        </form>
      </section>

      <section className="card">
        <h2>列表</h2>
        {loading ? (
          <p>加载中...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                {schema.fields.map((field) => (
                  <th key={field.name}>{field.label}</th>
                ))}
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.length ? (
                data.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  {schema.fields.map((field) => (
                    <td key={field.name}>{row[field.name]}</td>
                  ))}
                  <td>{row.created_at}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => handleEdit(row)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDelete(row.id)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={schema.fields.length + 3}>
                  暂无数据，请先新增记录。
                </td>
              </tr>
            )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
