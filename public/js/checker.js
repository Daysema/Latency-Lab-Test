const CHECK_TIMEOUT_MS = 4000;
const CONCURRENT_CHECKS = 6;

function uniqueUrls(urls) {
  const seen = new Set();
  return urls.filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function isImagePath(url) {
  return /\.(ico|png|jpg|jpeg|gif|svg|webp)(\?|$)/i.test(url);
}

export function getProbeUrls(service) {
  const urls = [];
  if (service.checkUrls) urls.push(...service.checkUrls);
  if (service.checkUrl) urls.push(service.checkUrl);

  try {
    const { origin } = new URL(service.url);
    urls.push(
      `${origin}/favicon.ico`,
      `${origin}/favicon.png`,
      `${origin}/favicon.svg`,
      `${origin}/apple-touch-icon.png`,
      `${origin}/robots.txt`,
    );
  } catch {
    /* ignore */
  }

  return uniqueUrls(urls);
}

function probeFetch(url, timeout) {
  return new Promise((resolve) => {
    const start = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, timeout);

    fetch(url, {
      mode: 'no-cors',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    })
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
    img.referrerPolicy = 'no-referrer';
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

function probeIframe(url, timeout) {
  return new Promise((resolve) => {
    const start = performance.now();
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden';
    iframe.referrerPolicy = 'no-referrer';

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      iframe.remove();
      resolve(ok ? Math.round(performance.now() - start) : null);
    };

    const timer = setTimeout(() => finish(false), timeout);
    iframe.onload = () => finish(true);
    iframe.onerror = () => finish(false);
    iframe.src = url;
    document.body.appendChild(iframe);
  });
}

function runStaticProbes(urls, timeout) {
  const probes = urls.flatMap((url) => {
    if (isImagePath(url)) return [probeImage(url, timeout)];
    return [probeFetch(url, timeout), probeImage(url, timeout)];
  });

  return Promise.any(
    probes.map((p) => p.then((ms) => (ms != null ? ms : Promise.reject()))),
  );
}

/**
 * Проверка с устройства: статические ресурсы (favicon, robots.txt),
 * затем fallback через скрытый iframe на главную страницу.
 */
export async function checkService(service) {
  const timeout = CHECK_TIMEOUT_MS;
  const staticUrls = getProbeUrls(service);

  let latency = null;

  try {
    latency = await runStaticProbes(staticUrls, timeout);
  } catch {
    try {
      latency = await probeIframe(service.url, timeout);
    } catch {
      latency = null;
    }
  }

  if (latency != null) {
    return { ...service, status: 'ok', latency };
  }

  return { ...service, status: 'blocked', latency: null };
}

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
