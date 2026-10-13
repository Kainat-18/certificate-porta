'use strict';
(() => {
  const config = window.SUPABASE_CONFIG || {};
  const status = document.getElementById('verification-status');
  const inputs = [document.getElementById('search_query'), document.querySelector('#subscribe-form input[name="Id"]')].filter(Boolean);
  const ids = ['name','course','issueDate','expiry'];
  let version = 0;
  async function verify(value) {
    const serial = value.trim().toUpperCase();
    const request = ++version;
    ids.forEach(id => document.getElementById(id).textContent = '');
    if (!serial) { status.textContent = 'Please enter a certificate serial number.'; return; }
    inputs.forEach(input => input.value = serial);
    status.textContent = 'Searching...';
    const url = new URL(location.href); url.searchParams.set('id', serial); history.replaceState(null, '', url);
    try {
      if (!config.url || !config.key) throw new Error('Certificate connection is not configured.');
      const response = await fetch(config.url + '/rest/v1/rpc/verify_certificate', {
        method: 'POST', headers: { apikey: config.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_serial: serial })
      });
      const data = await response.json();
      if (request !== version) return;
      if (!response.ok) throw new Error(data.message || 'Unable to search. Please try again.');
      if (!data.length) { status.textContent = 'No active certificate found for this serial number.'; return; }
      const entry = data[0];
      const date = value => new Date(value + 'T00:00:00').toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'});
      const values = [entry.holder_name, entry.course_name, date(entry.valid_from), date(entry.expiry_date)];
      ids.forEach((id,index) => document.getElementById(id).textContent = ' ' + values[index]);
      status.textContent = 'Certificate found. Serial number: ' + entry.serial_number;
    } catch (error) { if (request === version) status.textContent = error.message; }
  }
  for (const id of ['searchbox','subscribe-form']) {
    const form = document.getElementById(id);
    if (form) form.addEventListener('submit', event => {
      event.preventDefault();
      verify(form.querySelector('input').value);
      document.getElementById('certificate-heading').scrollIntoView({behavior:'smooth',block:'center'});
    });
  }
  const serial = new URLSearchParams(location.search).get('id');
  if (serial) verify(serial);
})();
