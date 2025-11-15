package stankin.backend.dto;

import java.util.List;

public record ChatRequestDTO(
    List<ChatMessageDTO> messages,
    Integer userId,
    List<Integer> installedApps
) {}
