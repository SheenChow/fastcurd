import path from "path";
import sqlite3 from "sqlite3";

sqlite3.verbose();

const dbFile = path.join(process.cwd(), "students.db");
const db = new sqlite3.Database(dbFile);

let initialized = false;

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

export async function initDb() {
  if (initialized) {
    return;
  }
  await run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      class_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  initialized = true;
}

export async function listStudents() {
  await initDb();
  return all(
    "SELECT id, name, age, class_name, email, created_at FROM students ORDER BY id DESC"
  );
}

export async function getStudentById(id) {
  await initDb();
  return get(
    "SELECT id, name, age, class_name, email, created_at FROM students WHERE id = ?",
    [id]
  );
}

export async function createStudent(student) {
  await initDb();
  const result = await run(
    "INSERT INTO students (name, age, class_name, email) VALUES (?, ?, ?, ?)",
    [student.name, student.age, student.class_name, student.email]
  );
  return getStudentById(result.lastID);
}

export async function updateStudent(id, student) {
  await initDb();
  await run(
    "UPDATE students SET name = ?, age = ?, class_name = ?, email = ? WHERE id = ?",
    [student.name, student.age, student.class_name, student.email, id]
  );
  return getStudentById(id);
}

export async function deleteStudent(id) {
  await initDb();
  const result = await run("DELETE FROM students WHERE id = ?", [id]);
  return result.changes > 0;
}
