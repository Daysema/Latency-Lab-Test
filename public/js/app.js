import { RU_SERVICES, FOREIGN_SERVICES } from './services.js';
import { checkAllServices, checkService, summarizeResults } from './checker.js';
import { verifyAccess, reportResults } from './api.js';

const networkBanner = document.getElementById('network-banner');
const regionInfo = document.getElementById('region-info');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const summaryEl = document.getElementById('summary');
const filterInput = document.getElementById('filter-input');
const filterStatus = document.getElementById('filter-status');
const ruGrid = document.getElementById('ru-grid');
const foreignGrid = document.getElementById('foreign-grid');
const tabButtons = document.querySelectorAll('.tab-btn');

let allResults = [];
let currentTab = 'all';
let verifyData = null;
let lastConnectionKey = null;
let scanInProgress = false;

const STORAGE_KEY = 'latency-lab-results';

function connectionKey(data) {
  const t = data?.client?.type || '';
  const k = data?.network?.connection?.kind || '';
  const op = data?.network?.operator || '';
  return t + '|' + k + '|' + op;
}

async function refreshVerification() {
  const data = await verifyAccess();
  const key = connectionKey(data);
  const changed = lastConnectionKey !== null && lastConnectionKey !== key;
  lastConnectionKey = key;
  verifyData = data;
  initNetworkBanner(verifyData);

  if (changed) {
    clearPersistedResults();
    summaryEl.classList.add('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = 'Подключение изменилось — запустите проверку снова';
    initCatalog();
  }

  return data;
}

function formatRegion(geo) {
  if (!geo) return '';
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.join(', ');
}

function buildConnectionBanner(data) {
  const conn = data.network?.connection;
  const regionText = formatRegion(data.geo);
  const operator = escapeHtml(conn?.operator || data.network?.operator || '—');

  if (!conn) {
    return {
      className: 'banner banner--ok',
      html: '<strong>Проверка с вашего устройства</strong>',
    };
  }

  if (conn.kind === 'mobile') {
    return {
      className: 'banner banner--mobile',
      html:
        '<strong>📱 Проверка производится с мобильной сети</strong><br>' +
        'Оператор: <strong>' + operator + '</strong>' +
        (regionText ? '<br>Регион: <strong>' + escapeHtml(regionText) + '</strong>' : ''),
    };
  }

  if (conn.kind === 'wifi') {
    return {
      className: 'banner banner--wifi',
      html:
        '<strong>📶 Проверка производится через Wi-Fi</strong><br>' +
        'Провайдер: <strong>' + operator + '</strong>' +
        (regionText ? '<br>Регион: <strong>' + escapeHtml(regionText) + '</strong>' : ''),
    };
  }

  return {
    className: 'banner banner--wired',
    html:
      '<strong>🖥️ Проверка производится с проводного интернета</strong><br>' +
      'Провайдер: <strong>' + operator + '</strong>' +
      (regionText ? '<br>Регион: <strong>' + escapeHtml(regionText) + '</strong>' : ''),
  };
}

function formatClientDetails(client, connectionKind) {
  if (!client) return '';

  const parts = [];

  if (connectionKind === 'wifi' && client.type === 'wifi') {
    parts.push('Wi-Fi');
  } else if (connectionKind === 'wired' && client.type === 'ethernet') {
    parts.push('Ethernet');
  } else if (connectionKind === 'mobile' && client.type === 'cellular') {
  if (client.effectiveType) {
      const speedMap = {
        'slow-2g': 'скорость: низкая',
        '2g': 'скорость: 2G',
        '3g': 'скорость: 3G',
        '4g': 'скорость: 4G/LTE',
      };
      parts.push(speedMap[client.effectiveType] || client.effectiveType);
    }
  }

  if (client.downlink) {
    parts.push('↓ ~' + client.downlink + ' Мбит/с');
  }

  return parts.join(' · ');
}

function initNetworkBanner(data) {
  const client = data.client;
  const connectionKind = data.network?.connection?.kind;
  const clientDetails = formatClientDetails(client, connectionKind);

  if (data.allowed) {
    const banner = buildConnectionBanner(data);
    networkBanner.className = banner.className;
    networkBanner.innerHTML = banner.html + (clientDetails ? '<br><small>' + escapeHtml(clientDetails) + '</small>' : '');

    const conn = data.network?.connection;
    const regionText = formatRegion(data.geo);
    regionInfo.className = 'region-info';
    regionInfo.classList.remove('hidden');
    regionInfo.innerHTML =
      '<div class="region-info__item"><span class="region-info__label">Тип подключения</span><span class="region-info__value">' + escapeHtml(conn?.kindLabel || '—') + '</span></div>' +
      '<div class="region-info__item"><span class="region-info__label">' + (conn?.kind === 'mobile' ? 'Оператор' : 'Провайдер') + '</span><span class="region-info__value">' + escapeHtml(data.network?.operator || '—') + '</span></div>' +
      '<div class="region-info__item"><span class="region-info__label">Регион</span><span class="region-info__value">' + escapeHtml(regionText || '—') + '</span></div>' +
      '<div class="region-info__item"><span class="region-info__label">ASN</span><span class="region-info__value">AS' + escapeHtml(String(data.network?.asn || '—')) + '</span></div>';

    mainContent.classList.remove('hidden');
    startBtn.disabled = false;
    initCatalog();
  } else {
    networkBanner.className = 'banner banner--warn';
    let extra = '';

    if (data.reason === 'geo' && data.geo) {
      extra = '<br><small>Определён регион: ' + escapeHtml(formatRegion(data.geo)) + '</small>';
    } else if (data.reason === 'security' && data.security) {
      const flags = [];
      if (data.security.vpn) flags.push('VPN');
      if (data.security.proxy) flags.push('прокси');
      if (data.security.hosting) flags.push('хостинг');
      if (data.security.tor) flags.push('Tor');
      if (flags.length) extra = '<br><small>Обнаружено: ' + escapeHtml(flags.join(', ')) + '</small>';
    } else if (clientDetails) {
      extra = '<br><small>' + escapeHtml(clientDetails) + '</small>';
    }

    networkBanner.innerHTML =
      '<strong>⚠ Проверка недоступна</strong><br>' +
      escapeHtml(data.message || 'Отключите VPN/прокси для проверки.') +
      extra;

    if (data.geo) {
      regionInfo.className = 'region-info region-info--muted';
      regionInfo.classList.remove('hidden');
      regionInfo.innerHTML =
        '<div class="region-info__item"><span class="region-info__label">Ваш регион</span><span class="region-info__value">' +
        escapeHtml(formatRegion(data.geo)) + '</span></div>';
    }

    startBtn.disabled = true;
    mainContent.classList.add('hidden');
  }
}

function buildCatalog() {
  return [
    ...RU_SERVICES.map((s) => ({ ...s, region: 'ru', status: 'pending', latency: null })),
    ...FOREIGN_SERVICES.map((s) => ({ ...s, region: 'foreign', status: 'pending', latency: null })),
  ];
}

function hasCheckedResults(results) {
  return results.some((r) => r.status === 'ok' || r.status === 'blocked');
}

function clearPersistedResults() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function loadPersistedResultsRaw() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadPersistedResults() {
  const data = loadPersistedResultsRaw();
  if (!data?.results?.length) return null;
  if (data.connectionKey !== lastConnectionKey) return null;
  return data;
}

function persistResults(scanCompleted = null) {
  try {
    if (!hasCheckedResults(allResults)) {
      clearPersistedResults();
      return;
    }
    const existing = loadPersistedResultsRaw();
    const completed = scanCompleted ?? existing?.scanCompleted ?? false;
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        connectionKey: lastConnectionKey,
        results: allResults.map((r) => ({
          url: r.url,
          region: r.region,
          status: r.status === 'checking' ? 'pending' : r.status,
          latency: r.latency,
        })),
        scanCompleted: completed,
      }),
    );
  } catch {
    /* ignore */
  }
}

