let CURRENT = JSON.parse(JSON.stringify(DEFAULT_CONTENT));

if (typeof firebase !== "undefined" && firebase.apps.length === 0 && typeof firebaseConfig !== "undefined") {
  firebase.initializeApp(firebaseConfig);
}

const appDb = firebase && firebase.firestore ? firebase.firestore() : null;
const appAuth = firebase && firebase.auth ? firebase.auth() : null;

if (appDb && appAuth) {
  window.db = appDb;
  window.auth = appAuth;
}

/* ---------- auth guard ---------- */
if (!firebaseReady || !appDb || !appAuth) {
  alert("Firebase isn't configured yet. Fill in js/firebase-config.js, then reload.");
} else {
  appAuth.onAuthStateChanged((user) => {
    if (!user) window.location.href = "index.html";
  });
}

document.getElementById("logout").addEventListener("click", async () => {
  if (appAuth) await appAuth.signOut();
  window.location.href = "index.html";
});

initNetwork();

function applyTheme(theme) {
  const selected = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", selected);
  document.querySelectorAll("[data-theme-btn]").forEach(button => {
    button.classList.toggle("active", button.dataset.themeBtn === selected);
  });
}

document.querySelectorAll("[data-theme-btn]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-theme-btn]").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    document.documentElement.setAttribute("data-theme", button.dataset.themeBtn);
  });
});
applyTheme("light");

/* ---------- generic repeatable row builder ---------- */
function buildRow(containerId, fields, values, removeCb) {
  const item = document.createElement("div");
  item.className = "repeat-item";
  item.innerHTML = `
    <button class="rm" onclick="this.parentElement.remove()">remove ✕</button>
    ${fields.map(f => `
      <div class="field">
        <label>${f.label}</label>
        ${f.type === "textarea"
          ? `<textarea rows="2" data-key="${f.key}">${values[f.key] || ""}</textarea>`
          : `<input data-key="${f.key}" value="${(values[f.key] || "").toString().replace(/"/g, "&quot;")}">`}
      </div>
    `).join("")}
  `;
  document.getElementById(containerId).appendChild(item);
  return item;
}

function readRows(containerId, keys) {
  const items = document.querySelectorAll(`#${containerId} .repeat-item`);
  return Array.from(items).map(item => {
    const obj = {};
    keys.forEach(k => {
      const el = item.querySelector(`[data-key="${k}"]`);
      obj[k] = el ? el.value : "";
    });
    return obj;
  });
}

