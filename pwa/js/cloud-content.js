/* Contenus publics vérifiés — Supabase (aucune donnée de dossier n'est envoyée). */
(function () {
  'use strict';

  const API_URL = 'https://xyzddjakeyypdwsyfwpb.supabase.co/rest/v1';
  const PUBLISHABLE_KEY = 'sb_publishable_1Ug9sTKrVGlAeL6e3gX2vQ_cgjbfmWa';
  const CACHE_KEY = 'mena_public_content_v1';
  const MAX_CACHE_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  const TABLES = {
    official_sources: 'id,authority,title,url,jurisdiction,source_type,verified_on,status,notes',
    official_documents: 'id,title,authority,url,document_type,language,topic,published_on,verified_on,description',
    legal_updates: 'id,effective_on,detected_on,title,summary,impact,source_url,authority,status',
    resources_directory: 'id,category,name,description,url,authority,verified_on',
    courses: 'id,slug,title,summary,audience,level,duration_minutes,position,published,updated_on,learning_objectives'
  };

  let state = { data: {}, fetchedAt: '', source: 'none', error: '' };

  function readCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      if (!cached || !cached.data || !cached.savedAt) return null;
      return cached;
    } catch (_) { return null; }
  }

  function writeCache(data) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); }
    catch (_) { /* Le cache public est facultatif. */ }
  }

  async function fetchTable(table, select) {
    const url = API_URL + '/' + table + '?select=' + encodeURIComponent(select);
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { apikey: PUBLISHABLE_KEY, Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(table + ': HTTP ' + response.status);
    const value = await response.json();
    if (!Array.isArray(value)) throw new Error(table + ': réponse invalide');
    return value;
  }

  async function load(options) {
    options = options || {};
    const cached = readCache();
    if (cached && !options.force && Date.now() - cached.savedAt < MAX_CACHE_AGE_MS) {
      state = { data: cached.data, fetchedAt: new Date(cached.savedAt).toISOString(), source: 'cache', error: '' };
      return state;
    }
    try {
      const entries = await Promise.all(Object.entries(TABLES).map(async ([table, select]) => [table, await fetchTable(table, select)]));
      const data = Object.fromEntries(entries);
      writeCache(data);
      state = { data, fetchedAt: new Date().toISOString(), source: 'network', error: '' };
    } catch (error) {
      state = cached
        ? { data: cached.data, fetchedAt: new Date(cached.savedAt).toISOString(), source: 'cache', error: String(error.message || error) }
        : { data: {}, fetchedAt: '', source: 'none', error: String(error.message || error) };
    }
    return state;
  }

  function get(table) { return Array.isArray(state.data[table]) ? state.data[table] : []; }
  function snapshot() { return state; }

  window.MENA_CLOUD = { load, get, snapshot };
}());
