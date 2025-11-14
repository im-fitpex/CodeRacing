package stankin.backend.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import stankin.backend.dto.AppDTO;
import stankin.backend.model.App;
import stankin.backend.repository.AppRepository;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final AppRepository appRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Get personalized recommendations based on user activity
     */
    public List<AppDTO> getRecommendations(Integer userId, int limit) {
        // Get user's favorite categories based on viewing history
        String categorySql = """
            SELECT category_id, count() as views
            FROM rustore.user_activities ua
            JOIN rustore.apps a ON ua.app_id = a.id
            WHERE ua.user_id = ? AND ua.activity_type = 'view'
            GROUP BY category_id
            ORDER BY views DESC
            LIMIT 3
        """;

        List<Integer> favoriteCategories = jdbcTemplate.queryForList(
                categorySql, Integer.class, userId);

        if (favoriteCategories.isEmpty()) {
            // Return popular apps if no history
            return appRepository.findPopular().stream()
                    .limit(limit)
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        // Get apps from favorite categories that user hasn't viewed
        String appSql = """
            SELECT DISTINCT a.*
            FROM rustore.apps a
            WHERE a.category_id IN (?, ?, ?)
            AND a.id NOT IN (
                SELECT app_id FROM rustore.user_activities 
                WHERE user_id = ?
            )
            ORDER BY a.rating DESC, a.downloads DESC
            LIMIT ?
        """;

        List<App> recommendedApps = jdbcTemplate.query(
                appSql,
                (rs, rowNum) -> App.builder()
                        .id(rs.getInt("id"))
                        .name(rs.getString("name"))
                        .categoryId(rs.getInt("category_id"))
                        .rating(rs.getFloat("rating"))
                        .downloads(rs.getLong("downloads"))
                        .build(),
                favoriteCategories.get(0),
                favoriteCategories.size() > 1 ? favoriteCategories.get(1) : 0,
                favoriteCategories.size() > 2 ? favoriteCategories.get(2) : 0,
                userId,
                limit
        );

        return recommendedApps.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Track user activity for recommendations
     */
    public void trackActivity(Integer userId, Integer appId, String activityType) {
        String sql = """
            INSERT INTO rustore.user_activities 
            (user_id, app_id, activity_type, timestamp, session_id)
            VALUES (?, ?, ?, now(), ?)
        """;

        String sessionId = UUID.randomUUID().toString();
        jdbcTemplate.update(sql, userId, appId, activityType, sessionId);

        log.info("Tracked activity: user={}, app={}, type={}", userId, appId, activityType);
    }

    private AppDTO convertToDTO(App app) {
        // TODO: позже заменить на реальное имя категории по categoryId
        String categoryName = getCategoryNameById(app.getCategoryId()); //  реализовать позже

        return AppDTO.builder()
                .id(app.getId())
                .name(app.getName())
                .category(categoryName)
                .rating(app.getRating())
                .downloads(app.getDownloads())
                .build();
    }

    private String getCategoryNameById(Integer categoryId) {
        if (categoryId == null) return "Uncategorized";
        // Пример через jdbcTemplate (можно вынести в CategoryRepository)
        String sql = "SELECT name FROM rustore.categories WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, String.class, categoryId);
        } catch (EmptyResultDataAccessException e) {
            return "Unknown";
        }
    }
}
