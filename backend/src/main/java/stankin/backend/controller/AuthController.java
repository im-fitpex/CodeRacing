package stankin.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import stankin.backend.model.User;
import stankin.backend.repository.UserRepository;

@RestController
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/auth/success")
    public String success(@AuthenticationPrincipal OAuth2User oauth2User) {
        Long vkId = (Long) oauth2User.getAttribute("vk_id");
        String email = (String) oauth2User.getAttribute("email");
        String name = (String) oauth2User.getAttribute("name");

        // Найдём или создадим пользователя
        User user = userRepository.findByVkId(vkId).orElseGet(() -> {
            User newUser = new User();
            newUser.setVkId(vkId);
            newUser.setUsername(name);
            newUser.setEmail(email != null ? email : "vk_" + vkId + "@example.com");
            newUser.setIsAdmin(false);
            return userRepository.save(newUser);
        });

        // Обновим last_login
        user = userRepository.save(user); // вызовет UPDATE

        return "Welcome, " + user.getUsername() + "! Your ID: " + user.getVkId();
    }
}