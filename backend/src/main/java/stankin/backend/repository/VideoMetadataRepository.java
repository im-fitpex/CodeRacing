package stankin.backend.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import stankin.backend.model.Video;

import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@RequiredArgsConstructor
@Slf4j
public class VideoMetadataRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private record CursorData(LocalDateTime createdAt, UUID videoId) {}

    private final Map<String, CursorCacheEntry> cursorCache = new ConcurrentHashMap<>();

    // Для простоты — кэшируем на 5 минут (защита от DoS через подбор)
    private record CursorCacheEntry(CursorData data, long timestamp) {}

    public List<Video> findFeed(String cursor, int limit) {
        if (limit < 1) limit = 10;
        if (limit > 50) limit = 50;

        String sql;
        Object[] params;

        if (cursor == null || cursor.isEmpty()) {
            sql = """
                SELECT video_id, author_id, title, description, video_url,
                       thumbnail_url, duration_seconds, created_at
                FROM video_metadata
                ORDER BY created_at DESC, video_id DESC
                LIMIT ?
                """;
            params = new Object[]{limit};
        } else {
            CursorData decoded = decodeCursor(cursor);
            sql = """
                SELECT video_id, author_id, title, description, video_url,
                       thumbnail_url, duration_seconds, created_at
                FROM video_metadata
                WHERE (created_at < ?) OR (created_at = ? AND video_id < ?)
                ORDER BY created_at DESC, video_id DESC
                LIMIT ?
                """;
            params = new Object[]{
                    decoded.createdAt(),
                    decoded.createdAt(),
                    decoded.videoId(),
                    limit
            };
        }

        return jdbcTemplate.query(sql, params, videoRowMapper());
    }

    private RowMapper<Video> videoRowMapper() {
        return (rs, rowNum) -> new Video(
                UUID.fromString(rs.getString("video_id")),
                UUID.fromString(rs.getString("author_id")),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("video_url"),
                rs.getString("thumbnail_url"),
                rs.getInt("duration_seconds"),
                rs.getTimestamp("created_at").toLocalDateTime()
        );
    }

    public String encodeCursor(LocalDateTime createdAt, UUID videoId) {
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "t", createdAt.toString(),
                    "id", videoId.toString()
            ));
            return Base64.getEncoder().encodeToString(json.getBytes(StandardCharsets.UTF_8));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to encode cursor", e);
        }
    }

    private CursorData decodeCursor(String cursor) {
        String cacheKey = cursor.substring(0, Math.min(cursor.length(), 16));
        CursorCacheEntry cached = cursorCache.get(cacheKey);
        long now = System.currentTimeMillis();

        if (cached != null && now - cached.timestamp() < 300_000) { // 5 min
            return cached.data();
        }

        try {
            String json = new String(Base64.getDecoder().decode(cursor), StandardCharsets.UTF_8);
            JsonNode node = objectMapper.readTree(json);
            CursorData data = new CursorData(
                    LocalDateTime.parse(node.get("t").asText()),
                    UUID.fromString(node.get("id").asText())
            );
            cursorCache.put(cacheKey, new CursorCacheEntry(data, now));
            return data;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid cursor format", e);
        }
    }
}