"use client";

import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  name: "",
  age: "",
  class_name: "",
  email: ""
};

export default function HomePage() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submitText = useMemo(
    () => (editingId ? "更新学生信息" : "新增学生"),
    [editingId]
  );

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "获取学生列表失败");
      }
      setStudents(data.data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      age: Number(form.age)
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/students/${editingId}` : "/api/students";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "提交失败");
      }
      setMessage(editingId ? "更新成功" : "新增成功");
      resetForm();
      await fetchStudents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setForm({
      name: row.name,
      age: String(row.age),
      class_name: row.class_name,
      email: row.email
    });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("确认删除该学生吗？");
    if (!confirmed) {
      return;
    }

    setMessage("");
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "删除失败");
      }
      setMessage("删除成功");
      if (editingId === id) {
        resetForm();
      }
      await fetchStudents();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="container">
      <section className="card">
        <h1>学生管理系统</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="姓名"
              required
            />
            <input
              name="age"
              type="number"
              min="1"
              value={form.age}
              onChange={handleChange}
              placeholder="年龄"
              required
            />
            <input
              name="class_name"
              value={form.class_name}
              onChange={handleChange}
              placeholder="班级"
              required
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="邮箱"
              required
            />
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
        <h2>学生列表</h2>
        {loading ? (
          <p>加载中...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>姓名</th>
                <th>年龄</th>
                <th>班级</th>
                <th>邮箱</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {students.length ? (
                students.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.age}</td>
                    <td>{row.class_name}</td>
                    <td>{row.email}</td>
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
                  <td colSpan={7}>暂无数据，请先新增学生。</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
