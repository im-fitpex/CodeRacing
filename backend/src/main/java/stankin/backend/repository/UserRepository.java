package stankin.backend.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import stankin.backend.model.User;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    private int generateId(Long vkId) {
        return (int)(vkId & 0xFFFFFFFFL);
    }

    public Optional<User> findByVkId(Long vkId) {
        String sql = "SELECT id, username, email, vk_id, created_at, last_login, is_admin " +
                "FROM rustore.users WHERE vk_id = :vkId";

        try {
            return Optional.ofNullable(namedParameterJdbcTemplate.queryForObject(
                    sql,
                    Map.of("vkId", vkId),
                    (rs, rowNum) -> {
                        User u = new User();
                        u.setId(rs.getLong("id"));
                        u.setUsername(rs.getString("username"));
                        u.setEmail(rs.getString("email"));
                        u.setVkId(rs.getLong("vk_id"));
                        u.setCreatedAt(rs.getObject("created_at", LocalDateTime.class));
                        u.setLastLogin(rs.getObject("last_login", LocalDateTime.class));
                        u.setIsAdmin(rs.getBoolean("is_admin"));
                        return u;
                    }
            ));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public User save(User user) {
        if (user.getId() == null || user.getId() == 0) {
            user.setId((long) generateId(user.getVkId()));
        }

        String insertSql = """
            INSERT INTO rustore.users (id, username, email, vk_id, created_at, last_login, is_admin)
            VALUES (:id, :username, :email, :vkId, :createdAt, :lastLogin, :isAdmin)
            """;

        namedParameterJdbcTemplate.update(insertSql, Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "vkId", user.getVkId(),
                "createdAt", user.getCreatedAt() == null ? LocalDateTime.now() : user.getCreatedAt(),
                "lastLogin", user.getLastLogin() == null ? LocalDateTime.now() : user.getLastLogin(),
                "isAdmin", user.getIsAdmin() ? 1 : 0
        ));

        return user;
    }

    public void updateLastLogin(Long vkId) {
        User existing = findByVkId(vkId).orElseThrow();
        existing.setLastLogin(LocalDateTime.now());
        save(existing);
    }
}
