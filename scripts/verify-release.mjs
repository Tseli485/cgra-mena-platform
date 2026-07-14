import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = (path) => fs.readFileSync(path, 'utf8');
const html = read('pwa/index.html');
const sw = read('pwa/sw.js');
const version = JSON.parse(read('pwa/version.json'));
const vercel = JSON.parse(read('vercel.json'));

const checks = [];
function check(name, fn) {
  fn();
  checks.push(name);
}

check('JavaScript intégré valide', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1]).filter((code) => code.trim());
  assert.equal(scripts.length, 1);
  scripts.forEach((code, index) => new vm.Script(code, { filename: `index.html#${index + 1}` }));
});

check('Version cohérente', () => {
  assert.match(html, new RegExp(`const APP_VERSION='${version.version.replaceAll('.', '\\.')}'`));
  assert.equal(version.version, '1.11.1');
  assert.match(sw, /const CACHE = 'mena-v38'/);
});

check('Assets hors ligne complets', () => {
  assert.match(sw, /\.\/js\/cloud-content\.js/);
  assert.match(html, /<script src="js\/cloud-content\.js"><\/script>/);
});

check('Installation indépendante multi-appareils', () => {
  const manifest = JSON.parse(read('pwa/manifest.json'));
  assert.equal(manifest.display, 'standalone');
  assert.match(html, /beforeinstallprompt/);
  assert.match(html, /appinstalled/);
  assert.match(html, /function installApp\b/);
  assert.match(html, /Chaque tuteur installe une copie indépendante/);
});

check('Documents Pro complets', () => {
  for (const fn of ['renderDocumentsPro', 'prepareProDocument', 'saveProDocument', 'printProDocument', 'emailProDocument']) {
    assert.match(html, new RegExp(`function ${fn}\\b`));
  }
  assert.match(html, /rapport_initial/);
  assert.match(html, /rapport_final/);
  assert.match(html, /Historique chiffré du dossier/);
  assert.match(read('pwa/mode-emploi.html'), /Documents Pro et Automatisations/);
  assert.match(read('pwa/handleiding.html'), /Professionele documenten en automatiseringen/);
});

check('Automatisations locales', () => {
  for (const rule of ['rdv_7j', 'rapport_retard', 'transition_165', 'majorite', 'document_expire', 'backup']) {
    assert.match(html, new RegExp(rule));
  }
  assert.match(html, /function runAutomations\b/);
  assert.match(html, /function completeAutoTask\b/);
});

check('Contrat de confidentialité', () => {
  const cloud = read('pwa/js/cloud-content.js');
  for (const table of ['official_sources', 'official_documents', 'legal_updates', 'resources_directory', 'courses']) {
    assert.match(cloud, new RegExp(table));
  }
  for (const forbidden of ['mena_cases', 'tutor_profiles', 'tutor_documents', 'document_analyses', 'generated_documents', 'service_role']) {
    assert.doesNotMatch(cloud, new RegExp(forbidden));
  }
  assert.match(html, /Aucune donnée nominative ajoutée/);
  assert.match(html, /n'est pas envoyée à Supabase/);
});

check('Flux rendez-vous complet', () => {
  for (const functionName of ['openRdvRoute', 'openRdvGoogleCalendar', 'openCaseNote', 'saveCaseNote', 'deleteCaseNote']) {
    assert.match(html, new RegExp(`function ${functionName}\\b`));
  }
  assert.match(html, /d\.caseNotes\.unshift\(note\)/);
  assert.match(html, /r\.statut=.*'realise'/);
  assert.doesNotMatch(html, /deleteCaseNote\('\$\{d\.id\}',\s*'\$\{n\.id\}'\)/);
  assert.match(html, /deleteCaseNote\(this\.dataset\.dossierId,this\.dataset\.noteId\)/);
});

check('Liens officiels limités', () => {
  assert.match(html, /OFFICIAL_CONTENT_HOSTS=new Set/);
  assert.match(html, /u\.protocol==='https:'&&OFFICIAL_CONTENT_HOSTS\.has/);
});

check('HTML sans identifiants dupliqués', () => {
  const ids = [...html.matchAll(/(?:^|\s)id="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

check('Configuration Vercel sûre', () => {
  assert.equal(vercel.outputDirectory, 'pwa');
  const allHeaders = vercel.headers.flatMap((entry) => entry.headers).map((entry) => entry.key);
  for (const required of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options']) {
    assert.ok(allHeaders.includes(required));
  }
  assert.ok(!vercel.rewrites.some((entry) => ['/mode-emploi.html', '/handleiding.html'].includes(entry.source)));
});

console.log(`✅ ${checks.length}/${checks.length} contrôles de livraison réussis`);
for (const name of checks) console.log(`  • ${name}`);
