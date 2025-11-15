package stankin.backend.repository;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import stankin.backend.model.App;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Repository
@RequiredArgsConstructor
public class AppRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<App> appRowMapper = (rs, rowNum) -> {
        try {
            return App.builder()
                    .id(rs.getInt("id"))
                    .name(rs.getString("name"))
                    .packageName(rs.getString("package_name"))
                    .developer(rs.getString("developer"))
                    .categoryId(rs.getInt("category_id"))
                    .description(rs.getString("description"))
                    .shortDescription(rs.getString("short_description"))
                    .version(rs.getString("version"))
                    .sizeMb(rs.getFloat("size_mb"))
                    .rating(rs.getFloat("rating"))
                    .downloads(rs.getLong("downloads"))
                    .price(rs.getFloat("price"))
                    .isFree(rs.getInt("is_free") == 1)  // Исправлено для ClickHouse
                    .ageRating(rs.getString("age_rating"))
                    .iconUrl(rs.getString("icon_url"))
                    .apkUrl(rs.getString("apk_url"))
                    .createdAt(getTimestamp(rs, "created_at"))  // Исправлено
                    .updatedAt(getTimestamp(rs, "updated_at"))  // Исправлено
                    .isEditorChoice(rs.getInt("is_editor_choice") == 1)  // Исправлено
                    .isNew(rs.getInt("is_new") == 1)  // Исправлено
                    .isPopular(rs.getInt("is_popular") == 1)  // Исправлено
                    .build();
        } catch (Exception e) {
            log.error("Error mapping row for app: {}", rs.getInt("id"), e);
            throw e;
        }
    };

    // Вспомогательный метод для безопасного получения timestamp
    private LocalDateTime getTimestamp(ResultSet rs, String columnName) throws SQLException {
        try {
            java.sql.Timestamp timestamp = rs.getTimestamp(columnName);
            return timestamp != null ? timestamp.toLocalDateTime() : LocalDateTime.now();
        } catch (SQLException e) {
            log.warn("Could not get timestamp for column {}, using current time", columnName);
            return LocalDateTime.now();
        }
    }

    public List<App> findAll() {
        String sql = "SELECT * FROM rustore.apps ORDER BY rating DESC, downloads DESC";
        return jdbcTemplate.query(sql, appRowMapper);
    }

    public Optional<App> findById(Integer id) {
        String sql = "SELECT * FROM rustore.apps WHERE id = ?";
        List<App> apps = jdbcTemplate.query(sql, appRowMapper, id);
        return apps.isEmpty() ? Optional.empty() : Optional.of(apps.get(0));
    }

    public List<App> findByCategory(Integer categoryId) {
        String sql = "SELECT * FROM rustore.apps WHERE category_id = ? ORDER BY rating DESC";
        return jdbcTemplate.query(sql, appRowMapper, categoryId);
    }

    public List<App> findByFreeStatus(boolean isFree) {
        String sql = "SELECT * FROM rustore.apps WHERE is_free = ? ORDER BY rating DESC, downloads DESC";
        return jdbcTemplate.query(sql, appRowMapper, isFree ? 1 : 0);
    }

    public List<App> findEditorChoice() {
        String sql = "SELECT * FROM rustore.apps WHERE is_editor_choice = 1 ORDER BY rating DESC LIMIT 10";
        return jdbcTemplate.query(sql, appRowMapper);
    }

    public List<App> findNew() {
        String sql = "SELECT * FROM rustore.apps WHERE is_new = 1 ORDER BY created_at DESC LIMIT 20";
        return jdbcTemplate.query(sql, appRowMapper);
    }

    public List<App> findPopular() {
        String sql = "SELECT * FROM rustore.apps WHERE is_popular = 1 ORDER BY downloads DESC LIMIT 20";
        return jdbcTemplate.query(sql, appRowMapper);
    }

    public List<App> searchByName(String query) {
        String sql = "SELECT * FROM rustore.apps WHERE lower(name) LIKE lower(?) ORDER BY rating DESC";
        return jdbcTemplate.query(sql, appRowMapper, "%" + query + "%");
    }

    public List<App> findSimilarApps(Integer categoryId, Integer excludeAppId, int limit) {
        String sql = "SELECT * FROM rustore.apps WHERE category_id = ? AND id != ? ORDER BY rating DESC LIMIT ?";
        return jdbcTemplate.query(sql, appRowMapper, categoryId, excludeAppId, limit);
    }

    public void incrementDownloads(Integer appId) {
        String sql = "ALTER TABLE rustore.apps UPDATE downloads = downloads + 1 WHERE id = ?";
        jdbcTemplate.update(sql, appId);
    }
}
