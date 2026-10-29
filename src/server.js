require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("node:path");
const { pool } = require("./db");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set to a random string of at least 32 characters.");
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT || 3000);
const prod = process.env.NODE_ENV === "production";
app.disable("x-powered-by");
if (prod) app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false });

function clean(v, max) { return String(v ?? "").trim().slice(0, max); }
function auth(req, res, next) {
  const token = req.cookies.nebulix_admin;
  if (!token) return res.status(401).json({ error: "Login talab qilinadi." });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie("nebulix_admin");
    return res.status(401).json({ error: "Sessiya tugagan. Qayta kiring." });
  }
}
function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

app.get("/api/health", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.json({ ok: true, database: "connected" }); }
  catch { res.status(503).json({ ok: false, database: "unavailable" }); }
});

app.post("/api/contact", contactLimiter, async (req, res) => {
  const name = clean(req.body.name, 120);
  const email = clean(req.body.email, 254);
  const subject = clean(req.body.subject, 180);
  const message = clean(req.body.message, 5000);
  // Lightweight honeypot for basic bot filtering.
  if (clean(req.body.website, 200)) return res.status(201).json({ ok: true });
  if (name.length < 2 || !validEmail(email) || message.length < 10) {
    return res.status(400).json({ error: "Ism, to‘g‘ri email va kamida 10 belgili xabar kiriting." });
  }
  try {
    await pool.query(
      "INSERT INTO messages (name,email,subject,message) VALUES ($1,$2,$3,$4)",
      [name, email, subject, message]
    );
    res.status(201).json({ ok: true, message: "Xabaringiz yuborildi. Rahmat!" });
  } catch (err) {
    console.error("Contact insert failed:", err.message);
    res.status(500).json({ error: "Xabarni saqlashda xatolik yuz berdi." });
  }
});

app.post("/api/admin/login", loginLimiter, async (req, res) => {
  const username = clean(req.body.username, 80);
  const password = String(req.body.password ?? "");
  try {
    const result = await pool.query("SELECT id, username, password_hash FROM admins WHERE username=$1", [username]);
    const admin = result.rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: "Login yoki parol noto‘g‘ri." });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "8h" });
    res.cookie("nebulix_admin", token, {
      httpOnly: true, sameSite: "strict", secure: prod, maxAge: 8 * 60 * 60 * 1000, path: "/"
    });
    res.json({ ok: true, admin: { username: admin.username } });
  } catch (err) {
    console.error("Login failed:", err.message);
    res.status(500).json({ error: "Server xatosi." });
  }
});
app.post("/api/admin/logout", (_req, res) => {
  res.clearCookie("nebulix_admin", { httpOnly: true, sameSite: "strict", secure: prod, path: "/" });
  res.json({ ok: true });
});
app.get("/api/admin/me", auth, (req, res) => res.json({ admin: { username: req.admin.username } }));

