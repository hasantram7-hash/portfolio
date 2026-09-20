/* Tries Firestore documents in a few common layouts. Falls back to
   DEFAULT_CONTENT when Firebase isn't configured or a field is missing. */

function deepMerge(base, override) {
  if (!override || typeof override !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const key in override) {
    const value = override[key];
    if (value === "" || value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (
      value && typeof value === "object" &&
      !Array.isArray(value) && base[key] && typeof base[key] === "object" && !Array.isArray(base[key])
    ) {
      out[key] = deepMerge(base[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function hasValue(value) {
  return value !== undefined && value !== null && (!Array.isArray(value) || value.length > 0) && (typeof value !== "string" || value.trim() !== "");
}

function firstValue(...values) {
  return values.find(hasValue);
}

function mergeArrayDefaults(defaultItems, value) {
  if (!Array.isArray(value) || value.length === 0) return defaultItems;
  return value.map((item, index) => {
    const defaultItem = defaultItems[index] || {};
    return item && typeof item === "object" ? deepMerge(defaultItem, item) : item;
  });
}

function normalizePortfolioData(data) {
  if (!data || typeof data !== "object") return DEFAULT_CONTENT;

  const rawProfile = data.profile && typeof data.profile === "object" ? data.profile : {};
  const profile = {
    name: firstValue(rawProfile.name, data.name, DEFAULT_CONTENT.profile.name),
    role: firstValue(rawProfile.role, data.role, DEFAULT_CONTENT.profile.role),
    location: firstValue(rawProfile.location, data.location, DEFAULT_CONTENT.profile.location),
    tagline: firstValue(rawProfile.tagline, data.tagline, DEFAULT_CONTENT.profile.tagline),
    photo: firstValue(rawProfile.photo, data.photo, DEFAULT_CONTENT.profile.photo),
    email: firstValue(rawProfile.email, data.email, DEFAULT_CONTENT.profile.email),
    resumeUrl: firstValue(rawProfile.resumeUrl, data.resumeUrl, DEFAULT_CONTENT.profile.resumeUrl)
  };

  const aboutParagraphs = Array.isArray(data.about?.paragraphs)
    && data.about.paragraphs.length > 0
      ? data.about.paragraphs
    : Array.isArray(data.paragraphs)
      && data.paragraphs.length > 0
        ? data.paragraphs
      : DEFAULT_CONTENT.about.paragraphs;

  const stats = Array.isArray(data.stats)
    && data.stats.length > 0
      ? data.stats
    : Array.isArray(data.about?.stats)
      && data.about.stats.length > 0
        ? data.about.stats
      : DEFAULT_CONTENT.stats;

  const about = {
    paragraphs: aboutParagraphs
  };

  const rawStatus = data.status && typeof data.status === "object" ? data.status : {};
  const status = {
    ...DEFAULT_CONTENT.status,
    ...rawStatus,
    text: firstValue(rawStatus.text, data.current_focus, typeof data.status === "string" ? data.status : "", DEFAULT_CONTENT.status.text)
  };

  return deepMerge(DEFAULT_CONTENT, {
    ...data,
    profile,
    about,
    stats,
    status,
    skills: mergeArrayDefaults(DEFAULT_CONTENT.skills, data.skills),
    projects: mergeArrayDefaults(DEFAULT_CONTENT.projects, data.projects),
    certificates: mergeArrayDefaults(DEFAULT_CONTENT.certificates, data.certificates),
    socials: mergeArrayDefaults(DEFAULT_CONTENT.socials, data.socials),
    timeline: mergeArrayDefaults(DEFAULT_CONTENT.timeline, data.timeline)
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

    return normalizePortfolioData(merged);
  } catch (e) {
    console.warn("Could not load live content, using defaults.", e);
    return DEFAULT_CONTENT;
  }
};
