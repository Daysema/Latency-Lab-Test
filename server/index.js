import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { initDb, saveSession, saveReport, getStatsSummary } from './db.js';
import { lookupIp, evaluateAccess, getClientIp } from './ip-lookup.js';

const PORT = process.env.PORT || 3000;
const app = express();
const db = initDb();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

/**
 * Проверка доступа: регион, ASN, VPN/proxy.
 * Клиент передаёт clientNetworkType из Network Information API.
 */
app.post('/api/verify', async (req, res) => {
  try {
    const clientNetworkType = req.body?.clientNetworkType || 'unknown';
    const clientIp = getClientIp(req);
    const lookup = await lookupIp(clientIp);
    const access = evaluateAccess(lookup, clientNetworkType);
    const sessionId = uuidv4();

    saveSession(db, {
      sessionId,
      country: lookup.country,
      countryCode: lookup.countryCode,
      region: lookup.region,
      city: lookup.city,
      asn: lookup.asn,
      asnOrg: lookup.asnOrg,
      isp: lookup.isp,
      clientNetworkType,
      allowed: access.allowed ? 1 : 0,
      blockReason: access.reason,
    });

    res.json({
      sessionId,
      allowed: access.allowed,
      reason: access.reason,
      message: access.message,
      geo: {
        country: lookup.country,
        countryCode: lookup.countryCode,
        region: lookup.region,
        city: lookup.city,
      },
      network: {
        asn: lookup.asn,
        operator: access.operator,
        isp: lookup.isp,
        mobileAsn: access.mobileAsn,
        cellularClient: access.cellularClient,
      },
      security: lookup.security,
    });
  } catch (err) {
    console.error('verify error:', err.message);
    res.status(503).json({
      allowed: false,
      reason: 'lookup_failed',
      message: 'Не удалось определить ваше подключение. Попробуйте обновить страницу.',
    });
  }
});

/**
 * Сохранение результатов проверки для статистики по регионам.
 */
app.post('/api/report', (req, res) => {
  const { sessionId, geo, network, summary } = req.body || {};

  if (!sessionId || !summary) {
    return res.status(400).json({ error: 'sessionId and summary required' });
  }

  const session = db.prepare('SELECT allowed FROM check_sessions WHERE session_id = ?').get(sessionId);
  if (!session || !session.allowed) {
    return res.status(403).json({ error: 'invalid session' });
  }

  saveReport(db, {
    sessionId,
    country: geo?.country || null,
    countryCode: geo?.countryCode || null,
    region: geo?.region || null,
    city: geo?.city || null,
    asn: network?.asn ?? null,
    totalServices: summary.total,
    available: summary.ok,
    blocked: summary.blocked,
    avgLatency: summary.avgLatency,
    ruAvailable: summary.ruOk,
    ruBlocked: summary.ruBlocked,
    foreignAvailable: summary.foreignOk,
    foreignBlocked: summary.foreignBlocked,
  });

  res.json({ ok: true });
});

/** Агрегированная статистика по регионам (для администратора) */
app.get('/api/stats', (_req, res) => {
  const byRegion = getStatsSummary(db);
  const totals = db.prepare(`
    SELECT COUNT(*) AS total_checks,
           COUNT(DISTINCT country_code || ':' || region) AS regions
    FROM check_reports
  `).get();

  res.json({ totals, byRegion });
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