function mergeCatalogWithPersisted(savedResults) {
  const map = new Map(
    savedResults
      .filter((r) => r.status === 'ok' || r.status === 'blocked')
      .map((r) => [r.region + '|' + r.url, r]),
  );
  return buildCatalog().map((item) => {
    const saved = map.get(item.region + '|' + item.url);
    return saved ? { ...item, status: saved.status, latency: saved.latency } : item;
  });
}

function findResultIndex(url, region) {
  return allResults.findIndex((r) => r.url === url && r.region === region);
}

function mergeBatchResults(batch) {
  for (const result of batch) {
    const idx = allResults.findIndex((r) => r.url === result.url && r.region === result.region);
    if (idx >= 0) allResults[idx] = result;
    else allResults.push(result);
  }
  persistResults();
}

function initCatalog() {
  const persisted = loadPersistedResults();
  if (persisted) {
    allResults = mergeCatalogWithPersisted(persisted.results);
    refreshGrids();
    if (hasCheckedResults(allResults)) {
      updateSummary();
      if (persisted.scanCompleted) {
        startBtn.textContent = 'Проверить снова';
        progressBar.style.width = '100%';
        progressText.textContent = 'Результаты восстановлены';
      }
    }
    return;
  }
  allResults = buildCatalog();
  refreshGrids();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function createCard(result) {
  const card = document.createElement('div');
  card.className = 'service-card service-card--' + result.status;
  card.dataset.name = result.name.toLowerCase();
  card.dataset.status = result.status;
  card.dataset.category = result.category.toLowerCase();
  card.dataset.url = result.url;
  card.dataset.region = result.region;

  const statusLabels = {
    ok: 'Отвечает',
    blocked: 'Нет ответа',
    pending: 'Не проверен',
    checking: 'Проверка…',
  };
  const statusText = statusLabels[result.status] || result.status;
  const latencyText =
    result.status === 'pending' || result.status === 'checking'
      ? '—'
      : result.latency != null
        ? result.latency + ' мс'
        : '—';

  const checkLabel =
    result.status === 'checking'
      ? 'Проверка…'
      : result.status === 'pending'
        ? 'Проверить'
        : 'Перепроверить';

  card.innerHTML =
    '<div class="service-card__header">' +
    '<span class="service-card__name">' + escapeHtml(result.name) + '</span>' +
    '<span class="service-card__badge">' + statusText + '</span>' +
    '</div>' +
    '<div class="service-card__meta">' +
    '<span class="service-card__latency">' + latencyText + '</span>' +
    '</div>' +
    '<div class="service-card__actions">' +
    '<button type="button" class="service-card__check"' +
    (result.status === 'checking' || scanInProgress ? ' disabled' : '') +
    '>' + checkLabel + '</button>' +
    '<a class="service-card__link" href="' + escapeHtml(result.url) + '" target="_blank" rel="noopener">Открыть →</a>' +
    '</div>';

  return card;
}

async function recheckOne(url, region) {
  if (scanInProgress) return;

  const idx = findResultIndex(url, region);
  if (idx < 0) return;

  const current = allResults[idx];
  if (current.status === 'checking') return;

  if (!verifyData?.allowed) {
    try {
      const fresh = await refreshVerification();
      if (!fresh?.allowed) return;
    } catch {
      return;
    }
  }

  allResults[idx] = { ...current, status: 'checking', latency: null };
  refreshGrids();

  const result = await checkService({ ...current, region });
  const updated = { ...result, region };

  const newIdx = findResultIndex(url, region);
  if (newIdx >= 0) allResults[newIdx] = updated;
  else allResults.push(updated);

  refreshGrids();
  persistResults();

  if (!summaryEl.classList.contains('hidden')) {
    updateSummary();
  }
}

function onGridClick(e) {
  const btn = e.target.closest('.service-card__check');
  if (!btn || btn.disabled) return;
  const card = btn.closest('.service-card');
  if (!card) return;
  recheckOne(card.dataset.url, card.dataset.region);
}

function getCategoryOrder(region) {
  const source = region === 'ru' ? RU_SERVICES : FOREIGN_SERVICES;
  const order = [];
  const seen = new Set();
  for (const s of source) {
    if (!seen.has(s.category)) {
      seen.add(s.category);
      order.push(s.category);
    }
  }
  return order;
}

function groupByCategory(results, region) {
  const grouped = new Map();
  for (const r of results) {
    if (!grouped.has(r.category)) grouped.set(r.category, []);
    grouped.get(r.category).push(r);
  }

  const order = getCategoryOrder(region);
  const extra = [...grouped.keys()].filter((c) => !order.includes(c));
  const categories = [...order, ...extra];

  return categories
    .filter((cat) => grouped.has(cat))
    .map((cat) => {
      const items = grouped.get(cat).sort((a, b) => {
        const order = { ok: 0, blocked: 1, checking: 2, pending: 3 };
        const diff = (order[a.status] ?? 9) - (order[b.status] ?? 9);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, 'ru');
      });
      const ok = items.filter((i) => i.status === 'ok').length;
      const pending = items.filter((i) => i.status === 'pending').length;
      const checking = items.filter((i) => i.status === 'checking').length;
      return { category: cat, items, ok, pending, checking, total: items.length };
    });
}

