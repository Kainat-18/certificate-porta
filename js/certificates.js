'use strict';
(async () => {
  const $ = id => document.getElementById(id);
  const config = window.SUPABASE_CONFIG || {};
  const message = (text, error = false) => { $('message').textContent = text; $('message').className = error ? 'error' : ''; };
  if (!config.url || !config.key) {
    $('setup').hidden = false;
    document.querySelectorAll('button').forEach(b => b.disabled = true);
    return;
  }
  let client;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    client = createClient(config.url, config.key);
  } catch { message('Unable to load Supabase. Check your connection and configuration.', true); return; }
  let user = null, editing = null, records = [], searchVersion = 0;
  const form = $('certificate-form');
  const busy = async (target, action) => {
    const buttons = [...target.querySelectorAll('button')];
    buttons.forEach(b => b.disabled = true);
    try { await action(); } catch (e) { message(e.code === '23505' ? 'This serial number is already in use.' : e.message || 'Request failed. Please try again.', true); }
    finally { buttons.forEach(b => b.disabled = false); }
  };
  const node = (tag, text, className) => { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; };
  const date = value => new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  function reset() { editing = null; form.reset(); $('save').textContent = 'Save certificate'; $('cancel').hidden = true; }
  async function search(serial) {
    const version = ++searchVersion;
    $('details').hidden = true; $('details').replaceChildren();
    $('search-status').textContent = 'Searching…';
    const { data, error } = await client.rpc('verify_certificate', { p_serial: serial.trim().toUpperCase() });
    if (version !== searchVersion) return;
    if (error) { $('search-status').textContent = 'Search failed. Please try again.'; throw error; }
    if (!data?.length) { $('search-status').textContent = 'No active certificate found for this serial number.'; return; }
    const entry = data[0];
    const fields = [['Serial number', entry.serial_number], ['Certificate Holder Name', entry.holder_name], ['Course Name', entry.course_name], ['Certificate Valid From', date(entry.valid_from)], ['Certificate Expiry Date', date(entry.expiry_date)]];
    for (const [label, value] of fields) $('details').append(node('dt', label + ':'), node('dd', value));
    $('details').hidden = false;
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    $('search-status').textContent = entry.expiry_date < today ? 'Certificate found — expired.' : 'Certificate found.';
  }
  async function refreshSearch() { if ($('search-serial').value.trim()) await search($('search-serial').value); }
  async function load() {
    $('list-status').textContent = 'Loading entries…';
    const { data, error } = await client.from('certificates').select('id,serial_number,holder_name,course_name,valid_from,expiry_date,is_active').order('created_at', { ascending: false });
    if (error) { $('list-status').textContent = 'Unable to load entries.'; throw error; }
    records = data; $('entries').replaceChildren();
    $('list-status').textContent = records.length ? `${records.length} saved entries` : 'No entries yet. Add your first certificate above.';
    for (const entry of records) {
      const tr = document.createElement('tr');
      tr.append(node('td', entry.serial_number));
      const holder = node('td', entry.holder_name); holder.append(node('small', entry.course_name)); tr.append(holder);
      tr.append(node('td', `${date(entry.valid_from)} — ${date(entry.expiry_date)}`));
      const status = document.createElement('td'); status.append(node('span', entry.is_active ? 'ON' : 'OFF', 'badge' + (entry.is_active ? '' : ' off'))); tr.append(status);
      const controls = document.createElement('td'), actions = node('div', '', 'actions');
      for (const [action, label, className] of [['edit','Edit','secondary'], ['toggle', entry.is_active ? 'Turn OFF' : 'Turn ON','secondary'], ['delete','Delete','danger']]) {
        const button = node('button', label, className); button.type = 'button'; button.dataset.action = action; button.dataset.id = entry.id;
        if (action === 'toggle') button.setAttribute('aria-pressed', String(entry.is_active));
        actions.append(button);
      }
      controls.append(actions); tr.append(controls); $('entries').append(tr);
    }
  }
  async function sync(session) {
    user = session?.user || null;
    $('auth-form').hidden = !!user; $('workspace').hidden = !user;
    $('entries').replaceChildren(); records = []; reset();
    if (user) { $('account').textContent = user.email; await load(); }
  }
  $('search-form').addEventListener('submit', e => { e.preventDefault(); busy(e.currentTarget, async () => {
    const serial = $('search-serial').value.trim().toUpperCase(); $('search-serial').value = serial;
    const url = new URL(location.href); url.searchParams.set('id', serial); history.replaceState(null, '', url);
    await search(serial);
  }); });
  $('auth-form').addEventListener('submit', e => { e.preventDefault(); const signup = e.submitter?.value === 'signup'; busy(e.currentTarget, async () => {
    const credentials = { email: $('email').value.trim(), password: $('password').value };
    const { data, error } = signup ? await client.auth.signUp(credentials) : await client.auth.signInWithPassword(credentials);
    if (error) throw error;
    $('password').value = '';
    message(signup && !data.session ? 'Check your email to confirm your account, then sign in.' : 'Signed in successfully.');
  }); });
  $('logout').addEventListener('click', () => busy($('workspace'), async () => { const { error } = await client.auth.signOut(); if (error) throw error; message('Signed out.'); }));
  form.addEventListener('submit', e => { e.preventDefault(); busy(form, async () => {
    if (!user) throw new Error('Sign in first.');
    const values = new FormData(form);
    const payload = Object.fromEntries(['serial_number','holder_name','course_name','valid_from','expiry_date'].map(key => [key, values.get(key).trim()]));
    payload.serial_number = payload.serial_number.toUpperCase(); payload.is_active = values.has('is_active');
    if (!payload.holder_name || !payload.course_name) throw new Error('Holder and course name are required.');
    if (payload.expiry_date < payload.valid_from) throw new Error('Expiry date must be on or after the valid-from date.');
    const { data, error } = await (editing ? client.from('certificates').update(payload).eq('id', editing) : client.from('certificates').insert({ ...payload, owner_id: user.id })).select('id');
    if (error) throw error;
    if (!data.length) throw new Error('Entry was not saved. Refresh and try again.');
    reset(); message('Certificate saved.'); await load(); await refreshSearch();
  }); });
  $('cancel').addEventListener('click', reset);
  $('entries').addEventListener('click', e => {
    const button = e.target.closest('button[data-action]'); if (!button) return;
    const entry = records.find(item => item.id === button.dataset.id); if (!entry) return;
    if (button.dataset.action === 'edit') {
      editing = entry.id;
      for (const key of ['serial_number','holder_name','course_name','valid_from','expiry_date']) form.elements.namedItem(key).value = entry[key];
      form.elements.namedItem('is_active').checked = entry.is_active;
      $('save').textContent = 'Update certificate'; $('cancel').hidden = false; form.scrollIntoView({ behavior:'smooth', block:'center' }); return;
    }
    if (button.dataset.action === 'delete' && !confirm(`Delete certificate ${entry.serial_number}? This cannot be undone.`)) return;
    busy($('workspace'), async () => {
      const removing = button.dataset.action === 'delete';
      const { data, error } = await (removing ? client.from('certificates').delete().eq('id', entry.id) : client.from('certificates').update({ is_active: !entry.is_active }).eq('id', entry.id)).select('id');
      if (error) throw error;
      if (!data.length) throw new Error('Entry no longer exists or access was denied.');
      if (editing === entry.id) reset();
      // Clear existing public details immediately when changing visibility.
      $('details').hidden = true; $('details').replaceChildren();
      message(removing ? 'Certificate deleted.' : `Certificate turned ${entry.is_active ? 'OFF' : 'ON'}.`);
      await load(); await refreshSearch();
    });
  });
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') return;
    if (session?.user?.id === user?.id) return;
    setTimeout(() => sync(session).catch(e => message(e.message, true)), 0);
  });
  const { data, error } = await client.auth.getSession();
  if (error) message(error.message, true); else await sync(data.session).catch(e => message(e.message, true));
  const serial = new URLSearchParams(location.search).get('id');
  if (serial) { $('search-serial').value = serial; await search(serial).catch(e => message(e.message, true)); }
})();
