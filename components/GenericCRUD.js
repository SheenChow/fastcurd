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

function getEmptySearchForm(schema) {
  const form = {};
  const searchableFields = schema.fields.filter((f) => f.search_able === true);
  
  searchableFields.forEach((field) => {
    form[field.name] = "";
    if (field.type === "number") {
      form[`${field.name}_min`] = "";
      form[`${field.name}_max`] = "";
    }
    if (field.type === "date" || field.type === "datetime") {
      form[`${field.name}_start`] = "";
      form[`${field.name}_end`] = "";
    }
  });
  
  return form;
}

function getFormField(field, value, onChange, prefix = "") {
  const name = prefix ? `${prefix}${field.name}` : field.name;
  const commonProps = {
    name: name,
    value: value,
    onChange,
    placeholder: field.label,
    required: false,
  };

  switch (field.type) {
    case "number":
      return (
        <input
          key={name}
          type="number"
          min={field.min || 0}
          {...commonProps}
        />
      );
    case "boolean":
      return (
        <select key={name} {...commonProps}>
          <option value="">请选择</option>
          <option value="true">是</option>
          <option value="false">否</option>
        </select>
      );
    case "date":
    case "datetime":
      return <input key={name} type="date" {...commonProps} />;
    case "string":
    default:
      if (field.description && field.description.length > 50) {
        return <textarea key={name} rows={3} {...commonProps} />;
      }
      return <input key={name} type="text" {...commonProps} />;
  }
}

function getSearchField(field, searchForm, handleSearchChange) {
  const name = field.name;
  const value = searchForm[name] || "";

  switch (field.type) {
    case "string":
      return (
        <div key={name} style={{ display: "flex", flexDirection: "column", flex: "1" }}>
          <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            {field.label} (模糊搜索)
          </label>
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleSearchChange}
            placeholder={`输入${field.label}关键字`}
          />
        </div>
      );

    case "number":
      const minValue = searchForm[`${name}_min`] || "";
      const maxValue = searchForm[`${name}_max`] || "";
      return (
        <div key={name} style={{ display: "flex", flexDirection: "column", flex: "1" }}>
          <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            {field.label}
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="number"
              name={`${name}_min`}
              value={minValue}
              onChange={handleSearchChange}
              placeholder="最小值"
              style={{ width: "120px" }}
            />
            <span style={{ color: "#666" }}>~</span>
            <input
              type="number"
              name={`${name}_max`}
              value={maxValue}
              onChange={handleSearchChange}
              placeholder="最大值"
              style={{ width: "120px" }}
            />
          </div>
        </div>
      );

    case "date":
    case "datetime":
      const startValue = searchForm[`${name}_start`] || "";
      const endValue = searchForm[`${name}_end`] || "";
      return (
        <div key={name} style={{ display: "flex", flexDirection: "column", flex: "1" }}>
          <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            {field.label}
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="date"
              name={`${name}_start`}
              value={startValue}
              onChange={handleSearchChange}
            />
            <span style={{ color: "#666" }}>~</span>
            <input
              type="date"
              name={`${name}_end`}
              value={endValue}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      );

    case "boolean":
      return (
        <div key={name} style={{ display: "flex", flexDirection: "column", flex: "1" }}>
          <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            {field.label}
          </label>
          <select
            name={name}
            value={value}
            onChange={handleSearchChange}
          >
            <option value="">全部</option>
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
        </div>
      );

    default:
      return (
        <div key={name} style={{ display: "flex", flexDirection: "column", flex: "1" }}>
          <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
            {field.label}
          </label>
          <input
            type="text"
            name={name}
            value={value}
            onChange={handleSearchChange}
            placeholder={`输入${field.label}`}
          />
        </div>
      );
  }
}

export default function GenericCRUD({ tableName }) {
  const [schema, setSchema] = useState(null);
  const [data, setData] = useState([]);
  const [form, setForm] = useState({});
  const [searchForm, setSearchForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const submitText = useMemo(
    () => (editingId ? "更新" : "新增"),
    [editingId]
  );

  const searchableFields = useMemo(() => {
    if (!schema) return [];
    return schema.fields.filter((f) => f.search_able === true);
  }, [schema]);

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
        setSearchForm(getEmptySearchForm(result.schema));
      }
    } catch (err) {
      setError(err.message);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function executeSearch() {
    setLoading(true);
    setError(null);
    setIsSearching(true);

    try {
      const params = new URLSearchParams();
      
      Object.entries(searchForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const url = params.toString()
        ? `/api/${tableName}?${params.toString()}`
        : `/api/${tableName}`;

      const res = await fetch(url, { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "搜索失败");
      }
      setData(result.data);
      setMessage(`搜索完成，共 ${result.data.length} 条记录`);
    } catch (err) {
      setError(err.message);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    if (schema) {
      setSearchForm(getEmptySearchForm(schema));
      setIsSearching(false);
      fetchData();
      setMessage("已重置搜索条件");
    }
  }

  useEffect(() => {
    fetchData();
  }, [tableName]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSearchChange(event) {
    const { name, value } = event.target;
    setSearchForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSearch(event) {
    event.preventDefault();
    await executeSearch();
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
      
      if (isSearching) {
        await executeSearch();
      } else {
        await fetchData();
      }
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
      
      if (isSearching) {
        await executeSearch();
      } else {
        await fetchData();
      }
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
        
        {searchableFields.length > 0 && (
          <div style={{ marginBottom: "20px", padding: "16px", background: "#f9f9f9", borderRadius: "8px" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px" }}>
              🔍 搜索条件
              {isSearching && (
                <span style={{ marginLeft: "8px", color: "#0070f3", fontSize: "12px" }}>
                  (搜索模式)
                </span>
              )}
            </h3>
            <form onSubmit={handleSearch}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "12px" }}>
                {searchableFields.map((field) => getSearchField(field, searchForm, handleSearchChange))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit">搜索</button>
                <button
                  type="button"
                  className="secondary"
                  onClick={resetSearch}
                >
                  重置
                </button>
              </div>
            </form>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            {schema.fields.map((field) => (
              <div key={field.name} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                  {field.label}
                  {field.required && <span style={{ color: "red" }}>*</span>}
                  {field.search_able && (
                    <span style={{ marginLeft: "4px", fontSize: "10px", color: "#0070f3" }}>
                      [可搜索]
                    </span>
                  )}
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
        <h2>列表 {data.length > 0 && <span style={{ fontWeight: "normal", fontSize: "14px", color: "#666" }}>(共 {data.length} 条)</span>}</h2>
        {loading ? (
          <p>加载中...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                {schema.fields.map((field) => (
                  <th key={field.name}>
                    {field.label}
                    {field.search_able && (
                      <span style={{ marginLeft: "4px", fontSize: "10px", color: "#0070f3" }}>
                        🔍
                      </span>
                    )}
                  </th>
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
                  {isSearching ? "未找到匹配的记录，请调整搜索条件" : "暂无数据，请先新增记录。"}
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