function getOpenCategories(container) {
  const open = new Set();
  container.querySelectorAll('details.category-details[open]').forEach((el) => {
    if (el.dataset.category) open.add(el.dataset.category);
  });
  return open;
}

function renderGroupedResults(results, container, region) {
  const filtered = applyFilters(results);
  const openCategories = getOpenCategories(container);

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = '<p class="category-empty">Ничего не найдено</p>';
    return 0;
  }

  const groups = groupByCategory(filtered, region);

  for (const group of groups) {
    const details = document.createElement('details');
    details.className = 'category-details';
    details.dataset.category = group.category;
    if (openCategories.has(group.category)) {
      details.open = true;
    }

    const blocked = group.total - group.ok - group.pending - group.checking;
    const summary = document.createElement('summary');
    summary.className = 'category-summary';

    let statsHtml;
    if (group.pending === group.total) {
      statsHtml =
        '<span class="category-summary__total">' + group.total + '</span>' +
        '<span class="category-summary__pending"> · ожидает проверки</span>';
    } else {
      statsHtml =
        '<span class="category-summary__ok">' + group.ok + '</span>' +
        '<span class="category-summary__sep">из</span>' +
        '<span class="category-summary__total">' + group.total + '</span>' +
        (blocked > 0 ? '<span class="category-summary__blocked"> · ' + blocked + ' без ответа</span>' : '') +
        (group.checking > 0 ? '<span class="category-summary__pending"> · ' + group.checking + ' проверяется</span>' : '') +
        (group.pending > 0 ? '<span class="category-summary__pending"> · ' + group.pending + ' не проверено</span>' : '');
    }

    summary.innerHTML =
      '<span class="category-summary__name">' + escapeHtml(group.category) + '</span>' +
      '<span class="category-summary__stats">' + statsHtml + '</span>';

    const body = document.createElement('div');
    body.className = 'category-body';

    if (group.checking > 0) {
      const checkingSection = document.createElement('div');
      checkingSection.className = 'category-subsection';
      checkingSection.innerHTML =
        '<div class="category-subsection__title category-subsection__title--checking">⟳ Проверяются (' + group.checking + ')</div>';
      const checkingGrid = document.createElement('div');
      checkingGrid.className = 'grid';
      group.items.filter((i) => i.status === 'checking').forEach((r) => checkingGrid.appendChild(createCard(r)));
      checkingSection.appendChild(checkingGrid);
      body.appendChild(checkingSection);
    }

    if (group.pending > 0) {
      const pendingSection = document.createElement('div');
      pendingSection.className = 'category-subsection';
      pendingSection.innerHTML = '<div class="category-subsection__title category-subsection__title--pending">○ Не проверены (' + group.pending + ')</div>';
      const pendingGrid = document.createElement('div');
      pendingGrid.className = 'grid';
      group.items.filter((i) => i.status === 'pending').forEach((r) => pendingGrid.appendChild(createCard(r)));
      pendingSection.appendChild(pendingGrid);
      body.appendChild(pendingSection);
    }

    if (group.ok > 0) {
      const okSection = document.createElement('div');
      okSection.className = 'category-subsection';
      okSection.innerHTML = '<div class="category-subsection__title category-subsection__title--ok">✓ Отвечают (' + group.ok + ')</div>';
      const okGrid = document.createElement('div');
      okGrid.className = 'grid';
      group.items.filter((i) => i.status === 'ok').forEach((r) => okGrid.appendChild(createCard(r)));
      okSection.appendChild(okGrid);
      body.appendChild(okSection);
    }

    if (blocked > 0) {
      const blockedSection = document.createElement('div');
      blockedSection.className = 'category-subsection';
      blockedSection.innerHTML = '<div class="category-subsection__title category-subsection__title--blocked">✗ Нет ответа (' + blocked + ')</div>';
      const blockedGrid = document.createElement('div');
      blockedGrid.className = 'grid';
      group.items.filter((i) => i.status === 'blocked').forEach((r) => blockedGrid.appendChild(createCard(r)));
      blockedSection.appendChild(blockedGrid);
      body.appendChild(blockedSection);
    }

    details.appendChild(summary);
    details.appendChild(body);
    container.appendChild(details);
  }

  return filtered.length;
}

