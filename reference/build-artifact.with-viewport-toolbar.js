// Builds the "Shipment Tracker Preview" artifact from the REAL renderer
// source — not a hand-maintained parallel mockup. renderer/index.html is
// copied byte-for-byte (never modified on disk); the only thing added is a
// shim <script>, inserted before the app's own <script>, that provides
// window.shipAPI backed by artifact/fixture.json (anonymized real data, see
// build-demo-fixture.js) plus a demo banner. Because the UI markup and every
// render()/bind() function is the literal real file, this can't drift from
// the real app the way a hand-typed mockup does — the only gap that can
// exist is an IPC call the shim doesn't know how to answer, and those fail
// LOUDLY (a toast + console.error), never silently.
//
// Usage: node scripts/build-demo-fixture.js && node scripts/build-artifact.js
// Output: artifact/shipment-tracker-preview.generated.html — hand this file
// straight to the Artifact tool's publish action. See docs/ARTIFACT_SYNC.md.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RENDERER_PATH = path.join(ROOT, "renderer", "index.html");
const FIXTURE_PATH = path.join(ROOT, "artifact", "fixture.json");
const OUT_PATH = path.join(ROOT, "artifact", "shipment-tracker-preview.generated.html");

const version = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;
const renderer = fs.readFileSync(RENDERER_PATH, "utf8");
const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8"));

// README/artifact-tool constraint: the published file may carry no
// <!doctype>/<html>/<head>/<body> tags of its own. renderer/index.html
// already has none (Electron loads it as a body-fragment-shaped page), so
// no stripping is needed here — that's a happy structural match, not a
// coincidence to rely on blindly. Fail loudly if that ever stops being true.
if (/<!doctype|<html|<body/i.test(renderer)) {
  throw new Error(
    "renderer/index.html now contains <!doctype>/<html>/<body> — this script's " +
    "structural assumption (the real file is already a bare fragment, safe to hand " +
    "straight to the Artifact tool) no longer holds. Fix this script before publishing."
  );
}

const scriptOpenIdx = renderer.indexOf("<script>");
if (scriptOpenIdx === -1) throw new Error("Could not find the app's <script> tag in renderer/index.html.");

const shell = renderer.slice(0, scriptOpenIdx);
const appScript = renderer.slice(scriptOpenIdx);

const bannerHtml =
  `<div style="background:#7B4FE022;color:#7B4FE0;font:700 0.72rem 'Karla',sans-serif;` +
  `text-align:center;padding:6px;letter-spacing:0.04em;text-transform:uppercase;">` +
  `⚠ Preview build — generated from the real renderer source + anonymized real data, ` +
  `synced to v${version}. Not connected to real files, Outlook, or Stamps.` +
  `</div>`;
const shellWithBanner = shell.replace('<div class="app">', `<div class="app">\n  ${bannerHtml}`);
if (shellWithBanner === shell) {
  throw new Error('Could not find <div class="app"> to insert the demo banner after — renderer shell markup changed, update this script.');
}

const shim = `<script>
/* ====== demo shim, injected by scripts/build-artifact.js — NOT part of the real app ======
   Backs window.shipAPI with the anonymized fixture below instead of real IPC/disk access.
   Every real render()/bind() function below this point is untouched, verbatim app code. */
window.__DEMO__ = true;
const __FIXTURE__ = ${JSON.stringify(fixture)};
function __clone(x){ return x === undefined ? x : JSON.parse(JSON.stringify(x)); }

const __state = {
  settings: __clone(__FIXTURE__.settings),
  folders: __clone(__FIXTURE__.folders),
  folderMeta: __clone(__FIXTURE__.folderMeta),
  records: __clone(__FIXTURE__.records),
  log: __clone(__FIXTURE__.log),
  audit: __clone(__FIXTURE__.audit),
  batches: __clone(__FIXTURE__.batches),
  sourceFiles: __clone(__FIXTURE__.sourceFiles),
  stampsContacts: __clone(__FIXTURE__.stampsContacts),
};

function __demoNotice(name, unhandled){
  const el = document.createElement("div");
  el.textContent = unhandled ? \`Demo preview — "\${name}" isn't wired to fixture data yet (logged, not silent)\` : \`Demo preview — \${name} (simulated, not written to disk)\`;
  el.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1E1B16;color:#F7F5F1;padding:10px 18px;border-radius:9px;font:600 0.82rem 'Karla',sans-serif;z-index:9999;box-shadow:0 8px 24px -8px rgba(0,0,0,0.5);max-width:70vw;text-align:center;";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
  if (unhandled) console.error("[artifact demo] unhandled shipAPI." + name + " — extend the shim in scripts/build-artifact.js if this preview needs it");
  else console.info("[artifact demo] shipAPI." + name);
}

const __READ = {
  loadSettings: () => __state.settings,
  listCalendarEvents: () => __FIXTURE__.events,
  listEventFolders: () => __state.folders,
  loadFolderMeta: (folderPath) => __state.folderMeta[folderPath] || {},
  loadRecords: (folderPath) => __state.records[folderPath] || [],
  loadLog: (folderPath) => __state.log[folderPath] || [],
  loadAudit: (folderPath) => __state.audit[folderPath] || [],
  loadBatches: (folderPath) => __state.batches[folderPath] || [],
  listSourceFiles: (folderPath) => __state.sourceFiles[folderPath] || [],
  loadStampsContacts: (folderPath) => __state.stampsContacts[folderPath] || [],
  loadStampsHistory: () => __FIXTURE__.stampsHistory,
  stampsHistoryDateGroups: () => [],
  checkContactsCoverage: () => ({ eventsChecked: 0, issues: [] }),
  getAppVersion: () => "${version}-dev.1",
};
const __WRITE = {
  saveRecords: (folderPath, data) => { __state.records[folderPath] = data; },
  saveBatches: (folderPath, data) => { __state.batches[folderPath] = data; },
  saveFolderMeta: (folderPath, data) => { __state.folderMeta[folderPath] = data; },
  setLastFolder: (name) => { __state.settings.lastOpenedFolder = name; },
  appendAudit: (folderPath, entry) => { (__state.audit[folderPath] ||= []).push(entry); },
  appendLog: (folderPath, entries) => { (__state.log[folderPath] ||= []).push(...[].concat(entries)); },
};

window.shipAPI = new Proxy({}, {
  get(_, name){
    return (...args) => {
      try {
        if (Object.hasOwn(__READ, name)) { const v = __READ[name](...args); return Promise.resolve(__clone(v)); }
        if (Object.hasOwn(__WRITE, name)) { __WRITE[name](...args); __demoNotice(String(name)); return Promise.resolve({ ok: true }); }
      } catch (e) {
        console.error("[artifact demo] shipAPI." + String(name) + " threw", e);
      }
      // Anything not modeled above (import/export/pick a file, send email,
      // Stamps history matching, etc.) — never crashes the preview, and
      // never pretends to have worked either.
      __demoNotice(String(name), true);
      return Promise.resolve(/^(list|load)/.test(String(name)) ? [] : null);
    };
  }
});

// The real app relies on native alert/confirm/prompt for a handful of
// flows (see renderer/index.html's own createFolderPrompt/loadContactsFile/
// etc.). Artifact previews may sandbox these; fall back to sensible demo
// defaults instead of hanging if they're unavailable.
(function(){
  const realAlert = window.alert, realConfirm = window.confirm, realPrompt = window.prompt;
  window.alert = (msg) => { try { return realAlert(msg); } catch { __demoNotice("alert: " + msg); } };
  window.confirm = (msg) => { try { return realConfirm(msg); } catch { __demoNotice("confirm (defaulted yes): " + msg); return true; } };
  window.prompt = (msg, def) => { try { return realPrompt(msg, def); } catch { __demoNotice("prompt (cancelled): " + msg); return null; } };
})();
</script>
`;

