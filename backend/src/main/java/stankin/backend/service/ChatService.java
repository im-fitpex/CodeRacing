package stankin.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import stankin.backend.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ObjectMapper objectMapper;

    @Value("${openrouter.api-key}")
    private String openRouterApiKey;

    @Value("${openrouter.api-url}")
    private String openRouterApiUrl;

    @Value("${openrouter.model}")
    private String model;

    public ChatResponseDTO chat(ChatRequestDTO request) {
        try {
            String systemPrompt = buildSystemPrompt(request.userId(), request.installedApps());
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemPrompt));
            
            for (ChatMessageDTO msg : request.messages()) {
                messages.add(Map.of("role", msg.role(), "content", msg.content()));
            }
            
            Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", messages,
                "temperature", 0.7,
                "max_tokens", 500
            );
            
            WebClient webClient = WebClient.builder()
                .baseUrl(openRouterApiUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + openRouterApiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
            
            String response = webClient.post()
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            JsonNode jsonNode = objectMapper.readTree(response);
            String assistantMessage = jsonNode
                .path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();
            
            List<AppSuggestionDTO> suggestions = extractAppSuggestions(assistantMessage);
            
            return new ChatResponseDTO(
                assistantMessage,
                suggestions,
                LocalDateTime.now().toString()
            );
                
        } catch (Exception e) {
            log.error("Chat error: {}", e.getMessage(), e);
            return new ChatResponseDTO(
                "Извините, произошла ошибка. Попробуйте еще раз.",
                Collections.emptyList(),
                LocalDateTime.now().toString()
            );
        }
    }

    private String buildSystemPrompt(Integer userId, List<Integer> installedApps) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("Ты - Бот Максим Ферштапенович, дружелюбный AI-помощник магазина приложений RuStore.\n\n");
        prompt.append("ТВОЯ РОЛЬ:\n");
        prompt.append("- Помогаешь пользователям находить нужные приложения и игры\n");
        prompt.append("- Даешь советы по использованию магазина\n");
        prompt.append("- Рекомендуешь приложения\n\n");
        
        if (userId == null) {
            prompt.append("ПОЛЬЗОВАТЕЛЬ: Не авторизован\n");
            prompt.append("- Предлагай авторизоваться для персональных рекомендаций\n");
        } else {
            prompt.append("ПОЛЬЗОВАТЕЛЬ: Авторизован (ID: ").append(userId).append(")\n");
            if (installedApps != null && !installedApps.isEmpty()) {
                prompt.append("Установлено приложений: ").append(installedApps.size()).append("\n");
            }
        }
        
        prompt.append("\nКатегории: Финансы, Социальные сети, Транспорт, Игры, Государственные\n");
        prompt.append("Отвечай на русском, будь дружелюбным, используй эмодзи 😊\n");
        
        return prompt.toString();
    }

    private List<AppSuggestionDTO> extractAppSuggestions(String message) {
        List<AppSuggestionDTO> suggestions = new ArrayList<>();
        Pattern pattern = Pattern.compile("\\[APP:([^\\]]+)\\]");
        Matcher matcher = pattern.matcher(message);
        
        while (matcher.find()) {
            String appName = matcher.group(1);
            suggestions.add(new AppSuggestionDTO(
                1,
                appName,
                "/icons/default.png",
                "Рекомендация"
            ));
        }
        
        return suggestions;
    }
}
