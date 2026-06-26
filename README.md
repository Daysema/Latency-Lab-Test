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

1. В панели DNS создайте **A-запись** субдомена на IP сервера:

```
test.latencylab.ru  →  A  →  IP_ВАШЕГО_СЕРВЕРА
```

2. Дождитесь применения DNS (проверка):

```bash
dig +short test.latencylab.ru
# должен вернуть IP сервера, например 217.16.31.206
```

3. Откройте порты в файрволе **и в панели облака** (Security Groups):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

4. Создайте файл окружения:

```bash
cp .env.example .env
nano .env
```

Пример для продакшена:

```env
DOMAIN=test.latencylab.ru
ACME_EMAIL=forsworn657@yandex.ru
```

> `DOMAIN` — без `http://` и без `https://`. Порты **80** и **443** на сервере должны быть свободны.

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
# В .env: DOMAIN=http://localhost
cp docker-compose.override.example.yml docker-compose.override.yml
docker compose up -d --build
```

- Сайт: http://localhost:8080
- Статистика: http://localhost:8080/api/stats

### Продакшен (домен + HTTPS)

1. DNS A-запись → IP сервера (см. раздел «Установка на Ubuntu»)
2. Порты **80** и **443** открыты (ufw + панель хостинга)
3. Настройте `.env`:

```env
DOMAIN=test.latencylab.ru
ACME_EMAIL=your@email.com
```

4. Запустите:

```bash
docker compose up -d --build
```

Caddy автоматически получит сертификат Let's Encrypt.

Для домена с `www`: `DOMAIN=example.com, www.example.com`

## Устранение ошибок HTTPS (Caddy / Let's Encrypt)

### `NXDOMAIN looking up A for test.latencylab.ru`

DNS-запись ещё не создана или не применилась. Создайте A-запись в панели регистратора и подождите 5–30 минут.

```bash
dig +short test.latencylab.ru   # должен показать IP сервера
```

### `Connection refused` на порту 80

Let's Encrypt не может достучаться до сервера по HTTP.

```bash
# Проверка, что Caddy слушает порты
ss -tlnp | grep -E ':80|:443'

# Проверка с сервера
curl -I http://127.0.0.1

# Проверка .env — DOMAIN без http://
cat .env

# Убедитесь, что порт 80 не занят другим процессом
sudo lsof -i :80
```

Также откройте порты 80/443 в **панели облачного провайдера** (отдельно от ufw).

### После исправления DNS/портов

```bash
cd /opt/latency-lab
git pull
docker compose down
docker compose up -d --build
docker compose logs -f caddy
```

Успешная выдача сертификата в логах:

```
certificate obtained successfully  identifier=test.latencylab.ru
```

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
├── .env.example            # DOMAIN, ACME_EMAIL
├── docker-compose.override.example.yml  # локально: порт 8080
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
