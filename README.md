# Latency Lab

Проверка доступности российских и зарубежных сервисов **с устройства пользователя**.

## Особенности

- ~125 российских + ~57 зарубежных сервисов
- Запросы к сервисам идут из браузера клиента
- **Регион** определяется по IP (город, область, страна) — для статистики
- **Доступ только с мобильных ASN** (МТС, МегаФон, Билайн, Tele2, Yota и др.)
- **Блокировка VPN/прокси/хостинга** через ipwho.is security API
- Дополнительно: браузер должен сообщать `cellular` (4G/5G)

## Установка на сервер Ubuntu

Требования: Ubuntu 22.04 / 24.04, root или sudo, домен (для HTTPS).

### 1. Подготовка сервера

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ca-certificates
```

### 2. Установка Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

Проверка: `docker --version` и `docker compose version`.

### 3. Клонирование проекта

```bash
cd /opt
sudo git clone https://github.com/Daysema/Latency-Lab-Test.git latency-lab
sudo chown -R $USER:$USER latency-lab
cd latency-lab
```

### 4. Настройка домена и HTTPS

1. В панели DNS создайте **A-запись** домена на IP сервера.
2. Откройте порты в файрволе:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

3. Создайте файл окружения:

```bash
cp .env.example .env
nano .env
```

Пример для продакшена:

```env
DOMAIN=latencylab.example.com
ACME_EMAIL=admin@example.com
HTTP_PORT=80
```

### 5. Запуск

```bash
docker compose up -d --build
docker compose ps
```

Сайт: `https://ваш-домен.ru`  
Статистика: `https://ваш-домен.ru/api/stats`

### 6. Обновление

```bash
cd /opt/latency-lab
git pull
docker compose up -d --build
```

### 7. Полезные команды

```bash
# Логи
docker compose logs -f

# Перезапуск
docker compose restart

# Остановка
docker compose down

# Бэкап статистики
docker run --rm -v latency-lab-test_stats_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/stats-backup.tar.gz -C /data .
```

---

## Запуск

### Локально (без домена)

```bash
cp .env.example .env
docker compose up -d --build
```

- Сайт: http://localhost:8080
- Статистика: http://localhost:8080/api/stats

### Продакшен (домен + HTTPS)

1. Направьте DNS A-запись домена на IP сервера
2. Откройте порты **80** и **443**
3. Настройте `.env`:

```env
DOMAIN=latencylab.example.com
ACME_EMAIL=admin@example.com
HTTP_PORT=80
```

4. Запустите:

```bash
docker compose up -d --build
```

Caddy автоматически получит сертификат Let's Encrypt и будет обновлять его.

Для домена с `www` укажите оба: `DOMAIN=example.com, www.example.com`

## HTTPS и Caddy

- **Caddy** — reverse proxy, статика и автоматические TLS-сертификаты
- Сертификаты хранятся в Docker volume `caddy_data`
- Локально (`DOMAIN=http://localhost`) — только HTTP, без сертификата
- На реальном домене — автоматический HTTPS с редиректом HTTP → HTTPS

## Как работает проверка доступа

1. Клиент отправляет тип сети (`wifi` / `cellular`) в `POST /api/verify`
2. Сервер определяет IP → регион, ASN, ISP
3. Проверки:
   - ASN в списке мобильных операторов (или ISP по ключевым словам)
   - Нет VPN / proxy / Tor / hosting
   - Браузер сообщает сотовую сеть (`cellular`)
4. Если всё ок — выдаётся `sessionId`, показывается регион
5. После проверки сервисов результат сохраняется в SQLite (`POST /api/report`)

## Статистика

Данные в volume `stats_data` → `/data/stats.db`:

- Регион (страна, область, город)
- ASN оператора
- Сколько сервисов доступно / заблокировано
- Разбивка RU / зарубежные

Просмотр агрегатов: `GET /api/stats`

## Структура

```
├── docker-compose.yml      # caddy + api (node)
├── Caddyfile               # домен, HTTPS, прокси /api
├── .env.example            # DOMAIN, ACME_EMAIL, HTTP_PORT
├── server/
│   ├── index.js            # API
│   ├── mobile-asns.js      # allowlist ASN операторов
│   ├── ip-lookup.js        # IP → регион, ASN, VPN
│   └── db.js               # SQLite статистика
└── public/                 # фронтенд
```

## Важно

- Откройте на **телефоне** с **отключённым Wi-Fi и VPN**
- VPN поверх мобильной сети будет заблокирован по флагу `security.vpn`
- Wi-Fi дома заблокируется и по ASN (провайдер), и по типу сети в браузере
- Список ASN в `server/mobile-asns.js` — при необходимости дополняйте
