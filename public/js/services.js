// Список сервисов для проверки доступности с устройства пользователя
// checkUrl — лёгкий ресурс (favicon), доступный для cross-origin проверки

export const RU_SERVICES = [
  // Банки
  { name: 'Сбербанк', category: 'Банки', url: 'https://www.sberbank.ru', checkUrl: 'https://www.sberbank.ru/favicon.ico' },
  { name: 'Тинькофф', category: 'Банки', url: 'https://www.tinkoff.ru', checkUrl: 'https://www.tinkoff.ru/favicon.ico' },
  { name: 'ВТБ', category: 'Банки', url: 'https://www.vtb.ru', checkUrl: 'https://www.vtb.ru/favicon.ico' },
  { name: 'Альфа-Банк', category: 'Банки', url: 'https://alfabank.ru', checkUrl: 'https://alfabank.ru/favicon.ico' },
  { name: 'Газпромбанк', category: 'Банки', url: 'https://www.gazprombank.ru', checkUrl: 'https://www.gazprombank.ru/favicon.ico' },
  { name: 'Райффайзен', category: 'Банки', url: 'https://www.raiffeisen.ru', checkUrl: 'https://www.raiffeisen.ru/favicon.ico' },
  { name: 'Росбанк', category: 'Банки', url: 'https://www.rosbank.ru', checkUrl: 'https://www.rosbank.ru/favicon.ico' },
  { name: 'Почта Банк', category: 'Банки', url: 'https://www.pochtabank.ru', checkUrl: 'https://www.pochtabank.ru/favicon.ico' },
  { name: 'МКБ', category: 'Банки', url: 'https://mkb.ru', checkUrl: 'https://mkb.ru/favicon.ico' },
  { name: 'Совкомбанк', category: 'Банки', url: 'https://sovcombank.ru', checkUrl: 'https://sovcombank.ru/favicon.ico' },
  { name: 'Россельхозбанк', category: 'Банки', url: 'https://www.rshb.ru', checkUrl: 'https://www.rshb.ru/favicon.ico' },
  { name: 'Уралсиб', category: 'Банки', url: 'https://www.uralsib.ru', checkUrl: 'https://www.uralsib.ru/favicon.ico' },
  { name: 'Промсвязьбанк', category: 'Банки', url: 'https://www.psbank.ru', checkUrl: 'https://www.psbank.ru/favicon.ico' },
  { name: 'Ренессанс Кредит', category: 'Банки', url: 'https://rencredit.ru', checkUrl: 'https://rencredit.ru/favicon.ico' },
  { name: 'Хоум Кредит', category: 'Банки', url: 'https://www.homecredit.ru', checkUrl: 'https://www.homecredit.ru/favicon.ico' },
  { name: 'ЮниКредит', category: 'Банки', url: 'https://www.unicreditbank.ru', checkUrl: 'https://www.unicreditbank.ru/favicon.ico' },
  { name: 'Ак Барс', category: 'Банки', url: 'https://www.akbars.ru', checkUrl: 'https://www.akbars.ru/favicon.ico' },
  { name: 'Банк Санкт-Петербург', category: 'Банки', url: 'https://www.bspb.ru', checkUrl: 'https://www.bspb.ru/favicon.ico' },
  { name: 'МТС Банк', category: 'Банки', url: 'https://www.mtsbank.ru', checkUrl: 'https://www.mtsbank.ru/favicon.ico' },

  // Соцсети и мессенджеры
  { name: 'ВКонтакте', category: 'Соцсети', url: 'https://vk.com', checkUrl: 'https://vk.com/favicon.ico' },
  { name: 'Одноклассники', category: 'Соцсети', url: 'https://ok.ru', checkUrl: 'https://ok.ru/favicon.ico' },
  { name: 'Дзен', category: 'Соцсети', url: 'https://dzen.ru', checkUrl: 'https://dzen.ru/favicon.ico', checkUrls: ['https://dzen.ru/favicon.svg', 'https://dzen.ru/robots.txt'] },
  { name: 'Rutube', category: 'Соцсети', url: 'https://rutube.ru', checkUrl: 'https://rutube.ru/favicon.ico' },
  { name: 'Пикабу', category: 'Соцсети', url: 'https://pikabu.ru', checkUrl: 'https://pikabu.ru/favicon.ico' },
  { name: 'TenChat', category: 'Соцсети', url: 'https://tenchat.ru', checkUrl: 'https://tenchat.ru/favicon.ico' },

  // Яндекс
  { name: 'Яндекс', category: 'Яндекс', url: 'https://ya.ru', checkUrl: 'https://ya.ru/favicon.ico' },
  { name: 'Яндекс Почта', category: 'Яндекс', url: 'https://mail.yandex.ru', checkUrl: 'https://mail.yandex.ru/favicon.ico' },
  { name: 'Яндекс Карты', category: 'Яндекс', url: 'https://yandex.ru/maps', checkUrl: 'https://yandex.ru/favicon.ico' },
  { name: 'Яндекс Маркет', category: 'Яндекс', url: 'https://market.yandex.ru', checkUrl: 'https://market.yandex.ru/favicon.ico' },
  { name: 'Яндекс Музыка', category: 'Яндекс', url: 'https://music.yandex.ru', checkUrl: 'https://music.yandex.ru/favicon.ico' },
  { name: 'Яндекс Диск', category: 'Яндекс', url: 'https://disk.yandex.ru', checkUrl: 'https://disk.yandex.ru/favicon.ico' },
  { name: 'Яндекс Такси', category: 'Яндекс', url: 'https://taxi.yandex.ru', checkUrl: 'https://taxi.yandex.ru/favicon.ico' },
  { name: 'Яндекс Еда', category: 'Яндекс', url: 'https://eda.yandex.ru', checkUrl: 'https://eda.yandex.ru/favicon.ico' },
  { name: 'Яндекс Погода', category: 'Яндекс', url: 'https://yandex.ru/pogoda', checkUrl: 'https://yandex.ru/favicon.ico' },
  { name: 'Яндекс Облако', category: 'Яндекс', url: 'https://cloud.yandex.ru', checkUrl: 'https://cloud.yandex.ru/favicon.ico' },

  // Маркетплейсы
  { name: 'Wildberries', category: 'Маркетплейсы', url: 'https://www.wildberries.ru', checkUrl: 'https://www.wildberries.ru/favicon.ico' },
  { name: 'Ozon', category: 'Маркетплейсы', url: 'https://www.ozon.ru', checkUrl: 'https://www.ozon.ru/favicon.ico' },
  { name: 'Авито', category: 'Маркетплейсы', url: 'https://www.avito.ru', checkUrl: 'https://www.avito.ru/favicon.ico' },
  { name: 'СберМегаМаркет', category: 'Маркетплейсы', url: 'https://megamarket.ru', checkUrl: 'https://megamarket.ru/favicon.ico' },
  { name: 'Lamoda', category: 'Маркетплейсы', url: 'https://www.lamoda.ru', checkUrl: 'https://www.lamoda.ru/favicon.ico' },
  { name: 'AliExpress RU', category: 'Маркетплейсы', url: 'https://aliexpress.ru', checkUrl: 'https://aliexpress.ru/favicon.ico' },
  { name: 'Юла', category: 'Маркетплейсы', url: 'https://youla.ru', checkUrl: 'https://youla.ru/favicon.ico' },
  { name: 'Ситилинк', category: 'Маркетплейсы', url: 'https://www.citilink.ru', checkUrl: 'https://www.citilink.ru/favicon.ico', checkUrls: ['https://www.citilink.ru/favicon.svg', 'https://www.citilink.ru/robots.txt'] },
  { name: 'DNS', category: 'Маркетплейсы', url: 'https://www.dns-shop.ru', checkUrl: 'https://www.dns-shop.ru/favicon.ico' },
  { name: 'М.Видео', category: 'Маркетплейсы', url: 'https://www.mvideo.ru', checkUrl: 'https://www.mvideo.ru/favicon.ico', checkUrls: ['https://www.mvideo.ru/favicon.svg', 'https://www.mvideo.ru/robots.txt'] },

  // Госуслуги и государство
  { name: 'Госуслуги', category: 'Госуслуги', url: 'https://www.gosuslugi.ru', checkUrl: 'https://www.gosuslugi.ru/favicon.ico' },
  { name: 'Налог.ру', category: 'Госуслуги', url: 'https://www.nalog.gov.ru', checkUrl: 'https://www.nalog.gov.ru/favicon.ico' },
  { name: 'ПФР', category: 'Госуслуги', url: 'https://pfr.gov.ru', checkUrl: 'https://pfr.gov.ru/favicon.ico' },
  { name: 'МВД', category: 'Госуслуги', url: 'https://мвд.рф', checkUrl: 'https://мвд.рф/favicon.ico' },

  // Телеком
  { name: 'МТС', category: 'Телеком', url: 'https://mts.ru', checkUrl: 'https://mts.ru/favicon.ico' },
  { name: 'Билайн', category: 'Телеком', url: 'https://beeline.ru', checkUrl: 'https://beeline.ru/favicon.ico' },
  { name: 'МегаФон', category: 'Телеком', url: 'https://megafon.ru', checkUrl: 'https://megafon.ru/favicon.ico' },
  { name: 'Tele2', category: 'Телеком', url: 'https://tele2.ru', checkUrl: 'https://tele2.ru/favicon.ico' },
  { name: 'Ростелеком', category: 'Телеком', url: 'https://www.rt.ru', checkUrl: 'https://www.rt.ru/favicon.ico' },

  // Медиа и новости
  { name: 'РБК', category: 'Медиа', url: 'https://www.rbc.ru', checkUrl: 'https://www.rbc.ru/favicon.ico' },
  { name: 'Коммерсант', category: 'Медиа', url: 'https://www.kommersant.ru', checkUrl: 'https://www.kommersant.ru/favicon.ico' },
  { name: 'Ведомости', category: 'Медиа', url: 'https://www.vedomosti.ru', checkUrl: 'https://www.vedomosti.ru/favicon.ico' },
  { name: 'Интерфакс', category: 'Медиа', url: 'https://www.interfax.ru', checkUrl: 'https://www.interfax.ru/favicon.ico' },
  { name: 'ТАСС', category: 'Медиа', url: 'https://tass.ru', checkUrl: 'https://tass.ru/favicon.ico' },
  { name: 'РИА Новости', category: 'Медиа', url: 'https://ria.ru', checkUrl: 'https://ria.ru/favicon.ico' },
  { name: 'Lenta.ru', category: 'Медиа', url: 'https://lenta.ru', checkUrl: 'https://lenta.ru/favicon.ico' },
  { name: 'Газета.ru', category: 'Медиа', url: 'https://www.gazeta.ru', checkUrl: 'https://www.gazeta.ru/favicon.ico' },
  { name: 'Спорт-Экспресс', category: 'Медиа', url: 'https://www.sport-express.ru', checkUrl: 'https://www.sport-express.ru/favicon.ico' },
  { name: 'Чемпионат', category: 'Медиа', url: 'https://www.championat.com', checkUrl: 'https://www.championat.com/favicon.ico' },
  { name: 'Sports.ru', category: 'Медиа', url: 'https://www.sports.ru', checkUrl: 'https://www.sports.ru/favicon.ico' },
  { name: 'Кинопоиск', category: 'Медиа', url: 'https://www.kinopoisk.ru', checkUrl: 'https://www.kinopoisk.ru/favicon.ico' },
  { name: 'Иви', category: 'Медиа', url: 'https://www.ivi.ru', checkUrl: 'https://www.ivi.ru/favicon.ico' },
  { name: 'Premier', category: 'Медиа', url: 'https://premier.one', checkUrl: 'https://premier.one/favicon.ico' },
  { name: 'Wink', category: 'Медиа', url: 'https://wink.ru', checkUrl: 'https://wink.ru/favicon.ico' },

  // Транспорт и доставка
  { name: 'Аэрофлот', category: 'Транспорт', url: 'https://www.aeroflot.ru', checkUrl: 'https://www.aeroflot.ru/favicon.ico' },
  { name: 'СДЭК', category: 'Транспорт', url: 'https://www.cdek.ru', checkUrl: 'https://www.cdek.ru/favicon.ico' },
  { name: 'Почта России', category: 'Транспорт', url: 'https://www.pochta.ru', checkUrl: 'https://www.pochta.ru/favicon.ico' },
  { name: 'Самокат', category: 'Транспорт', url: 'https://samokat.ru', checkUrl: 'https://samokat.ru/favicon.ico' },
  { name: 'Delivery Club', category: 'Транспорт', url: 'https://www.delivery-club.ru', checkUrl: 'https://www.delivery-club.ru/favicon.ico' },
  { name: '2ГИС', category: 'Транспорт', url: 'https://2gis.ru', checkUrl: 'https://2gis.ru/favicon.ico' },

  // IT и хостинг
  { name: 'VK Cloud', category: 'IT', url: 'https://cloud.vk.com', checkUrl: 'https://cloud.vk.com/favicon.ico' },
  { name: 'Selectel', category: 'IT', url: 'https://selectel.ru', checkUrl: 'https://selectel.ru/favicon.ico' },
  { name: 'Timeweb', category: 'IT', url: 'https://timeweb.com', checkUrl: 'https://timeweb.com/favicon.ico' },
  { name: 'REG.RU', category: 'IT', url: 'https://www.reg.ru', checkUrl: 'https://www.reg.ru/favicon.ico' },
  { name: '1С', category: 'IT', url: 'https://1c.ru', checkUrl: 'https://1c.ru/favicon.ico' },
  { name: 'Kaspersky', category: 'IT', url: 'https://www.kaspersky.ru', checkUrl: 'https://www.kaspersky.ru/favicon.ico' },
  { name: 'Dr.Web', category: 'IT', url: 'https://www.drweb.ru', checkUrl: 'https://www.drweb.ru/favicon.ico' },
  { name: 'Habr', category: 'IT', url: 'https://habr.com', checkUrl: 'https://habr.com/favicon.ico' },

  // Ритейл и еда
  { name: 'X5 (Пятёрочка)', category: 'Ритейл', url: 'https://5ka.ru', checkUrl: 'https://5ka.ru/favicon.ico' },
  { name: 'Магнит', category: 'Ритейл', url: 'https://magnit.ru', checkUrl: 'https://magnit.ru/favicon.ico' },
  { name: 'Лента', category: 'Ритейл', url: 'https://lenta.com', checkUrl: 'https://lenta.com/favicon.ico' },
  { name: 'ВкусВилл', category: 'Ритейл', url: 'https://vkusvill.ru', checkUrl: 'https://vkusvill.ru/favicon.ico' },
  { name: 'Додо Пицца', category: 'Ритейл', url: 'https://dodopizza.ru', checkUrl: 'https://dodopizza.ru/favicon.ico' },
  { name: 'KFC RU', category: 'Ритейл', url: 'https://www.kfc.ru', checkUrl: 'https://www.kfc.ru/favicon.ico' },
  { name: 'Макдоналдс (Вкусно)', category: 'Ритейл', url: 'https://vkusnoitochka.ru', checkUrl: 'https://vkusnoitochka.ru/favicon.ico' },

  // Недвижимость
  { name: 'ЦИАН', category: 'Недвижимость', url: 'https://www.cian.ru', checkUrl: 'https://www.cian.ru/favicon.ico' },
  { name: 'Домклик', category: 'Недвижимость', url: 'https://domclick.ru', checkUrl: 'https://domclick.ru/favicon.ico' },
  { name: 'Яндекс Недвижимость', category: 'Недвижимость', url: 'https://realty.yandex.ru', checkUrl: 'https://realty.yandex.ru/favicon.ico' },

  // Авто
  { name: 'Авто.ру', category: 'Авто', url: 'https://auto.ru', checkUrl: 'https://auto.ru/favicon.ico' },
  { name: 'Drom', category: 'Авто', url: 'https://www.drom.ru', checkUrl: 'https://www.drom.ru/favicon.ico' },
  { name: 'Авито Авто', category: 'Авто', url: 'https://www.avito.ru/auto', checkUrl: 'https://www.avito.ru/favicon.ico' },

  // Работа
  { name: 'HeadHunter', category: 'Работа', url: 'https://hh.ru', checkUrl: 'https://hh.ru/favicon.ico' },
  { name: 'SuperJob', category: 'Работа', url: 'https://www.superjob.ru', checkUrl: 'https://www.superjob.ru/favicon.ico' },
  { name: 'Авито Работа', category: 'Работа', url: 'https://www.avito.ru/rabota', checkUrl: 'https://www.avito.ru/favicon.ico' },

  // Страхование
  { name: 'СОГАЗ', category: 'Страхование', url: 'https://www.sogaz.ru', checkUrl: 'https://www.sogaz.ru/favicon.ico' },
  { name: 'Ингосстрах', category: 'Страхование', url: 'https://www.ingos.ru', checkUrl: 'https://www.ingos.ru/favicon.ico' },
  { name: 'Росгосстрах', category: 'Страхование', url: 'https://www.rgs.ru', checkUrl: 'https://www.rgs.ru/favicon.ico' },
  { name: 'АльфаСтрахование', category: 'Страхование', url: 'https://www.alfastrah.ru', checkUrl: 'https://www.alfastrah.ru/favicon.ico' },

  // Финтех
  { name: 'ЮMoney', category: 'Финтех', url: 'https://yoomoney.ru', checkUrl: 'https://yoomoney.ru/favicon.ico' },
  { name: 'QIWI', category: 'Финтех', url: 'https://qiwi.com', checkUrl: 'https://qiwi.com/favicon.ico' },
];