app.get("/api/admin/stats", auth, async (_req, res) => {
  try {
    const [messages, projects, unread] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM messages"),
      pool.query("SELECT COUNT(*)::int AS count FROM projects"),
      pool.query("SELECT COUNT(*)::int AS count FROM messages WHERE status='new'")
    ]);
    res.json({ messages: messages.rows[0].count, projects: projects.rows[0].count, unread: unread.rows[0].count });
  } catch (err) { res.status(500).json({ error: "Statistikani yuklab bo‘lmadi." }); }
});
app.get("/api/admin/messages", auth, async (req, res) => {
  try {
    const status = ["new", "read", "archived"].includes(req.query.status) ? req.query.status : null;
    const result = status
      ? await pool.query("SELECT id,name,email,subject,message,status,created_at FROM messages WHERE status=$1 ORDER BY created_at DESC LIMIT 200", [status])
      : await pool.query("SELECT id,name,email,subject,message,status,created_at FROM messages ORDER BY created_at DESC LIMIT 200");
    res.json({ messages: result.rows });
  } catch { res.status(500).json({ error: "Xabarlarni yuklab bo‘lmadi." }); }
});
app.patch("/api/admin/messages/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  const status = clean(req.body.status, 20);
  if (!Number.isSafeInteger(id) || id < 1 || !["new", "read", "archived"].includes(status))
    return res.status(400).json({ error: "Noto‘g‘ri so‘rov." });
  try {
    const r = await pool.query("UPDATE messages SET status=$1 WHERE id=$2 RETURNING id,status", [status,id]);
    if (!r.rowCount) return res.status(404).json({ error: "Xabar topilmadi." });
    res.json({ ok: true, message: r.rows[0] });
  } catch { res.status(500).json({ error: "Holatni yangilab bo‘lmadi." }); }
});
app.delete("/api/admin/messages/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Noto‘g‘ri ID." });
  try {
    const r = await pool.query("DELETE FROM messages WHERE id=$1", [id]);
    if (!r.rowCount) return res.status(404).json({ error: "Xabar topilmadi." });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Xabarni o‘chirib bo‘lmadi." }); }
});
app.get("/api/admin/projects", auth, async (_req, res) => {
  try {
    const r = await pool.query("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC");
    res.json({ projects: r.rows });
  } catch { res.status(500).json({ error: "Loyihalarni yuklab bo‘lmadi." }); }
});
app.post("/api/admin/projects", auth, async (req, res) => {
  const title = clean(req.body.title, 160);
  const description = clean(req.body.description, 3000);
  const url = clean(req.body.url, 500);
  const image_url = clean(req.body.image_url, 1000);
  const tech_stack = Array.isArray(req.body.tech_stack) ? req.body.tech_stack.slice(0, 12).map(x => clean(x, 40)).filter(Boolean) : [];
  const featured = Boolean(req.body.featured);
  if (title.length < 2) return res.status(400).json({ error: "Loyiha nomi kamida 2 belgidan iborat bo‘lsin." });
  for (const link of [url, image_url].filter(Boolean)) {
    try { if (!["http:", "https:"].includes(new URL(link).protocol)) throw new Error(); }
    catch { return res.status(400).json({ error: "Havolalar http:// yoki https:// bilan boshlanishi kerak." }); }
  }
  try {
    const r = await pool.query(
      "INSERT INTO projects(title,description,url,image_url,tech_stack,featured) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [title, description, url, image_url, tech_stack, featured]
    );
    res.status(201).json({ project: r.rows[0] });
  } catch { res.status(500).json({ error: "Loyihani saqlab bo‘lmadi." }); }
});
app.put("/api/admin/projects/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  const title = clean(req.body.title, 160);
  const description = clean(req.body.description, 3000);
  const url = clean(req.body.url, 500);
  const image_url = clean(req.body.image_url, 1000);
  const tech_stack = Array.isArray(req.body.tech_stack) ? req.body.tech_stack.slice(0, 12).map(x => clean(x, 40)).filter(Boolean) : [];
  const featured = Boolean(req.body.featured);
  if (!Number.isSafeInteger(id) || id < 1 || title.length < 2) return res.status(400).json({ error: "Ma’lumotlarni tekshiring." });
  for (const link of [url, image_url].filter(Boolean)) {
    try { if (!["http:", "https:"].includes(new URL(link).protocol)) throw new Error(); }
    catch { return res.status(400).json({ error: "Havolalar http:// yoki https:// bilan boshlanishi kerak." }); }
  }
  try {
    const r = await pool.query(
      "UPDATE projects SET title=$1,description=$2,url=$3,image_url=$4,tech_stack=$5,featured=$6,updated_at=NOW() WHERE id=$7 RETURNING *",
      [title, description, url, image_url, tech_stack, featured, id]
    );
    if (!r.rowCount) return res.status(404).json({ error: "Loyiha topilmadi." });
    res.json({ project: r.rows[0] });
  } catch { res.status(500).json({ error: "Loyihani yangilab bo‘lmadi." }); }
});
app.delete("/api/admin/projects/:id", auth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Noto‘g‘ri ID." });
  try {
    const r = await pool.query("DELETE FROM projects WHERE id=$1", [id]);
    if (!r.rowCount) return res.status(404).json({ error: "Loyiha topilmadi." });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Loyihani o‘chirib bo‘lmadi." }); }
});

app.get("/admin", (_req, res) => res.sendFile(path.join(__dirname, "../public/admin/index.html")));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ error: "API route topilmadi." });
  next();
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nebulix.dev running on port ${PORT}`);
});