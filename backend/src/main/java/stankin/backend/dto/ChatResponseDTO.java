package stankin.backend.dto;

import java.util.List;

public record ChatResponseDTO(
    String message,
    List<AppSuggestionDTO> suggestions,
    String timestamp
) {}
