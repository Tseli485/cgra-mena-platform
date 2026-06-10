/* Worker Bergamot — traduction neuronale NL→FR 100 % locale (pivot NL→EN→FR).
   Moteur : @browsermt/bergamot-translator 0.4.9 (WASM, vendorisé dans js/lib/).
   Modèles : Mozilla firefox-translations (tiny, v1.0), servis depuis models/bergamot/.
   Aucune donnée n'est envoyée à un serveur : tout s'exécute dans ce worker. */
'use strict';
let READY = false, SERVICE = null, MODEL_NLEN = null, MODEL_ENFR = null;

/* Le WASM importe un module « wasm_gemm » (multiplication matricielle int8,
   fournie nativement par Firefox). Hors Firefox, on relie ces imports aux
   implémentations de REPLI exportées par le WASM lui-même (technique de
   l'extension officielle mozilla/firefox-translations). */
const GEMM_MAP = {
  'int8_prepare_a': 'int8PrepareAFallback',
  'int8_prepare_b': 'int8PrepareBFallback',
  'int8_prepare_b_from_transposed': 'int8PrepareBFromTransposedFallback',
  'int8_prepare_b_from_quantized_transposed': 'int8PrepareBFromQuantizedTransposedFallback',
  'int8_prepare_bias': 'int8PrepareBiasFallback',
  'int8_multiply_and_add_bias': 'int8MultiplyAndAddBiasFallback',
  'int8_select_columns_of_b': 'int8SelectColumnsOfBFallback'
};
let WASM_EXPORTS = null;
function gemmImports() {
  const o = {};
  for (const k in GEMM_MAP) { const f = GEMM_MAP[k]; o[k] = (...a) => WASM_EXPORTS[f](...a); }
  return o;
}
var Module = {
  locateFile: f => 'lib/' + f,
  onRuntimeInitialized: () => { postMessage({ op: 'engine' }); },
  print: t => postMessage({ op: 'log', msg: String(t) }),
  printErr: t => postMessage({ op: 'log', msg: 'E: ' + String(t) }),
  instantiateWasm: (info, receive) => {
    fetch('lib/bergamot-translator-worker.wasm')
      .then(r => r.arrayBuffer())
      .then(b => WebAssembly.instantiate(b, Object.assign({}, info, { wasm_gemm: gemmImports() })))
      .then(({ instance }) => { WASM_EXPORTS = instance.exports; receive(instance); })
      .catch(e => postMessage({ op: 'err', msg: 'wasm: ' + e.message }));
    return {};
  }
};
importScripts('lib/bergamot-translator-worker.js');

// Configuration Marian validée (extension officielle mozilla/firefox-translations)
const CONFIG = `beam-size: 1
normalize: 1.0
word-penalty: 0
max-length-break: 128
mini-batch-words: 1024
mime-type: text/plain
alignment: soft
ssplit-mode: paragraph
max-length-factor: 2.0
skip-cost: true
cpu-threads: 0
quiet: true
quiet-translation: true
gemm-precision: int8shiftAlphaAll
`;

function aligned(buf, alignment) {
  const m = new Module.AlignedMemory(buf.byteLength, alignment);
  m.getByteArrayView().set(new Uint8Array(buf));
  return m;
}
function buildModel(b) {     // b = {model, lex, vocab} (ArrayBuffers)
  const vocabs = new Module.AlignedMemoryList();
  vocabs.push_back(aligned(b.vocab, 64));
  return new Module.TranslationModel(CONFIG, aligned(b.model, 256), aligned(b.lex, 64), vocabs, null);
}
function translate(text) {
  const input = new Module.VectorString();
  input.push_back(text);
  const opts = new Module.VectorResponseOptions();
  opts.push_back({ qualityScores: false, alignment: false, html: false });
  const pivot = SERVICE.translateViaPivoting || SERVICE.translateViaPivot || SERVICE.pivot;
  const out = pivot.call(SERVICE, MODEL_NLEN, MODEL_ENFR, input, opts);
  const res = out.get(0).getTranslatedText();
  input.delete(); opts.delete(); out.delete();
  return res;
}

onmessage = e => {
  const d = e.data;
  try {
    if (d.op === 'load') {
      postMessage({ op: 'log', msg: 'classes: ' + ['BlockingService','TranslationModel','AlignedMemory','AlignedMemoryList','VectorString','VectorResponseOptions','ResponseOptions'].map(k => k + '=' + typeof Module[k]).join(' ') });
      SERVICE = new Module.BlockingService({ cacheSize: 0 });
      postMessage({ op: 'log', msg: 'service OK' });
      MODEL_NLEN = buildModel(d.nlen);
      postMessage({ op: 'log', msg: 'model nlen OK' });
      MODEL_ENFR = buildModel(d.enfr);
      postMessage({ op: 'log', msg: 'model enfr OK' });
      READY = true;
      postMessage({ op: 'ready' });
    } else if (d.op === 'tr') {
      if (!READY) throw new Error('not ready');
      postMessage({ op: 'res', id: d.id, text: translate(d.text) });
    }
  } catch (err) {
    postMessage({ op: 'err', id: d.id, msg: String(err && err.message || err) });
  }
};
