(() => {
  'use strict';
  const event = window.BIRTHDAY;
  const $ = id => document.getElementById(id);
  const escapeIcs = text => String(text).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  const icsDate = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const foldLine = line => {
    const lines = []; let part = ''; let length = 0;
    for (const character of line) {
      const bytes = new TextEncoder().encode(character).length;
      if (length + bytes > 75) { lines.push(part); part = ' '; length = 1; }
      part += character; length += bytes;
    }
    lines.push(part); return lines.join('\r\n');
  };
  const guest = new URLSearchParams(window.location.search).get('to');
  if (guest && guest.trim()) { $('greeting').textContent = `${guest.trim().slice(0, 60)}, келесің ғой? 💗`; $('greeting').hidden = false; }
  const message = `${guest ? guest.trim().slice(0, 60) + ': ' : ''}Ажар, туған күніңе келемін! 🎀 7 қараша, 20:00. Кездескенше! 💗`;
  const phone = event.whatsapp.replace(/\D/g, '');
  $('rsvp-link').href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const start = new Date(event.date);
  const countdown = () => {
    const remaining = start.getTime() - Date.now();
    $('countdown').hidden = false;
    if (remaining <= 0) {
      $('countdown-caption').textContent = '07 ҚАРАША 2026 · 20:00';
      document.querySelector('.countdown-grid').hidden = true;
      return false;
    }
    const minutes = Math.floor(remaining / 60000);
    $('days').textContent = String(Math.floor(minutes / 1440)).padStart(2, '0');
    $('hours').textContent = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
    $('minutes').textContent = String(minutes % 60).padStart(2, '0');
    return true;
  };
  if (Number.isFinite(start.getTime()) && countdown()) {
    const timer = window.setInterval(() => { if (!countdown()) window.clearInterval(timer); }, 1000);
  }
  $('calendar-button').addEventListener('click', () => {
    const fields = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Azhar Birthday//Invitation//KK',
      'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', 'UID:azhar-birthday-20261107@invitation.local',
      `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(start)}`,
      `SUMMARY:${escapeIcs('Ажар · 22 · Birthday Sleepover Party 🎀')}`,
      `LOCATION:${escapeIcs(event.city + ', ' + event.address)}`,
      `DESCRIPTION:${escapeIcs('Сүйікті пижамаңды және көтеріңкі көңіл күйіңді алып кел! 🎀\nКелетініңді WhatsApp арқылы хабарла: +' + phone)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const blob = new Blob([fields.map(foldLine).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'azhar-birthday.ics'; document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  for (const photo of event.photos || []) {
    if (!photo.src || !/^assets\/[a-zA-Z0-9_./-]+$/.test(photo.src) || photo.src.includes('..')) continue;
    const figure = document.createElement('figure'); const img = document.createElement('img');
    img.src = photo.src; img.alt = photo.alt || 'Ажар'; img.loading = 'lazy'; img.decoding = 'async';
    if (photo.width && photo.height) { img.width = photo.width; img.height = photo.height; }
    img.addEventListener('error', () => { figure.remove(); $('photos').hidden = !$('photo-grid').children.length; });
    const open = document.createElement('button');
    open.type = 'button'; open.className = 'photo-open'; open.setAttribute('aria-label', photo.alt + ' — үлкейту');
    open.append(img);
    const caption = document.createElement('figcaption'); caption.textContent = photo.caption || 'our kind of happy ♡';
    open.addEventListener('click', () => {
      $('photo-full').src = photo.src; $('photo-full').alt = photo.alt || 'Құрбылар';
      $('photo-caption').textContent = caption.textContent;
      if (typeof $('photo-dialog').showModal === 'function') $('photo-dialog').showModal();
    });
    figure.append(open, caption); $('photo-grid').append(figure); $('photos').hidden = false;
  }
  $('share-button').addEventListener('click', async () => {
    const url = new URL(window.location.href); url.hash = '';
    $('share-feedback').textContent = '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Ажар · Birthday Sleepover Party 🎀', text: 'Қыздарым, туған күнімде бірге болайық! 7 қараша · 20:00 ♡', url: url.href });
        return;
      }
    } catch (error) { if (error.name === 'AbortError') return; }
    try {
      await navigator.clipboard.writeText(url.href);
      $('share-feedback').textContent = 'Сілтеме көшірілді ♡';
    } catch {
      $('share-url').value = url.href;
      if (typeof $('share-dialog').showModal === 'function') {
        $('share-dialog').showModal(); $('share-url').select();
      } else { $('share-feedback').textContent = url.href; }
    }
  });
  $('photo-close').addEventListener('click', () => $('photo-dialog').close());
  $('photo-dialog').addEventListener('click', event => { if (event.target === $('photo-dialog')) $('photo-dialog').close(); });
  const welcome = $('welcome');
  function enter(withMusic) {
    if (withMusic) window.AzharSound?.start();
    welcome.close();
    $('main-content').setAttribute('tabindex', '-1');
    $('main-content').focus({ preventScroll: true });
  }
  $('open-music').addEventListener('click', () => enter(true));
  $('open-silent').addEventListener('click', () => enter(false));
  if (typeof welcome.showModal === 'function' && !window.location.hash) welcome.showModal();
  $('share-dialog').addEventListener('click', event => { if (event.target === $('share-dialog')) $('share-dialog').close(); });
})();
