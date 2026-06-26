import { getClientNetworkType } from './network.js';

export async function verifyAccess() {
  const client = getClientNetworkType();
  const res = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientNetworkType: client.type }),
  });

  if (!res.ok && res.status === 503) {
    const data = await res.json();
    return { allowed: false, client, message: data.message, reason: data.reason };
  }

  const data = await res.json();
  return { ...data, client };
}

export async function reportResults(sessionId, geo, network, summary) {
  await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, geo, network, summary }),
  });
}
