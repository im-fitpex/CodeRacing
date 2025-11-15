package stankin.backend.dto;

public record AppSuggestionDTO(
    Integer appId,
    String name,
    String iconUrl,
    String reason
) {}
