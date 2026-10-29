const $ = (s) => document.querySelector(s);
const state = { view: "overview", messages: [], projects: [] };
async function api(url, options = {}) {
  const response = await fetch(url, { credentials: "same-origin", headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && !url.includes("/login")) showLogin();
    throw new Error(data.error || "So‘rov bajarilmadi.");
  }
  return data;
}
function toast(message) {
  const el = $("#toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 2800);
}
function showLogin() { $("#loginScreen").classList.remove("hidden"); $("#appScreen").classList.add("hidden"); }
function showApp(username) {
  $("#loginScreen").classList.add("hidden"); $("#appScreen").classList.remove("hidden");
  $("#adminName").textContent = username || "Admin";
  loadDashboard();
}
$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); $("#loginError").textContent = "";
  const form = new FormData(e.currentTarget);
  try { const r = await api("/api/admin/login", {method:"POST", body:JSON.stringify({username:form.get("username"),password:form.get("password")})}); document.querySelector("#loginForm")?.reset(); showApp(r.admin.username); }
  catch (err) { $("#loginError").textContent = err.message; }
});
$("#logoutBtn").addEventListener("click", async () => { try { await api("/api/admin/logout",{method:"POST"}); } finally { showLogin(); } });
document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.goto)));
function switchView(view) {
  state.view = view;
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  $(`#${view}View`).classList.remove("hidden");
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  const labels = {overview:["OVERVIEW","Control overview"],messages:["MESSAGES","Xabarlar"],projects:["PROJECTS","Loyihalar"]};
  $("#crumbName").textContent = labels[view][0]; $("#pageTitle").textContent = labels[view][1];
  if (view === "messages") loadMessages(); if (view === "projects") loadProjects();
}
async function loadDashboard() {
  try {
    const [stats, msg] = await Promise.all([api("/api/admin/stats"), api("/api/admin/messages")]);
    $("#statMessages").textContent = stats.messages; $("#statUnread").textContent = stats.unread; $("#statProjects").textContent = stats.projects; $("#navUnread").textContent = stats.unread;
    state.messages = msg.messages; renderMessages($("#recentMessages"), state.messages.slice(0,5), true);
  } catch (e) { toast(e.message); }
}
function escapeHtml(s="") { return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function dateLabel(s) { return new Date(s).toLocaleString("uz-UZ",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}); }
function renderMessages(target, messages, recent=false) {
  if (!messages.length) { target.innerHTML = '<div class="empty">Hozircha xabarlar yo‘q.</div>'; return; }
  target.innerHTML = messages.map(m => `<article class="message-row">
    <div class="message-person"><strong>${escapeHtml(m.name)}</strong><small>${escapeHtml(m.email)}</small></div>
    <div class="message-preview"><b>${escapeHtml(m.subject || "Mavzusiz xabar")}</b><br>${escapeHtml(m.message)}</div>
    <div class="message-actions"><span class="status ${m.status}">${({new:"YANGI",read:"O‘QILGAN",archived:"ARXIV"})[m.status]}</span>${recent ? `<button class="icon-btn" data-open="${m.id}">Ko‘rish</button>` : `<button class="icon-btn" data-status="${m.id}" data-next="${m.status==="new"?"read":m.status==="read"?"archived":"new"}">${m.status==="new"?"O‘qildi":m.status==="read"?"Arxiv":"Qaytarish"}</button><button class="icon-btn" data-delete="${m.id}">✕</button>`}</div>
  </article>`).join("");
  target.querySelectorAll("[data-open]").forEach(b => b.addEventListener("click", async () => { await updateMessage(b.dataset.open,"read"); switchView("messages"); }));
  target.querySelectorAll("[data-status]").forEach(b => b.addEventListener("click", async () => { await updateMessage(b.dataset.status,b.dataset.next); }));
  target.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", async () => {
    if (!confirm("Ushbu xabarni butunlay o‘chirasizmi?")) return;
    try { await api(`/api/admin/messages/${b.dataset.delete}`,{method:"DELETE"}); toast("Xabar o‘chirildi."); await loadMessages(); await loadDashboard(); } catch(e){toast(e.message);}
  }));
}
async function updateMessage(id,status) { try { await api(`/api/admin/messages/${id}`,{method:"PATCH",body:JSON.stringify({status})}); toast("Xabar holati yangilandi."); await loadMessages(); await loadDashboard(); } catch(e){toast(e.message);} }
$("#messageFilter").addEventListener("change", loadMessages);
async function loadMessages() {
  try {
    const status = $("#messageFilter").value;
    const r = await api("/api/admin/messages" + (status ? `?status=${encodeURIComponent(status)}` : ""));
    state.messages = r.messages; renderMessages($("#allMessages"),r.messages);
  } catch(e){toast(e.message);}
}
$("#newProjectBtn").addEventListener("click", () => openProjectForm());
$("#cancelProject").addEventListener("click", () => $("#projectFormWrap").classList.add("hidden"));
function openProjectForm(project=null) {
  const f = $("#projectForm"); f.reset(); f.elements.id.value = project?.id || "";
  f.elements.title.value = project?.title || ""; f.elements.url.value = project?.url || "";
  f.elements.image_url.value = project?.image_url || ""; f.elements.description.value = project?.description || "";
  f.elements.tech_stack.value = (project?.tech_stack || []).join(", "); f.elements.featured.checked = !!project?.featured;
  $("#projectFormTitle").textContent = project ? "Loyihani tahrirlash" : "Yangi loyiha";
  $("#projectFormWrap").classList.remove("hidden"); $("#projectFormWrap").scrollIntoView({behavior:"smooth",block:"start"});
}
$("#projectForm").addEventListener("submit", async e => {
  e.preventDefault(); const f = e.currentTarget;
  const data = {title:f.elements.title.value, url:f.elements.url.value, image_url:f.elements.image_url.value, description:f.elements.description.value, tech_stack:f.elements.tech_stack.value.split(",").map(x=>x.trim()).filter(Boolean), featured:f.elements.featured.checked};
  const id = f.elements.id.value;
  try {
    await api(id ? `/api/admin/projects/${id}` : "/api/admin/projects", {method:id?"PUT":"POST",body:JSON.stringify(data)});
    $("#projectFormWrap").classList.add("hidden"); toast(id ? "Loyiha yangilandi." : "Loyiha qo‘shildi."); await loadProjects(); await loadDashboard();
  } catch(err){toast(err.message);}
});
async function loadProjects() {
  try {
    const r = await api("/api/admin/projects"); state.projects = r.projects;
    if (!r.projects.length) { $("#projectGrid").innerHTML = '<div class="empty glass">Hozircha loyihalar qo‘shilmagan. “Yangi loyiha” tugmasini bosing.</div>'; return; }
    $("#projectGrid").innerHTML = r.projects.map(p => `<article class="project-card glass">
      <div class="project-icon">▧</div><h4>${escapeHtml(p.title)} ${p.featured?'<span class="status">FEATURED</span>':''}</h4>
      <p>${escapeHtml(p.description || "Tavsif kiritilmagan.")}</p><div class="tags">${(p.tech_stack||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      <div class="project-actions"><button class="ghost" data-edit="${p.id}">Tahrirlash</button><button class="icon-btn" data-project-delete="${p.id}">O‘chirish</button></div>
    </article>`).join("");
    $("#projectGrid").querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click",()=>openProjectForm(state.projects.find(p=>String(p.id)===b.dataset.edit))));
    $("#projectGrid").querySelectorAll("[data-project-delete]").forEach(b => b.addEventListener("click",async()=>{
      if(!confirm("Loyihani butunlay o‘chirasizmi?"))return;
      try{await api(`/api/admin/projects/${b.dataset.projectDelete}`,{method:"DELETE"});toast("Loyiha o‘chirildi.");await loadProjects();await loadDashboard();}catch(err){toast(err.message);}
    }));
  } catch(e){toast(e.message);}
}
(async function init(){
  try { const r = await api("/api/admin/me"); showApp(r.admin.username); }
  catch { showLogin(); }
})();
