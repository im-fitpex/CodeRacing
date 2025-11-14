package stankin.backend.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import stankin.backend.model.Category;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CategoryRepository {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Category> categoryRowMapper = (rs, rowNum) -> Category.builder()
            .id(rs.getInt("id"))
            .name(rs.getString("name"))
            .slug(rs.getString("slug"))
            .icon(rs.getString("icon"))
            .type(rs.getString("type"))
            .createdAt(rs.getTimestamp("created_at").toLocalDateTime())
            .build();

    public List<Category> findAll() {
        String sql = "SELECT * FROM rustore.categories ORDER BY id";
        return jdbcTemplate.query(sql, categoryRowMapper);
    }

    public Optional<Category> findById(Integer id) {
        String sql = "SELECT * FROM rustore.categories WHERE id = ?";
        List<Category> categories = jdbcTemplate.query(sql, categoryRowMapper, id);
        return categories.isEmpty() ? Optional.empty() : Optional.of(categories.get(0));
    }

    public List<Category> findByType(String type) {
        String sql = "SELECT * FROM rustore.categories WHERE type = ? ORDER BY name";
        return jdbcTemplate.query(sql, categoryRowMapper, type);
    }
}