/**
 * Тип подключения на стороне клиента (Network Information API).
 * Решение о доступе принимает сервер (блокируется только VPN/прокси).
 */
export function getClientNetworkType() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const ua = navigator.userAgent;
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);

  if (!conn) {
    return { type: 'unknown', label: 'Неизвестно', isMobileDevice, effectiveType: '', downlink: null };
  }

  const typeLabels = {
    cellular: 'Мобильная сеть',
    wifi: 'Wi-Fi',
    ethernet: 'Ethernet',
    wimax: 'WiMAX',
    bluetooth: 'Bluetooth',
    none: 'Нет сети',
    other: 'Другое',
    unknown: 'Неизвестно',
  };

  return {
    type: conn.type || 'unknown',
    label: typeLabels[conn.type] || conn.type || 'Неизвестно',
    isMobileDevice,
    effectiveType: conn.effectiveType || '',
    downlink: conn.downlink ?? null,
    rtt: conn.rtt ?? null,
  };
}
