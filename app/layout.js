import "./globals.css";

export const metadata = {
  title: "学生管理系统",
  description: "基于 Next.js 15 + React 19 + SQLite3 的学生 CRUD 示例"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
