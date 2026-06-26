import { isMobileAsn, getMobileAsnName, matchesMobileIsp } from './mobile-asns.js';

const LOOKUP_TIMEOUT_MS = 5000;

/**
 * Определяет IP, регион и ASN через ipwho.is (бесплатно, без ключа).
 * Также возвращает флаги VPN/proxy/hosting.
 */
export async function lookupIp(ip) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const url = ip
      ? `https://ipwho.is/${ip}?security=1`
      : 'https://ipwho.is/?security=1';

    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'IP lookup failed');
    }

    return {
      ip: data.ip,
      country: data.country,
      countryCode: data.country_code,
      region: data.region,
      city: data.city,
      asn: data.connection?.asn ?? null,
      asnOrg: data.connection?.org ?? null,
      isp: data.connection?.isp ?? null,
      security: {
        vpn: Boolean(data.security?.vpn),
        proxy: Boolean(data.security?.proxy),
        tor: Boolean(data.security?.tor),
        hosting: Boolean(data.security?.hosting),
        relay: Boolean(data.security?.relay),
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Решает, разрешена ли проверка для данного IP.
 */
export function evaluateAccess(lookup, clientNetworkType) {
  const reasons = [];
  const asn = lookup.asn;
  const mobileAsn = isMobileAsn(asn);
  const mobileIsp = matchesMobileIsp(lookup.isp, lookup.asnOrg);
  const cellularClient = clientNetworkType === 'cellular';

  if (lookup.security.vpn) reasons.push('vpn');
  if (lookup.security.proxy) reasons.push('proxy');
  if (lookup.security.tor) reasons.push('tor');
  if (lookup.security.hosting) reasons.push('hosting');
  if (lookup.security.relay) reasons.push('relay');

  if (reasons.length > 0) {
    return {
      allowed: false,
      reason: 'security',
      message: buildSecurityMessage(reasons),
      mobileAsn,
      mobileIsp,
      cellularClient,
      operator: getMobileAsnName(asn) || lookup.asnOrg,
    };
  }

  if (!mobileAsn && !mobileIsp) {
    return {
      allowed: false,
      reason: 'asn',
      message: `Ваш IP (AS${asn || '?'}, ${lookup.isp || lookup.asnOrg || 'неизвестно'}) не принадлежит мобильному оператору. Подключитесь к мобильной сети (4G/5G), отключите Wi-Fi и VPN.`,
      mobileAsn: false,
      mobileIsp: false,
      cellularClient,
      operator: lookup.asnOrg || lookup.isp,
    };
  }

  if (!cellularClient && clientNetworkType !== 'unknown') {
    return {
      allowed: false,
      reason: 'client_network',
      message: 'Браузер сообщает, что вы не в сотовой сети. Отключите Wi-Fi, подключитесь к 4G/5G и обновите страницу.',
      mobileAsn,
      mobileIsp,
      cellularClient: false,
      operator: getMobileAsnName(asn) || lookup.asnOrg,
    };
  }

  return {
    allowed: true,
    reason: null,
    message: null,
    mobileAsn,
    mobileIsp,
    cellularClient,
    operator: getMobileAsnName(asn) || lookup.asnOrg || lookup.isp,
  };
}

function buildSecurityMessage(flags) {
  const labels = {
    vpn: 'VPN',
    proxy: 'прокси',
    tor: 'Tor',
    hosting: 'хостинг/дата-центр',
    relay: 'iCloud Relay / анонимайзер',
  };
  const detected = flags.map((f) => labels[f] || f).join(', ');
  return `Обнаружено подключение через ${detected}. Отключите VPN/прокси и подключитесь напрямую к мобильной сети оператора.`;
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) return realIp.trim();
  return req.socket.remoteAddress?.replace(/^::ffff:/, '') || null;
}
