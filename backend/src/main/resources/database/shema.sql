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