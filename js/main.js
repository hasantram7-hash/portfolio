/* ---------------- BOOT / TERMINAL INTRO ---------------- */
function runBoot() {
  const boot = document.getElementById("boot");
  const box = boot.querySelector(".boot-box");
  const lines = [
    "$ connecting to hemnarayan.dev ...",
    "$ verifying identity ...",
    "> HEM NARAYAN RAM — self-taught developer",
    "$ status: available for opportunities",
    "$ launching portfolio_"
  ];
  let i = 0;
  function next() {
    if (i >= lines.length) {
      setTimeout(() => boot.classList.add("hidden"), 450);
      return;
    }
    const div = document.createElement("div");
    div.className = "line";
    div.textContent = lines[i];
    box.insertBefore(div, box.querySelector(".cursor-blink"));
    requestAnimationFrame(() => (div.style.opacity = 1));
    i++;
    setTimeout(next, i === lines.length ? 500 : 380);
  }
  next();
}

/* ---------------- ROLE TYPEWRITER ---------------- */
function initRoleTyper(roles) {
  const el = document.getElementById("role-line");
  let ri = 0, ci = 0, deleting = false;
  function tick() {
    const word = roles[ri];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    let delay = deleting ? 40 : 70;
    if (!deleting && ci === word.length + 1) { deleting = true; delay = 1400; }
    if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 300; }
    setTimeout(tick, delay);
  }
  tick();
}

/* ---------------- RENDER CONTENT ---------------- */
function iconFor(key) {
  const icons = {
    gh: "&#xf09b;", li: "in", yt: "&#9654;", tk: "&#9835;", fb: "f"
  };
  return icons[key] || "&#8599;";
}

function normalizeProject(project) {
  const normalized = {
    gallery: [], problem: "", solution: "", techDetails: "", learnings: "",
    ...project
  };
  normalized.gallery = Array.isArray(normalized.gallery) ? normalized.gallery : [];
  return normalized;
}

function formatUpdatedAt(value) {
  if (!value) return "";
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `Last updated: ${date.toLocaleDateString()}`;
}

function render(content) {
  const safeContent = content || DEFAULT_CONTENT;
  const p = safeContent.profile || DEFAULT_CONTENT.profile;
  const about = safeContent.about || DEFAULT_CONTENT.about;
  const stats = Array.isArray(safeContent.stats) ? safeContent.stats : (Array.isArray(about.stats) ? about.stats : DEFAULT_CONTENT.stats);
  const projects = (safeContent.projects || DEFAULT_CONTENT.projects).map(normalizeProject);
  const skills = safeContent.skills || DEFAULT_CONTENT.skills;
  const certificates = safeContent.certificates || DEFAULT_CONTENT.certificates;
  const socials = safeContent.socials || DEFAULT_CONTENT.socials;
  const timeline = safeContent.timeline || DEFAULT_CONTENT.timeline;

  document.documentElement.setAttribute("data-theme", safeContent.theme || "light");
  document.title = `${p.name} — ${p.role}`;
  document.getElementById("hero-name").textContent = p.name;
  document.getElementById("hero-lede").textContent = p.tagline;
  document.getElementById("term-name").textContent = p.name;
  document.getElementById("term-location").textContent = p.location;
  document.getElementById("term-email").textContent = p.email;
  document.getElementById("term-status").textContent = safeContent.status?.text || "available for opportunities";

  const heroPhoto = document.getElementById("hero-photo");
  heroPhoto.src = p.photo || "assets/profile-fallback.svg";
  heroPhoto.onerror = () => {
    heroPhoto.onerror = null;
    heroPhoto.src = "assets/profile-fallback.svg";
  };

  document.getElementById("contact-email").href = "mailto:" + p.email;
  document.getElementById("contact-email").textContent = p.email;
  if (p.resumeUrl) {
    document.getElementById("resume-btn").href = p.resumeUrl;
  } else {
    document.getElementById("resume-btn").style.display = "none";
  }
  initRoleTyper([p.role, "Web Developer", "AI Tinkerer", "Class 11 Student"]);

  // about
  const aboutWrap = document.getElementById("about-text");
  aboutWrap.innerHTML = (about.paragraphs || []).map(t => `<p>${t}</p>`).join("");
  const statRow = document.getElementById("stat-row");
  statRow.innerHTML = (stats || []).map(s => `
    <div class="stat glass"><b>${s.value}</b><span>${s.label}</span></div>
  `).join("");

  // timeline
  document.getElementById("timeline").innerHTML = (timeline || []).map(t => `
    <div class="tl-item">
      <div class="yr mono">${t.year}</div>
      <h4>${t.title}</h4>
      <p>${t.text}</p>
    </div>
  `).join("");

  // skills
  const skillsGrid = document.getElementById("skills-grid");
  skillsGrid.innerHTML = (skills || []).map(s => `
    <div class="skill-card glass reveal">
      <div class="top"><span>${s.name}</span><span>${s.level}%</span></div>
      <div class="bar-track"><div class="bar-fill" data-level="${s.level}"></div></div>
    </div>
  `).join("");

  // projects
  document.getElementById("projects-grid").innerHTML = projects.map((pr, index) => `
    <div class="project-card glass reveal">
      <div class="thumb"><span class="glyph">&#10022;</span></div>
      <div class="body">
        <h3>${pr.title}</h3>
        <p>${pr.description}</p>
        <div class="tag-row">${(pr.tags || []).map(t => `<span class="tag mono">${t}</span>`).join("")}</div>
        <div class="links">
          ${pr.link ? `<a href="${pr.link}" target="_blank" rel="noopener">Live demo →</a>` : ""}
          ${pr.github ? `<a href="${pr.github}" target="_blank" rel="noopener">Source →</a>` : ""}
          ${(pr.gallery || []).length ? `<button class="text-link" data-gallery-project="${index}">View memories</button>` : ""}
          ${[pr.problem, pr.solution, pr.techDetails, pr.learnings].some(Boolean) ? `<button class="text-link" data-case-project="${index}">Read case study →</button>` : ""}
        </div>
      </div>
    </div>
  `).join("");

  // certificates
  document.getElementById("cert-grid").innerHTML = (certificates || []).map(c => `
    <div class="cert-card glass reveal">
      <div class="ic">&#127891;</div>
      <div>
        <h4>${c.title}</h4>
        <span>${c.issuer}</span><br/>
        ${c.url ? `<a href="${c.url}" target="_blank" rel="noopener">Verify certificate →</a>` : ""}
      </div>
    </div>
  `).join("");

  // socials
  document.getElementById("social-grid").innerHTML = (socials || []).map(s => `
    <a class="social-card glass reveal" href="${s.url}" target="_blank" rel="noopener">
      <div class="ic mono">${iconFor(s.icon)}</div>
      <div><b>${s.platform}</b><span>Follow / connect</span></div>
    </a>
  `).join("");

  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("last-updated").textContent = formatUpdatedAt(safeContent.lastUpdated);

  requestAnimationFrame(() => {
    document.querySelectorAll(".bar-fill").forEach(b => {
      setTimeout(() => (b.style.width = b.dataset.level + "%"), 300);
    });
  });

  initReveal();
  initAssistant(content);
  initFeatureInteractions(projects);
}

