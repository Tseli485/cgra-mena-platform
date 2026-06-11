#!/usr/bin/env node
/* Audit harness déterministe — Plateforme MENA Tuteur.
   Usage: node scripts/harness-audit.js [repo] [--format text|json]
   Scores reproductibles par commit : chaque check = fichier/règle explicite. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = process.cwd();
const fmt = process.argv.includes('--format') ? process.argv[process.argv.indexOf('--format') + 1] : 'text';
const R = p => path.join(ROOT, p);
const ex = p => fs.existsSync(R(p));
const rd = p => { try { return fs.readFileSync(R(p), 'utf-8'); } catch { return ''; } };

const checks = [];
function check(cat, pts, label, ok, fix) {
  checks.push({ cat, pts: ok ? pts : 0, max: pts, label, ok, fix: ok ? null : fix });
}

/* 1. Tool Coverage — outillage projet pour les sessions IA */
check('Tool Coverage', 4, 'CLAUDE.md projet présent', ex('CLAUDE.md'), 'Créer CLAUDE.md (architecture + règles).');
check('Tool Coverage', 3, 'Codemap présent (docs/CODEMAP.md)', ex('docs/CODEMAP.md'), 'Créer docs/CODEMAP.md.');
check('Tool Coverage', 3, 'README avec démarrage rapide', /##/.test(rd('README.md')), 'Étoffer README.md.');

/* 2. Context Efficiency */
check('Context Efficiency', 4, 'Dictionnaire NL-FR extrait en module', ex('pwa/js/nl-fr-dict.js'), 'Extraire les gros blocs de données.');
check('Context Efficiency', 3, 'Données en JSON séparés (≥5 fichiers)', (() => { try { return fs.readdirSync(R('pwa/js/data')).filter(f => f.endsWith('.json')).length >= 5; } catch { return false; } })(), 'Séparer les données du code.');
check('Context Efficiency', 3, 'CLAUDE.md règle d\'édition par ancres', /ancres/.test(rd('CLAUDE.md')), 'Documenter la méthode d\'édition.');

/* 3. Quality Gates (CI) */
const ci = rd('.github/workflows/ci.yml');
check('Quality Gates', 2, 'CI: validation JSON', /Valider les JSON/.test(ci), 'Ajouter la validation JSON.');
check('Quality Gates', 2, 'CI: cohérence des versions', /coh[ée]rence des versions/i.test(ci), 'Ajouter le check de versions.');
check('Quality Gates', 2, 'CI: tests navigateur bloquants', /tests-e2e/.test(ci), 'Ajouter le job E2E Playwright.');
check('Quality Gates', 2, 'CI: gate encodage UTF-8', /UTF-8/.test(ci), 'Ajouter le gate UTF-8 (bug cp1252 attrapé le 11/06).');
check('Quality Gates', 2, 'CI: gate syntaxe JS (node --check)', /node --check|syntaxe JS/i.test(ci), 'Ajouter le gate node --check.');

/* 4. Memory Persistence — état applicatif documenté */
check('Memory Persistence', 5, 'Stores documentés dans le codemap', /localStorage.*IndexedDB/s.test(rd('docs/CODEMAP.md')), 'Documenter les stores.');
check('Memory Persistence', 5, 'Sauvegarde chiffrée + archives implémentées', /mena_archive_enc/.test(rd('pwa/index.html')), 'Implémenter archives chiffrées.');

/* 5. Eval Coverage */
const tests = rd('pwa/tests.html');
const nTests = (tests.match(/await T\(/g) || []).length;
check('Eval Coverage', 4, `≥10 tests automatisés (actuel: ${nTests})`, nTests >= 10, 'Étendre pwa/tests.html.');
check('Eval Coverage', 3, 'Tests couvrent le chiffrement', /aesEncrypt/.test(tests), 'Tester le chiffrement.');
check('Eval Coverage', 3, 'Tests couvrent les délais légaux', /computeDelais/.test(tests), 'Tester computeDelais.');

/* 6. Security Guardrails */
check('Security Guardrails', 3, 'CI: scan données réelles bloquant', /DONNEES REELLES/.test(ci), 'Ajouter le scan PII.');
check('Security Guardrails', 2, 'LICENSE présente', ex('LICENSE'), 'Ajouter LICENSE.');
check('Security Guardrails', 2, 'Release: SHA256SUMS publiés', /SHA256SUMS/.test(rd('.github/workflows/build.yml')), 'Publier les empreintes.');
check('Security Guardrails', 3, 'Chiffrement AES-GCM + PBKDF2 ≥100k itérations', /iterations:150000/.test(rd('pwa/index.html')), 'Renforcer la dérivation de clé.');

/* 7. Cost Efficiency */
check('Cost Efficiency', 5, 'Modèles IA exclus de l\'exécutable', /Exclure les modeles IA/.test(rd('.github/workflows/build.yml')), 'Exclure pwa/models du build.');
check('Cost Efficiency', 5, 'Service worker avec cache versionné', /mena-v\d+/.test(rd('pwa/sw.js')), 'Versionner le cache SW.');

/* 8. GitHub Integration */
const wf = (() => { try { return fs.readdirSync(R('.github/workflows')).filter(f => f.endsWith('.yml')); } catch { return []; } })();
check('GitHub Integration', 2, `≥5 workflows (actuel: ${wf.length})`, wf.length >= 5, 'Ajouter des workflows.');
check('GitHub Integration', 2, 'Release automatique sur tag', /release:\s*$|startsWith\(github\.ref, 'refs\/tags/m.test(rd('.github/workflows/build.yml')), 'Automatiser la release.');
check('GitHub Integration', 2, 'Publication gh-pages automatisée au tag', /gh-pages/.test(rd('.github/workflows/build.yml')), 'Automatiser gh-pages dans build.yml.');
check('GitHub Integration', 2, 'Veille contenu pages officielles', ex('.github/workflows/veille-contenu.yml'), 'Ajouter la veille.');
check('GitHub Integration', 2, 'Soumission winget automatique', ex('.github/workflows/winget-update.yml'), 'Ajouter winget-update.yml.');

/* agrégation */
const cats = {};
for (const c of checks) {
  cats[c.cat] = cats[c.cat] || { pts: 0, max: 0 };
  cats[c.cat].pts += c.pts; cats[c.cat].max += c.max;
}
const overall = checks.reduce((s, c) => s + c.pts, 0);
const maxScore = checks.reduce((s, c) => s + c.max, 0);
const failed = checks.filter(c => !c.ok);
const top_actions = failed.slice(0, 3).map(c => `[${c.cat}] ${c.fix}`);
const out = {
  rubric: 'mena-harness-2026-06-11', scope: 'repo',
  overall_score: overall, max_score: maxScore,
  applicable_categories: Object.keys(cats), category_count: Object.keys(cats).length,
  categories: Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, `${v.pts}/${v.max}`])),
  failed_checks: failed.map(c => ({ cat: c.cat, label: c.label, fix: c.fix })),
  top_actions
};
if (fmt === 'json') { console.log(JSON.stringify(out, null, 1)); }
else {
  console.log(`Harness Audit (repo): ${overall}/${maxScore}`);
  for (const [k, v] of Object.entries(cats)) console.log(`- ${k}: ${v.pts}/${v.max}`);
  if (failed.length) { console.log('\nChecks en échec:'); failed.forEach(c => console.log(`  ✗ [${c.cat}] ${c.label} → ${c.fix}`)); }
  if (top_actions.length) { console.log('\nTop actions:'); top_actions.forEach((a, i) => console.log(`${i + 1}) ${a}`)); }
  if (!failed.length) console.log('\n✅ Tous les checks passent.');
}
