package stankin.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import stankin.backend.model.User;
import stankin.backend.repository.UserRepository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class VkOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired
    private UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        String accessToken = userRequest.getAccessToken().getTokenValue();

        // Запрос профиля
        String url = "https://api.vk.com/method/users.get"
                + "?access_token=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&fields=id,first_name,last_name,screen_name,email"
                + "&v=5.199";

        String response = restTemplate.getForObject(url, String.class);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root;
        try {
            root = mapper.readTree(response);
        } catch (Exception e) {
            throw new OAuth2AuthenticationException("Failed to parse VK response");
        }

        if (root.has("error")) {
            throw new OAuth2AuthenticationException("VK API error: " + root.get("error"));
        }

        JsonNode userNode = root.get("response").get(0);
        long vkId = userNode.get("id").asLong();
        String firstName = userNode.has("first_name") ? userNode.get("first_name").asText() : "";
        String lastName = userNode.has("last_name") ? userNode.get("last_name").asText() : "";
        String username = userNode.has("screen_name") && !userNode.get("screen_name").asText().isEmpty()
                ? userNode.get("screen_name").asText()
                : (firstName + " " + lastName).trim();
        String email = userNode.has("email") ? userNode.get("email").asText() : "";

        // Поиск или создание пользователя
        User user = userRepository.findByVkId(vkId).orElseGet(() -> {
            User newUser = User.builder()
                    .username(username)
                    .email(email)
                    .vkId(vkId)
                    .createdAt(LocalDateTime.now())
                    .lastLogin(LocalDateTime.now())
                    .isAdmin(false)
                    .build();
            return userRepository.save(newUser);
        });

        // Обновляем last_login (вставляем новую версию)
        userRepository.updateLastLogin(vkId);

        // Формируем атрибуты для Spring Security
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", user.getId());
        attributes.put("vk_id", user.getVkId());
        attributes.put("username", user.getUsername());
        attributes.put("email", user.getEmail());
        attributes.put("is_admin", user.getIsAdmin());

        return new DefaultOAuth2User(
                Collections.emptyList(),
                attributes,
                "vk_id"  // principal name → можно использовать в @PreAuthorize("#oauth2.principal.attributes['vk_id'] == ...")
        );
    }
}