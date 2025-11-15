package stankin.backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

public record Video(
        UUID id,
        UUID authorId,
        String title,
        String description,
        String videoUrl,
        String thumbnailUrl,
        int durationSeconds,
        LocalDateTime createdAt
) {
    public boolean isLongForm() {
        return durationSeconds > 60;
    }
}
