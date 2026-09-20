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

  const aboutParagraphs = Array.isArray(data.about?.paragraphs)
    ? data.about.paragraphs
    : Array.isArray(data.paragraphs)
      ? data.paragraphs
      : DEFAULT_CONTENT.about.paragraphs;

  const stats = Array.isArray(data.stats)
    ? data.stats
    : Array.isArray(data.about?.stats)
      ? data.about.stats
      : DEFAULT_CONTENT.stats;

  const about = {
    paragraphs: aboutParagraphs
  };

  const status = data.status && typeof data.status === "object"
    ? { ...DEFAULT_CONTENT.status, ...data.status }
    : { text: data.current_focus || data.status || DEFAULT_CONTENT.status.text };

  return deepMerge(DEFAULT_CONTENT, {
    ...data,
    profile,
    about,
    stats,
    status,
    skills: Array.isArray(data.skills) ? data.skills : DEFAULT_CONTENT.skills,
    projects: Array.isArray(data.projects) ? data.projects : DEFAULT_CONTENT.projects,
    certificates: Array.isArray(data.certificates) ? data.certificates : DEFAULT_CONTENT.certificates,
    socials: Array.isArray(data.socials) ? data.socials : DEFAULT_CONTENT.socials,
    timeline: Array.isArray(data.timeline) ? data.timeline : DEFAULT_CONTENT.timeline
  });
}

window.getContent = async function () {
  if (!firebaseReady || !db) return DEFAULT_CONTENT;

  try {
    const candidateDocs = ["content", "site", "hero", "about", "profile", "portfolio"];
    let merged = { ...DEFAULT_CONTENT };

    for (const docId of candidateDocs) {
      try {
        const doc = await db.collection("portfolio").doc(docId).get();
        if (!doc.exists) continue;
        merged = normalizePortfolioData(deepMerge(merged, doc.data()));
      } catch (err) {
        console.warn(`Skipped Firestore document ${docId}:`, err);
      }
    }

    return merged;
  } catch (e) {
    console.warn("Could not load live content, using defaults.", e);
    return DEFAULT_CONTENT;
  }
};
