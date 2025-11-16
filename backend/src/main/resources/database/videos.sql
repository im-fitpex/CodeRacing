-- Видео клипы для приложений
INSERT INTO rustore.video_clips (app_id, title, description, video_url, thumbnail_url, duration_sec, is_playable, demo_time_limit_sec, orientation, views, likes) VALUES

-- Clash Royale (app_id: 12)
(12, 'Clash Royale - топ колоды 2025', 'Лучшие стратегии для побед в 2025 году. Узнайте, какие колоды использует элита игроков.', '/videos/clashroyal.mp4', '/thumbnails/clash_1.jpg', 330, 1, 90, 'vertical', 680000, 45000),
(12, 'Как разобраться новичку', 'Полное руководство для новичков. От первых шагов до взятия первого трофея.', '/videos/clashroyal.mp4', '/thumbnails/clash_2.jpg', 480, 1, 90, 'vertical', 450000, 32000),
(12, 'Секреты прокачки в Clash Royale', 'Узнайте, как быстро прокачать карты и достичь высоких кубков', '/videos/clashroyal.mp4', '/thumbnails/clash_3.jpg', 420, 1, 90, 'vertical', 320000, 24000),

-- Яндекс Go (app_id: 6)
(6, 'Яндекс Go - экономия на поездках', 'Лайфхаки для пользователей. Как сэкономить на таксі и доставке.', '/videos/yandexgo.mp4', '/thumbnails/yandexgo_1.jpg', 140, 1, 90, 'vertical', 189000, 11200),
(6, 'Каршеринг в Яндекс Go', 'Как арендовать автомобиль через Яндекс Go за минуту', '/videos/yandexgo.mp4', '/thumbnails/yandexgo_2.jpg', 210, 1, 90, 'vertical', 156000, 8900),
(6, 'Доставка в Яндекс Go', 'Заказываем еду и товары через Яндекс Go - быстро, удобно', '/videos/yandexgo.mp4', '/thumbnails/yandexgo_3.jpg', 185, 1, 90, 'vertical', 98000, 5600),

-- ВКонтакте (app_id: 8)
(8, 'ВКонтакте - что нового в 2025', 'Все новые функции социальной сети ВКонтакте', '/videos/clashroyal.mp4', '/thumbnails/vk_1.jpg', 280, 1, 90, 'vertical', 567000, 34000),
(8, 'Как создать сообщество в ВК', 'Пошаговая инструкция по созданию и управлению сообществом', '/videos/yandexgo.mp4', '/thumbnails/vk_2.jpg', 350, 1, 90, 'vertical', 234000, 16000),

-- Сбербанк Онлайн (app_id: 1)
(1, 'Сбербанк Онлайн - переводы онлайн', 'Быстрые переводы между картами и счетами', '/videos/clashroyal.mp4', '/thumbnails/sber_1.jpg', 150, 1, 90, 'vertical', 445000, 28000),
(1, 'Инвестиции в Сбербанке', 'Как начать инвестировать с приложения Сбербанк Онлайн', '/videos/yandexgo.mp4', '/thumbnails/sber_2.jpg', 420, 1, 90, 'vertical', 312000, 19000),

-- Тинькофф (app_id: 2)
(2, 'Тинькофф - открытие счета за минуту', 'Как быстро открыть счет в Тинькоффе', '/videos/clashroyal.mp4', '/thumbnails/tinkoff_1.jpg', 200, 1, 90, 'vertical', 389000, 24000),
(2, 'Кэшбэк в Тинькоффе', 'Максимизируем кэшбэк на каждую покупку', '/videos/yandexgo.mp4', '/thumbnails/tinkoff_2.jpg', 310, 1, 90, 'vertical', 276000, 18000),

-- Telegram (app_id: 9)
(9, 'Telegram - безопасность и приватность', 'Как защитить свои данные в Телеграме', '/videos/clashroyal.mp4', '/thumbnails/telegram_1.jpg', 280, 1, 90, 'vertical', 678000, 41000),
(9, 'Боты и каналы в Telegram', 'Полезные боты и интересные каналы', '/videos/yandexgo.mp4', '/thumbnails/telegram_2.jpg', 360, 1, 90, 'vertical', 445000, 29000),

-- Яндекс Музыка (app_id: 13)
(13, 'Яндекс Музыка - персональные плейлисты', 'Как создать идеальный плейлист', '/videos/clashroyal.mp4', '/thumbnails/yamusic_1.jpg', 220, 1, 90, 'vertical', 298000, 18000),
(13, 'Подкасты в Яндекс Музыке', 'Лучшие подкасты на платформе', '/videos/yandexgo.mp4', '/thumbnails/yamusic_2.jpg', 380, 1, 90, 'vertical', 167000, 11000),

-- Госуслуги (app_id: 4)
(4, 'Госуслуги - получение паспорта онлайн', 'Как оформить документы через портал Госуслуги', '/videos/clashroyal.mp4', '/thumbnails/gosuslugi_1.jpg', 290, 1, 90, 'vertical', 234000, 15000),
(4, 'Запись к врачу через Госуслуги', 'Удобный способ записаться на приём', '/videos/yandexgo.mp4', '/thumbnails/gosuslugi_2.jpg', 180, 1, 90, 'vertical', 167000, 9800),

-- Яндекс Диск (app_id: 10)
(10, 'Яндекс Диск - облачное хранилище', 'Как использовать облако эффективно', '/videos/clashroyal.mp4', '/thumbnails/yadisk_1.jpg', 240, 1, 90, 'vertical', 312000, 19000),
(10, 'Синхронизация файлов в Яндекс Диске', 'Синхронизируем все файлы между устройствами', '/videos/yandexgo.mp4', '/thumbnails/yadisk_2.jpg', 200, 1, 90, 'vertical', 145000, 8700);