export const FOREIGN_SERVICES = [
  // Соцсети
  { name: 'Google', category: 'Соцсети', url: 'https://www.google.com', checkUrl: 'https://www.google.com/favicon.ico' },
  { name: 'YouTube', category: 'Соцсети', url: 'https://www.youtube.com', checkUrl: 'https://www.youtube.com/favicon.ico' },
  { name: 'Facebook', category: 'Соцсети', url: 'https://www.facebook.com', checkUrl: 'https://www.facebook.com/favicon.ico' },
  { name: 'Instagram', category: 'Соцсети', url: 'https://www.instagram.com', checkUrl: 'https://www.instagram.com/favicon.ico' },
  { name: 'X (Twitter)', category: 'Соцсети', url: 'https://x.com', checkUrl: 'https://x.com/favicon.ico' },
  { name: 'TikTok', category: 'Соцсети', url: 'https://www.tiktok.com', checkUrl: 'https://www.tiktok.com/favicon.ico' },
  { name: 'Reddit', category: 'Соцсети', url: 'https://www.reddit.com', checkUrl: 'https://www.reddit.com/favicon.ico' },
  { name: 'Snapchat', category: 'Соцсети', url: 'https://www.snapchat.com', checkUrl: 'https://www.snapchat.com/favicon.ico' },

  // Мессенджеры
  { name: 'Telegram Web', category: 'Мессенджеры', url: 'https://web.telegram.org', checkUrl: 'https://web.telegram.org/favicon.ico' },
  { name: 'WhatsApp', category: 'Мессенджеры', url: 'https://web.whatsapp.com', checkUrl: 'https://web.whatsapp.com/favicon.ico' },
  { name: 'Discord', category: 'Мессенджеры', url: 'https://discord.com', checkUrl: 'https://discord.com/favicon.ico' },
  { name: 'Viber', category: 'Мессенджеры', url: 'https://www.viber.com', checkUrl: 'https://www.viber.com/favicon.ico' },
  { name: 'Zoom', category: 'Мессенджеры', url: 'https://zoom.us', checkUrl: 'https://zoom.us/favicon.ico' },
  { name: 'Microsoft Teams', category: 'Мессенджеры', url: 'https://teams.microsoft.com', checkUrl: 'https://teams.microsoft.com/favicon.ico' },

  // Стриминг
  { name: 'Netflix', category: 'Стриминг', url: 'https://www.netflix.com', checkUrl: 'https://www.netflix.com/favicon.ico' },
  { name: 'Spotify', category: 'Стриминг', url: 'https://www.spotify.com', checkUrl: 'https://www.spotify.com/favicon.ico' },
  { name: 'Twitch', category: 'Стриминг', url: 'https://www.twitch.tv', checkUrl: 'https://www.twitch.tv/favicon.ico' },
  { name: 'Apple Music', category: 'Стриминг', url: 'https://music.apple.com', checkUrl: 'https://music.apple.com/favicon.ico' },
  { name: 'Disney+', category: 'Стриминг', url: 'https://www.disneyplus.com', checkUrl: 'https://www.disneyplus.com/favicon.ico' },
  { name: 'HBO Max', category: 'Стриминг', url: 'https://www.max.com', checkUrl: 'https://www.max.com/favicon.ico' },

  // Технологии
  { name: 'Microsoft', category: 'Технологии', url: 'https://www.microsoft.com', checkUrl: 'https://www.microsoft.com/favicon.ico' },
  { name: 'Apple', category: 'Технологии', url: 'https://www.apple.com', checkUrl: 'https://www.apple.com/favicon.ico' },
  { name: 'Amazon', category: 'Технологии', url: 'https://www.amazon.com', checkUrl: 'https://www.amazon.com/favicon.ico' },
  { name: 'GitHub', category: 'Технологии', url: 'https://github.com', checkUrl: 'https://github.com/favicon.ico' },
  { name: 'GitLab', category: 'Технологии', url: 'https://gitlab.com', checkUrl: 'https://gitlab.com/favicon.ico' },
  { name: 'Stack Overflow', category: 'Технологии', url: 'https://stackoverflow.com', checkUrl: 'https://stackoverflow.com/favicon.ico' },
  { name: 'Cloudflare', category: 'Технологии', url: 'https://www.cloudflare.com', checkUrl: 'https://www.cloudflare.com/favicon.ico' },
  { name: 'OpenAI', category: 'Технологии', url: 'https://openai.com', checkUrl: 'https://openai.com/favicon.ico' },
  { name: 'ChatGPT', category: 'Технологии', url: 'https://chat.openai.com', checkUrl: 'https://chat.openai.com/favicon.ico' },
  { name: 'Claude', category: 'Технологии', url: 'https://claude.ai', checkUrl: 'https://claude.ai/favicon.ico' },

  // Почта
  { name: 'Gmail', category: 'Почта', url: 'https://mail.google.com', checkUrl: 'https://mail.google.com/favicon.ico' },
  { name: 'Outlook', category: 'Почта', url: 'https://outlook.live.com', checkUrl: 'https://outlook.live.com/favicon.ico' },

  // Маркетплейсы
  { name: 'eBay', category: 'Маркетплейсы', url: 'https://www.ebay.com', checkUrl: 'https://www.ebay.com/favicon.ico' },
  { name: 'AliExpress', category: 'Маркетплейсы', url: 'https://www.aliexpress.com', checkUrl: 'https://www.aliexpress.com/favicon.ico' },
  { name: 'Etsy', category: 'Маркетплейсы', url: 'https://www.etsy.com', checkUrl: 'https://www.etsy.com/favicon.ico' },
  { name: 'Walmart', category: 'Маркетплейсы', url: 'https://www.walmart.com', checkUrl: 'https://www.walmart.com/favicon.ico' },

  // Новости
  { name: 'BBC', category: 'Новости', url: 'https://www.bbc.com', checkUrl: 'https://www.bbc.com/favicon.ico' },
  { name: 'CNN', category: 'Новости', url: 'https://www.cnn.com', checkUrl: 'https://www.cnn.com/favicon.ico' },
  { name: 'Reuters', category: 'Новости', url: 'https://www.reuters.com', checkUrl: 'https://www.reuters.com/favicon.ico' },
  { name: 'The Guardian', category: 'Новости', url: 'https://www.theguardian.com', checkUrl: 'https://www.theguardian.com/favicon.ico' },
  { name: 'NY Times', category: 'Новости', url: 'https://www.nytimes.com', checkUrl: 'https://www.nytimes.com/favicon.ico' },

  // Облака
  { name: 'Dropbox', category: 'Облака', url: 'https://www.dropbox.com', checkUrl: 'https://www.dropbox.com/favicon.ico' },
  { name: 'Google Drive', category: 'Облака', url: 'https://drive.google.com', checkUrl: 'https://drive.google.com/favicon.ico' },
  { name: 'OneDrive', category: 'Облака', url: 'https://onedrive.live.com', checkUrl: 'https://onedrive.live.com/favicon.ico' },
  { name: 'iCloud', category: 'Облака', url: 'https://www.icloud.com', checkUrl: 'https://www.icloud.com/favicon.ico' },

  // Игры
  { name: 'Steam', category: 'Игры', url: 'https://store.steampowered.com', checkUrl: 'https://store.steampowered.com/favicon.ico' },
  { name: 'Epic Games', category: 'Игры', url: 'https://www.epicgames.com', checkUrl: 'https://www.epicgames.com/favicon.ico' },
  { name: 'PlayStation', category: 'Игры', url: 'https://www.playstation.com', checkUrl: 'https://www.playstation.com/favicon.ico' },
  { name: 'Xbox', category: 'Игры', url: 'https://www.xbox.com', checkUrl: 'https://www.xbox.com/favicon.ico' },
  { name: 'Roblox', category: 'Игры', url: 'https://www.roblox.com', checkUrl: 'https://www.roblox.com/favicon.ico' },
];