const appHtml = shellWithBanner + shim + appScript;

// Viewport-preview toolbar — testing aid only, exists ONLY in this build
// script, never touches renderer/index.html or the real exe. The real app
// renders inside an <iframe>, loaded via doc.write() so it's a genuinely
// separate browsing context with its own layout viewport — setting the
// iframe's pixel width/height is real viewport emulation (same principle
// devtools' own device toolbar uses), not a CSS transform/zoom trick that
// would misreport sizes to media queries. Added per direct request: no way
// to reach an exact tablet-landscape size through ordinary browser resize.
const VIEWPORTS = [
  { label: "Desktop", w: 0, h: 0 },
  { label: "Tablet Portrait (768×1024)", w: 768, h: 1024 },
  { label: "Tablet Landscape (1024×768)", w: 1024, h: 768 },
  { label: "Tablet Portrait Large (820×1180)", w: 820, h: 1180 },
  { label: "Phone (390×844)", w: 390, h: 844 },
  { label: "Phone Large (412×915)", w: 412, h: 915 },
];
const toolbarButtons = VIEWPORTS.map((v, i) =>
  `<button data-w="${v.w}" data-h="${v.h}" style="background:${i === 0 ? "#5FC2CC" : "transparent"};color:${i === 0 ? "#0B1E1F" : "#F3EEE4"};border:1px solid #4A4234;border-radius:7px;padding:5px 11px;font-size:0.74rem;font-weight:700;cursor:pointer;white-space:nowrap;">${v.label}</button>`
).join("");

const output = `<div style="display:flex;flex-direction:column;height:100vh;font-family:'Karla',sans-serif;">
  <div id="__viewport_toolbar" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:8px 12px;background:#141311;border-bottom:1px solid #39332a;flex:none;">
    <span style="color:#B0A692;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">Preview at:</span>
    ${toolbarButtons}
    <span id="__viewport_label" style="color:#7C7362;font-size:0.72rem;margin-left:auto;"></span>
  </div>
  <div id="__viewport_stage" style="flex:1;min-height:0;display:flex;align-items:flex-start;justify-content:center;overflow:auto;background:#0c0b09;padding:16px;">
    <iframe id="__app_frame" title="Citytri Shipment Tracker preview" style="border:1px solid #39332a;width:100%;height:100%;background:#17140F;flex:none;"></iframe>
  </div>
</div>
<script>
(function(){
  const frame = document.getElementById('__app_frame');
  const label = document.getElementById('__viewport_label');
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open(); doc.write(${JSON.stringify(appHtml).replace(/<\/script/gi, "<\\/script")}); doc.close();
  document.querySelectorAll('#__viewport_toolbar button').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('#__viewport_toolbar button').forEach(b => { b.style.background = 'transparent'; b.style.color = '#F3EEE4'; });
      btn.style.background = '#5FC2CC'; btn.style.color = '#0B1E1F';
      const w = +btn.dataset.w, h = +btn.dataset.h;
      if (w && h) {
        frame.style.width = w + 'px';
        frame.style.height = h + 'px';
        label.textContent = w + ' \\u00d7 ' + h + ' px';
      } else {
        frame.style.width = '100%';
        frame.style.height = '100%';
        label.textContent = '';
      }
    };
  });
})();
</script>`;

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, output);
console.log(`Wrote ${OUT_PATH} (${(output.length / 1024).toFixed(0)} KB) from the real renderer/index.html + anonymized fixture, with a ${VIEWPORTS.length}-preset viewport toolbar.`);
