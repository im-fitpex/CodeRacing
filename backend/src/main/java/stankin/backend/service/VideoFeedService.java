package stankin.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import stankin.backend.dto.VideoClipDTO;


import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoFeedService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<VideoClipDTO> getFeed(Integer userId, String cursor, int limit) {
        String sql = """
            SELECT 
                v.id, v.app_id, a.name as app_name, a.icon_url as app_icon_url,
                a.rating as app_rating, a.price as app_price, a.is_free as app_is_free,
                v.title, v.description, v.video_url, v.thumbnail_url,
                v.duration_sec, v.is_playable, v.demo_url, v.demo_time_limit_sec,
                v.orientation, v.views, v.likes, v.created_at
            FROM rustore.video_clips v
            JOIN rustore.apps a ON v.app_id = a.id
            WHERE v.app_id NOT IN (
                SELECT app_id FROM rustore.not_interested WHERE user_id = ?
            )
            ORDER BY v.created_at DESC, v.id
            LIMIT ?
        """;

        List<VideoClipDTO> videos = jdbcTemplate.query(sql,
                (rs, rowNum) -> VideoClipDTO.builder()
                        .id(UUID.fromString(rs.getString("id")))
                        .appId(rs.getInt("app_id"))
                        .appName(rs.getString("app_name"))
                        .appIconUrl(rs.getString("app_icon_url"))
                        .appRating(rs.getFloat("app_rating"))
                        .appPrice(rs.getFloat("app_price"))
                        .appIsFree(rs.getBoolean("app_is_free"))
                        .title(rs.getString("title"))
                        .description(rs.getString("description"))
                        .videoUrl(rs.getString("video_url"))
                        .thumbnailUrl(rs.getString("thumbnail_url"))
                        .durationSec(rs.getInt("duration_sec"))
                        .isPlayable(rs.getBoolean("is_playable"))
                        .demoUrl(rs.getString("demo_url"))
                        .demoTimeLimitSec(rs.getInt("demo_time_limit_sec"))
                        .orientation(rs.getString("orientation"))
                        .views(rs.getLong("views"))
                        .likes(rs.getLong("likes"))
                        .isLiked(false)
                        .isInWishlist(false)
                        .build(),
                userId != null ? userId : 0, limit
        );

        // Check likes and wishlist status
        if (userId != null && !videos.isEmpty()) {
            enrichWithUserData(videos, userId);
        }

        return videos;
    }

    private void enrichWithUserData(List<VideoClipDTO> videos, Integer userId) {
        // Get liked videos
        String likedSql = "SELECT video_id FROM rustore.video_interactions WHERE user_id = ? AND interaction_type = 'like'";
        Set<UUID> likedIds = new HashSet<>(jdbcTemplate.queryForList(likedSql, UUID.class, userId));

        // Get wishlist
        String wishlistSql = "SELECT app_id FROM rustore.wishlist WHERE user_id = ?";
        Set<Integer> wishlistIds = new HashSet<>(jdbcTemplate.queryForList(wishlistSql, Integer.class, userId));

        // Update DTOs - would need mutable version or rebuild
        // For now, client will make separate requests
    }

    public void recordInteraction(Integer userId, UUID videoId, String type, int watchDuration, int demoDuration) {
        String sql = """
            INSERT INTO rustore.video_interactions 
            (user_id, video_id, interaction_type, watch_duration_sec, demo_played_sec, timestamp, session_id)
            VALUES (?, ?, ?, ?, ?, now(), ?)
        """;

        jdbcTemplate.update(sql, userId, videoId, type, watchDuration, demoDuration, UUID.randomUUID().toString());
    }

    public boolean toggleLike(Integer userId, UUID videoId) {
        // Check if already liked
        String checkSql = "SELECT count() FROM rustore.video_interactions WHERE user_id = ? AND video_id = ? AND interaction_type = 'like'";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, videoId);

        if (count > 0) {
            // Unlike
            recordInteraction(userId, videoId, "dislike", 0, 0);
            return false;
        } else {
            // Like
            recordInteraction(userId, videoId, "like", 0, 0);
            return true;
        }
    }

    public long getLikeCount(UUID videoId) {
        String sql = "SELECT likes FROM rustore.video_clips WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, Long.class, videoId);
    }

    public void markNotInterested(Integer userId, UUID videoId, String reason) {
        String appIdSql = "SELECT app_id FROM rustore.video_clips WHERE id = ?";
        Integer appId = jdbcTemplate.queryForObject(appIdSql, Integer.class, videoId);

        String sql = "INSERT INTO rustore.not_interested (user_id, app_id, reason, marked_at) VALUES (?, ?, ?, now())";
        jdbcTemplate.update(sql, userId, appId, reason);

        recordInteraction(userId, videoId, "skip", 0, 0);
    }

    public boolean toggleWishlist(Integer userId, UUID videoId) {
        String appIdSql = "SELECT app_id FROM rustore.video_clips WHERE id = ?";
        Integer appId = jdbcTemplate.queryForObject(appIdSql, Integer.class, videoId);

        String checkSql = "SELECT count() FROM rustore.wishlist WHERE user_id = ? AND app_id = ?";
        int count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, appId);

        if (count > 0) {
            // Remove from wishlist
            String deleteSql = "ALTER TABLE rustore.wishlist DELETE WHERE user_id = ? AND app_id = ?";
            jdbcTemplate.update(deleteSql, userId, appId);
            return false;
        } else {
            // Add to wishlist
            String insertSql = "INSERT INTO rustore.wishlist (user_id, app_id, added_from_video, added_at) VALUES (?, ?, ?, now())";
            jdbcTemplate.update(insertSql, userId, appId, videoId);
            return true;
        }
    }

    public UUID startDemoSession(Integer userId, UUID videoId) {
        String appIdSql = "SELECT app_id FROM rustore.video_clips WHERE id = ?";
        Integer appId = jdbcTemplate.queryForObject(appIdSql, Integer.class, videoId);

        UUID sessionId = UUID.randomUUID();
        String sql = "INSERT INTO rustore.demo_sessions (id, user_id, video_id, app_id, started_at) VALUES (?, ?, ?, ?, now())";
        jdbcTemplate.update(sql, sessionId, userId, videoId, appId);

        return sessionId;
    }

    public void endDemoSession(UUID sessionId, int playedSec, boolean completed) {
        String sql = "ALTER TABLE rustore.demo_sessions UPDATE ended_at = now(), duration_sec = ?, completed = ? WHERE id = ?";
        jdbcTemplate.update(sql, playedSec, completed ? 1 : 0, sessionId);
    }

    public List<VideoClipDTO> getWishlist(Integer userId) {
        String sql = """
            SELECT 
                v.id, v.app_id, a.name as app_name, a.icon_url as app_icon_url,
                a.rating as app_rating, a.price as app_price, a.is_free as app_is_free,
                v.title, v.description, v.video_url, v.thumbnail_url,
                v.duration_sec, v.is_playable, v.demo_url, v.demo_time_limit_sec,
                v.orientation, v.views, v.likes
            FROM rustore.wishlist w
            JOIN rustore.video_clips v ON w.added_from_video = v.id
            JOIN rustore.apps a ON v.app_id = a.id
            WHERE w.user_id = ?
            ORDER BY w.added_at DESC
        """;

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> VideoClipDTO.builder()
                        .id(UUID.fromString(rs.getString("id")))
                        .appId(rs.getInt("app_id"))
                        .appName(rs.getString("app_name"))
                        .appIconUrl(rs.getString("app_icon_url"))
                        .appRating(rs.getFloat("app_rating"))
                        .appPrice(rs.getFloat("app_price"))
                        .appIsFree(rs.getBoolean("app_is_free"))
                        .title(rs.getString("title"))
                        .description(rs.getString("description"))
                        .videoUrl(rs.getString("video_url"))
                        .thumbnailUrl(rs.getString("thumbnail_url"))
                        .durationSec(rs.getInt("duration_sec"))
                        .isPlayable(rs.getBoolean("is_playable"))
                        .demoUrl(rs.getString("demo_url"))
                        .demoTimeLimitSec(rs.getInt("demo_time_limit_sec"))
                        .orientation(rs.getString("orientation"))
                        .views(rs.getLong("views"))
                        .likes(rs.getLong("likes"))
                        .isLiked(false)
                        .isInWishlist(true)
                        .build(),
                userId
        );
    }
}

