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
 * Определяет тип подключения для отображения пользователю.
 * Тип из браузера (wifi/cellular/ethernet) имеет приоритет над ASN.
 */
export function resolveConnectionProfile(lookup, clientNetworkType) {
  const mobileAsn = isMobileAsn(lookup.asn) || matchesMobileIsp(lookup.isp, lookup.asnOrg);
  const provider = lookup.isp || lookup.asnOrg || 'неизвестный провайдер';
  const mobileOperator = getMobileAsnName(lookup.asn) || lookup.asnOrg || lookup.isp || provider;

  const base = { provider, mobileAsn };

  if (clientNetworkType === 'wifi') {
    return {
      ...base,
      kind: 'wifi',
      kindLabel: 'Wi-Fi',
      operator: provider,
      cellularClient: false,
    };
  }

  if (clientNetworkType === 'ethernet') {
    return {
      ...base,
      kind: 'wired',
      kindLabel: 'Проводной интернет',
      operator: provider,
      cellularClient: false,
    };
  }

  if (clientNetworkType === 'cellular') {
    if (!mobileAsn) {
      return {
        ...base,
        kind: 'wifi',
        kindLabel: 'Wi-Fi',
        operator: provider,
        cellularClient: false,
      };
    }
    return {
      ...base,
      kind: 'mobile',
      kindLabel: 'Мобильная сеть',
      operator: mobileOperator,
      cellularClient: true,
    };
  }

  if (mobileAsn) {
    return {
      ...base,
      kind: 'mobile',
      kindLabel: 'Мобильная сеть',
      operator: mobileOperator,
      cellularClient: false,
    };
  }

  return {
    ...base,
    kind: 'wired',
    kindLabel: 'Проводной интернет',
    operator: provider,
    cellularClient: false,
  };
}

/**
 * Разрешает проверку из любой страны.
 * Блокирует только VPN, прокси, Tor и хостинг.
 */
export function evaluateAccess(lookup, clientNetworkType) {
  const reasons = [];
  const profile = resolveConnectionProfile(lookup, clientNetworkType);

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
      connection: profile,
      operator: profile.operator,
    };
  }

  return {
    allowed: true,
    reason: null,
    message: null,
    connection: profile,
    operator: profile.operator,
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
  return `Обнаружено подключение через ${detected}. Отключите VPN/прокси для точной проверки вашего реального провайдера.`;
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
