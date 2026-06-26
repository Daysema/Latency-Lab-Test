const CHECK_TIMEOUT_MS = 8000;
const CONCURRENT_CHECKS = 6;

/**
 * Проверяет доступность одного сервиса с устройства пользователя.
 * Использует загрузку favicon и fetch(no-cors) — запрос идёт из браузера клиента.
 */
export function checkService(service) {
  return new Promise((resolve) => {
    const start = performance.now();
    let settled = false;

    const finish = (status, latency) => {
      if (settled) return;
      settled = true;
      resolve({
        ...service,
        status,
        latency: latency != null ? Math.round(latency) : null,
      });
    };

    const timeout = setTimeout(() => finish('blocked', CHECK_TIMEOUT_MS), CHECK_TIMEOUT_MS);

    const img = new Image();
    img.onload = () => {
      clearTimeout(timeout);
      finish('ok', performance.now() - start);
    };
    img.onerror = () => {
      fetch(service.checkUrl, { mode: 'no-cors', cache: 'no-store' })
        .then(() => {
          clearTimeout(timeout);
          finish('ok', performance.now() - start);
        })
        .catch(() => {
          clearTimeout(timeout);
          finish('blocked', performance.now() - start);
        });
    };
    img.src = service.checkUrl + '?t=' + Date.now();
  });
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
