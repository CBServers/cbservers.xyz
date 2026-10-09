(() => {
  'use strict';

  const params = new URLSearchParams(location.search);
  const SOCIAL = params.get('social') || 'https://social.cbservers.dev';
  const $ = id => document.getElementById(id);
  const fmt = n => (n === null || n === undefined) ? '–' : Number(n).toLocaleString();
  const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };

  const getJson = async url => {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  };

  const fmtWhen = ts => {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // The home hero line mixes the summary and the server feeds, so it hides only when every source it shows has failed.
  let summaryDown = false, serversDown = false;
  function updateLiveLine() {
    const line = $('live-line');
    if (line) line.hidden = summaryDown && (serversDown || !$('live-ours'));
  }

  // Hero line and the stats strip share one summary call.
  async function loadSummary() {
    if (!$('live-online') && !$('s-online')) return;
    try {
      const s = await getJson(`${SOCIAL}/v1/stats/summary`);
      const latest = s.latest || {};
      const inGame = Object.values(latest.games || {}).reduce((a, b) => a + b, 0);
      const players = s.servers ? s.servers.players : null;
      set('live-online', fmt(latest.online));
      set('live-ingame', fmt(inGame));
      set('s-online', fmt(latest.online));
      set('s-online-note', s.peak24h ? `24h peak ${fmt(s.peak24h.n)}` : '');
      set('s-players', fmt(players));
      set('s-players-note', s.servers ? `across ${fmt(s.servers.servers)} servers` : '');
      set('s-peak', s.peakAll ? fmt(s.peakAll.n) : '–');
      set('s-peak-note', s.peakAll ? fmtWhen(s.peakAll.ts) : '');
      summaryDown = false;
    } catch (e) {
      summaryDown = true;
    }
    updateLiveLine();
  }

  // Hosted servers: each group renders rows from its status feed (brad.stream game-server status API).
  const GAMES = {
    T4: { key: 't4', label: 'T4', name: 'World at War', accent: '#B94E14' },
    IW4: { key: 'iw4x', label: 'IW4x', name: 'Modern Warfare 2', accent: '#FBC751' },
    T5: { key: 't5', label: 'T5', name: 'Black Ops', accent: '#186AC6' },
    IW5: { key: 'iw5', label: 'IW5', name: 'Modern Warfare 3', accent: '#09FF00' },
    T6: { key: 't6', label: 'T6', name: 'Black Ops 2', accent: '#FE890A' },
    IW6: { key: 'iw6x', label: 'IW6x', name: 'Ghosts', accent: '#3B718C' },
    SHG1: { key: 's1x', label: 'S1x', name: 'Advanced Warfare', accent: '#F9D406' },
    T7: { key: 'boiii', label: 'BOIII', name: 'Black Ops 3', accent: '#F3751B' },
    IW7: { key: 'iw7-mod', label: 'IW7-Mod', name: 'Infinite Warfare', accent: '#FFFFFF' },
    H1: { key: 'h1-mod', label: 'H1-Mod', name: 'MW Remastered', accent: '#46D744' },
    H2M: { key: 'hmw-mod', label: 'HMW', name: 'HorizonMW', accent: '#97838A' },
    S2: { key: 's2x', label: 'S2x', name: 'World War II', accent: '#8C7A4B', hidden: true },
  };
  // IW4MAdmin's Reference.Game enum, indexed by value; the feed sends the number.
  const GAME_CODES = ['UKN', 'IW3', 'IW4', 'IW5', 'IW6', 'T4', 'T5', 'T6', 'T7', 'SHG1', 'CSGO', 'H1', 'L4D2', 'H2M', 'IW7', 'S2'];
  const gameCode = s => GAME_CODES[s.game] || String(s.game);
  const sentence = s => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
  const stripColors = s => String(s || '').replace(/\^[0-9a-zA-Z:;.]/g, '').split('|')[0].replace(/\s+/g, ' ').trim();
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const isPublic = addr => addr && !/^(127\.|0\.0\.0\.0|localhost$|10\.|192\.168\.)/.test(addr);
  const svg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  function serverRow(s, features, host) {
    const code = gameCode(s);
    const g = GAMES[code] || { key: '', label: code, name: code, accent: '#FFA02E' };
    const logo = g.key ? `<img src="/assets/img/games/${g.key}/icon.png" alt="${esc(g.name)}">` : '';
    const address = isPublic(s.ipAddress) ? s.ipAddress : host;
    const connect = `connect ${address}:${s.port}`;
    const players = s.clientCount || 0;
    const mode = sentence(s.gameType);
    return `<div class="server${s.online ? '' : ' offline'}" style="--game-accent:${g.accent}">
      <div class="server-game">${logo}<span>${esc(g.label)}</span></div>
      <div class="server-name">${esc(stripColors(s.name))}<small>${esc([mode, features].filter(Boolean).join(', '))}</small></div>
      <div class="server-map">${s.online ? esc(s.map || '–') : 'offline'}</div>
      <div class="server-players${players > 0 ? ' hot' : ''}"><span class="n">${fmt(players)}</span> / ${fmt(s.maxClients)}</div>
      ${address
        ? `<button class="server-connect" type="button" data-copy="${esc(connect)}">${svg}${esc(connect)}</button>`
        : '<span class="server-connect muted">Find it in the in-game browser</span>'}
    </div>`;
  }

  async function loadServers() {
    const groups = [...document.querySelectorAll('.server-group[data-source]')];
    if (!groups.length) return;
    let total = 0, up = 0, count = 0, any = false;
    await Promise.all(groups.map(async group => {
      const list = group.querySelector('[data-list]');
      try {
        const feed = await getJson(group.dataset.source);
        const servers = Array.isArray(feed) ? feed.filter(s => !(GAMES[gameCode(s)] || {}).hidden) : [];
        if (!servers.length) { list.innerHTML = '<p class="servers-empty">No servers listed.</p>'; return; }
        servers.sort((a, b) => (gameCode(a) === 'T7' ? 0 : 1) - (gameCode(b) === 'T7' ? 0 : 1));
        list.innerHTML = servers.map(x => serverRow(x, group.dataset.features || '', group.dataset.host || '')).join('');
        any = true;
        total += servers.reduce((n, s) => n + (s.online ? (s.clientCount || 0) : 0), 0);
        up += servers.filter(s => s.online).length;
        count += servers.length;
      } catch (e) {
        list.innerHTML = '<p class="servers-empty">Status unavailable right now.</p>';
      }
    }));
    wireCopy(document.getElementById('servers'));
    set('servers-updated', any ? `${fmt(up)} of ${fmt(count)} servers online` : 'Server status unavailable');
    set('live-ours', any ? fmt(total) : '–');
    set('s-ours', any ? fmt(total) : '–');
    set('s-ours-note', any ? `on ${fmt(up)} servers` : '');
    serversDown = !any;
    updateLiveLine();
  }

  function wireCopy(scope) {
    (scope || document).querySelectorAll('[data-copy]:not([data-wired])').forEach(btn => {
      btn.dataset.wired = '1';
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.copy);
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1400);
        } catch (e) {
          const range = document.createRange();
          range.selectNodeContents(btn);
          getSelection().removeAllRanges();
          getSelection().addRange(range);
        }
      });
    });
  }

  function wireNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = $('nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  wireCopy();
  wireNav();
  set('year', String(new Date().getFullYear()));
  loadSummary();
  loadServers();
  setInterval(() => { loadSummary(); loadServers(); }, 30000);
})();