function initFeatureInteractions(projects) {
  const galleryModal = document.getElementById("gallery-modal");
  const galleryImage = document.getElementById("gallery-image");
  const galleryCaption = document.getElementById("gallery-caption");
  let galleryItems = [], galleryIndex = 0, touchStartX = 0;

  function showPhoto(index) {
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const photo = galleryItems[galleryIndex];
    galleryImage.src = photo.url;
    galleryImage.alt = photo.caption || "Project memory";
    galleryCaption.textContent = photo.caption || "";
  }
  function openGallery(project) {
    galleryItems = project.gallery.filter(photo => photo.url);
    if (!galleryItems.length) return;
    showPhoto(0);
    galleryModal.hidden = false;
    requestAnimationFrame(() => galleryModal.classList.add("open"));
  }
  function closeModal(modal) {
    modal.classList.remove("open");
    setTimeout(() => { modal.hidden = true; }, 220);
  }

  document.querySelectorAll("[data-gallery-project]").forEach(button => {
    button.addEventListener("click", () => openGallery(projects[button.dataset.galleryProject]));
  });
  document.querySelectorAll("[data-case-project]").forEach(button => {
    button.addEventListener("click", () => {
      const project = projects[button.dataset.caseProject];
      document.getElementById("case-title").textContent = project.title;
      document.getElementById("case-problem").textContent = project.problem;
      document.getElementById("case-solution").textContent = project.solution;
      document.getElementById("case-tech").textContent = project.techDetails;
      document.getElementById("case-learnings").textContent = project.learnings;
      const modal = document.getElementById("case-modal");
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("open"));
    });
  });
  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.closest(".feature-modal")));
  });
  document.querySelectorAll(".feature-modal").forEach(modal => modal.addEventListener("click", event => {
    if (event.target === modal) closeModal(modal);
  }));
  document.querySelector(".gallery-prev").addEventListener("click", () => showPhoto(galleryIndex - 1));
  document.querySelector(".gallery-next").addEventListener("click", () => showPhoto(galleryIndex + 1));
  galleryImage.addEventListener("touchstart", event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  galleryImage.addEventListener("touchend", event => {
    const distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) > 45) showPhoto(galleryIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") document.querySelectorAll(".feature-modal.open").forEach(closeModal);
    if (galleryModal.classList.contains("open")) {
      if (event.key === "ArrowLeft") showPhoto(galleryIndex - 1);
      if (event.key === "ArrowRight") showPhoto(galleryIndex + 1);
    }
  });

  initCommandPalette(closeModal);
}

