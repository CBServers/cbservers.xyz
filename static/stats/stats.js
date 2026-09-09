// Public launcher stats dashboard. Reads the cbfriends history endpoints and draws them with
// Chart.js. No build step: this file, stats.css and index.html are served as-is.
(function () {
    'use strict';

    const params = new URLSearchParams(location.search);
    const API = (params.get('api') || 'https://social.cbservers.xyz').replace(/\/$/, '');
    const SUMMARY_MS = 30_000;
    const SERIES_MS = 60_000;
    const MAX_COLORED = 8;   // categorical slots; everything past them folds into Other

    // Display names mirror the launcher's GameUtils.GAME_CONFIGS; order is its GAME_ORDER.
    const GAMES = {
        'cod1': ['Call of Duty', 'CoD'], 'coduo': ['United Offensive', 'UO'], 'cod2x': ['Call of Duty 2', 'CoD2'],
        'cod4x': ['Modern Warfare', 'COD4'], 't4': ['World at War', 'WaW'], 'iw4x': ['Modern Warfare 2', 'MW2'],
        't5': ['Black Ops', 'BO1'], 'iw5': ['Modern Warfare 3', 'MW3'], 't6': ['Black Ops 2', 'BO2'],
        'iw6x': ['Ghosts', 'Ghosts'], 's1x': ['Advanced Warfare', 'AW'], 'boiii': ['Black Ops 3', 'BO3'],
        'iw7-mod': ['Infinite Warfare', 'IW'], 'h1-mod': ['Modern Warfare Remastered', 'MWR'], 's2x': ['World War II', 'WWII'],
        'bo4': ['Black Ops 4', 'BO4'], 'mw2r': ['MW2 Campaign Remastered', 'MW2CR'], 'hmw-mod': ['HorizonMW', 'HMW'],
    };
    const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8].map(i => css(`--series-${i}`));
    const IDLE_COLOR = css('--idle');
    const OTHER_COLOR = css('--other');
    const TEXT2 = css('--text-2');
    const MUTED = css('--muted');
    const GRID = css('--grid');

    const nameOf = key => (GAMES[key] ? GAMES[key][0] : key);
    const shortOf = key => (GAMES[key] ? GAMES[key][1] : key);
    const fmt = n => (n === null || n === undefined || Number.isNaN(n)) ? '–' : Math.round(n).toLocaleString();
    const fmt1 = n => (n === null || n === undefined) ? '–' : (Math.round(n * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 });
    const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
    const $ = id => document.getElementById(id);

    const fmtTime = (ts, opts) => new Date(ts * 1000).toLocaleString(undefined, opts);
    const fmtWhen = ts => fmtTime(ts, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const fmtDay = ts => fmtTime(ts, { month: 'short', day: 'numeric' });
    const fmtDayYear = ts => fmtTime(ts, { year: 'numeric', month: 'short', day: 'numeric' });
    const fmtClock = ts => fmtTime(ts, { hour: 'numeric', minute: '2-digit' });

    // ---- Colors follow the game, never its rank. A game keeps its slot while it stays in the top
    // set; only when it drops out and another needs a slot does the slot move.
    const assigned = new Map();
    function colorsFor(topGames) {
        for (const g of topGames) if (!assigned.has(g) && assigned.size < MAX_COLORED) assigned.set(g, freeSlot());
        for (const g of topGames) {
            if (assigned.has(g)) continue;
            const victim = [...assigned.keys()].find(k => !topGames.includes(k));
            if (victim === undefined) break;
            const slot = assigned.get(victim);
            assigned.delete(victim);
            assigned.set(g, slot);
        }
        return Object.fromEntries(topGames.filter(g => assigned.has(g)).map(g => [g, SLOTS[assigned.get(g)]]));
    }
    function freeSlot() {
        const used = new Set(assigned.values());
        for (let i = 0; i < MAX_COLORED; i++) if (!used.has(i)) return i;
        return 0;
    }

    // ---- Chart.js setup
    Chart.defaults.font.family = css('--font') || 'system-ui, sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = MUTED;
    Chart.defaults.animation = false;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.color = TEXT2;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(14, 14, 22, 0.96)';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.12)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = TEXT2;
    Chart.defaults.plugins.tooltip.bodyColor = '#f2f2f6';
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.boxWidth = 10;
    Chart.defaults.plugins.tooltip.boxHeight = 2;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
    Chart.defaults.plugins.tooltip.usePointStyle = false;

    // A vertical hairline at the hovered X, so the reader aims at a time rather than a line.
    const crosshair = {
        id: 'crosshair',
        afterDraw(chart) {
            const active = chart.tooltip && chart.tooltip.getActiveElements();
            if (!active || !active.length) return;
            const x = active[0].element.x;
            const { top, bottom } = chart.chartArea;
            const ctx = chart.ctx;
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.28)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
            ctx.restore();
        },
    };
    Chart.register(crosshair);

    function niceTicks(minMs, maxMs, count) {
        const span = maxMs - minMs;
        const steps = [60, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, 86400, 172800, 604800, 1209600, 2592000].map(s => s * 1000);
        const step = steps.find(s => span / s <= count) || steps[steps.length - 1];
        const ticks = [];
        const tz = new Date(minMs).getTimezoneOffset() * 60_000;
        for (let t = Math.ceil((minMs - tz) / step) * step + tz; t <= maxMs; t += step) ticks.push({ value: t });
        return ticks;
    }

    function tickLabel(ms, spanMs) {
        const ts = ms / 1000;
        if (spanMs > 3 * 86400_000) return fmtDay(ts);
        const d = new Date(ms);
        if (d.getHours() === 0 && d.getMinutes() === 0) return fmtDay(ts);
        return fmtClock(ts);
    }

    function timeAxis(from, to) {
        const spanMs = (to - from) * 1000;
        return {
            type: 'linear', min: from * 1000, max: to * 1000,
            grid: { color: GRID, drawTicks: false }, border: { display: false },
            afterBuildTicks: axis => { axis.ticks = niceTicks(axis.min, axis.max, 9); },
            ticks: { callback: v => tickLabel(v, spanMs), maxRotation: 0, autoSkip: true, padding: 6 },
        };
    }

    const valueAxis = () => ({
        beginAtZero: true, grid: { color: GRID, drawTicks: false }, border: { display: false },
        ticks: { callback: v => fmt(v), maxTicksLimit: 6, padding: 6, precision: 0 },
    });

    const tooltipOpts = {
        mode: 'index', intersect: false,
        itemSort: (a, b) => (b.parsed.y || 0) - (a.parsed.y || 0),
        filter: item => item.parsed.y !== null && item.parsed.y !== undefined,
        callbacks: {
            title: items => (items.length ? fmtWhen(items[0].parsed.x / 1000) : ''),
            label: item => ` ${fmt1(item.parsed.y)}  ${item.dataset.label}`,
        },
    };

    const points = (t, arr) => t.map((ts, i) => ({ x: ts * 1000, y: arr[i] === undefined ? null : arr[i] }));

    function areaDataset(label, t, arr, color, stacked) {
        return {
            label, data: points(t, arr), borderColor: color, backgroundColor: color + 'b8',
            borderWidth: 1.25, pointRadius: 0, pointHitRadius: 12, tension: 0, spanGaps: false,
            fill: stacked ? 'stack' : 'origin',
        };
    }
    function lineDataset(label, t, arr, color) {
        return { label, data: points(t, arr), borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 0, pointHitRadius: 12, tension: 0, spanGaps: false, fill: false };
    }

    const charts = new Map();
    function draw(id, config) {
        const existing = charts.get(id);
        if (existing) {
            existing.data = config.data;
            existing.options = config.options;
            existing.update();
            return existing;
        }
        const c = new Chart($(id), config);
        charts.set(id, c);
        return c;
    }

    function stackedArea(id, t, from, to, series, opts = {}) {
        const datasets = series.map(s => areaDataset(s.label, t, s.data, s.color, true));
        return draw(id, {
            type: 'line', data: { datasets },
            options: {
                maintainAspectRatio: false, parsing: false, normalized: true,
                interaction: { mode: 'index', intersect: false },
                scales: { x: timeAxis(from, to), y: { ...valueAxis(), stacked: true } },
                plugins: {
                    legend: { position: 'bottom', reverse: true, labels: { padding: 14 } },
                    tooltip: { ...tooltipOpts, filter: item => tooltipOpts.filter(item) && (opts.keepZero || item.parsed.y > 0) },
                },
            },
        });
    }

    function lineChart(id, t, from, to, series) {
        return draw(id, {
            type: 'line', data: { datasets: series.map(s => lineDataset(s.label, t, s.data, s.color)) },
            options: {
                maintainAspectRatio: false, parsing: false, normalized: true,
                interaction: { mode: 'index', intersect: false },
                scales: { x: timeAxis(from, to), y: valueAxis() },
                plugins: { legend: { display: series.length > 1, position: 'bottom', labels: { padding: 14 } }, tooltip: tooltipOpts },
            },
        });
    }

    function sparkline(id, t, arr, color) {
        return draw(id, {
            type: 'line',
            data: { datasets: [{ data: points(t, arr), borderColor: color, backgroundColor: color + '33', borderWidth: 1.5, pointRadius: 0, fill: 'origin', spanGaps: false, tension: 0 }] },
            options: {
                maintainAspectRatio: false, parsing: false, normalized: true, events: [],
                scales: { x: { type: 'linear', display: false }, y: { display: false, beginAtZero: true } },
                plugins: { legend: { display: false }, tooltip: { enabled: false }, crosshair: false },
            },
        });
    }

    // ---- Series helpers
    const avg = arr => { const v = arr.filter(x => x !== null && x !== undefined); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
    const max = arr => { const v = arr.filter(x => x !== null && x !== undefined); return v.length ? Math.max(...v) : null; };
    const min = arr => { const v = arr.filter(x => x !== null && x !== undefined); return v.length ? Math.min(...v) : null; };
    const last = arr => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] !== null && arr[i] !== undefined) return arr[i]; return null; };
    const hasData = arr => arr.some(x => x !== null && x !== undefined);

    function sumSeries(arrs, len) {
        const out = new Array(len).fill(null);
        for (const a of arrs) for (let i = 0; i < len; i++) if (a[i] !== null && a[i] !== undefined) out[i] = (out[i] || 0) + a[i];
        return out;
    }

    // Top games by average over the range get a color; the rest fold into Other.
    function splitGames(gameSeries, len) {
        const ranked = Object.keys(gameSeries).filter(g => hasData(gameSeries[g]))
            .sort((a, b) => (avg(gameSeries[b]) || 0) - (avg(gameSeries[a]) || 0));
        const top = ranked.slice(0, MAX_COLORED);
        const rest = ranked.slice(MAX_COLORED);
        const colors = colorsFor(top);
        const series = top.map(g => ({ key: g, label: shortOf(g), data: gameSeries[g], color: colors[g] }));
        if (rest.length) series.push({ key: 'other', label: `Other (${rest.length})`, data: sumSeries(rest.map(g => gameSeries[g]), len), color: OTHER_COLOR });
        return { series, top, rest };
    }

    function bucketText(bucket) {
        if (bucket >= 86400) return 'one day';
        if (bucket >= 3600) return bucket === 3600 ? 'one hour' : `${bucket / 3600} hours`;
        return bucket === 60 ? 'one minute' : `${bucket / 60} minutes`;
    }

    // ---- State
    const state = {
        tab: localStorage.getItem('cbstats.tab') || 'overview',
        range: localStorage.getItem('cbstats.range') || '24h',
        uniquesRange: localStorage.getItem('cbstats.uniques') || '30d',
        summary: null, series: null, uniques: null, spark: null,
    };
    const VALID_RANGES = ['6h', '12h', '24h', '48h', '7d', '30d', 'all'];
    if (!VALID_RANGES.includes(state.range)) state.range = '24h';
    if (!['30d', '90d', 'all'].includes(state.uniquesRange)) state.uniquesRange = '30d';
    if (!['overview', 'games', 'servers', 'uniques'].includes(state.tab)) state.tab = 'overview';

    async function getJson(path) {
        const res = await fetch(`${API}${path}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`${path} ${res.status}`);
        return res.json();
    }

    function showError(msg) {
        const el = $('error');
        el.textContent = msg;
        el.hidden = !msg;
    }

    // ---- Rendering: headline and tiles
    function renderSummary() {
        const s = state.summary;
        if (!s) return;
        const inGame = Object.values(s.games || {}).reduce((a, b) => a + b, 0);
        $('h-online').textContent = fmt(s.online);
        $('h-ingame').textContent = fmt(inGame);
        $('h-idle').textContent = fmt(s.idle);
        if (s.peak24h) {
            $('h-peakline').textContent = `That is ${pct(s.online, s.peak24h.n)}% of the peak for the last 24 hours, which was ${fmt(s.peak24h.n)} at ${fmtWhen(s.peak24h.ts)}.` +
                (s.since ? ` Tracking since ${fmtDayYear(s.since)}.` : '');
        }
        $('t-peak24').textContent = s.peak24h ? fmt(s.peak24h.n) : '–';
        $('t-peak24-when').textContent = s.peak24h ? fmtWhen(s.peak24h.ts) : '';
        $('t-peakall').textContent = s.peakAll ? fmt(s.peakAll.n) : '–';
        $('t-peakall-when').textContent = s.peakAll ? fmtDayYear(s.peakAll.ts) : '';

        const today = s.today || {};
        const y = s.yesterday;
        const delta = (id, cur, prev) => {
            const el = $(id);
            el.className = 'note';
            if (!y || prev === undefined) { el.textContent = 'no complete day yet'; return; }
            const d = cur - prev;
            el.textContent = `${d >= 0 ? '+' : ''}${fmt(d)} vs yesterday (${fmt(prev)})`;
            el.classList.add(d >= 0 ? 'up' : 'down');
        };
        $('t-dau').textContent = fmt(today.dau);
        $('t-wau').textContent = fmt(today.wau);
        $('t-mau').textContent = fmt(today.mau);
        $('t-new').textContent = fmt(today.new);
        delta('t-dau-note', today.dau, y && y.dau);
        delta('t-wau-note', today.wau, y && y.wau);
        delta('t-mau-note', today.mau, y && y.mau);
        delta('t-new-note', today.new, y && y.new);

        $('t-spark-online-now').textContent = fmt(s.online);
        if (s.servers) {
            $('t-svr-now').textContent = fmt(s.servers.players);
            $('t-svr-note').textContent = `across ${fmt(s.servers.servers)} servers` + (s.serversPeak24h ? `, 24h peak ${fmt(s.serversPeak24h.n)}` : '');
        }
        for (const el of document.querySelectorAll('[data-when]')) el.textContent = `updated ${fmtClock(Math.floor(Date.now() / 1000))}`;
    }

    function renderSpark() {
        const sp = state.spark;
        if (!sp) return;
        sparkline('spark-online', sp.t, sp.online, SLOTS[0]);
        sparkline('spark-servers', sp.t, sp.servers.players, SLOTS[1]);
    }

    // ---- Rendering: tabs
    function renderOverview() {
        const d = state.series;
        if (!d) return;
        const inGame = d.t.map((_, i) => (d.online[i] === null ? null : d.online[i] - (d.idle[i] || 0)));
        stackedArea('c-overview', d.t, d.from, d.to, [
            { label: 'In a game', data: inGame, color: SLOTS[0] },
            { label: 'Idle (no game running)', data: d.idle, color: IDLE_COLOR },
        ], { keepZero: true });
        lineChart('c-overview-servers', d.t, d.from, d.to, [{ label: 'Players in public servers', data: d.servers.players, color: SLOTS[1] }]);
        const samples = d.online.filter(x => x !== null).length;
        $('cap-overview').textContent = `Launchers online, averaged into buckets of ${bucketText(d.bucket)}. ${samples.toLocaleString()} buckets with data, latest ${fmt(last(d.online))}, high ${fmt(max(d.online))}. Idle means the launcher is open with no game running; the two bands add up to launchers online.`;

        const rows = [
            ['Launchers online', d.online], ['In a game', inGame], ['Idle', d.idle],
            ['Players in public servers', d.servers.players], ['Public servers', d.servers.servers],
        ];
        fillTable('tbl-overview', rows.map(([name, arr]) => [name, fmt(last(arr)), fmt1(avg(arr)), fmt(max(arr)), fmt(min(arr))]));
    }

    function renderGames() {
        const d = state.series;
        const s = state.summary;
        if (!d) return;
        const { series, rest } = splitGames(d.games, d.t.length);
        stackedArea('c-games', d.t, d.from, d.to, series);
        $('cap-games').textContent = `Launchers with each game running, stacked, in buckets of ${bucketText(d.bucket)}. ` +
            (rest.length ? `The ${MAX_COLORED} busiest games over the range are drawn separately; ${rest.length} quieter ${rest.length === 1 ? 'game is' : 'games are'} folded into Other. ` : '') +
            'Idle launchers are not shown here.';

        const now = (s && s.games) || {};
        renderBars('bars-games', Object.keys(now).map(g => [g, now[g]]), 'launchers');
        const colors = Object.fromEntries(series.map(x => [x.key, x.color]));
        const rows = Object.keys(d.games).sort((a, b) => (now[b] || 0) - (now[a] || 0) || (avg(d.games[b]) || 0) - (avg(d.games[a]) || 0))
            .map(g => [swatchName(g, colors[g] || OTHER_COLOR), fmt(now[g] || 0), fmt1(avg(d.games[g])), fmt(max(d.games[g])), s && s.gamePeaks && s.gamePeaks[g] ? fmt(s.gamePeaks[g].n) : '–']);
        fillTable('tbl-games', rows);
    }

    function renderServers() {
        const d = state.series;
        const s = state.summary;
        if (!d) return;
        const perGame = Object.fromEntries(Object.entries(d.servers.games).map(([g, v]) => [g, v.players]));
        const { series, rest } = splitGames(perGame, d.t.length);
        stackedArea('c-servers', d.t, d.from, d.to, series);
        lineChart('c-servers-count', d.t, d.from, d.to, [{ label: 'Public servers', data: d.servers.servers, color: SLOTS[1] }]);
        $('cap-servers').textContent = `Players in public servers per game, all clients, in buckets of ${bucketText(d.bucket)}. ` +
            (rest.length ? `${rest.length} quieter ${rest.length === 1 ? 'game is' : 'games are'} folded into Other. ` : '') +
            'Sampled once a minute from the servers browser.';

        const now = (s && s.servers && s.servers.games) || {};
        renderBars('bars-servers', Object.keys(now).map(g => [g, now[g].players]), 'players');
        const colors = Object.fromEntries(series.map(x => [x.key, x.color]));
        const rows = Object.keys(d.servers.games).sort((a, b) => ((now[b] && now[b].players) || 0) - ((now[a] && now[a].players) || 0))
            .map(g => [swatchName(g, colors[g] || OTHER_COLOR), fmt(now[g] ? now[g].players : 0), fmt(now[g] ? now[g].servers : 0), fmt1(avg(d.servers.games[g].players)), fmt(max(d.servers.games[g].players))]);
        fillTable('tbl-servers', rows);
    }

    function renderUniques() {
        const u = state.uniques;
        if (!u) return;
        const days = u.days;
        const t = days.map(x => Math.floor(Date.parse(x.day + 'T00:00:00Z') / 1000));
        const from = t.length ? t[0] : Math.floor(Date.now() / 1000);
        const to = t.length ? t[t.length - 1] : from;
        const span = Math.max(to - from, 86400);
        lineChart('c-uniques', t, from - 43200, to + 43200, [
            { label: 'Daily', data: days.map(x => x.dau), color: SLOTS[0] },
            { label: '7-day', data: days.map(x => x.wau), color: SLOTS[1] },
            { label: '30-day', data: days.map(x => x.mau), color: SLOTS[2] },
        ]);
        draw('c-new', {
            type: 'bar',
            data: { datasets: [{ label: 'New launchers', data: days.map((x, i) => ({ x: t[i] * 1000, y: x.new })), backgroundColor: SLOTS[6], borderRadius: 3, barThickness: 'flex', maxBarThickness: 18 }] },
            options: {
                maintainAspectRatio: false, parsing: false,
                scales: { x: { ...timeAxis(from - 43200, to + 43200), offset: false }, y: valueAxis() },
                plugins: { legend: { display: false }, tooltip: { ...tooltipOpts, mode: 'nearest', intersect: false, callbacks: { title: items => (items.length ? fmtDayYear(items[0].parsed.x / 1000) : ''), label: item => ` ${fmt(item.parsed.y)}  new launchers` } } },
            },
        });
        void span;
        const rows = days.slice().reverse().map(x => {
            const busiest = Object.entries(x.games || {}).sort((a, b) => b[1] - a[1])[0];
            return [x.day + (x.partial ? ' (today, partial)' : ''), fmt(x.dau), fmt(x.wau), fmt(x.mau), fmt(x.new), busiest ? `${nameOf(busiest[0])} (${fmt(busiest[1])})` : '–'];
        });
        fillTable('tbl-uniques', rows);
    }

    function swatchName(key, color) {
        const frag = document.createDocumentFragment();
        const sw = document.createElement('span');
        sw.className = 'sw';
        sw.style.background = color;
        frag.appendChild(sw);
        frag.appendChild(document.createTextNode(nameOf(key)));
        return frag;
    }

    function renderBars(id, entries, unit) {
        const host = $(id);
        host.textContent = '';
        const rows = entries.filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
        if (!rows.length) {
            const p = document.createElement('p');
            p.className = 'none';
            p.textContent = `Nobody right now.`;
            host.appendChild(p);
            return;
        }
        const top = rows[0][1];
        for (const [g, v] of rows) {
            const row = document.createElement('div');
            row.className = 'bar-row';
            row.title = `${nameOf(g)}: ${fmt(v)} ${unit}`;
            const name = document.createElement('span'); name.className = 'name'; name.textContent = nameOf(g);
            const track = document.createElement('div'); track.className = 'track';
            const fill = document.createElement('div'); fill.className = 'fill'; fill.style.width = `${Math.max(2, (v / top) * 100)}%`;
            track.appendChild(fill);
            const val = document.createElement('span'); val.className = 'val'; val.textContent = fmt(v);
            row.append(name, track, val);
            host.appendChild(row);
        }
    }

    function fillTable(id, rows) {
        const body = $(id).querySelector('tbody');
        body.textContent = '';
        for (const cells of rows) {
            const tr = document.createElement('tr');
            cells.forEach((c, i) => {
                const td = document.createElement('td');
                if (i > 0 && typeof c === 'string') td.className = 'r';
                if (c instanceof Node) td.appendChild(c); else td.textContent = c;
                tr.appendChild(td);
            });
            body.appendChild(tr);
        }
    }

    function renderTab() {
        if (state.tab === 'overview') renderOverview();
        else if (state.tab === 'games') renderGames();
        else if (state.tab === 'servers') renderServers();
        else renderUniques();
        const d = state.series;
        $('empty').hidden = !(d && !hasData(d.online) && state.tab !== 'uniques');
        if (d) $('foot-sampling').textContent = `Launcher counts are sampled once a minute from every launcher's 30-second heartbeat; a launcher silent for 90 seconds drops out. The ${state.range} range is drawn in buckets of ${bucketText(d.bucket)}.`;
    }

    // ---- Fetch loops
    let seriesInFlight = null;
    async function loadSeries() {
        const range = state.range;
        for (const el of document.querySelectorAll('.panel:not([hidden]) .card')) el.classList.add('loading');
        try {
            const p = getJson(`/v1/stats/series?range=${range}`);
            seriesInFlight = p;
            const d = await p;
            if (seriesInFlight !== p || range !== state.range) return;
            state.series = d;
            showError('');
            renderTab();
        } catch (e) {
            showError('Could not load history from the stats service. Retrying.');
            console.warn(e);
        } finally {
            for (const el of document.querySelectorAll('.card')) el.classList.remove('loading');
        }
    }

    async function loadSummary() {
        try {
            const [s, sp] = await Promise.all([getJson('/v1/stats/summary'), getJson('/v1/stats/series?range=24h')]);
            state.summary = s;
            state.spark = sp;
            renderSummary();
            renderSpark();
            if (state.tab === 'games' || state.tab === 'servers') renderTab();
            showError('');
        } catch (e) {
            showError('Could not reach the stats service. Retrying.');
            console.warn(e);
        }
    }

    async function loadUniques() {
        const range = state.uniquesRange;
        try {
            const u = await getJson(`/v1/stats/uniques?range=${range}`);
            if (range !== state.uniquesRange) return;
            state.uniques = u;
            if (state.tab === 'uniques') renderTab();
        } catch (e) {
            console.warn(e);
        }
    }

    // ---- Controls
    function setPressed(groupId, value) {
        for (const b of $(groupId).querySelectorAll('button')) b.setAttribute('aria-pressed', b.dataset.range === value ? 'true' : 'false');
    }
    function selectTab(tab) {
        state.tab = tab;
        localStorage.setItem('cbstats.tab', tab);
        for (const b of document.querySelectorAll('.tabs [role=tab]')) b.setAttribute('aria-selected', b.dataset.tab === tab ? 'true' : 'false');
        for (const p of document.querySelectorAll('.panel')) p.hidden = p.id !== `tab-${tab}`;
        $('range-series').hidden = tab === 'uniques';
        $('range-uniques').hidden = tab !== 'uniques';
        renderTab();
    }
    document.querySelector('.tabs').addEventListener('click', e => {
        const b = e.target.closest('[data-tab]');
        if (b) selectTab(b.dataset.tab);
    });
    $('range-series').addEventListener('click', e => {
        const b = e.target.closest('[data-range]');
        if (!b || b.dataset.range === state.range) return;
        state.range = b.dataset.range;
        localStorage.setItem('cbstats.range', state.range);
        setPressed('range-series', state.range);
        loadSeries();
    });
    $('range-uniques').addEventListener('click', e => {
        const b = e.target.closest('[data-range]');
        if (!b || b.dataset.range === state.uniquesRange) return;
        state.uniquesRange = b.dataset.range;
        localStorage.setItem('cbstats.uniques', state.uniquesRange);
        setPressed('range-uniques', state.uniquesRange);
        loadUniques();
    });

    setPressed('range-series', state.range);
    setPressed('range-uniques', state.uniquesRange);
    selectTab(state.tab);
    loadSummary();
    loadSeries();
    loadUniques();
    setInterval(loadSummary, SUMMARY_MS);
    setInterval(loadSeries, SERIES_MS);
    setInterval(loadUniques, 5 * SERIES_MS);
})();
