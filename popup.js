const ext = typeof browser !== 'undefined' ? browser : chrome; // Firefox: browser, Chromium: chrome
const $ = (id) => document.getElementById(id);
const FILE_EXT = { json: 'json', csv: 'csv', sql: 'sql', text: 'txt', lines: 'txt' };
const NOTES = {
  valid: 'Realistic values that pass typical validation.',
  edge: 'Long, Unicode, emoji, special-character and boundary values to stress-test validation.',
  security: 'Attack-style test inputs (XSS, SQLi, SSRF and more). Use only on systems you are authorized to test.'
};
const toFields = (types) => types.map((t) => (typeof t === 'string' ? { name: t, type: t } : { ...t }));
let state = { fields: toFields(TDG.PRESETS.User), count: 5, secCount: 0, format: 'json', mode: 'valid', preset: 'User', category: '' };
let statusTimer;
let generatedOutput = '';

const save = () => { try { ext.storage.local.set({ tdg2: state }); } catch (e) {} };
function say(msg, err) {
  const s = $('status'); s.style.color = err ? '#b42318' : '#15803d'; s.textContent = msg;
  clearTimeout(statusTimer); if (msg) statusTimer = setTimeout(() => { s.textContent = ''; }, 2500);
}

async function copyText(value) {
  try { await navigator.clipboard.writeText(value); }
  catch (e) {
    const temp = document.createElement('textarea');
    temp.value = value; temp.style.position = 'fixed'; temp.style.opacity = '0';
    document.body.appendChild(temp);
    let copied;
    try { temp.select(); copied = document.execCommand('copy'); }
    finally { temp.remove(); }
    if (!copied) throw e;
  }
  say('Copied to clipboard');
}

function renderValueOutput(rows) {
  const box = $('valueOutput');
  const showValues = state.format === 'text' || state.format === 'lines';
  $('out').style.display = showValues ? 'none' : 'block';
  box.style.display = showValues ? 'block' : 'none';
  box.textContent = '';
  if (!showValues) return;

  const columns = rows.length ? Object.keys(rows[0]) : [];
  rows.forEach((row) => {
    const group = document.createElement('div'); group.className = `value-group${state.format === 'lines' ? ' value-group-lines' : ''}`;
    columns.forEach((column) => {
      const value = String(row[column]);
      const displayedValue = state.format === 'lines' ? value.replace(/\r/g, '\\r').replace(/\n/g, '\\n') : value;
      const line = document.createElement('div'); line.className = 'value-row';
      if (state.format === 'text') {
        const label = document.createElement('span'); label.textContent = `${column}: `;
        line.appendChild(label);
      }
      const text = document.createElement('span'); text.textContent = displayedValue;
      const button = document.createElement('button'); button.className = 'value-copy'; button.type = 'button';
      button.setAttribute('aria-label', `Copy ${column} value`); button.title = 'Copy this value';
      button.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="4.5" width="7" height="8" rx="1.5"/><path d="M9.5 3.5A1.5 1.5 0 0 0 8 2H3.5A1.5 1.5 0 0 0 2 3.5V10"/></svg>';
      let feedback;
      let feedbackTimer;
      button.onclick = async () => {
        try {
          await copyText(displayedValue);
          if (feedback) feedback.remove();
          clearTimeout(feedbackTimer);
          feedback = document.createElement('span');
          feedback.textContent = 'Copied!';
          feedback.setAttribute('role', 'status');
          feedback.style.cssText = 'margin-left: 4px; color: #15803d; font: 11px system-ui, sans-serif';
          button.after(feedback);
          feedbackTimer = setTimeout(() => feedback.remove(), 1600);
        } catch (e) { say('Could not copy to clipboard', true); }
      };
      line.append(text, button); group.appendChild(line);
    });
    box.appendChild(group);
  });
}

const isSec = () => state.mode === 'security';
const secTotal = () => (state.category ? (TDG.SEC.find((c) => c.id === state.category) || { count: 0 }).count : TDG.SEC_TOTAL);
const clamp = (n) => Math.max(1, Math.min(1000, parseInt(n, 10) || 1));
const currentCount = () => (isSec() ? clamp(state.secCount || secTotal()) : clamp(state.count));

function generate() {
  // Security mode needs no fields: it produces a plain list of payloads
  const fields = isSec() ? [{ name: 'payload', type: 'secAny' }] : state.fields.filter((f) => f.name.trim());
  if (!fields.length) { generatedOutput = ''; $('out').value = ''; renderValueOutput([]); $('meta').textContent = 'Add at least one field'; return; }
  const count = currentCount();
  try {
    const rows = TDG.dataset(fields, count, { mode: state.mode, category: state.category });
    generatedOutput = TDG.format(rows, state.format, 'test_data');
    $('out').value = generatedOutput;
    renderValueOutput(rows);
    if (isSec()) { const total = secTotal(); $('meta').textContent = `${count} payload${count > 1 ? 's' : ''} · ${Math.min(total, count)} of ${total} covered`; }
    else $('meta').textContent = `${count} row${count > 1 ? 's' : ''} · ready to copy`;
  } catch (e) { say(e.message, true); }
}
const changed = () => { save(); generate(); };

