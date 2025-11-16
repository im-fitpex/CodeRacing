CREATE DATABASE IF NOT EXISTS rustore;
-- приложения
CREATE TABLE IF NOT EXISTS rustore.apps (
                                            id UInt32,
                                            name String,
                                            package_name String,
                                            developer String,
                                            category_id UInt16,
                                            description String,
                                            short_description String,
                                            version String,
                                            size_mb Float32,
                                            rating Float32,
                                            downloads UInt64,
                                            price Float32,
                                            is_free UInt8,
                                            age_rating String,
                                            icon_url String,
                                            apk_url String,
                                            created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    is_editor_choice UInt8 DEFAULT 0,
    is_new UInt8 DEFAULT 0,
    is_popular UInt8 DEFAULT 0,
    INDEX idx_category category_id TYPE minmax GRANULARITY 4,
    INDEX idx_rating rating TYPE minmax GRANULARITY 4,
    INDEX idx_free is_free TYPE set(2) GRANULARITY 1
    ) ENGINE = MergeTree()
    ORDER BY (category_id, rating, id)
    PARTITION BY toYYYYMM(created_at)
    SETTINGS index_granularity = 8192;

-- категории приложений
CREATE TABLE IF NOT EXISTS rustore.categories (
                                                  id UInt16,
                                                  name String,
                                                  slug String,
                                                  icon String,
                                                  type String,
                                                  created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY id
    SETTINGS index_granularity = 8192;

-- Скриншоты приложений
CREATE TABLE IF NOT EXISTS rustore.screenshots (
                                                   id UInt32,
                                                   app_id UInt32,
                                                   url String,
                                                   order_index UInt8,
                                                   created_at DateTime DEFAULT now()
    ) ENGINE = MergeTree()
    ORDER BY (app_id, order_index)
    SETTINGS index_granularity = 8192;

-- Видео клипы
CREATE TABLE IF NOT EXISTS rustore.video_clips (
    id UUID DEFAULT generateUUIDv4(),
    app_id UInt32,
    title String,
    description String,
    video_url String,
    thumbnail_url String,
    duration_sec UInt16 DEFAULT 0,
    is_playable UInt8 DEFAULT 1,
    demo_url String DEFAULT '',
    demo_time_limit_sec UInt16 DEFAULT 90,
    orientation String DEFAULT 'vertical',
    views UInt64 DEFAULT 0,
    likes UInt64 DEFAULT 0,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    INDEX idx_app_id app_id TYPE minmax GRANULARITY 4
) ENGINE = MergeTree()
ORDER BY (app_id, created_at)
SETTINGS index_granularity = 8192;

-- Взаимодействия с видео
CREATE TABLE IF NOT EXISTS rustore.video_interactions (
    id UUID DEFAULT generateUUIDv4(),
    user_id UInt32,
    video_id UUID,
    interaction_type String,
    watch_duration_sec UInt16 DEFAULT 0,
    demo_played_sec UInt16 DEFAULT 0,
    timestamp DateTime DEFAULT now(),
    session_id String DEFAULT ''
) ENGINE = MergeTree()
ORDER BY (user_id, timestamp)
SETTINGS index_granularity = 8192;

-- "Не интересует" для видео
CREATE TABLE IF NOT EXISTS rustore.not_interested (
    user_id UInt32,
    app_id UInt32,
    reason String DEFAULT 'not_interested',
    marked_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (user_id, app_id)
SETTINGS index_granularity = 8192;

-- Избранное пользователей
CREATE TABLE IF NOT EXISTS rustore.wishlist (
    user_id UInt32,
    app_id UInt32,
    added_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (user_id, app_id)
SETTINGS index_granularity = 8192;