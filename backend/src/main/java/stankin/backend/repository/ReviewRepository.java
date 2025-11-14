package stankin.backend.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import stankin.backend.model.Review;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ReviewRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Review> reviewRowMapper = (rs, rowNum) -> Review.builder()
            .id(rs.getLong("id"))
            .appId(rs.getInt("app_id"))
            .userId(rs.getInt("user_id"))
            .rating(rs.getInt("rating"))
            .comment(rs.getString("comment"))
            .helpfulCount(rs.getInt("helpful_count"))
            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
            .build();

    public List<Review> findByAppId(Integer appId, int limit) {
        String sql = "SELECT * FROM rustore.reviews WHERE app_id = ? ORDER BY created_at DESC LIMIT ?";
        return jdbcTemplate.query(sql, reviewRowMapper, appId, limit);
    }

    public Review save(Review review) {
        String sql = """
            INSERT INTO rustore.reviews (id, app_id, user_id, rating, comment, helpful_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?, now())
        """;

        long id = System.currentTimeMillis();
        jdbcTemplate.update(sql, id, review.getAppId(), review.getUserId(),
                review.getRating(), review.getComment(), 0);

        review.setId(id);
        return review;
    }

    public void incrementHelpfulCount(Long reviewId) {
        String sql = "ALTER TABLE rustore.reviews UPDATE helpful_count = helpful_count + 1 WHERE id = ?";
        jdbcTemplate.update(sql, reviewId);
    }
}