function initCommandPalette(closeModal) {
  const modal = document.getElementById("command-palette");
  const input = document.getElementById("palette-input");
  const list = document.getElementById("palette-list");
  const commands = [
    ["About", "#about"], ["Skills", "#skills"], ["Projects", "#projects"],
    ["Certificates", "#certificates"], ["Socials", "#socials"], ["Contact", "#contact"], ["Activity", "#activity"], ["Admin", "admin/"]
  ];
  let filtered = commands, selected = 0;
  function draw() {
    filtered = commands.filter(([label]) => label.toLowerCase().includes(input.value.toLowerCase()));
    selected = Math.min(selected, Math.max(filtered.length - 1, 0));
    list.innerHTML = filtered.map(([label], index) => `<button class="palette-item${index === selected ? " selected" : ""}" data-command-index="${index}"><span>${label}</span><span class="mono">↵</span></button>`).join("");
    list.querySelectorAll("button").forEach(button => button.addEventListener("click", () => openSelected(Number(button.dataset.commandIndex))));
  }
  function openSelected(index = selected) {
    const command = filtered[index];
    if (!command) return;
    closeModal(modal);
    if (command[1].startsWith("#")) document.querySelector(command[1])?.scrollIntoView({ behavior: "smooth" });
    else window.location.href = command[1];
  }
  function open() {
    modal.hidden = false;
    input.value = "";
    draw();
    requestAnimationFrame(() => { modal.classList.add("open"); input.focus(); });
  }
  input.addEventListener("input", () => { selected = 0; draw(); });
  input.addEventListener("keydown", event => {
    if (event.key === "ArrowDown") { event.preventDefault(); selected = Math.min(selected + 1, filtered.length - 1); draw(); }
    if (event.key === "ArrowUp") { event.preventDefault(); selected = Math.max(selected - 1, 0); draw(); }
    if (event.key === "Enter") { event.preventDefault(); openSelected(); }
  });
  document.addEventListener("keydown", event => {
    const target = event.target;
    const typing = target.matches("input, textarea, select") || target.isContentEditable;
    if (event.key === "/" && !typing) { event.preventDefault(); open(); }
  });
}

async function initVisitorCounter() {
  const count = document.getElementById("visitor-count");
  if (!firebaseReady || !db) {
    if (count) count.hidden = true;
    return;
  }
  try {
    const ref = db.collection("portfolio").doc("stats");
    const visits = await db.runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      const next = (snapshot.exists ? Number(snapshot.data().visits) || 0 : 0) + 1;
      transaction.set(ref, { visits: next }, { merge: true });
      return next;
    });
    count.textContent = `${visits} people have visited`;
    count.hidden = false;
  } catch (error) {
    console.warn("Visitor counter unavailable.", error);
    if (count) count.hidden = true;
  }
}

/* ---------------- SCROLL REVEAL ---------------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

/* ---------------- NAV ---------------- */
function initNav() {
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
}

/* ---------------- AI ASSISTANT (rule-based, local) ---------------- */
function initAssistant(content) {
  const toggle = document.getElementById("ai-toggle");
  const panel = document.getElementById("ai-panel");
  const body = document.getElementById("ai-body");
  const input = document.getElementById("ai-input");
  const send = document.getElementById("ai-send");

  toggle.addEventListener("click", () => panel.classList.toggle("open"));

  function addMsg(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  addMsg(`Hey! I'm ${content.profile.name.split(" ")[0]}'s site assistant. Ask me about his skills, projects, or certificates.`, "bot");

  function answer(q) {
    const s = q.toLowerCase();
    if (/skill/.test(s)) return "Main skills: " + content.skills.map(x => x.name).join(", ") + ".";
    if (/project/.test(s)) return content.projects.map(p => `${p.title} — ${p.description}`).join(" | ");
    if (/certificat/.test(s)) return "Certificates: " + content.certificates.map(c => c.title).join(", ") + ".";
    if (/contact|email|reach/.test(s)) return `You can reach him at ${content.profile.email}.`;
    if (/age|old/.test(s)) return "He's 17, currently in class 11.";
    if (/who|about/.test(s)) return content.about.paragraphs[0];
    if (/hire|available/.test(s)) return "He's a student, but open to small freelance/collab work — reach out via email or LinkedIn.";
    return "I can answer questions about skills, projects, certificates, or how to get in touch — try asking one of those!";
  }

  function handle() {
    const val = input.value.trim();
    if (!val) return;
    addMsg(val, "user");
    input.value = "";
    setTimeout(() => addMsg(answer(val), "bot"), 350);
  }
  send.addEventListener("click", handle);
  input.addEventListener("keydown", e => { if (e.key === "Enter") handle(); });
}

/* ---------------- BOOTSTRAP (main site only) ---------------- */
window.addEventListener("DOMContentLoaded", async () => {
  if (!document.getElementById("boot")) return; // not the main page (e.g. admin)
  runBoot();
  initNetwork();
  initCursor();
  initNav();
  const content = await window.getContent();
  render(content);
  initVisitorCounter();
});