function renderMode() {
  $('modeValid').classList.toggle('on', state.mode === 'valid');
  $('modeEdge').classList.toggle('on', state.mode === 'edge');
  $('modeSec').classList.toggle('on', isSec());
  $('catBox').style.display = isSec() ? 'block' : 'none';
  $('presetsBox').style.display = isSec() ? 'none' : 'block'; // not needed for security payloads
  $('fieldsBox').style.display = isSec() ? 'none' : 'block';
  $('countLbl').textContent = isSec() ? 'Payloads' : 'Rows';
  $('count').value = isSec() ? currentCount() : state.count;
  $('modeNote').textContent = NOTES[state.mode];
}

function renderPresets() {
  const box = $('presets'); box.textContent = '';
  Object.entries(TDG.PRESETS).forEach(([label, types]) => {
    const b = document.createElement('button'); b.className = 'chip' + (state.preset === label ? ' on' : ''); b.textContent = label;
    b.onclick = () => { state.fields = toFields(types); state.preset = label; renderPresets(); renderFields(); changed(); };
    box.appendChild(b);
  });
}

function renderFields() {
  const box = $('fields'); box.textContent = '';
  state.fields.forEach((f, i) => {
    const row = document.createElement('div'); row.className = 'frow';
    const name = document.createElement('input'); name.className = 'inp'; name.value = f.name; name.setAttribute('aria-label', 'Field name');
    name.oninput = () => { f.name = name.value; state.preset = null; renderPresets(); changed(); };
    const sel = document.createElement('select'); sel.className = 'inp'; sel.setAttribute('aria-label', 'Field type');
    TDG.GROUPS.forEach((gp) => {
      const og = document.createElement('optgroup'); og.label = gp.name;
      gp.types.forEach(([id, label]) => { const o = document.createElement('option'); o.value = id; o.textContent = label; og.appendChild(o); });
      sel.appendChild(og);
    });
    sel.value = f.type;
    sel.onchange = () => { if (f.name === f.type) { f.name = sel.value; name.value = f.name; } f.type = sel.value; state.preset = null; renderPresets(); changed(); };
    const del = document.createElement('button'); del.className = 'x'; del.setAttribute('aria-label', 'Remove field');
    del.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#57606a" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>';
    del.onclick = () => { state.fields.splice(i, 1); state.preset = null; renderPresets(); renderFields(); changed(); };
    row.append(name, sel, del); box.appendChild(row);
  });
}

// Close the side panel / sidebar / window
async function closeApp() {
  try {
    if (ext.sidebarAction && ext.sidebarAction.close) { await ext.sidebarAction.close(); return; }        // Firefox sidebar
    const w = await ext.windows.getCurrent();
    if (w.type === 'popup') { await ext.windows.remove(w.id); return; }                                    // detached window
    if (ext.sidePanel && ext.sidePanel.close) { await ext.sidePanel.close({ windowId: w.id }); return; }  // Chrome 141+
    ext.runtime.sendMessage({ type: 'closePanel' });                                                       // older Chromium side panel
  } catch (e) { window.close(); }
}

function setMode(m) { state.mode = m; renderMode(); changed(); }

(async () => {
  try { const s = (await ext.storage.local.get('tdg2')).tdg2; if (s && Array.isArray(s.fields)) state = { ...state, ...s }; } catch (e) {}
  $('format').value = state.format;
  const cat = $('category');
  [['', `All categories (${TDG.SEC_TOTAL} payloads)`]].concat(TDG.SEC.map((c) => [c.id, `${c.label} (${c.count})`])).forEach(([v, l]) => { const o = document.createElement('option'); o.value = v; o.textContent = l; cat.appendChild(o); });
  cat.value = state.category || '';
  cat.onchange = () => { state.category = cat.value; state.secCount = 0; $('count').value = currentCount(); changed(); }; // list every payload of the category
  renderMode(); renderPresets(); renderFields();

  $('modeValid').onclick = () => setMode('valid');
  $('modeEdge').onclick = () => setMode('edge');
  $('modeSec').onclick = () => setMode('security');
  $('count').oninput = () => { if (isSec()) state.secCount = $('count').value; else state.count = $('count').value; changed(); };
  $('format').onchange = () => { state.format = $('format').value; changed(); };
  $('addField').onclick = () => { state.fields.push({ name: 'firstName', type: 'firstName' }); state.preset = null; renderPresets(); renderFields(); changed(); };
  $('regen').onclick = () => { generate(); say('Regenerated'); };
  $('copy').onclick = () => copyText(generatedOutput).catch(() => say('Could not copy to clipboard', true));
  $('download').onclick = () => {
    const blob = new Blob([generatedOutput], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `test-data.${FILE_EXT[state.format]}`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $('close').onclick = closeApp;
  generate(); // data is ready the moment it opens
})();
