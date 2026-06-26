import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = process.env.DB_PATH || '/data/stats.db';

export function initDb() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS check_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      country TEXT,
      country_code TEXT,
      region TEXT,
      city TEXT,
      asn INTEGER,
      asn_org TEXT,
      isp TEXT,
      client_network_type TEXT,
      allowed INTEGER NOT NULL DEFAULT 0,
      block_reason TEXT
    );

    CREATE TABLE IF NOT EXISTS check_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      country TEXT,
      country_code TEXT,
      region TEXT,
      city TEXT,
      asn INTEGER,
      total_services INTEGER,
      available INTEGER,
      blocked INTEGER,
      avg_latency INTEGER,
      ru_available INTEGER,
      ru_blocked INTEGER,
      foreign_available INTEGER,
      foreign_blocked INTEGER,
      FOREIGN KEY (session_id) REFERENCES check_sessions(session_id)
    );

    CREATE INDEX IF NOT EXISTS idx_reports_region ON check_reports(country_code, region);
    CREATE INDEX IF NOT EXISTS idx_reports_created ON check_reports(created_at);
  `);

  return db;
}

export function saveSession(db, data) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO check_sessions
      (session_id, country, country_code, region, city, asn, asn_org, isp,
       client_network_type, allowed, block_reason)
    VALUES
      (@sessionId, @country, @countryCode, @region, @city, @asn, @asnOrg, @isp,
       @clientNetworkType, @allowed, @blockReason)
  `);
  stmt.run(data);
}

export function saveReport(db, data) {
  const stmt = db.prepare(`
    INSERT INTO check_reports
      (session_id, country, country_code, region, city, asn,
       total_services, available, blocked, avg_latency,
       ru_available, ru_blocked, foreign_available, foreign_blocked)
    VALUES
      (@sessionId, @country, @countryCode, @region, @city, @asn,
       @totalServices, @available, @blocked, @avgLatency,
       @ruAvailable, @ruBlocked, @foreignAvailable, @foreignBlocked)
  `);
  stmt.run(data);
}

export function getStatsSummary(db) {
  return db.prepare(`
    SELECT
      country_code,
      region,
      COUNT(*) AS checks_count,
      ROUND(AVG(available * 100.0 / NULLIF(total_services, 0)), 1) AS avg_availability_pct
    FROM check_reports
    GROUP BY country_code, region
    ORDER BY checks_count DESC
    LIMIT 50
  `).all();
}