/* ---------- section-specific add functions ---------- */
function addStat(v = { value: "", label: "" }) {
  buildRow("stats-list", [{ key: "value", label: "Value (e.g. 17)" }, { key: "label", label: "Label (e.g. years old)" }], v);
}
function addTimeline(v = { year: "", title: "", text: "" }) {
  buildRow("timeline-list", [
    { key: "year", label: "Year / period" },
    { key: "title", label: "Title" },
    { key: "text", label: "Description", type: "textarea" }
  ], v);
}
function addSkill(v = { name: "", level: 70 }) {
  buildRow("skills-list", [{ key: "name", label: "Skill name" }, { key: "level", label: "Level (0-100)" }], v);
}
function addGalleryPhoto(containerId, v = { url: "", caption: "" }) {
  buildRow(containerId, [
    { key: "url", label: "Photo URL" },
    { key: "caption", label: "Caption" }
  ], v);
}
function addProject(v = { title: "", description: "", tags: "", link: "", github: "", gallery: [], problem: "", solution: "", techDetails: "", learnings: "" }) {
  const item = buildRow("projects-list", [
    { key: "title", label: "Title" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "tags", label: "Tags (comma-separated)" },
    { key: "link", label: "Live demo URL" },
    { key: "github", label: "GitHub URL (optional)" },
    { key: "problem", label: "Problem (optional)", type: "textarea" },
    { key: "solution", label: "Solution (optional)", type: "textarea" },
    { key: "techDetails", label: "Tech details (optional)", type: "textarea" },
    { key: "learnings", label: "What I learned (optional)", type: "textarea" }
  ], { ...v, tags: Array.isArray(v.tags) ? v.tags.join(", ") : v.tags });
  const galleryId = `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const gallery = document.createElement("div");
  gallery.className = "project-gallery-editor";
  gallery.innerHTML = `<label>Gallery photos</label><div id="${galleryId}"></div><button type="button" class="add-btn">+ Add photo</button>`;
  item.appendChild(gallery);
  (v.gallery || []).forEach(photo => addGalleryPhoto(galleryId, photo));
  gallery.querySelector(".add-btn").addEventListener("click", () => addGalleryPhoto(galleryId));
}
function addCert(v = { title: "", issuer: "", url: "" }) {
  buildRow("certs-list", [
    { key: "title", label: "Certificate title" },
    { key: "issuer", label: "Issuer" },
    { key: "url", label: "Verify URL (optional)" }
  ], v);
}
function addSocial(v = { platform: "", url: "", icon: "" }) {
  buildRow("socials-list", [
    { key: "platform", label: "Platform name" },
    { key: "url", label: "URL" },
    { key: "icon", label: "Icon code (gh / li / yt / tk / fb)" }
  ], v);
}

/* ---------- populate form from content ---------- */
function populate(content) {
  CURRENT = content;
  const safeProfile = content.profile || DEFAULT_CONTENT.profile;
  const safeAbout = content.about || DEFAULT_CONTENT.about;
  const safeStats = Array.isArray(content.stats) ? content.stats : (Array.isArray(content.about?.stats) ? content.about.stats : DEFAULT_CONTENT.stats);
  const safeTimeline = Array.isArray(content.timeline) ? content.timeline : DEFAULT_CONTENT.timeline;
  const safeSkills = Array.isArray(content.skills) ? content.skills : DEFAULT_CONTENT.skills;
  const safeProjects = Array.isArray(content.projects) ? content.projects : DEFAULT_CONTENT.projects;
  const safeCertificates = Array.isArray(content.certificates) ? content.certificates : DEFAULT_CONTENT.certificates;
  const safeSocials = Array.isArray(content.socials) ? content.socials : DEFAULT_CONTENT.socials;

  document.getElementById("stats-list").innerHTML = "";
  document.getElementById("timeline-list").innerHTML = "";
  document.getElementById("skills-list").innerHTML = "";
  document.getElementById("projects-list").innerHTML = "";
  document.getElementById("certs-list").innerHTML = "";
  document.getElementById("socials-list").innerHTML = "";

  const selectedTheme = content.theme || "light";
  applyTheme(selectedTheme);
  document.querySelectorAll("[data-theme-btn]").forEach(button => {
    button.classList.toggle("active", button.dataset.themeBtn === selectedTheme);
  });

  document.getElementById("p-name").value = safeProfile.name || "";
  document.getElementById("p-role").value = safeProfile.role || "";
  document.getElementById("p-location").value = safeProfile.location || "";
  document.getElementById("p-email").value = safeProfile.email || "";
  document.getElementById("p-photo").value = safeProfile.photo || "";
  document.getElementById("p-resume").value = safeProfile.resumeUrl || "";
  document.getElementById("p-tagline").value = safeProfile.tagline || "";
  document.getElementById("p-status").value = content.status?.text || "";
  document.getElementById("a-paragraphs").value = (safeAbout.paragraphs || []).join("\n");

  safeStats.forEach(s => addStat(s));
  safeTimeline.forEach(t => addTimeline(t));
  safeSkills.forEach(s => addSkill(s));
  safeProjects.forEach(p => addProject(p));
  safeCertificates.forEach(c => addCert(c));
  safeSocials.forEach(s => addSocial(s));
}

function readProjects() {
  return Array.from(document.querySelectorAll("#projects-list > .repeat-item")).map(item => {
    const project = {};
    ["title", "description", "tags", "link", "github", "problem", "solution", "techDetails", "learnings"].forEach(key => {
      project[key] = item.querySelector(`[data-key="${key}"]`)?.value || "";
    });
    project.tags = project.tags.split(",").map(tag => tag.trim()).filter(Boolean);
    const galleryList = item.querySelector(".project-gallery-editor > div");
    project.gallery = galleryList ? readRows(galleryList.id, ["url", "caption"]) : [];
    return project;
  });
}

/* ---------- gather + save ---------- */
async function saveAll() {
  const status = document.getElementById("save-status");
  status.textContent = "Saving...";
  const data = {
    theme: document.querySelector("[data-theme-btn].active")?.dataset.themeBtn || "light",
    profile: {
      name: document.getElementById("p-name").value,
      role: document.getElementById("p-role").value,
      location: document.getElementById("p-location").value,
      email: document.getElementById("p-email").value,
      photo: document.getElementById("p-photo").value,
      resumeUrl: document.getElementById("p-resume").value,
      tagline: document.getElementById("p-tagline").value
    },
    about: {
      paragraphs: document.getElementById("a-paragraphs").value.split("\n").filter(Boolean)
    },
    stats: readRows("stats-list", ["value", "label"]),
    timeline: readRows("timeline-list", ["year", "title", "text"]),
    skills: readRows("skills-list", ["name", "level"]).map(s => ({ ...s, level: Number(s.level) || 0 })),
    projects: readProjects(),
    certificates: readRows("certs-list", ["title", "issuer", "url"]),
    socials: readRows("socials-list", ["platform", "url", "icon"]),
    status: {
      text: document.getElementById("p-status")?.value || "",
      updatedAt: new Date().toISOString()
    },
    lastUpdated: new Date().toISOString()
  };

  try {
    if (!firebaseReady || !appDb) throw new Error("Firebase not configured");
    await appDb.collection("portfolio").doc("content").set(data, { merge: true });
    await appDb.collection("portfolio").doc("site").set(data, { merge: true });
    status.textContent = "Saved ✓ — live on the site now.";
  } catch (e) {
    console.error(e);
    status.textContent = "Save failed — check Firebase config / rules.";
  }
  setTimeout(() => (status.textContent = ""), 4000);
}

/* ---------- init ---------- */
(async function init() {
  if (firebaseReady && appDb) {
    try {
      const contentDoc = await appDb.collection("portfolio").doc("content").get();
      const legacyDoc = contentDoc.exists ? null : await appDb.collection("portfolio").doc("site").get();
      const snapshot = contentDoc.exists ? contentDoc : legacyDoc;
      populate(snapshot && snapshot.exists ? { ...DEFAULT_CONTENT, ...snapshot.data() } : DEFAULT_CONTENT);
      return;
    } catch (e) { console.warn(e); }
  }
  populate(DEFAULT_CONTENT);
})();
