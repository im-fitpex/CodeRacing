package stankin.backend.repository;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import stankin.backend.model.ViewEvent;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Repository
@RequiredArgsConstructor
@Slf4j
public class ViewEventRepository {

    private final JdbcTemplate jdbcTemplate;

    @Value("${clickhouse.batch-size:1000}")
    private int batchSize;

    @Value("${clickhouse.batch-interval-ms:5000}")
    private long batchIntervalMs;

    private final Queue<ViewEvent> buffer = new ConcurrentLinkedQueue<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    @PostConstruct
    public void init() {
        scheduler.scheduleAtFixedRate(this::flushBuffer, batchIntervalMs, batchIntervalMs, TimeUnit.MILLISECONDS);
    }

    @PreDestroy
    public void shutdown() {
        flushBuffer();
        scheduler.shutdown();
    }

    public void save(ViewEvent event) {
        buffer.add(event);
        if (buffer.size() >= batchSize) {
            flushBuffer();
        }
    }

    private synchronized void flushBuffer() {
        if (buffer.isEmpty()) return;

        List<ViewEvent> batch = new ArrayList<>(buffer);
        buffer.clear();

        String sql = """
            INSERT INTO video_views (video_id, user_id, session_id, watch_duration_ms, scrolled_to_next, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """;

        try {
            int[] results = jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    ViewEvent e = batch.get(i);
                    ps.setObject(1, e.videoId());
                    ps.setObject(2, e.userId());    // null → ClickHouse: NULL
                    ps.setObject(3, e.sessionId());
                    ps.setLong(4, e.watchDurationMs());
                    ps.setBoolean(5, e.scrolledToNext());
                    ps.setTimestamp(6, Timestamp.valueOf(e.timestamp()));
                }

                @Override
                public int getBatchSize() {
                    return batch.size();
                }
            });

            int total = Arrays.stream(results).sum();
            log.debug("Inserted {} view events ({} rows affected)", batch.size(), total);

        } catch (Exception ex) {
            log.error("Bulk insert failed for {} events", batch.size(), ex);
            // In production: send to DLQ (e.g., Kafka, Redis)
            buffer.addAll(batch);
        }
    }
}