function renderResults(results, grid) {
  const region = grid.id === 'ru-grid' ? 'ru' : 'foreign';
  return renderGroupedResults(results, grid, region);
}

function applyFilters(results) {
  const query = filterInput.value.trim().toLowerCase();
  const status = filterStatus.value;

  return results.filter((r) => {
    if (status !== 'all' && r.status !== status) return false;
    if (query && !r.name.toLowerCase().includes(query) && !r.category.toLowerCase().includes(query)) return false;
    return true;
  });
}

function updateSummary() {
  const ruResults = allResults.filter((r) => r.region === 'ru');
  const foreignResults = allResults.filter((r) => r.region === 'foreign');
  const ruSum = summarizeResults(ruResults);
  const foreignSum = summarizeResults(foreignResults);
  const totalSum = summarizeResults(allResults);

  summaryEl.innerHTML =
    '<div class="stat"><span class="stat__value">' + totalSum.ok + '/' + totalSum.total + '</span><span class="stat__label">отвечают</span></div>' +
    '<div class="stat"><span class="stat__value stat__value--blocked">' + totalSum.blocked + '</span><span class="stat__label">без ответа</span></div>' +
    '<div class="stat"><span class="stat__value">' + (totalSum.avgLatency ?? '—') + '</span><span class="stat__label">ср. задержка, мс</span></div>' +
    '<div class="stat stat--split">' +
    '<span>🇷🇺 ' + ruSum.ok + '/' + ruSum.total + '</span>' +
    '<span>🌍 ' + foreignSum.ok + '/' + foreignSum.total + '</span>' +
    '</div>';
  summaryEl.classList.remove('hidden');
}

