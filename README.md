# Hem Narayan Ram — Portfolio

Dark, glassmorphism, cybersecurity-themed portfolio with a live admin panel.
Everything (skills, projects, certificates, socials, about text) is editable
from `/admin` without touching code — no redeploy needed, since content lives
in Firebase and loads live.

## 1. Firebase setup (do this first)

You already have a Firebase project (`portfolio-website-de351`) and a
service-account key — **that key is for servers only, never put it in this
frontend code.** For this site you need the separate **Web app config**:

1. Go to the [Firebase Console](https://console.firebase.google.com/) → your project.
2. Project Settings (gear icon) → General → scroll to "Your apps".
3. If there's no Web app yet, click **Add app → Web (</>)**, give it any nickname.
4. Copy the `firebaseConfig` object it shows you.
5. Paste those values into `js/firebase-config.js`, replacing the `PASTE_..._HERE` placeholders.

### Enable the two Firebase products this site uses
- **Firestore Database** → Create database → start in production mode.
- **Authentication** → Sign-in method → enable **Email/Password**.
- Authentication → Users → **Add user** → create yourself an admin login
  (this is the only account allowed to log in to `/admin`).

### Firestore security rules
The deployable rules are stored in `firestore.rules`. Go to Firestore → Rules
in the Firebase project configured in `js/firebase-config.js` and paste/publish
the contents of that file. These rules let anyone *read* your portfolio content
(so the public site works), allow the public visitor counter to increment only
the `visits` field, and allow only a signed-in user (you) to write portfolio data:

```
See `firestore.rules` for the complete ruleset.
```

## 2. Run it locally

No build step — it's plain HTML/CSS/JS. Just open `index.html` in a browser,
or serve it so paths behave correctly:

```bash
cd portfolio
python3 -m http.server 5500
```

Then visit `http://localhost:5500`.

## 3. Using the admin panel

- Visit `/admin` (or click "Admin" in the footer).
- Log in with the account you created in Firebase Authentication.
- Edit anything — profile, about text, timeline, skills, projects,
  certificates, social links.
- Click **Save all changes**. The public site picks it up on next page load —
  no redeploy needed, since it reads straight from Firestore.
- Until you fill in `firebase-config.js`, the site just shows the default
  content baked into `js/content-data.js` — which is already filled with your
  real info, so the site works out of the box even before Firebase is wired up.

## 4. Deploy (Vercel)

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com) → New Project → import the repo.
3. Framework preset: **Other** (it's static — no build command needed).
4. Deploy. Done — `/admin` works the same way on the live URL.

## 5. Adding your photo, resume, more projects/certs

- Replace `assets/profile.jpg` with your own photo (same filename), or paste
  a hosted image URL into the **Photo URL** field in the admin panel.
- For a downloadable resume, upload the PDF somewhere (e.g. Firebase Storage,
  Google Drive with a public link) and paste that URL into **Resume URL** in
  the admin panel.
- Add more projects/certificates anytime from `/admin` — no code changes needed.

## File map

```
index.html              → the public site
css/style.css            → all styling
js/content-data.js       → default/fallback content (safe to hand-edit too)
js/firebase-config.js    → your Firebase Web config (fill this in)
js/content-loader.js     → loads live content from Firestore, falls back to defaults
js/bg.js                 → background network canvas + custom cursor
js/main.js               → boot sequence, rendering, animations, AI assistant
admin/index.html          → admin login
admin/dashboard.html      → admin content editor
admin/admin.js            → admin logic (reads/writes Firestore)
assets/profile.jpg        → your photo
```

## Note on the AI assistant widget

The chat bubble on the site is a lightweight, rule-based assistant that
answers from your own content (skills/projects/certs/contact) — it runs
fully in the browser, no API key needed. If you later want it backed by a
real AI model, that would call an API from a small backend (not exposed in
frontend code) — happy to wire that up when you're ready.
