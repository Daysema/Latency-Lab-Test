import { RU_SERVICES, FOREIGN_SERVICES } from './services.js';
import { checkAllServices, summarizeResults } from './checker.js';
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

function formatRegion(geo) {
  if (!geo) return '';
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.join(', ');
}

function initNetworkBanner(data) {
  const client = data.client;
  let clientDetails = '';

  if (client) {
    const parts = [];
    if (client.label) parts.push(client.label);
    if (client.effectiveType) parts.push(client.effectiveType);
    if (client.downlink) parts.push('↓ ' + client.downlink + ' Мбит/с');
    if (parts.length) clientDetails = parts.join(' · ');
  }

  if (data.allowed) {
    networkBanner.className = 'banner banner--ok';
    networkBanner.innerHTML =
      '<strong>✓ Доступ разрешён</strong> — проверка с вашего устройства' +
      (clientDetails ? '<br><small>' + escapeHtml(clientDetails) + '</small>' : '');

    const regionText = formatRegion(data.geo);
    const operator = data.network?.operator;
    regionInfo.className = 'region-info';
    regionInfo.classList.remove('hidden');
    regionInfo.innerHTML =
      '<div class="region-info__item"><span class="region-info__label">Регион</span><span class="region-info__value">' + escapeHtml(regionText || '—') + '</span></div>' +
      '<div class="region-info__item"><span class="region-info__label">Оператор</span><span class="region-info__value">' + escapeHtml(operator || '—') + '</span></div>' +
      '<div class="region-info__item"><span class="region-info__label">ASN</span><span class="region-info__value">AS' + escapeHtml(String(data.network?.asn || '—')) + '</span></div>';

    mainContent.classList.remove('hidden');
    startBtn.disabled = false;
  } else {
    networkBanner.className = 'banner banner--warn';
    let extra = '';

    if (data.reason === 'asn' && data.network) {
      extra = '<br><small>ASN: AS' + escapeHtml(String(data.network.asn || '?')) +
        ' · ' + escapeHtml(data.network.isp || data.network.operator || '') + '</small>';
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
      escapeHtml(data.message || 'Подключитесь к мобильной сети оператора без VPN.') +
      extra;

    if (data.geo) {
      regionInfo.className = 'region-info region-info--muted';
      regionInfo.classList.remove('hidden');
      regionInfo.innerHTML =
        '<div class="region-info__item"><span class="region-info__label">Ваш регион</span><span class="region-info__value">' +
        escapeHtml(formatRegion(data.geo)) + '</span></div>';
    }

    startBtn.disabled = true;
  }
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

  const statusText = result.status === 'ok' ? 'Доступен' : 'Недоступен';
  const latencyText = result.latency != null ? result.latency + ' мс' : '—';

  card.innerHTML =
    '<div class="service-card__header">' +
    '<span class="service-card__name">' + escapeHtml(result.name) + '</span>' +
    '<span class="service-card__badge">' + statusText + '</span>' +
    '</div>' +
    '<div class="service-card__meta">' +
    '<span class="service-card__category">' + escapeHtml(result.category) + '</span>' +
    '<span class="service-card__latency">' + latencyText + '</span>' +
    '</div>' +
    '<a class="service-card__link" href="' + escapeHtml(result.url) + '" target="_blank" rel="noopener">Открыть →</a>';

  return card;
}

function renderResults(results, grid) {
  grid.innerHTML = '';
  const filtered = applyFilters(results);
  filtered.forEach((r) => grid.appendChild(createCard(r)));
  return filtered.length;
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
    '<div class="stat"><span class="stat__value">' + totalSum.ok + '/' + totalSum.total + '</span><span class="stat__label">доступно</span></div>' +
    '<div class="stat"><span class="stat__value stat__value--blocked">' + totalSum.blocked + '</span><span class="stat__label">недоступно</span></div>' +
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
  if (!verifyData?.allowed) return;

  startBtn.disabled = true;
  startBtn.textContent = 'Проверка...';
  allResults = [];
  summaryEl.classList.add('hidden');
  ruGrid.innerHTML = '';
  foreignGrid.innerHTML = '';
  progressBar.style.width = '0%';
  progressText.textContent = 'Подготовка...';

  const ruTagged = RU_SERVICES.map((s) => ({ ...s, region: 'ru' }));
  const foreignTagged = FOREIGN_SERVICES.map((s) => ({ ...s, region: 'foreign' }));
  const allServices = [...ruTagged, ...foreignTagged];
  const total = allServices.length;

  await checkAllServices(allServices, (completed, _total, batchResults) => {
    allResults.push(...batchResults);
    const pct = Math.round((completed / total) * 100);
    progressBar.style.width = pct + '%';
    progressText.textContent = 'Проверено ' + completed + ' из ' + total;

    batchResults.forEach((r) => {
      const grid = r.region === 'ru' ? ruGrid : foreignGrid;
      grid.appendChild(createCard(r));
    });
  });

  const summary = summarizeResults(allResults);
  updateSummary();
  refreshGrids();

  reportResults(verifyData.sessionId, verifyData.geo, verifyData.network, summary).catch(() => {});

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
startBtn.addEventListener('click', runCheck);

if (navigator.connection) {
  navigator.connection.addEventListener('change', () => location.reload());
}

async function init() {
  networkBanner.className = 'banner banner--loading';
  networkBanner.innerHTML = '<strong>Определяем регион и тип подключения...</strong>';
  startBtn.disabled = true;

  try {
    verifyData = await verifyAccess();
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
