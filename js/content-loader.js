/* Tries Firestore documents in a few common layouts. Falls back to
   DEFAULT_CONTENT when Firebase isn't configured or a field is missing. */

function deepMerge(base, override) {
  if (!override) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key in override) {
    if (
      override[key] && typeof override[key] === "object" &&
      !Array.isArray(override[key]) && base[key] && typeof base[key] === "object"
    ) {
      out[key] = deepMerge(base[key], override[key]);
    } else if (override[key] !== undefined) {
      out[key] = override[key];
    }
  }
  return out;
}

function normalizePortfolioData(data) {
  if (!data || typeof data !== "object") return DEFAULT_CONTENT;

  const profile = data.profile || {
    name: data.name || DEFAULT_CONTENT.profile.name,
    role: data.role || DEFAULT_CONTENT.profile.role,
    location: data.location || DEFAULT_CONTENT.profile.location,
    tagline: data.tagline || DEFAULT_CONTENT.profile.tagline,
    photo: data.photo || DEFAULT_CONTENT.profile.photo,
    email: data.email || DEFAULT_CONTENT.profile.email,
    resumeUrl: data.resumeUrl || DEFAULT_CONTENT.profile.resumeUrl
  };

  const about = data.about || {
    paragraphs: Array.isArray(data.aboutParagraphs) ? data.aboutParagraphs : DEFAULT_CONTENT.about.paragraphs,
    stats: Array.isArray(data.aboutStats) ? data.aboutStats : DEFAULT_CONTENT.about.stats
  };

  const status = data.status || {
    text: data.current_focus || DEFAULT_CONTENT.status.text
  };

  return deepMerge(DEFAULT_CONTENT, {
    ...data,
    profile,
    about,
    status,
    skills: Array.isArray(data.skills) ? data.skills : DEFAULT_CONTENT.skills,
    projects: Array.isArray(data.projects) ? data.projects : DEFAULT_CONTENT.projects,
    certificates: Array.isArray(data.certificates) ? data.certificates : DEFAULT_CONTENT.certificates,
    socials: Array.isArray(data.socials) ? data.socials : DEFAULT_CONTENT.socials,
    timeline: Array.isArray(data.timeline) ? data.timeline : DEFAULT_CONTENT.timeline
  });
}

window.getContent = async function () {
  if (!firebaseReady) return DEFAULT_CONTENT;

  try {
    const candidateDocs = ["content", "site", "hero", "about", "profile", "portfolio"];
    let merged = { ...DEFAULT_CONTENT };

    for (const docId of candidateDocs) {
      const doc = await db.collection("portfolio").doc(docId).get();
      if (!doc.exists) continue;
      merged = normalizePortfolioData(deepMerge(merged, doc.data()));
    }

    return merged;
  } catch (e) {
    console.warn("Could not load live content, using defaults.", e);
    return DEFAULT_CONTENT;
  }
};
