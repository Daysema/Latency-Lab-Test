const CHECK_TIMEOUT_MS = 8000;
const CONCURRENT_CHECKS = 6;

function uniqueUrls(urls) {
  const seen = new Set();
  return urls.filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function probeFetch(url, timeout) {
  return new Promise((resolve) => {
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, timeout);

    fetch(url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal })
      .then(() => {
        clearTimeout(timer);
        resolve(Math.round(performance.now() - start));
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });
}

function probeImage(url, timeout) {
  return new Promise((resolve) => {
    const start = performance.now();
    const timer = setTimeout(() => resolve(null), timeout);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timer);
      resolve(Math.round(performance.now() - start));
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url + (url.includes('?') ? '&' : '?') + 'probe=' + Date.now();
  });
}

/**
 * Проверяет доступность с устройства пользователя несколькими способами:
 * fetch(no-cors) к сайту и favicon. Успех — если хотя бы один ответил.
 */
export async function checkService(service) {
  const start = performance.now();
  const urls = uniqueUrls([service.url, service.checkUrl]);
  const timeout = CHECK_TIMEOUT_MS;

  const probes = urls.flatMap((url) => [
    probeFetch(url, timeout),
    probeImage(url, timeout),
  ]);

  const results = await Promise.all(
    probes.map((p) =>
      p.then((latency) => (latency != null ? latency : Promise.reject())),
    ),
  ).catch(() => []);

  // Promise.all with reject - wrong. Use Promise.any:
  let latency = null;
  try {
    latency = await Promise.any(
      probes.map((p) =>
        p.then((ms) => (ms != null ? ms : Promise.reject(new Error('fail')))),
      ),
    );
  } catch {
    latency = null;
  }

  if (latency != null) {
    return { ...service, status: 'ok', latency };
  }

  return {
    ...service,
    status: 'blocked',
    latency: Math.round(performance.now() - start),
  };
}

/**
 * Проверяет список сервисов с ограничением параллельности.
 */
export async function checkAllServices(services, onProgress) {
  const results = [];
  let completed = 0;

  for (let i = 0; i < services.length; i += CONCURRENT_CHECKS) {
    const batch = services.slice(i, i + CONCURRENT_CHECKS);
    const batchResults = await Promise.all(batch.map(checkService));
    results.push(...batchResults);
    completed += batch.length;
    if (onProgress) onProgress(completed, services.length, batchResults);
  }

  return results;
}

export function summarizeResults(results) {
  const ok = results.filter((r) => r.status === 'ok').length;
  const blocked = results.filter((r) => r.status === 'blocked').length;
  const latencies = results.filter((r) => r.status === 'ok' && r.latency != null).map((r) => r.latency);
  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;

  const ru = results.filter((r) => r.region === 'ru');
  const foreign = results.filter((r) => r.region === 'foreign');
  const ruOk = ru.filter((r) => r.status === 'ok').length;
  const ruBlocked = ru.filter((r) => r.status === 'blocked').length;
  const foreignOk = foreign.filter((r) => r.status === 'ok').length;
  const foreignBlocked = foreign.filter((r) => r.status === 'blocked').length;

  return { total: results.length, ok, blocked, avgLatency, ruOk, ruBlocked, foreignOk, foreignBlocked };
}