function refreshGrids() {
  const ruCount = renderResults(allResults.filter((r) => r.region === 'ru'), ruGrid);
  const foreignCount = renderResults(allResults.filter((r) => r.region === 'foreign'), foreignGrid);
  document.getElementById('ru-count').textContent = ruCount;
  document.getElementById('foreign-count').textContent = foreignCount;
}

async function runCheck() {
  progressText.textContent = 'Проверяем подключение...';
  startBtn.disabled = true;

  let fresh;
  try {
    fresh = await refreshVerification();
  } catch {
    progressText.textContent = 'Ошибка связи с сервером';
    startBtn.disabled = false;
    return;
  }

  if (!fresh?.allowed) {
    startBtn.disabled = true;
    return;
  }

  scanInProgress = true;
  startBtn.textContent = 'Проверка...';
  clearPersistedResults();
  allResults = buildCatalog();
  summaryEl.classList.add('hidden');
  progressBar.style.width = '0%';
  progressText.textContent = 'Подготовка...';
  refreshGrids();

  const ruTagged = RU_SERVICES.map((s) => ({ ...s, region: 'ru' }));
  const foreignTagged = FOREIGN_SERVICES.map((s) => ({ ...s, region: 'foreign' }));
  const allServices = [...ruTagged, ...foreignTagged];
  const total = allServices.length;

  await checkAllServices(allServices, (completed, _total, batchResults) => {
    mergeBatchResults(batchResults);
    const pct = Math.round((completed / total) * 100);
    progressBar.style.width = pct + '%';
    progressText.textContent = 'Проверено ' + completed + ' из ' + total;
    refreshGrids();
  });

  const summary = summarizeResults(allResults);
  updateSummary();
  refreshGrids();

  reportResults(verifyData.sessionId, verifyData.geo, verifyData.network, summary).catch(() => {});

  persistResults(true);
  scanInProgress = false;
  startBtn.disabled = false;
  startBtn.textContent = 'Проверить снова';
  progressText.textContent = 'Готово · результат сохранён для статистики';
}

function updateTabVisibility() {
  const ruSection = document.getElementById('ru-section');
  const foreignSection = document.getElementById('foreign-section');
  ruSection.classList.toggle('hidden', currentTab === 'foreign');
  foreignSection.classList.toggle('hidden', currentTab === 'ru');
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    updateTabVisibility();
  });
});

filterInput.addEventListener('input', refreshGrids);
filterStatus.addEventListener('change', refreshGrids);
ruGrid.addEventListener('click', onGridClick);
foreignGrid.addEventListener('click', onGridClick);
startBtn.addEventListener('click', runCheck);

const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
if (conn) {
  conn.addEventListener('change', () => {
    refreshVerification().catch(() => {});
  });
}
window.addEventListener('online', () => {
  refreshVerification().catch(() => {});
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    refreshVerification().catch(() => {});
  }
});

async function init() {
  networkBanner.className = 'banner banner--loading';
  networkBanner.innerHTML = '<strong>Определяем регион и тип подключения...</strong>';
  startBtn.disabled = true;

  try {
    verifyData = await verifyAccess();
    lastConnectionKey = connectionKey(verifyData);
    initNetworkBanner(verifyData);
  } catch {
    networkBanner.className = 'banner banner--warn';
    networkBanner.innerHTML =
      '<strong>⚠ Ошибка</strong><br>Не удалось связаться с сервером. Проверьте подключение и обновите страницу.';
    startBtn.disabled = true;
  }

  updateTabVisibility();
  document.getElementById('ru-total').textContent = RU_SERVICES.length;
  document.getElementById('foreign-total').textContent = FOREIGN_SERVICES.length;
}

init();
