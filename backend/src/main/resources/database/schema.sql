-- Materialized view for app statistics (optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS rustore.app_stats_mv
ENGINE = AggregatingMergeTree()
ORDER BY app_id
POPULATE
AS SELECT
              app_id,
              countState() as view_count,
              uniqState(user_id) as unique_viewers,
              maxState(timestamp) as last_viewed
   FROM rustore.user_activities
   WHERE activity_type = 'view'
   GROUP BY app_id;